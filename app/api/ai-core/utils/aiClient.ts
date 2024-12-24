import { createOpenAI } from "@ai-sdk/openai"
import { env } from "@/lib/env"

export const getOpenaiClient = (model?: string) =>
  createOpenAI({
    baseURL: env.OPENAI_BASE_URL,
    apiKey: env.OPENAI_API_KEY,
  })(model ?? "openai/gpt-4o-2024-11-20")
