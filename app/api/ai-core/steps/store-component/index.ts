/*
 * @Descripttion: 
 * @version: 
 * @Author: wangmin
 * @Date: 2025-07-02 16:20:51
 * @LastEditors: wangmin
 * @LastEditTime: 2025-07-02 16:27:49
 */
import {
  initComponentCode,
  updateComponentCodeVersion,
} from "@/lib/db/componentCode/mutations"
import { GenerateProcessingWorkflowContext } from "../../type"
import { transformComponentArtifactFromXml } from "@/lib/xml-message-parser/parser"

// Helper function to merge component files
function mergeComponentFiles(originalXml: string, newXml: string): string {
  // 解析原始XML和新的XML
  const originalComponent = transformComponentArtifactFromXml(originalXml)
  const newComponent = transformComponentArtifactFromXml(newXml)

  if (!originalComponent || !newComponent) {
    // 如果无法解析，直接返回原始的XML
    return originalXml
  }

  // 创建一个文件名到文件内容的映射
  const fileMap = new Map()

  // 先添加所有原始文件
  originalComponent.files.forEach(file => {
    fileMap.set(file.name, {
      content: file.content,
      isEntryFile: file.isEntryFile,
    })
  })

  // 然后用新文件覆盖或添加
  newComponent.files.forEach(file => {
    fileMap.set(file.name, {
      content: file.content,
      isEntryFile: file.isEntryFile,
    })
  })

  // 构建合并后的XML
  let mergedXml = `<ComponentArtifact name="${
    newComponent.componentName || originalComponent.componentName
  }">`

  // 添加所有文件
  fileMap.forEach((file, fileName) => {
    mergedXml += `\n  <ComponentFile fileName="${fileName}" isEntryFile="${file.isEntryFile}">`
    mergedXml += file.content
    mergedXml += `</ComponentFile>`
  })

  mergedXml += "\n</ComponentArtifact>"

  return mergedXml
}

export const updateComponent = async (
  context: GenerateProcessingWorkflowContext,
): Promise<GenerateProcessingWorkflowContext> => {
  if (!context.query.component) {
    throw new Error("Component not found")
  }
  // 获取原始代码和新生成的代码
  const originalCode = context.query.component.code
  const newCode = context.state.generatedCode

  // 合并组件文件
  const mergedCode = mergeComponentFiles(originalCode, newCode)

  await updateComponentCodeVersion({
    id: context.query.component.id,
    prompt: context.query.prompt,
    code: mergedCode,
  })

  context.stream.close()

  return context
}

export const initComponent = async (
  context: GenerateProcessingWorkflowContext,
): Promise<GenerateProcessingWorkflowContext> => {
  if (!context.query.component) {
    throw new Error("Component not found")
  }
  const originalCode = context.query.component.code
  if (originalCode) {
    throw new Error("Component already initialized")
  }

  await initComponentCode({
    id: context.query.component.id,
    code: context.state.generatedCode,
    name: context.state.designTask.componentName,
    description: context.state.designTask.componentDescription,
  })

  context.stream.close()

  return context
}
