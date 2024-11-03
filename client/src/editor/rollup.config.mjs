import { nodeResolve } from "@rollup/plugin-node-resolve"

export default {
  input: "./src/editor/editor.js",
  output: {
    file: "./src/editor/editor.bundle.js",
    format: "iife",
  },
  plugins: [nodeResolve()],
}
