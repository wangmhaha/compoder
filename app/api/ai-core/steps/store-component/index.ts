import { WorkflowContext } from "../../type"
import {
  createComponentCode,
  updateComponentCode,
} from "@/lib/db/componentCode/mutations"

export const storeComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  // 当context.query.component存在时，更新componentCode
  if (context.query.component) {
    await updateComponentCode({
      id: context.query.component.id,
      prompt: context.query.prompt,
      code: context.state.generatedCode,
    })
  } else {
    const newComponent = await createComponentCode({
      userId: context.query.userId,
      name: context.state.designTask!.componentName,
      description: context.state.designTask!.componentDescription,
      prompt: context.query.prompt,
      code: context.state.generatedCode,
    })
    context.stream.write(`<newComponentId>${newComponent._id}</newComponentId>`)
  }

  return context
}
