"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Code2, Terminal } from "lucide-react"
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

  const [showConsole, setShowConsole] = useState(false)
  const [consoleInput, setConsoleInput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState(["Welcome to LeetCode CLI"])

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
              <div className="flex-1 overflow-auto bg-[#1E1E1E] p-4 font-mono text-sm">
                <pre className="text-gray-300">{code}</pre>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="m-2 self-start"
                onClick={() => setShowConsole(!showConsole)}
              >
                <Terminal className="mr-2 h-4 w-4" />
                Toggle Console
              </Button>
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-blue-400 p-1 transition-opacity opacity-0 hover:opacity-100 active:opacity-100" />
          <ResizablePanel defaultSize={40} className="m-4 rounded-xl border border-blue-400">
            <Card className="m-3 rounded-xl border-t border-gray-800 bg-black text-white">
              <div className="h-full overflow-auto p-2 font-mono text-sm">
                {consoleOutput.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
                <form onSubmit={handleConsoleSubmit} className="mt-2 flex">
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
      {showConsole && (
        <Card className="rounded-none border-t border-gray-800 bg-black text-white">
          <div className="h-48 overflow-auto p-2 font-mono text-sm">
            {consoleOutput.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
            <form onSubmit={handleConsoleSubmit} className="mt-2 flex">
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
      )}
    </div>
  )
}
