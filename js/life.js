import {Universe, Cell} from "../pkg/wasm_game_of_life.js";
import {memory} from "../pkg/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 10;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

class Fps {
  #fps;
  #frames;
  #lastFrameTimestamp;

  constructor(fps) {
    this.#fps = fps;
    this.#frames = [];
    this.#lastFrameTimestamp = performance.now();
  }

  render() {
    const now = performance.now();
    const delta = now - this.#lastFrameTimestamp;
    this.#lastFrameTimestamp = now;
    const fps = 1 / delta * 1000;

    this.#frames.push(fps);
    if (this.#frames.length > 100) {
      this.#frames.shift();
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.#frames.length; i++) {
      sum += this.#frames[i];
      min = Math.min(this.#frames[i], min);
      max = Math.max(this.#frames[i], max);
    }
    let mean = sum / this.#frames.length;

    this.#fps.textContent = `
Frames per second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
}

export class GameOfLife {
  #universeWidth;
  #universeHeight;
  #gui;

  #universe;
  #animationId;
  #fps;
  #canvasWidth;
  #canvasHeight;

  constructor(width, height, gui) {
    this.#universeWidth = width;
    this.#universeHeight = height;
    this.#gui = gui;

    this.#universe = Universe.new(this.#universeWidth, this.#universeHeight);
    this.#animationId = null;
    this.#fps = new Fps(gui.fps);
    this.#canvasWidth = (CELL_SIZE + 1) * this.#universeWidth + 1;
    this.#canvasHeight = (CELL_SIZE + 1) * this.#universeHeight + 1;
  }

  init() {
    this.#initEventListeners();
    this.#initCanvas();
  }

  #initEventListeners() {
    this.#gui.playPauseButton.addEventListener("click", () => this.#toggleAnimation());
    this.#gui.tickButton.addEventListener("click", () => this.#tickUniverse());
    this.#gui.initButton.addEventListener("click", () => this.#initUniverse());
    this.#gui.clearButton.addEventListener("click", () => this.#clearUniverse());
    this.#gui.canvas.addEventListener("click", (ev) => this.#toggleCell(ev));
  }

  #initCanvas() {
    this.#gui.canvas.height = this.#canvasHeight;
    this.#gui.canvas.width = this.#canvasWidth;
    this.#drawGrid();
    this.#initUniverse();
  }

  #initUniverse() {
    this.#universe.clear();
    this.#universe.init_random();
    this.#drawCells();
  }

  #clearUniverse() {
    this.#universe.clear();
    this.#drawCells();
  }

  #play() {
    this.#renderLoop();
    this.#gui.playPauseButton.innerHTML = "⏸️";
  }

  #pause() {
    cancelAnimationFrame(this.#animationId);
    this.#animationId = null;
    this.#gui.playPauseButton.innerHTML = "▶️";
  }

  #toggleAnimation() {
    if (this.#isPaused()) {
      this.#play();
    } else {
      this.#pause();
    }
  }

  #isPaused() {
    return this.#animationId === null;
  }

  #toggleCell(event) {
    const rect = this.#gui.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const row = Math.floor(y * this.#universeHeight / this.#canvasHeight);
    const col = Math.floor(x * this.#universeWidth / this.#canvasWidth);

    let deltas = [[0,0]];
    if (event.ctrlKey) {
      // Glider.
      deltas = [[-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    } else if (event.shiftKey) {
      // Pulsar.
      const quadrant = [
        [1, 2], [1, 3], [1, 4],
        [2, 1], [2, 6],
        [3, 1], [3, 6],
        [4, 1], [4, 6],
        [6, 2], [6, 3], [6, 4],
      ];

      deltas = [];
      for (let row_mul of [-1, 1]) {
        for (let col_mul of [-1, 1]) {
          for (let [row_delta, col_delta] of quadrant) {
            deltas.push([row_delta * row_mul, col_delta * col_mul]);
          }
        }
      }
    }

    for (let [row_delta, col_delta] of deltas) {
      if (row_delta < 0) { row_delta += this.#universeHeight }
      const r = (row + row_delta) % this.#universeHeight;
      if (col_delta < 0) { col_delta += this.#universeWidth }
      const c = (col + col_delta) % this.#universeWidth;
      this.#universe.toggle_cell(r, c);
    }

    this.#drawCells();
  }

  #tickUniverse() {
    this.#universe.tick();
    this.#drawCells();
  }

  #renderLoop() {
    this.#fps.render();
    this.#tickUniverse();
    this.#animationId = requestAnimationFrame(() => this.#renderLoop());
  }

  #drawGrid() {
    const ctx = this.#gui.canvas.getContext("2d");

    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i < this.#universeWidth + 1; i++) {
      const x = i * (CELL_SIZE + 1) + 1;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.#canvasHeight);
    }

    // Horizontal lines.
    for (let i = 0; i < this.#universeHeight + 1; i++) {
      const y = i * (CELL_SIZE + 1) + 1;
      ctx.moveTo(0, y);
      ctx.lineTo(this.#canvasWidth, y);
    }

    ctx.stroke();
  }

  #drawCells() {
    const cellsPtr = this.#universe.cells_ptr();
    const cellsLen = this.#universe.cells_len();
    const cells = new Uint8Array(memory.buffer, cellsPtr, cellsLen);

    const ctx = this.#gui.canvas.getContext("2d");

    ctx.beginPath();

    for (let row = 0; row < this.#universeHeight; row++) {
      for (let col = 0; col < this.#universeWidth; col++) {
        const {nbyte, nbit} = this.#getIndex(row, col);

        ctx.fillStyle = (cells[nbyte] >> nbit) & 1 === 1 ? ALIVE_COLOR : DEAD_COLOR;
        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE,
        );
      }
    }
  }

  #getIndex(row, column) {
    const idx = row * this.#universeWidth + column;
    return {
      nbyte: Math.floor(idx / 8),
      nbit: idx % 8,
    }
  }
}

export class Gui {
  canvas;
  playPauseButton;
  tickButton;
  initButton;
  clearButton;
  fps;

  constructor(canvas, playPauseButton, tickButton, initButton, clearButton, fps) {
    this.canvas = canvas;
    this.playPauseButton = playPauseButton;
    this.tickButton = tickButton;
    this.initButton = initButton;
    this.clearButton = clearButton;
    this.fps = fps;
  }
}
