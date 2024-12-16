import { getOpenAI } from "@/service/utils/openai"
import { generateComponentDesign } from "../helpers"
import { getPrompt } from "@/utils/codegenConfig/index.server"
import { WorkflowContext } from "../../type"

export const designCreateComponent = async (
  context: WorkflowContext,
): Promise<WorkflowContext> => {
  const openai = getOpenAI(context.query.ai?.key, context.query.ai?.baseUrl, {
    parent: context.trace.span,
    generationName: "design-create-component",
    tags: [context.query.codeType],
  })

  context.stream.write("start design component \n")

  const component_design = await generateComponentDesign(openai, context)

  const designLibrary = component_design.library
  const retrievedAugmentationContent = getRetrievedAugmentationContent(
    context.query.codeType,
    designLibrary,
  )

  const customPrompt = getPrompt(context.query.codeType!)

  const generateComponentPrompt = [
    {
      role: "system",
      content: `
      ## 角色
      你是一位资深的前端工程师，十分擅长编写业务组件代码。

      ## 目标
      拼装基础物料组件生成业务组件代码。

      ## 限制
      - 如果有基础物料组件文档，则必须遵循文档来生成业务组件代码，基础物料组件文档放在<basic-component-docs>  </basic-component-docs>中包裹

      ${
        !!customPrompt
          ? `
      ## 特别注意
      ${customPrompt}`
          : ""
      }

      ## 工作流
      1、接受<user-requirements> </user-requirements>包裹的用户需求
      2、时刻记住你的[限制]
      3、生成符合用户需求的业务组件代码
      `,
    },
    ...(!!retrievedAugmentationContent
      ? [
          {
            role: "system",
            content: `
        如下<basic-component-docs>  </basic-component-docs>中是基础物料组件文档，必须遵循文档来生成业务组件代码，尤其是不能使用文档之外未知的api
        <basic-component-docs>
        ${retrievedAugmentationContent}
        </basic-component-docs>
      `,
          },
        ]
      : []),
    ...(context.query.designComponentMessages
      ? context.query.designComponentMessages
      : [
          ...(context.query.imgUrl
            ? [
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: { url: context.query.imgUrl },
                    },
                  ],
                },
              ]
            : []),
          {
            content: `<user-requirements> ${context.query.description} </user-requirements>`,
            role: "user",
          },
        ]),
    {
      role: "assistant",
      content: JSON.stringify(component_design),
    },
    {
      role: "user",
      content:
        "请开始生成代码，不要添加任何额外的文字描述或注释。你的回答只包含代码！仅限组件代码，生成的所有的代码是放在一个文件中，用```code ```包裹起来，不要重复import package, 每次必须给出完整的代码。组件需要包含一个demo演示，并export default默认导出。",
    },
  ]

  context.stream.write("design component end \n\n")

  return {
    ...context,
    state: {
      ...context.state,
      designTask: {
        name: `${component_design.new_component_name}_${randomUid(5)}`,
        description: {
          user: context.query.description,
          llm: component_design.new_component_description,
        },
        retrievedAugmentationContent,
        generateComponentPrompt,
      },
    },
  }
}
