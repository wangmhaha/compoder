import { Types } from "mongoose"

export type PromptText = {
  type: "text"
  text: string
}

export type PromptImage = {
  type: "image"
  image: string
}

export type Prompt = PromptText | PromptImage

export type Version = {
  code: string
  prompt: Prompt[]
}

export interface ComponentCode {
  _id: Types.ObjectId
  userId: Types.ObjectId
  codegenId: Types.ObjectId
  name: string
  description: string
  versions: Version[]
}
