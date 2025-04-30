import { pipe } from "./utils/pipe"
import { withErrorHandling } from "./utils/errorHandling"
import {
  designComponent,
  generateComponent,
  updateComponent,
  initComponent,
} from "./steps"
import { InitialWorkflowContext, WorkflowContext } from "./type"

type Workflow = (context: InitialWorkflowContext) => Promise<WorkflowContext>

export const updateComponentWorkflow = pipe<
  InitialWorkflowContext,
  WorkflowContext
>(
  withErrorHandling(designComponent),
  withErrorHandling(generateComponent),
  withErrorHandling(updateComponent),
)

export const initComponentWorkflow = pipe<
  InitialWorkflowContext,
  WorkflowContext
>(
  withErrorHandling(designComponent),
  withErrorHandling(generateComponent),
  withErrorHandling(initComponent),
)

export async function run(workflow: Workflow, context: InitialWorkflowContext) {
  try {
    const result = await workflow(context)
    return {
      success: true,
      data: result.state,
    }
  } catch (error: any) {
    console.error("Workflow failed:", error)
    context.stream.write(error.toString())
    context.stream.close()
  }
}
