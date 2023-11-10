use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Universe {
    const WIDTH: u32 = 136;
    const HEIGHT: u32 = 48;

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for &delta_row in [self.height - 1, 0, 1].iter() {
            for &delta_column in [self.width - 1, 0, 1].iter() {
                if delta_row == 0 && delta_column == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_column = (column + delta_column) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_column);
                count += self.cells[idx] as u8;
            }
        }
        count
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let cells = (0..Self::WIDTH * Self::HEIGHT)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

        Universe {
            width: Self::WIDTH,
            height: Self::HEIGHT,
            cells,
        }
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for column in 0..self.width {
                let idx = self.get_index(row, column);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, column);
                let next_cell = match (cell, live_neighbors) {
                    (Cell::Alive, ..=1) => Cell::Dead,
                    (Cell::Alive, 2..=3) => Cell::Alive,
                    (Cell::Alive, 4..) => Cell::Dead,
                    (Cell::Dead, 3) => Cell::Alive,
                    (state, _) => state,
                };
                next[idx] = next_cell;
            }
        }

        self.cells = next;
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
}

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    console::log_1(&JsValue::from_str("wasm-game-of-life started"));

    Ok(())
}
