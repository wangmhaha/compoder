import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createDeepSeek } from "@ai-sdk/deepseek"

import { findModelConfig, type AIProvider } from "@/lib/config/ai-providers"

// Generic AI client factory
export const getAIClient = (provider: AIProvider, model: string) => {
  const modelConfig = findModelConfig(provider, model)

  switch (provider) {
    case "openai":
      return createOpenAI({
        baseURL: modelConfig.baseURL,
        apiKey: modelConfig.apiKey,
      })(modelConfig.model)
    case "anthropic":
      return createAnthropic({
        baseURL: modelConfig.baseURL,
        apiKey: modelConfig.apiKey,
      })(modelConfig.model)
    case "deepseek":
      return createDeepSeek({
        baseURL: modelConfig.baseURL,
        apiKey: modelConfig.apiKey,
      })(modelConfig.model)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

// Backward compatibility functions
export const getOpenaiClient = (model: string) => getAIClient("openai", model)

export const getAnthropicClient = (model: string) =>
  getAIClient("anthropic", model)
