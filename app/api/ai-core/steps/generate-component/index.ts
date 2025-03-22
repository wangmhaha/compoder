import { streamText } from "ai"
import { buildSystemPrompt, generateComponentMessage } from "./utils"
import {
  DesignProcessingWorkflowContext,
  GenerateProcessingWorkflowContext,
} from "../../type"

export const generateComponent = async (
  context: DesignProcessingWorkflowContext,
): Promise<GenerateProcessingWorkflowContext> => {
  context.stream.write("start call codegen-ai \n")

  let completion = ""

  const systemPrompt = buildSystemPrompt(
    context.query.rules,
    context.state?.designTask?.retrievedAugmentationContent,
  )

  console.log("generate-component systemPrompt:", systemPrompt)

  const messages = generateComponentMessage(context)

  const stream = await streamText({
    system: systemPrompt,
    model: context.query.aiModel,
    messages,
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
