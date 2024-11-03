import { EditorView, minimalSetup } from "codemirror"

let editor = new EditorView({
  extensions: [minimalSetup],
  parent: document.getElementById("editor-parent"),
})

export default editor
