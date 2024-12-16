import { pipe } from "./utils/pipe"
import { withErrorHandling } from "./utils/errorHandling"
import {
  designComponent,
  generateComponent,
  postprocessGeneratedComponent,
  storeComponent,
} from "./steps"
import { WorkflowContext } from "./type"

export const componentWorkflow = pipe(
  withErrorHandling(designComponent),
  withErrorHandling(generateComponent),
  withErrorHandling(postprocessGeneratedComponent),
  withErrorHandling(storeComponent),
)

export async function run(context: WorkflowContext) {
  try {
    const result = await componentWorkflow(context)
    return {
      success: true,
      data: result.state,
    }
  } catch (error) {
    console.error("Workflow failed:", error)
    return {
      success: false,
      error: error as Error,
    }
  }
}
