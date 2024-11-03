"use client"

import { Card } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Code2 } from "lucide-react"
import Script from "next/script"
import { useState } from "react"

export default function Page() {
  const [code, setCode] = useState(`class Solution:
    def getSkyline(self, buildings: List[List[int]]) -> List[List[int]]:
        # points are either the left corner or intersect of right corner to top of building or ground
        # we need to follow every x-cord. scan the top of buildings from left to right
        
        # create a function takes in a point and existing skyline and returns where to add it based on if its a left or right point
        # if neither we would be the last traverse skyline point, we need to search before that
        
        skyline = []
        for i, building in enumerate(buildings):
            l, r, h = building
            skyline.extend([[l,h], [r,0]])
            
        else:
            positions = []
            for j, point in enumerate(skyline): 
                x, h = point
                if j > 0:
                    positions.append([x, h])
                else:
                    positions.append(["pos", "h"])
                    
        return skyline`)

  const [consoleInput, setConsoleInput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (consoleInput === "") {
      return
    }

    if (consoleInput === "clear") {
      setConsoleOutput([])
      setConsoleInput("")
      return
    }

    setConsoleOutput([...consoleOutput, `> ${consoleInput}`, "Command executed successfully"])
    setConsoleInput("")
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
              <div id="editor-parent">
                <div id="editor" />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-blue-400 p-1 opacity-0 transition-opacity hover:opacity-100 active:opacity-100" />
          <ResizablePanel defaultSize={40} className="m-4 rounded-xl border border-blue-400">
            <Card className="m-3 rounded-xl border-t border-gray-800 bg-black text-white">
              <div className="h-full overflow-auto p-2 font-mono text-sm">
                {consoleOutput.map((line, index) => (
                  <div key={index}>{line}</div>
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
      <Script src="/editor.bundle.min.js" />
    </div>
  )
}
