import {GameOfLife, Gui} from "./life.js";

const UNIVERSE_WIDTH = 64;
const UNIVERSE_HEIGHT = 64;

const gui = new Gui(
  document.getElementById("game-of-life"),
  document.getElementById("play-pause"),
  document.getElementById("tick"),
  document.getElementById("init"),
  document.getElementById("clear"),
  document.getElementById("fps"),
);

const life = new GameOfLife(UNIVERSE_WIDTH, UNIVERSE_HEIGHT, gui);
life.init()
