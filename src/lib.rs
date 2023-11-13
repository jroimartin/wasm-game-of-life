use js_sys::Math;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Cell {
    Dead,
    Alive,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Universe {
    width: usize,
    height: usize,
    cells: Vec<u8>,
}

impl Universe {
    fn get_index(&self, row: usize, column: usize) -> (usize, usize) {
        let idx = row * self.width + column;
        let nbyte = idx / 8;
        let nbit = idx % 8;
        (nbyte, nbit)
    }

    pub fn cell(&self, row: usize, column: usize) -> Cell {
        let (nbyte, nbit) = self.get_index(row, column);
        if (self.cells[nbyte] >> nbit) & 1 == 1 {
            Cell::Alive
        } else {
            Cell::Dead
        }
    }

    pub fn cells(&self) -> Vec<Cell> {
        self.cells
            .iter()
            .flat_map(|b| {
                (0..8).map(|i| {
                    if (*b >> i) & 1 == 1 {
                        Cell::Alive
                    } else {
                        Cell::Dead
                    }
                })
            })
            .take(self.width * self.height)
            .collect()
    }

    pub fn set_cell(&mut self, row: usize, column: usize, cell: Cell) {
        let (nbyte, nbit) = self.get_index(row, column);
        match cell {
            Cell::Alive => self.cells[nbyte] |= 1 << nbit,
            Cell::Dead => self.cells[nbyte] &= !(1 << nbit),
        }
    }

    pub fn set_cells(&mut self, coords: &[(usize, usize)], cell: Cell) {
        coords
            .iter()
            .for_each(|&(row, col)| self.set_cell(row, col, cell))
    }

    fn live_neighbor_count(&self, row: usize, column: usize) -> u8 {
        let mut count = 0;
        for &delta_row in [self.height - 1, 0, 1].iter() {
            for &delta_col in [self.width - 1, 0, 1].iter() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                match self.cell(neighbor_row, neighbor_col) {
                    Cell::Alive => count += 1,
                    Cell::Dead => {}
                }
            }
        }
        count
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: usize, height: usize) -> Universe {
        let size = (width * height + 7) / 8;
        Universe {
            width,
            height,
            cells: vec![0u8; size],
        }
    }

    pub fn init(&mut self) {
        for b in self.cells.iter_mut() {
            *b = (0..8).fold(*b, |acc, i| {
                if Math::random() < 0.5 {
                    acc | (1 << i)
                } else {
                    acc
                }
            });
        }
    }

    pub fn tick(&mut self) {
        let prev = self.clone();
        for row in 0..self.height {
            for col in 0..self.width {
                let cell = prev.cell(row, col);
                let live_neighbors = prev.live_neighbor_count(row, col);
                let next_cell = match (cell, live_neighbors) {
                    (Cell::Alive, ..=1) => Cell::Dead,
                    (Cell::Alive, 2..=3) => Cell::Alive,
                    (Cell::Alive, 4..) => Cell::Dead,
                    (Cell::Dead, 3) => Cell::Alive,
                    (state, _) => state,
                };
                self.set_cell(row, col, next_cell);
            }
        }
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn cells_ptr(&self) -> *const u8 {
        self.cells.as_ptr()
    }

    pub fn cells_len(&self) -> usize {
        self.cells.len()
    }
}

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    log!("wasm-game-of-life");

    Ok(())
}

#[macro_export]
macro_rules! log {
    ($($args:tt)*) => {
        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!($($args)*)))
    };
}
