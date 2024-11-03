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
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(getConsolePrompt())

  const editorParentRef = useRef<HTMLDivElement>(null)
  const consoleInputRef = useRef<HTMLInputElement>(null)
  const consoleInputParentRef = useRef<HTMLDivElement>(null)
  const consolePanelRef = useRef<any>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        console.log("trying to collapse")

        if (isConsoleCollapsed) {
          consolePanelRef.current?.expand()
          consoleInputRef.current?.focus()
          setIsConsoleCollapsed(false)
        } else {
          consolePanelRef.current?.collapse()
          setIsConsoleCollapsed(true)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isConsoleCollapsed])

  useEffect(() => {
    if (consoleInputParentRef.current) {
      consoleInputParentRef.current.scrollTop = consoleInputParentRef.current.scrollHeight
    }
  }, [consoleOutput])

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await handleConsoleCommands(consoleInput, currentPrompt)

    setCurrentPrompt(getConsolePrompt())
    setConsoleInput("")
  }

  async function handleConsoleCommands(command: string, currentPrompt: string) {
    if (consoleInput === "") {
      setConsoleOutput((prev) => [...prev, currentPrompt])
      return
    }

    if (command === "clear") {
      setConsoleOutput([])
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
        setConsoleOutput((prev) => [...prev, `${currentPrompt}${command}`, error])
        return
      }

      const data = await response.json()
      setConsoleOutput((prev) => [...prev, `${currentPrompt}${command}`, data.output])
      return
    }

    setConsoleOutput((prev) => [
      ...prev,
      `${currentPrompt}${command}`,
      `sh: command not found: ${command}`,
    ])
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

  function getConsolePrompt() {
    const timeStamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    return `[${timeStamp}] > `
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
            ref={consolePanelRef}
            defaultSize={40}
            className="m-4 cursor-text rounded-xl border border-blue-400"
            onClick={handleOnConsoleCardClick}
            collapsible={true}
          >
            <div className="flex h-[40px] items-center border-b border-gray-800 pl-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>console</span>
              </div>
            </div>
            <Card className="h-[calc(100%-40px)] rounded-none border-0 border-t border-none bg-[#272728] text-white">
              <div
                className="h-full overflow-y-auto p-2 font-mono text-sm"
                ref={consoleInputParentRef}
              >
                {consoleOutput.map((line, index) => (
                  <div key={index} className="mb-0">
                    <pre>{line}</pre>
                  </div>
                ))}
                <form onSubmit={handleConsoleSubmit} className="flex">
                  <span className="mr-2">{currentPrompt}</span>
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
