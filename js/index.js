import {Universe, Cell} from "../pkg/wasm_game_of_life.js";
import {memory} from "../pkg/wasm_game_of_life_bg.wasm";

const UNIVERSE_WIDTH = 64;
const UNIVERSE_HEIGHT = 64;
const CELL_SIZE = 10;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const CANVAS_HEIGHT = (CELL_SIZE + 1) * UNIVERSE_HEIGHT + 1;
const CANVAS_WIDTH = (CELL_SIZE + 1) * UNIVERSE_WIDTH + 1;

const playPauseButton = document.getElementById("play-pause");
const tickButton = document.getElementById("tick");
const initButton = document.getElementById("init");
const clearButton = document.getElementById("clear");
const canvas = document.getElementById("game-of-life");

const universe = Universe.new(UNIVERSE_WIDTH, UNIVERSE_HEIGHT);
const ctx = canvas.getContext("2d");
let animationId = null;

const initEventListeners = () => {
  playPauseButton.addEventListener("click", toggleAnimation);
  tickButton.addEventListener("click", tickUniverse);
  initButton.addEventListener("click", initUniverse);
  clearButton.addEventListener("click", clearUniverse);
  canvas.addEventListener("click", toggleCell);
}

const initCanvas = () => {
  canvas.height = CANVAS_HEIGHT;
  canvas.width = CANVAS_WIDTH;
  drawGrid();
  initUniverse();
};

const initUniverse = () => {
  universe.clear();
  universe.init_random();
  drawCells();
};

const clearUniverse = () => {
  universe.clear();
  drawCells();
}

const play = () => {
  renderLoop();
  playPauseButton.innerHTML = "⏸️";
};

const pause = () => {
  cancelAnimationFrame(animationId);
  animationId = null;
  playPauseButton.innerHTML = "▶️";
};

const toggleAnimation = () => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
};

const isPaused = () => {
  return animationId === null;
};

const toggleCell = (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const row = Math.floor(y * UNIVERSE_HEIGHT / CANVAS_HEIGHT);
  const col = Math.floor(x * UNIVERSE_WIDTH / CANVAS_WIDTH);

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
    if (row_delta < 0) { row_delta += UNIVERSE_HEIGHT };
    const r = (row + row_delta) % UNIVERSE_HEIGHT;
    if (col_delta < 0) { col_delta += UNIVERSE_WIDTH };
    const c = (col + col_delta) % UNIVERSE_WIDTH;
    universe.toggle_cell(r, c);
  }

  drawCells();
};

const tickUniverse = () => {
  universe.tick();
  drawCells();
};

const renderLoop = () => {
  tickUniverse();
  animationId = requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i < UNIVERSE_WIDTH + 1; i++) {
    const x = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
  }

  // Horizontal lines.
  for (let i = 0; i < UNIVERSE_HEIGHT + 1; i++) {
    const y = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
  }

  ctx.stroke();
};

const drawCells = () => {
  const cellsPtr = universe.cells_ptr();
  const cellsLen = universe.cells_len();
  const cells = new Uint8Array(memory.buffer, cellsPtr, cellsLen);

  ctx.beginPath();

  for (let row = 0; row < UNIVERSE_HEIGHT; row++) {
    for (let col = 0; col < UNIVERSE_WIDTH; col++) {
      const {nbyte, nbit} = getIndex(row, col);

      ctx.fillStyle = (cells[nbyte] >> nbit) & 1 === 1 ? ALIVE_COLOR : DEAD_COLOR;
      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE,
      );
    }
  }
};

const getIndex = (row, column) => {
  let idx = row * UNIVERSE_WIDTH + column;
  return {
    nbyte: Math.floor(idx / 8),
    nbit: idx % 8,
  }
};

initEventListeners();
initCanvas();
