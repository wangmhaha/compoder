import { PassThrough } from "stream"
import { CodegenRule } from "@/lib/db/codegen/types"
import { LanguageModel } from "ai"
import { Prompt } from "@/lib/db/componentCode/types"

// Define base workflow context
interface BaseWorkflowContext {
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
}

// design phase state
interface DesignPhaseState {
  state: {
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
  }
}

// generate code phase state
interface GeneratePhaseState {
  state: {
    generatedCode: string
  }
}

// workflow context type
export type WorkflowContext = BaseWorkflowContext &
  DesignPhaseState &
  GeneratePhaseState
