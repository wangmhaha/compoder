import { streamText } from "ai"
import { buildSystemPrompt, generateComponentMessage } from "./utils"
import { WorkflowContext } from "../../type"

export const generateComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  context.stream.write("start call codegen-ai \n")

  let completion = ""
  let generated_code = ""

  const stream = await streamText({
    system: buildSystemPrompt(
      context.query.rules,
      context.state.designTask?.retrievedAugmentationContent,
    ),
    model: context.query.aiModel,
    messages: generateComponentMessage(context),
  })

  for await (const part of stream.textStream) {
    try {
      process.stdout.write(part || "")
      const chunk = part || ""
      completion += chunk
      context.stream.write(chunk)
    } catch (e) {
      console.error(e)
    }
  }

  let start = false
  for (const l of completion.split("\n")) {
    let skip = false
    if (
      [
        "```",
        ...[
          "tsx",
          "jsx",
          "typescript",
          "react",
          "javascript",
          "vue",
          "code",
        ].map(e => "```" + e),
      ].includes(l.toLowerCase().trim())
    ) {
      start = !start
      skip = true
    }
    if (start && !skip) generated_code += `${l}\n`
  }
  generated_code = generated_code.trim()

  context.stream.write("call codegen-ai end \n\n")

  return {
    ...context,
    state: {
      ...context.state,
      generatedCode: generated_code || `'${completion}'`,
    },
  }
}
