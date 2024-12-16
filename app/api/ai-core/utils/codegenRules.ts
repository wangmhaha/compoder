import { CodegenRule } from "@/lib/db/codegen/types"

export function getPublicComponentsRule(rules: CodegenRule[]) {
  return rules.find(rule => rule.type === "public-components")?.dataSet
}

export function getStylesRule(rules: CodegenRule[]) {
  return rules.find(rule => rule.type === "styles")?.prompt
}

export function getPrivateComponentDocs(rules: CodegenRule[]) {
  return rules.find(rule => rule.type === "private-components")?.docs
}

export function getPrivateDocsDescription(rules: CodegenRule[]): string {
  const configJson = getPrivateComponentDocs(rules)
  const basicPublicComponentLibrary = getPublicComponentsRule(rules)

  // Check if configJson is empty or not an object
  if (!configJson || Object.keys(configJson).length === 0) {
    return basicPublicComponentLibrary
      ? `- ${basicPublicComponentLibrary}中所有的组件`
      : ""
  }

  const templates: string[] = []

  if (!!basicPublicComponentLibrary) {
    templates.push(`
        - ${basicPublicComponentLibrary}中所有的组件
      `)
  }

  for (const namespace in configJson) {
    if (configJson.hasOwnProperty(namespace)) {
      const components = configJson[namespace]
      let componentDescriptions = ""

      for (const key in components) {
        if (components.hasOwnProperty(key)) {
          const component = components[key]
          componentDescriptions += `
  ${key}：${component.description}
  `
        }
      }

      const template = `
  - ${namespace}中的组件，如下内容是对${namespace}组件的描述（只能使用以下列出的组件名称）
  ---------------------
  ${componentDescriptions.trim()}
  ---------------------
  `
      templates.push(template.trim())
    }
  }

  return templates.join("\n\n")
}

export async function getFileStructureRule(rules: CodegenRule[]) {
  return rules.find(rule => rule.type === "file-structure")?.prompt
}
