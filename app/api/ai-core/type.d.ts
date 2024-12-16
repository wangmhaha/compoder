import { PassThrough } from "stream"
import { CodegenRule } from "@/lib/db/codegen/types"

export interface WorkflowContext {
  stream: PassThrough
  query: {
    text?: string
    model: string
    rules: CodegenRule[]
    component?: {
      name: string
      customName: string
      description: string
      code: string
      imgUrl?: string
    }
    userId: string
    codeType: string
    description: string
    imgUrl?: string
    ai?: {
      key: string
      baseUrl: string
    }
    designComponentMessages?: string
  }

  state: {
    designTask?: {
      name: string
      description: {
        user: string
        llm: string
      }
      retrievedAugmentationContent?: string
      generateComponentPrompt: Array<{
        role: "user" | "assistant"
        content:
          | string
          | Array<{ type: string; text: string; image_url?: { url: string } }>
      }>
    }
    generatedCode?: string
    processedComponent?: {
      version: string
      code: string
    }
  }
}
