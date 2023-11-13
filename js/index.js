import {GameOfLife} from "./life.js";

const UNIVERSE_WIDTH = 64;
const UNIVERSE_HEIGHT = 64;

const life = new GameOfLife(UNIVERSE_WIDTH, UNIVERSE_HEIGHT);
life.init()
