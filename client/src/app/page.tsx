"use client"

import { Card } from "@/components/ui/card"
// import MyEditor from "@/components/ui/react-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getInitialProgram } from "@/lib/code-templates"
import { handleConsoleCommands } from "@/lib/console"
import { EditorView } from "codemirror"
import { Code2, Terminal } from "lucide-react"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import * as ResizablePrimitive from "react-resizable-panels"
import { EditorOptions, SupportedLanguage } from "../../editor/editor"
// import { EditorOptions } from "../../editor/editor"

const CONSOLE_HISTORY_SIZE = 20

export interface ConsoleHistoryEntry {
  original: string
  buffer: string
}

export default function Page() {
  const [consoleHistory, setConsoleHistory] = useState<ConsoleHistoryEntry[]>([
    {
      original: "",
      buffer: "",
    },
  ])
  const [consoleHistoryIndex, setConsoleHistoryIndex] = useState(0)
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguage.Python)

  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [editorView, setEditorView] = useState<EditorView | null>(null)
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")

  const editorParentRef = useRef<HTMLDivElement>(null)
  const consoleInputRef = useRef<HTMLInputElement>(null)
  const consoleInputParentRef = useRef<HTMLDivElement>(null)
  const consolePanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null)

  useEffect(() => {
    setCurrentPrompt(getConsolePrompt())
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        if (isConsoleCollapsed) {
          consolePanelRef.current?.expand()
          consoleInputRef.current?.focus()
          setIsConsoleCollapsed(false)
        } else {
          consolePanelRef.current?.collapse()
          setIsConsoleCollapsed(true)
        }
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setConsoleHistoryIndex((prev) => Math.max(prev - 1, 0))
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setConsoleHistoryIndex((prev) => Math.min(prev + 1, consoleHistory.length - 1))
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isConsoleCollapsed, consoleHistory, consoleHistoryIndex, setIsConsoleCollapsed])

  useEffect(() => {
    if (consoleInputRef.current) {
      const input = consoleInputRef.current
      input.focus()
      input.selectionStart = input.selectionEnd = input.value.length
    }
  }, [consoleHistoryIndex])

  useEffect(() => {
    if (consoleInputParentRef.current) {
      consoleInputParentRef.current.scrollTop = consoleInputParentRef.current.scrollHeight
    }
  }, [consoleOutput])

  useEffect(() => {
    handleOnLanguageChange(language)
  }, [language])

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const command = consoleHistory[consoleHistoryIndex].buffer

    await handleConsoleCommands(
      command,
      currentPrompt,
      language,
      setConsoleOutput,
      () => editorView?.state.doc.toString() ?? "",
      () => {
        setConsoleHistory((prev) => {
          let newHistory: ConsoleHistoryEntry[]
          prev[prev.length - 1].original = command

          if (prev.length >= CONSOLE_HISTORY_SIZE) {
            newHistory = [...prev.slice(1), { original: "", buffer: "" }]
          } else {
            newHistory = [...prev, { original: "", buffer: "" }]
          }

          // TODO: can optimize this to be amortized O(1) on average
          newHistory.map((entry) => {
            entry.buffer = entry.original
          })

          setConsoleHistoryIndex(newHistory.length - 1)
          return newHistory
        })
      }
    )

    setCurrentPrompt(getConsolePrompt())
  }

  const handleOnScriptLoad = () => {
    console.log("script loaded")
    if (
      typeof window.createEditorState === "function" &&
      typeof window.createEditorView === "function" &&
      editorParentRef.current
    ) {
      console.log("createEditorState and createEditorView are available")

      const initialState = window.createEditorState(getInitialProgram(), { oneDark: true })
      const editorView = window.createEditorView(initialState, editorParentRef.current)
      setEditorView(editorView)
    }
  }

  const handleOnLanguageChange = (language: SupportedLanguage) => {
    if (
      typeof window.createEditorState !== "function" ||
      typeof window.createEditorView !== "function" ||
      !editorParentRef.current
    ) {
      return
    }

    const options: EditorOptions = {
      oneDark: true,
      language,
    }

    const newState = window.createEditorState(getInitialProgram(language), options)
    setEditorView((prev) => {
      if (prev) {
        prev.setState(newState)
        return prev
      }
      return null
    })
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
          <ResizablePanel defaultSize={60} className="m-4 mb-1 rounded-xl border-0">
            <div className="flex h-full flex-col bg-[#465a78]">
              <div className="flex h-[40px] items-center border-b border-gray-800 pl-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span>
                    <Select
                      value={language}
                      onValueChange={(value) => {
                        setLanguage(value as SupportedLanguage)
                      }}
                    >
                      <SelectTrigger className="font-sm h-[25px] w-[120px] border-none bg-[#5f6f8c] font-mono transition hover:bg-opacity-70 focus:border-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-none bg-transparent font-mono text-white backdrop-blur-sm">
                        <SelectItem value={SupportedLanguage.Python}>python</SelectItem>
                        <SelectItem value={SupportedLanguage.Go}>go</SelectItem>
                      </SelectContent>
                    </Select>
                  </span>
                </div>
              </div>
              <div id="editor-parent" ref={editorParentRef} className="h-[calc(100%-40px)]" />
            </div>
          </ResizablePanel>
          <ResizableHandle className="m-0.5 bg-gray-600 p-0.5 opacity-0 transition-opacity hover:opacity-100 active:opacity-100" />
          <ResizablePanel
            ref={consolePanelRef}
            defaultSize={40}
            className="m-4 mt-1 cursor-text rounded-xl border-0"
            onClick={handleOnConsoleCardClick}
            collapsible={true}
          >
            <div className="flex h-[40px] items-center border-b border-gray-800 bg-[#363636] pl-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>console</span>
              </div>
            </div>
            <Card className="h-[calc(100%-40px)] rounded-none border-0 border-t border-none bg-[#272728] text-white">
              <div
                className="h-full overflow-y-auto p-2 font-mono text-xs"
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
                    value={consoleHistory[consoleHistoryIndex].buffer}
                    onChange={(e) => {
                      setConsoleHistory((prev) => {
                        prev[consoleHistoryIndex].buffer = e.target.value
                        return [...prev]
                      })
                    }}
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
