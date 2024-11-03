"use client"

import { Card } from "@/components/ui/card"
// import MyEditor from "@/components/ui/react-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { EditorView } from "codemirror"
import { Code2, Terminal } from "lucide-react"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

export default function Page() {
  const [consoleInput, setConsoleInput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [editorView, setEditorView] = useState<EditorView | null>(null)

  const editorParentRef = useRef<HTMLDivElement>(null)
  const consoleInputRef = useRef<HTMLInputElement>(null)
  const consoleInputParentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (consoleInputParentRef.current) {
      consoleInputParentRef.current.scrollTop = consoleInputParentRef.current.scrollHeight
    }
  }, [consoleOutput])

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (consoleInput === "") {
      setConsoleOutput((prev) => [...prev, "> "])
      setConsoleInput("")
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
        const error = await response.text()
        setConsoleOutput((prev) => [...prev, `> ${command}`, error])
        setConsoleInput("")
        return
      }

      const data = await response.json()
      setConsoleOutput((prev) => [...prev, `> ${command}`, data.output])
      setConsoleInput("")
      return
    }

    setConsoleOutput((prev) => [...prev, `> ${command}`, `sh: command not found: ${command}`])
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

      const initialPythonProgram = `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 1]

testCases = [
    ([2, 7, 11, 15], 9),
    ([3, 2, 4], 6),
    ([3, 3], 6),
]

for nums, target in testCases:
    if Solution().twoSum(nums, target) == [0, 1]:
        print("Pass")
    else:
        print("Fail")
`
      const initialState = window.createEditorState(initialPythonProgram, { oneDark: true })
      const editorView = window.createEditorView(initialState, editorParentRef.current)
      setEditorView(editorView)
    }
  }

  const handleOnConsoleCardClick = () => {
    consoleInputRef.current?.focus()
  }

  return (
    <div className="flex h-screen flex-col bg-[#1E1E1E] text-white">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={60} className="m-4 rounded-xl border border-blue-400">
            <div className="flex h-full flex-col">
              <div className="flex h-[40px] items-center border-b border-gray-800 pl-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span>code</span>
                </div>
              </div>
              <div id="editor-parent" ref={editorParentRef} className="h-full" />
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-blue-400 p-1 opacity-0 transition-opacity hover:opacity-100 active:opacity-100" />
          <ResizablePanel
            defaultSize={40}
            className="m-4 cursor-text rounded-xl border border-blue-400 bg-black"
            onClick={handleOnConsoleCardClick}
          >
            <div className="flex h-[40px] items-center border-b border-gray-800 pl-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>console</span>
              </div>
            </div>
            <Card className="mx-3 mb-3 h-[calc(100%-40px)] rounded-xl border-t border-none border-gray-800 bg-black text-white">
              <div
                className="h-full overflow-y-auto p-2 font-mono text-sm"
                ref={consoleInputParentRef}
              >
                {consoleOutput.map((line, index) => (
                  <div key={index} className="mb-1">
                    <pre>{line}</pre>
                  </div>
                ))}
                <form onSubmit={handleConsoleSubmit} className="flex">
                  <span className="mr-2">{">"}</span>
                  <input
                    type="text"
                    ref={consoleInputRef}
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
