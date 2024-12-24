import { streamText, CoreMessage } from "ai"
import { WorkflowContext } from "../../type"
import {
  getPrivateComponentDocs,
  getPrivateDocsDescription,
} from "../../utils/codegenRules"
import { z } from "zod"

export interface ComponentDesign {
  componentName: string
  componentDescription: string
  library: Array<{
    name: string
    components: string[]
    description: string
  }>
  retrievedAugmentationContent?: string
}

const buildSystemPrompt = (rules: WorkflowContext["query"]["rules"]) => {
  return `
    # You are a senior frontend engineer who excels at developing business components.
    ## Goal
    Extract the "basic component materials", component name, and description information needed to develop business components from business requirements and design drafts.
    ## Constraints
    Basic component materials include:
    ${getPrivateDocsDescription(rules)}
    Please note: You absolutely cannot provide packages outside of the above basic component materials, nor provide example code. Your job is to call designNewComponentApi to generate design details for the new component.
    ## Workflow
    1. Accept user's business requirements or design draft images
    2. Extract required materials from [Constraints] basic component materials for developing business components
    3. Call designNewComponentApi to generate design details for the new component
    `
}

// When component exists, build corresponding user message and assistant message
const buildCurrentComponentMessage = (
  component: WorkflowContext["query"]["component"],
): Array<CoreMessage> => {
  return component
    ? [
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
    : []
}

// Build user message
const buildUserMessage = (
  prompt: WorkflowContext["query"]["prompt"],
  component?: WorkflowContext["query"]["component"],
): Array<CoreMessage> => {
  return [
    {
      role: "user",
      content: prompt
        .map(p => {
          if (p.type === "image") {
            return { type: "image" as const, image: p.image }
          }
          return { type: "text" as const, text: p.text }
        })
        .concat({
          type: "text",
          text: `
            Please call designNewComponentApi to generate design details for the new component
            ${
              !component
                ? ""
                : `(need to combine with the code from the previous ${component?.name} component to generate new design details)`
            }
          `,
        }),
    },
  ]
}

// get the api of the components in the library
export function getRetrievedAugmentationContent(
  docs: ReturnType<typeof getPrivateComponentDocs>,
  library?: ComponentDesign["library"],
): string {
  if (!library) {
    return ``
  }

  const templates: string[] = []

  for (const param of library) {
    const namespace = param.name
    const componentsList = param?.components
    const components = docs?.[namespace]

    if (components) {
      let componentDescriptions = ""

      for (const componentName of componentsList) {
        const component = components[componentName]
        if (component) {
          componentDescriptions += `
${componentName}: ${component.api}
`
        }
      }

      const template = `
The following content describes the usage of components in the ${namespace} library
---------------------
${componentDescriptions.trim()}
---------------------
`
      templates.push(template.trim())
    }
  }

  return templates.join("\n\n")
}

export async function generateComponentDesign(
  req: WorkflowContext,
): Promise<ComponentDesign> {
  const componentsSchema = z.object({
    componentName: z.string().describe("Component name"),
    componentDescription: z.string().describe("Component description"),
    library: z.array(
      z
        .object({
          name: z.string().describe("Library name"),
          components: z
            .array(z.string())
            .describe("Components name in the library"),
          description: z
            .string()
            .describe(
              "Describe how each component in components is used in a table format",
            ),
        })
        .describe(
          "Libraries containing required base material components. Need to get all base material component libraries at once",
        ),
    ),
  })

  let parserCompletion: ComponentDesign = {
    componentName: "componentName",
    componentDescription: "componentDescription",
    library: [],
  }

  const systemPrompt = buildSystemPrompt(req.query.rules)

  const messages = [
    ...buildCurrentComponentMessage(req.query.component),
    ...buildUserMessage(req.query.prompt, req.query.component),
  ]

  try {
    const stream = await streamText({
      system: systemPrompt,
      model: req.query.aiModel,
      messages,
      tools: {
        designNewComponentApi: {
          description:
            "generate the required design details to create a new component",
          parameters: componentsSchema,
          execute: async params => {
            console.log("params", params)
            parserCompletion = params
          },
        },
      },
    })

    for await (const part of stream.textStream) {
      console.log("part", part)
    }

    if (parserCompletion.library.length > 0) {
      const docs = getPrivateComponentDocs(req.query.rules)
      parserCompletion.retrievedAugmentationContent =
        getRetrievedAugmentationContent(docs, parserCompletion.library)
    }

    return parserCompletion
  } catch (err) {
    console.log("err", err)
    throw new Error("Stream processing error")
  }
}
