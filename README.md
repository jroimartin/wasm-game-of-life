# WASM Game of Life

My take on the tutorial of [The Rust Wasm Book][rustwasm-book], which
implements the Game of Life using rust-generated WebAssembly.

The structure of this repository is based on the
[rust-webpack-template][rust-webpack-template].

## How to install

```sh
npm install
```

## How to run in debug mode

Builds the project and opens it in a new browser tab. Auto-reloads
when the project changes.

```sh
npm start
```

## How to build in release mode

Builds the project and places it into the `dist` folder.

```sh
npm run build
```

## How to run unit tests

Runs tests in Firefox:

```sh
npm test -- --firefox
```

Runs tests in Chrome:

```sh
npm test -- --chrome
```

Runs tests in Safari:

```sh
npm test -- --safari
```


[rust-webpack-template]: https://github.com/rustwasm/rust-webpack-template
[rustwasm-book]: https://rustwasm.github.io/docs/book/
