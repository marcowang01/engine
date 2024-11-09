import { SupportedLanguage } from "../../editor/editor"
import { ExecuteCodeResponse } from "./schema"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

const dummyProblem = `
## Problem Description

You are given an integer array \`prices\` where \`prices[i]\` is the price of a given stock on the *i*-th day.

On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it and then immediately sell it on the same day.

Find and return the maximum profit you can achieve.

---

### Examples

#### Example 1
**Input**: \`prices = [7,1,5,3,6,4]\`  
**Output**: \`7\`  
**Explanation**: 
- Buy on day 2 (price = 1) and sell on day 3 (price = 5), profit = \`5 - 1 = 4\`.
- Then buy on day 4 (price = 3) and sell on day 5 (price = 6), profit = \`6 - 3 = 3\`.
- Total profit is \`4 + 3 = 7\`.

#### Example 2
**Input**: \`prices = [1,2,3,4,5]\`  
**Output**: \`4\`  
**Explanation**: 
- Buy on day 1 (price = 1) and sell on day 5 (price = 5), profit = \`5 - 1 = 4\`.
- Total profit is \`4\`.

#### Example 3
**Input**: \`prices = [7,6,4,3,1]\`  
**Output**: \`0\`  
**Explanation**: 
- There is no way to make a positive profit, so we never buy the stock to achieve the maximum profit of \`0\`.

---

### Constraints
- \`1 <= prices.length <= 3 * 10^4\`
- \`0 <= prices[i] <= 10^4\`
`

export async function handleConsoleCommands(
  command: string,
  currentPrompt: string,
  language: SupportedLanguage,
  setConsoleOutput: React.Dispatch<React.SetStateAction<string[]>>,
  getCurrentCodeFromEditor: () => string,
  onSubmitNewCommand: () => void
) {
  if (command === "") {
    setConsoleOutput((prev) => [...prev, currentPrompt])
    return
  }

  switch (command) {
    case "clear":
      setConsoleOutput([])
      break
    case "run":
    case "r":
      const startTime = Date.now()
      const currentCode = getCurrentCodeFromEditor()

      let response: Response
      try {
        response = await fetch(`${SERVER_URL}/execute-code`, {
          method: "POST",
          body: JSON.stringify({ code: currentCode, language }),
        })
      } catch (error) {
        setConsoleOutput((prev) => [
          ...prev,
          `${currentPrompt}${command}`,
          `ExecutionServerError: ${error}`,
        ])
        break
      }

      if (!response.ok) {
        const error = await response.text()
        setConsoleOutput((prev) => [...prev, `${currentPrompt}${command}`, error])
        break
      }

      let data: ExecuteCodeResponse
      try {
        data = (await response.json()) as ExecuteCodeResponse
      } catch (error) {
        setConsoleOutput((prev) => [
          ...prev,
          `${currentPrompt}${command}`,
          `ServerResponseParseError: ${error}`,
        ])
        break
      }
      const timeElapsed = data.time_elapsed
      const endTime = Date.now()
      setConsoleOutput((prev) => [
        ...prev,
        `${currentPrompt}${command}`,
        `${data.output}
executed in ${timeElapsed}ms (${endTime - startTime}ms)`,
      ])
      break
    case "help":
    case "h":
      setConsoleOutput((prev) => [...prev, `${currentPrompt}${command}`, getHelpText()])
      break
    case "insert":
      /*
      await fetch("/api/insert-problem", {
        method: "POST",
        body: JSON.stringify({
          problem: {
            title: "Best Time to Buy and Sell Stock II",
            description: dummyProblem,
          },
        }),
      })
      */

      setConsoleOutput((prev) => [...prev, `${currentPrompt}${command}`, "Inserted problem"])

      break
    default:
      setConsoleOutput((prev) => [
        ...prev,
        `${currentPrompt}${command}`,
        `sh: command not found: ${command}. Type "help" for more information.`,
      ])
      break
  }

  onSubmitNewCommand()
}

function getHelpText() {
  return `
Usage: [command]

Available commands:
  help, h          Display this help information
  run, r           Execute the current code in the editor
  clear            Clear the console output

Options:
  No additional options available at this time

Examples:
  help             Show help information

For more information, visit the documentation or type a command.
`
}
