import { streamText } from "ai"
import { buildSystemPrompt, generateComponentMessage } from "./utils"
import {
  DesignProcessingWorkflowContext,
  GenerateProcessingWorkflowContext,
  OllamaModel,
} from "../../type"
import { LanguageModel } from "ai"

async function handleOllamaStream(
  ollamaModel: OllamaModel,
  systemPrompt: string,
  messages: any[],
  context: DesignProcessingWorkflowContext,
): Promise<string> {
  let completion = ""

  const response = await fetch(`${ollamaModel.config.baseURL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel.modelId,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: Array.isArray(msg.content)
            ? msg.content
                .map((c: { type: string; text: string }) =>
                  c.type === "text" ? c.text : "",
                )
                .join("\n")
            : msg.content,
        })),
      ],
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split("\n")

    for (const line of lines) {
      if (line.trim() === "") continue

      try {
        const parsed = JSON.parse(line)
        const content = parsed.message?.content || ""
        process.stdout.write(content || "")
        completion += content
        context.stream.write(content)
      } catch (e) {
        console.error("Error parsing JSON:", e)
      }
    }
  }

  return completion
}

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

  // 检查是否是 Ollama 模型
  const aiModel = context.query.aiModel
  const isOllamaModel =
    "specificationVersion" in aiModel &&
    aiModel.specificationVersion === "v1" &&
    "config" in aiModel &&
    aiModel.config.provider === "ollama.chat"

  if (isOllamaModel && (aiModel as OllamaModel).config) {
    completion = await handleOllamaStream(
      aiModel as OllamaModel,
      systemPrompt,
      messages,
      context,
    )
  } else {
    // Original implementation for other providers
    const stream = await streamText({
      system: systemPrompt,
      model: aiModel as LanguageModel,
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
