import { WorkflowContext } from "../type"

export const withErrorHandling =
  <T>(fn: (ctx: WorkflowContext) => Promise<T>) =>
  async (context: WorkflowContext): Promise<T> => {
    try {
      return await fn(context)
    } catch (error) {
      context.stream.write(`${fn.name} failed: ${error}\n`)
      throw error
    }
  }
