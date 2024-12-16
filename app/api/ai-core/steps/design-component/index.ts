import { generateComponentDesign } from "@/app/api/ai-core/steps/design-component/utils"
import { WorkflowContext } from "../../type"

export const designComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  context.stream.write("start design component \n")

  context.stream.write("start design component \n")

  const componentDesign = await generateComponentDesign(context)

  context.stream.write("design component end \n\n")

  return {
    ...context,
    state: {
      ...context.state,
      designTask: componentDesign,
    },
  }
}
