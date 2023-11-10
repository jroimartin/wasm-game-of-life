const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    index: "./js/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "static"),
          filter: async (resourcePath) => {
            return !resourcePath.endsWith("~");
          },
        },
      ]
    }),

    new WasmPackPlugin({
      crateDirectory: __dirname,
      extraArgs: '--no-pack',
    }),
  ]
};
