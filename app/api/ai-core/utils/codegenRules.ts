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
  const docs = getPrivateComponentDocs(rules)
  const basicPublicComponentLibrary = getPublicComponentsRule(rules)

  // Check if configJson is empty or not an object
  if (!docs || Object.keys(docs).length === 0) {
    return basicPublicComponentLibrary
      ? `- All components in ${basicPublicComponentLibrary}`
      : ""
  }

  const templates: string[] = []

  if (!!basicPublicComponentLibrary) {
    templates.push(`
        - All components in ${basicPublicComponentLibrary}
      `)
  }

  for (const namespace in docs) {
    if (docs.hasOwnProperty(namespace)) {
      const components = docs[namespace]
      let componentDescriptions = ""

      for (const key in components) {
        if (components.hasOwnProperty(key)) {
          const component = components[key]
          componentDescriptions += `
  ${key}: ${component.description}
  `
        }
      }

      const template = `
  - Components in ${namespace}, below are descriptions of ${namespace} components (can only use component names listed below)
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
