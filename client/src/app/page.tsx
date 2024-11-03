"use client"

import { Card } from "@/components/ui/card"
// import MyEditor from "@/components/ui/react-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { EditorView } from "codemirror"
import { Code2 } from "lucide-react"
import Script from "next/script"
import { useRef, useState } from "react"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

export default function Page() {
  const [consoleInput, setConsoleInput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])

  const [editorView, setEditorView] = useState<EditorView | null>(null)
  const editorParentRef = useRef<HTMLDivElement>(null)

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (consoleInput === "") {
      return
    }

    handleConsoleCommands(consoleInput)
  }

  async function handleConsoleCommands(command: string) {
    if (command === "clear") {
      setConsoleOutput([])
      setConsoleInput("")
      return
    }

    if (command === "run") {
      const currentCode = editorView?.state.doc.toString()

      const response = await fetch(`${SERVER_URL}/execute-code`, {
        method: "POST",
        body: JSON.stringify({ code: currentCode, language: "python" }),
      })

      if (!response.ok) {
        setConsoleOutput([...consoleOutput, `> ${command}`, `${command} command not found`])
        return
      }

      const data = await response.json()
      setConsoleOutput([...consoleOutput, `> ${command}`, data.output])
      setConsoleInput("")
      return
    }

    setConsoleOutput([...consoleOutput, `> ${command}`, `${command} command not found`])
    setConsoleInput("")
    return
  }

  const handleOnScriptLoad = () => {
    console.log("script loaded")
    if (
      typeof window.createEditorState === "function" &&
      typeof window.createEditorView === "function" &&
      editorParentRef.current
    ) {
      console.log("createEditorState and createEditorView are available")
      const initialState = window.createEditorState("print('Hello, world!')\n", { oneDark: true })
      const editorView = window.createEditorView(initialState, editorParentRef.current)
      setEditorView(editorView)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#1E1E1E] text-white">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={60} className="m-4 rounded-xl border border-blue-400">
            <div className="flex h-full flex-col">
              <div className="flex items-center border-b border-gray-800 p-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span>Code</span>
                </div>
              </div>
              <div id="editor-parent" ref={editorParentRef}>
                <div id="editor" />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-blue-400 p-1 opacity-0 transition-opacity hover:opacity-100 active:opacity-100" />
          <ResizablePanel defaultSize={40} className="m-4 rounded-xl border border-blue-400">
            <Card className="m-3 rounded-xl border-t border-gray-800 bg-black text-white">
              <div className="h-full overflow-auto p-2 font-mono text-sm">
                {consoleOutput.map((line, index) => (
                  <div key={index} className="mb-2">
                    <pre>{line}</pre>
                  </div>
                ))}
                <form onSubmit={handleConsoleSubmit} className="flex">
                  <span className="mr-2">{">"}</span>
                  <input
                    type="text"
                    value={consoleInput}
                    onChange={(e) => setConsoleInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    autoFocus
                  />
                </form>
              </div>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Script src="/editor.bundle.min.js" onLoad={handleOnScriptLoad} />
    </div>
  )
}
