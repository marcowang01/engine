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

/*
 * all code in here runs in the client browser !
 */

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

declare global {
  interface Window {
    createEditorState: (initialContent: string, options: EditorOptions) => EditorState
    createEditorView: (state: EditorState, parent: HTMLElement | null) => EditorView
  }
}

window.createEditorState = createEditorState
window.createEditorView = createEditorView

/*
const initialState = createEditorState("print('Hello, world!')\n", { oneDark: true })

const editorParent = document.getElementById("editor-parent")
const editorView = createEditorView(initialState, editorParent)

export function getCurrentCode() {
  return editorView.state.doc.toString()
}

declare global {
  interface Window {
    getCurrentCode: () => string
  }
}

window.getCurrentCode = getCurrentCode

export default editorView
*/
