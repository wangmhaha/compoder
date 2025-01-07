import { createOpenAI } from "@ai-sdk/openai"
import { env } from "@/lib/env"

export const getOpenaiClient = (model?: string) =>
  createOpenAI({
    baseURL: env.OPENAI_BASE_URL,
    apiKey: env.OPENAI_API_KEY,
  })(model ?? "claude-3-5-sonnet-20241022")
