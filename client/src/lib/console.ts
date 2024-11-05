import { SupportedLanguage } from "../../editor/editor"
import { ExecuteCodeResponse } from "./schema"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

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
