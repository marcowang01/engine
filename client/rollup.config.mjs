// rollup.config.js
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

export default {
  input: "./editor/editor.ts",
  output: {
    file: "./public/editor.bundle.js",
    format: "iife",
    name: "editor",
  },
  plugins: [
    nodeResolve(),
    // needed if using .ts for editor file
    commonjs(),
    typescript(),
  ],
}
