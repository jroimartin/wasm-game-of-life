import {Universe, Cell} from "../pkg/wasm_game_of_life.js";
import {memory} from "../pkg/wasm_game_of_life_bg.wasm";

const UNIVERSE_WIDTH = 64;
const UNIVERSE_HEIGHT = 64;

const CELL_SIZE = 10;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new(UNIVERSE_WIDTH, UNIVERSE_HEIGHT);
universe.init();

const canvas = document.getElementById("game-of-life");
const canvasHeight = (CELL_SIZE + 1) * UNIVERSE_HEIGHT + 1;
const canvasWidth = (CELL_SIZE + 1) * UNIVERSE_WIDTH + 1;
canvas.height = canvasHeight;
canvas.width = canvasWidth;

const playPauseButton = document.getElementById("play-pause");
const initButton = document.getElementById("init");
const clearButton = document.getElementById("clear");

let animationId = null;

const ctx = canvas.getContext("2d");

const initUniverse = () => {
  universe.clear();
  universe.init();
  drawCell();
};

const clearUniverse = () => {
  universe.clear();
  drawCell();
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

const renderLoop = () => {
  universe.tick();
  drawCell();
  animationId = requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i < UNIVERSE_WIDTH + 1; i++) {
    const x = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
  }

  // Horizontal lines.
  for (let i = 0; i < UNIVERSE_HEIGHT + 1; i++) {
    const y = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
  }

  ctx.stroke();
};

const drawCell = () => {
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

drawGrid();
playPauseButton.addEventListener("click", toggleAnimation);
initButton.addEventListener("click", initUniverse);
clearButton.addEventListener("click", clearUniverse);
