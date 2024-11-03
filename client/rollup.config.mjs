import { nodeResolve } from "@rollup/plugin-node-resolve"

export default {
  input: "./src/editor/editor.js",
  output: {
    file: "./public/editor.bundle.js",
    format: "iife",
  },
  plugins: [nodeResolve()],
}
