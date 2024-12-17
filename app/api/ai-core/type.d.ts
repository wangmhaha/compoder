import { PassThrough } from "stream"
import { CodegenRule } from "@/lib/db/codegen/types"
import { LanguageModel } from "ai"
import { Prompt } from "@/lib/db/componentCode/types"

// workflow context type
export type WorkflowContext = {
  stream: PassThrough
  query: {
    prompt: Prompt[]
    aiModel: LanguageModel
    rules: CodegenRule[]
    userId: string
    component?: {
      id: string
      name: string
      code: string
      prompt: Prompt[]
    }
  }
  state?: {
    designTask: {
      componentName: string
      componentDescription: string
      library: Array<{
        name: string
        components: string[]
        description: string
      }>
      retrievedAugmentationContent?: string
    }
    generatedCode?: string
  }
}
