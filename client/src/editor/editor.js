import { python } from "@codemirror/lang-python"
import { EditorView, minimalSetup } from "codemirror"
let editor = new EditorView({
  extensions: [minimalSetup, python()],
  parent: document.getElementById("editor-parent"),
})

export default editor
