import { WorkflowContext } from "../../type"

export const postprocessGeneratedComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  return {
    ...context,
    state: {
      ...context.state,
      processedComponent: {
        version: `${Date.now()}`,
        code: context.state.generatedCode!,
      },
    },
  }
}
