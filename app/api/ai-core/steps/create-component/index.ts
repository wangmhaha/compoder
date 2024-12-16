import { WorkflowContext } from "../../type"

export const createComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  const openai = getOpenAI(context.query.ai?.key, context.query.ai?.baseUrl, {
    parent: context.trace.span,
    generationName: "create-component",
    tags: [context.query.codeType],
  })

  context.stream.write("start call codegen-ai \n")

  let completion = ""
  let generated_code = ""

  const stream = await openai.chat.completions.create({
    stream: true,
    model: getPromptModel(context.query.codeType),
    messages: context.state.designTask!.generateComponentPrompt,
  })

  for await (const part of stream) {
    try {
      process.stdout.write(part?.choices?.[0]?.delta?.content || "")
      const chunk = part?.choices?.[0]?.delta?.content || ""
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
