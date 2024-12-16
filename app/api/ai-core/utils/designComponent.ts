import { WorkflowContext } from "../type"
import { getPrivateDocsDescription } from "./codegenRules"

export interface ComponentDesign {
  newComponentName: string
  newComponentDescription: string
  library: Array<{
    name: string
    components: string[]
    description: string
  }>
}

export async function generateComponentDesign(
  req: WorkflowContext,
): Promise<ComponentDesign> {
  const components_schema = {
    type: "object",
    properties: {
      newComponentName: {
        type: "string",
        minLength: 1,
        description: "New component name",
        errorMessage: {
          minLength: "Component name is required",
        },
      },
      newComponentDescription: {
        type: "string",
        minLength: 1,
        description:
          "Write a description for the component design task based on the user query. Stick strictly to what the user wants in their request - do not go off track",
        errorMessage: {
          minLength: "Component description is required",
        },
      },
      library: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "基础物料组件的库名",
            },
            components: {
              type: "array",
              items: {
                type: "string",
              },
              description: "基础物料组件的名字列表",
            },
            description: {
              type: "string",
              description: "用表格描述components中的每个组件是如何使用的",
            },
          },
          required: ["name", "components", "description"],
          description: "基础物料组件的库名，需一次性拿到所有的",
        },
      },
    },
    required: ["newComponentName", "newComponentDescription", "library"],
  }

  let completion = ""

  try {
    const stream = await openai.chat.completions.create({
      stream: true,
      model: getPromptModel(req.query.codeType),
      messages: [
        {
          role: `system`,
          content: `
          ## 角色
          你是一位资深的前端工程师，十分擅长开发业务组件。
          ## 目标
          从业务需求和设计稿图中提取出开发业务组件所需要的“基础组件物料“、业务组件的名称、描述信息。
          ## 限制
          基础组件物料包括：
          ${getPrivateDocsDescription(req.query.rules)}
          请注意：绝对不能给出以上基础组件物料之外的包，也不能给出示例代码，你的工作就是调用design_new_component_api生成新组件的设计细节。
          ## 工作流
          1、接受用户的业务需求或者设计稿图
          2、从[限制]的基础组件物料中提取出开发业务组件所需要的物料
          3、调用design_new_component_api生成新组件的设计细节
          `,
        },
        // 当存在上一次的component信息时（编辑迭代场景），需要将上一次的component信息传递给用户
        ...(!!req?.query?.component
          ? [
              {
                role: `user`,
                content: [
                  ...(req.query?.component?.imgUrl
                    ? [
                        {
                          type: "image_url",
                          image_url: {
                            url: req.query?.component?.imgUrl,
                          },
                        },
                      ]
                    : []),
                  {
                    type: "text",
                    text: req.query?.component?.description,
                  },
                ],
              },
              {
                role: `assistant`,
                content: `
                  - Component name : ${req.query?.component?.name}
                  - Component code :
                  ${req.query?.component?.code}
                `,
              },
            ]
          : []),
        ...(req.query.imgUrl
          ? [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: req.query.imgUrl },
                  },
                ],
              },
            ]
          : []),
        {
          role: `user`,
          content: req.query.description,
        },
        {
          role: `user`,
          content: `请调用design_new_component_api生成新组件的设计细节 ${
            isEmpty(req?.query?.component)
              ? ""
              : `（需要结合上一次的${req.query?.component?.name}组件的code来生成新的设计细节）`
          }`,
        },
      ] as Array<ChatCompletionMessageParam>,
      tools: [
        {
          type: "function",
          function: {
            name: `design_new_component_api`,
            description: `generate the required design details to create a new component`,
            parameters: components_schema,
          },
        },
      ],
    })

    for await (const part of stream) {
      try {
        process.stdout.write(part?.choices?.[0]?.delta?.content || "")
        process.stdout.write(
          part?.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments || "",
        )
      } catch (err) {
        console.log("err", err)
        false
      }
      try {
        const chunk =
          part?.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments || ""
        completion += chunk
      } catch (err) {
        console.log("err", err)
        false
      }
    }
  } catch (err) {
    console.log("err", err)
    throw new Error("call openai error")
  }

  completion = !!completion ? completion : `{}`

  let parserCompletion = {}

  try {
    parserCompletion = eval(`(${completion})`)
  } catch (e) {
    parserCompletion = {}
  }

  return {
    ...{
      newComponentName: "newComponentName",
      newComponentDescription: "newComponentDescription",
      library: [],
    },
    ...parserCompletion,
  }
}
