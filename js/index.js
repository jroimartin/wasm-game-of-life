import { Universe, Cell } from "../pkg/wasm_game_of_life.js";
import { memory } from "../pkg/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 10;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const height = universe.height();
const width = universe.width();

const canvas_height = (CELL_SIZE + 1) * height + 1;
const canvas_width = (CELL_SIZE + 1) * width + 1;

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = canvas_height;
canvas.width = canvas_width;

const ctx = canvas.getContext("2d");

const renderLoop = () => {
  universe.tick();

  drawGrid();
  drawCell();

  requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i < width + 1; i++) {
    const x = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas_height);
  }

  // Horizontal lines.
  for (let i = 0; i < height + 1; i++) {
    const y = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas_width, y);
  }

  ctx.stroke();
};

const drawCell = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, Math.floor((width * height + 7) / 8));

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const { nbyte, nbit } = getIndex(row, col);

      ctx.fillStyle = (cells[nbyte] >> nbit) & 1 == 1 ? ALIVE_COLOR : DEAD_COLOR;
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
  let idx = row * width + column;
  return {
    nbyte: Math.floor(idx / 8),
    nbit: idx % 8,
  }
};

drawGrid();
drawCell();
requestAnimationFrame(renderLoop);
