/*
import { EditorView } from "codemirror"
import { useEffect, useRef } from "react"

import { defaultHighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import {
  drawSelection,
  highlightActiveLine,
  highlightSpecialChars,
  lineNumbers,
} from "@codemirror/view"

// Theme

// Language
import { python } from "@codemirror/lang-python"
const MyEditor = () => {
  const editorRef = useRef(null)

  useEffect(() => {
    const startState = EditorState.create({
      doc: "Hello World",
      extensions: [
        lineNumbers(),
        highlightSpecialChars(),
        drawSelection(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        highlightActiveLine(),
        python(),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: editorRef.current ?? undefined,
    })

    return () => {
      view.destroy() // Clean up the editor on component unmount
    }
  }, [])

  return <div ref={editorRef}></div>
}

export default MyEditor
*/
