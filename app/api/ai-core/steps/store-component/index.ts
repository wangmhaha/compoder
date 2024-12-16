import { Component } from "@/service/components/schema"
import { WorkflowContext } from "../../type"

export const storeComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  await Component.create({
    name: context.state.designTask!.name,
    customName:
      context.query.component?.customName || context.state.designTask!.name,
    description: context.state.designTask!.description.user,
    version: context.state.processedComponent!.version,
    codeType: context.query.codeType,
    code: context.state.processedComponent!.code,
    query: JSON.stringify(context.query),
    logs: JSON.stringify(context.state),
    userId: context.query.userId,
  })

  context.stream.write(
    `new-component-id={{{${context.state.designTask!.name}}}} \n`,
  )

  return context
}
