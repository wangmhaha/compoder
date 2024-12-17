import { ComponentCodeModel } from "./schema"
import { Prompt } from "./types"

export async function createComponentCode({
  userId,
  name,
  description,
  prompt,
  code,
}: {
  userId: string
  name: string
  description: string
  prompt: Prompt[]
  code: string
}) {
  try {
    const componentCode = await ComponentCodeModel.create({
      userId,
      name,
      description,
      versions: [
        {
          code,
          prompt,
        },
      ],
    })

    return {
      _id: componentCode._id,
      ...componentCode.toObject(),
    }
  } catch (error) {
    console.error("Error creating component code:", error)
    throw error
  }
}

export async function updateComponentCode({
  id,
  prompt,
  code,
}: {
  id: string
  prompt: Prompt[]
  code: string
}) {
  try {
    const componentCode = await ComponentCodeModel.findById(id)
    if (!componentCode) {
      throw new Error("Component code not found")
    }
    componentCode.versions.push({ prompt, code })
    await componentCode.save()
    return {
      _id: componentCode._id,
      ...componentCode.toObject(),
    }
  } catch (error) {
    console.error("Error updating component code:", error)
    throw error
  }
}
