import { CodegenRule } from "@/lib/db/codegen/types"

const defaultFileStructure = `
Output component code in XML format as follows:
<ComponentArtifact name="ComponentName">
  <ComponentFile fileName="App.tsx" isEntryFile="true">
      // In this file, mock data needs to be created for each component prop, and export default the component demo
  </ComponentFile>
  <ComponentFile fileName="[ComponentName].tsx">
      // This file contains the actual business logic of the component. If the component code exceeds 500 lines, split it
  </ComponentFile>
  <ComponentFile fileName="helpers.ts">
      // This file contains helper functions for the component (optional)
  </ComponentFile>
  <ComponentFile fileName="interface.ts">
      // This file contains prop type definitions for the component. Note: All data that needs to interact with APIs must be defined through props, such as component initialization data props (initialData), props for modifying API data (onChange, onSave, onDelete, etc.)
  </ComponentFile>
</ComponentArtifact>
`

const defaultStyles = `
Use tailwindcss to write styles
`

export function getPublicComponentsRule(rules: CodegenRule[]) {
  return rules.find(rule => rule.type === "public-components")?.dataSet
}

export function getStylesRule(rules: CodegenRule[]) {
  return rules.find(rule => rule.type === "styles")?.prompt ?? defaultStyles
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
  return (
    rules.find(rule => rule.type === "file-structure")?.prompt ??
    defaultFileStructure
  )
}
