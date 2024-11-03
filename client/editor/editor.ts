import { EditorView } from "codemirror"

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language"
import { highlightSelectionMatches } from "@codemirror/search"
import { EditorState } from "@codemirror/state"
import {
  crosshairCursor,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
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
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    indentUnit.of("    "),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      indentWithTab,
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
    ]),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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
  const view = new EditorView({ state, parent: parent || undefined })
  // make the editor grow to fill the parent
  view.dom.style.height = "100%"

  return view
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
