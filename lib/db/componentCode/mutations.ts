import { ComponentCodeModel } from "./schema"
import { Prompt, Version } from "./types"

export async function createComponentCode({
  userId,
  codegenId,
  name,
  description,
  prompt,
  code,
}: {
  userId: string
  codegenId: string
  name: string
  description: string
  prompt: Prompt[]
  code: string
}) {
  try {
    const versions = []
    if (prompt) {
      versions.push({
        code,
        prompt,
      })
    }
    const componentCode = await ComponentCodeModel.create({
      userId,
      codegenId,
      name,
      description,
      versions,
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

export async function initComponentCode({
  id,
  code,
  name,
  description,
}: {
  id: string
  code: string
  name?: string
  description?: string
}) {
  try {
    const componentCode = await ComponentCodeModel.findById(id)
    if (!componentCode) {
      throw new Error("Component code not found")
    }
    const lastVersion =
      componentCode.versions[componentCode.versions.length - 1]
    if (!lastVersion) {
      throw new Error("Version not found")
    }
    lastVersion.code = code
    if (name && componentCode.name !== name) {
      componentCode.name = name
    }
    if (description && componentCode.description !== description) {
      componentCode.description = description
    }
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

export async function updateComponentCodeVersion({
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

export async function saveComponentCodeVersion({
  id,
  versionId,
  code,
}: {
  id: string
  versionId: string
  code: string
}) {
  try {
    const componentCode = await ComponentCodeModel.findById(id)
    if (!componentCode) {
      throw new Error("Component code not found")
    }

    const versionIndex = componentCode.versions.findIndex(
      (v: Version) => v._id.toString() === versionId,
    )
    if (versionIndex === -1) {
      throw new Error("Version not found")
    }

    componentCode.versions[versionIndex].code = code
    await componentCode.save()

    return {
      _id: componentCode._id,
      ...componentCode.toObject(),
    }
  } catch (error) {
    console.error("Error saving component code version:", error)
    throw error
  }
}

export async function deleteComponentCode({ id }: { id: string }) {
  try {
    const result = await ComponentCodeModel.findByIdAndDelete(id)
    if (!result) {
      throw new Error("Component code not found")
    }
    return { success: true }
  } catch (error) {
    console.error("Error deleting component code:", error)
    throw error
  }
}
