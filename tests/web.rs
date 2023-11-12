use wasm_bindgen_test::{wasm_bindgen_test, wasm_bindgen_test_configure};
use wasm_game_of_life::{Cell, Universe};

wasm_bindgen_test_configure!(run_in_browser);

#[test]
fn universe_set_cells() {
    let mut uni = Universe::new(2, 2);
    uni.set_cells(&[(0, 1), (1, 0)], Cell::Alive);
    assert_eq!(
        uni.cells(),
        [Cell::Dead, Cell::Alive, Cell::Alive, Cell::Dead]
    );
}

#[test]
fn universe_tick() {
    let mut uni = Universe::new(5, 5);
    uni.set_cells(&[(1, 2), (2, 2), (3, 2)], Cell::Alive);
    assert_eq!(
        uni.cells(),
        [
            // Row 0.
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            // Row 1.
            Cell::Dead,
            Cell::Dead,
            Cell::Alive,
            Cell::Dead,
            Cell::Dead,
            // Row 2.
            Cell::Dead,
            Cell::Dead,
            Cell::Alive,
            Cell::Dead,
            Cell::Dead,
            // Row 3.
            Cell::Dead,
            Cell::Dead,
            Cell::Alive,
            Cell::Dead,
            Cell::Dead,
            // Row 4.
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
        ]
    );
    uni.tick();
    assert_eq!(
        uni.cells(),
        [
            // Row 0.
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            // Row 1.
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            // Row 2.
            Cell::Dead,
            Cell::Alive,
            Cell::Alive,
            Cell::Alive,
            Cell::Dead,
            // Row 3.
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            // Row 4.
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
            Cell::Dead,
        ]
    );
}

#[wasm_bindgen_test]
fn it_works() {
    assert_eq!(1, 1)
}
