import { CodegenRule } from "@/lib/db/codegen/types"

const IMPORTANT_NOTE = `Important: Write the code directly inside each ComponentFile tag. Do NOT use any code block markers (like \`\`\`tsx, \`\`\`ts, etc.) inside the XML tags.

`

const defaultFileStructure = `${IMPORTANT_NOTE}Output component code in XML format as follows:
<ComponentArtifact name="ComponentName">
  <ComponentFile fileName="App.tsx" isEntryFile="true">
    import { ComponentName } from './ComponentName';
    
    const mockProps = {
      // Define mock data here
    };
    
    export default function App() {
      return <ComponentName {...mockProps} />;
    }
  </ComponentFile>
  
  <ComponentFile fileName="[ComponentName].tsx">
    // Main component implementation
    // Split into multiple files if exceeds 500 lines
  </ComponentFile>

  <ComponentFile fileName="helpers.ts">
    // Helper functions (optional)
  </ComponentFile>

  <ComponentFile fileName="interface.ts">
    // Type definitions for component props
    // All API-interacting data must be defined as props:
    // - initialData for component initialization
    // - onChange, onSave, onDelete etc. for data modifications
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

export function getFileStructureRule(rules: CodegenRule[]) {
  const customPrompt = rules.find(
    rule => rule.type === "file-structure",
  )?.prompt
  if (customPrompt) {
    return IMPORTANT_NOTE + customPrompt
  }
  return defaultFileStructure
}
