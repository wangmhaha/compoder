import {
  createComponentCode,
  updateComponentCode,
} from "@/lib/db/componentCode/mutations"
import { GenerateProcessingWorkflowContext } from "../../type"

export const storeComponent = async (
  context: GenerateProcessingWorkflowContext,
): Promise<GenerateProcessingWorkflowContext> => {
  console.log("storeComponent", context)
  if (context.query.component) {
    await updateComponentCode({
      id: context.query.component.id,
      prompt: context.query.prompt,
      code: context.state.generatedCode,
    })
  } else {
    const newComponent = await createComponentCode({
      userId: context.query.userId,
      codegenId: context.query.codegenId!,
      name: context.state.designTask.componentName,
      description: context.state.designTask.componentDescription,
      prompt: context.query.prompt,
      code: context.state.generatedCode,
    })
    context.stream.write(`<NewComponentId>${newComponent._id}</NewComponentId>`)
  }

  context.stream.close()

  return context
}
