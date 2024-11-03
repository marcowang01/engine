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

export interface EditorOptions {
  oneDark?: boolean
}

function createEditorState(initialContent: string, options: EditorOptions = {}) {
  const extensions = [
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

function createEditorView(state: EditorState, parent: HTMLElement | null) {
  return new EditorView({ state, parent: parent || undefined })
}

const initialState = createEditorState("print('Hello, world!')\n", { oneDark: true })

const editorParent = document.getElementById("editor-parent")
const editorView = createEditorView(initialState, editorParent)

export default editorView
