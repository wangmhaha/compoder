import { CoreMessage } from "ai"
import { WorkflowContext } from "../../type"
import {
  getPublicComponentsRule,
  getFileStructureRule,
  getStylesRule,
} from "../../utils/codegenRules"

// build system prompt
export const buildSystemPrompt = (
  rules: WorkflowContext["query"]["rules"],
  retrievedAugmentationContent?: string,
): string => {
  return `
    # You are a senior frontend engineer focused on business component development

    ## Goal
    Generate business component code based on requirements and component libraries


    ## Output Specification
    ${getFileStructureRule(rules)}

    ## Style Specification
    ${getStylesRule(rules)}

    ## Component Usage Guidelines
    1. Open Source Components
    - You can use components from ${getPublicComponentsRule(rules)?.join(", ")}
    - Use the latest stable version of APIs

    ${
      retrievedAugmentationContent
        ? `
    2. Private Components
    - Must strictly follow the API defined in the documentation below
    - Using undocumented private component APIs is prohibited
    <basic-component-docs>
      ${retrievedAugmentationContent}
    </basic-component-docs>
    `
        : ""
    }

    ## Workflow
    1. Analyze user requirements <user-requirements> </user-requirements>
    2. Use components specified in requirements, following component usage guidelines
    3. Generate business component code according to output specification
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
        - Component Name: ${design?.componentName}
        - Component Description: ${design?.componentDescription}
        - Base Components Used:
        ${design?.library
          ?.map(
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
