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
  LanguageSupport,
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
import { go } from "@codemirror/lang-go"
import { python } from "@codemirror/lang-python"

export interface EditorOptions {
  oneDark?: boolean
  language?: SupportedLanguage
}

export enum SupportedLanguage {
  Python = "python",
  Go = "go",
}

/*
 * all code in here runs in the client browser !
 */

function createEditorState(initialContent: string, options: EditorOptions = {}) {
  let languageSupport: LanguageSupport
  switch (options.language) {
    case SupportedLanguage.Python:
      languageSupport = python()
      break
    case SupportedLanguage.Go:
      languageSupport = go()
      break
    default:
      languageSupport = python()
      break
  }

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
    languageSupport,
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

if (typeof window !== "undefined") {
  window.createEditorState = createEditorState
  window.createEditorView = createEditorView
}
