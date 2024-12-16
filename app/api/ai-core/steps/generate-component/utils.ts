import { CoreMessage } from "ai"
import { WorkflowContext } from "../../type"
import { getPublicComponentsRule } from "../../utils/codegenRules"

// build system prompt
export const buildSystemPrompt = (
  rules: WorkflowContext["query"]["rules"],
  retrievedAugmentationContent?: string,
): string => {
  return `
    # 你是一位资深的前端工程师，专注于业务组件开发

    ## 目标
    基于需求和组件库生成业务组件代码

    ## 输出规范
    - 仅输出代码，不含描述或注释
    - 单文件代码，使用 \`\`\`code \`\`\` 包裹
    - 避免重复 import
    - 包含 demo 演示
    - 使用 export default 导出

    ## 组件使用规范
    1. 开源组件
    - 可以使用 ${getPublicComponentsRule(rules)?.join(", ")} 中的组件
    - 使用最新稳定版本的 API

    ${
      retrievedAugmentationContent
        ? `
    2. 私有组件
    - 必须严格遵循以下文档定义的 API
    - 禁止使用文档未提供的私有组件 API
    <basic-component-docs>
      ${retrievedAugmentationContent}
    </basic-component-docs>
    `
        : ""
    }

    ## 工作流程
    1. 分析用户需求 <user-requirements> </user-requirements>
    2. 使用需求中指定的组件，遵循组件使用规范
    3. 按输出规范生成业务组件代码
    `
}

// build current component prompt
// When component exists, build corresponding user message and assistant message
export const buildCurrentComponentMessage = (
  component: WorkflowContext["query"]["component"],
): Array<CoreMessage> => {
  return [
    {
      role: "user",
      content:
        component?.prompt?.map(prompt => {
          if (prompt.type === "image") {
            return { type: "image" as const, image: prompt.image }
          }
          return { type: "text" as const, text: prompt.text }
        }) || [],
    },
    {
      role: "assistant",
      content: `
          - Component name: ${component?.name}
          - Component code:
          ${component?.code}
        `,
    },
  ]
}

// build user prompt
export const buildUserMessage = (
  prompt: WorkflowContext["query"]["prompt"],
  design: WorkflowContext["state"]["designTask"],
): Array<CoreMessage> => {
  return [
    {
      role: "user",
      content: prompt.map(p => {
        if (p.type === "image") {
          return { type: "image" as const, image: p.image }
        }
        return {
          type: "text" as const,
          text: `<user-requirements>
        ${p.text}

        ## Component Design Information
        - Component Name: ${design.componentName}
        - Component Description: ${design.componentDescription}
        - Base Components Used:
        ${design.library
          .map(
            lib => `
          ${lib.name}:
          - Component List: ${lib.components.join(", ")}
          - Usage Instructions: ${lib.description}
        `,
          )
          .join("\n")}
        </user-requirements>`,
        }
      }),
    },
  ]
}

// generate component prompt
export const generateComponentMessage = (
  context: WorkflowContext,
): Array<CoreMessage> => {
  return [
    ...buildCurrentComponentMessage(context.query.component),
    ...buildUserMessage(context.query.prompt, context.state.designTask),
  ]
}
