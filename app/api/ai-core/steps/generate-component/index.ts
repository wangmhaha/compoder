import { streamText } from "ai"
import { buildSystemPrompt, generateComponentMessage } from "./utils"
import { WorkflowContext } from "../../type"

export const generateComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  context.stream.write("start call codegen-ai \n")

  let completion = ""

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

  context.stream.write("call codegen-ai end \n\n")

  return {
    ...context,
    state: {
      ...context.state,
      generatedCode: completion,
    },
  }
}
