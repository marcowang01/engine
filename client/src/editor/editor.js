import { EditorView } from "codemirror"

import { defaultHighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import {
  drawSelection,
  highlightActiveLine,
  highlightSpecialChars,
  lineNumbers,
} from "@codemirror/view"

// Theme
import { oneDark } from "@codemirror/theme-one-dark"

// Language
import { python } from "@codemirror/lang-python"

function createEditorState(initialContent, options = {}) {
  let extensions = [
    lineNumbers(),
    highlightSpecialChars(),
    drawSelection(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    highlightActiveLine(),
    python(),
  ]

  if (options.oneDark) {
    extensions.push(oneDark)
  }

  return EditorState.create({
    doc: initialContent,
    extensions,
  })
}

function createEditorView(state, parent) {
  return new EditorView({ state, parent })
}

const initialState = createEditorState("print('Hello, world!')\n", { oneDark: true })
const editorView = createEditorView(initialState, document.getElementById("editor-parent"))

export default editorView
