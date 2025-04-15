import { FileNode } from "@/components/biz/CodeIDE/interface"

// Parse ComponentArtifact XML string, return component name and component file list
export function transformComponentArtifactFromXml(xmlString: string) {
  try {
    const nameMatch = xmlString.match(/<ComponentArtifact\s+name="([^"]+)">/)
    const componentName = nameMatch ? nameMatch[1] : null

    // Parse ComponentFile tags
    const componentFiles = []
    const fileRegex =
      /<ComponentFile\s+fileName="([^"]+)"(?:\s+isEntryFile="([^"]+)")?\s*>([\s\S]*?)<\/ComponentFile>/g
    let match

    while ((match = fileRegex.exec(xmlString)) !== null) {
      componentFiles.push({
        fileName: match[1],
        isEntryFile: match[2] === "true",
        content: match[3],
      })
    }

    const fileNodes: FileNode[] = componentFiles.map(file => ({
      id: file.fileName,
      name: file.fileName,
      content: file.content,
      isEntryFile: file.isEntryFile,
    }))

    const codes = fileNodes.reduce((acc, file) => {
      if (file.content) {
        acc[file.name] = file.content
      }
      return acc
    }, {} as Record<string, string>)

    return {
      componentName,
      entryFile: componentFiles.find(file => file.isEntryFile)?.fileName,
      files: fileNodes,
      codes,
    }
  } catch (error) {
    console.error("Error processing Component Artifact XML:", error)
    throw error
  }
}

// transform file node to xml string
export function transformFileNodeToXml(
  fileNodes: FileNode[],
  componentName: string,
) {
  const xmlFileString = fileNodes
    .map(
      file =>
        `<ComponentFile fileName="${file.name}" isEntryFile="${file.isEntryFile}">${file.content}</ComponentFile>`,
    )
    .join("\n")
  return `<ComponentArtifact name="${componentName}">${xmlFileString}</ComponentArtifact>`
}

// Parse XML string with format: <TryCatchError> ...error message... </TryCatchError>
export function transformTryCatchErrorFromXml(xmlString: string) {
  const errorMessage = xmlString.match(
    /<TryCatchError>([\s\S]*?)<\/TryCatchError>/,
  )
  return errorMessage ? errorMessage[1] : null
}

// Parse XML string with format: <NewComponentId> ...component id... </NewComponentId>
export function transformNewComponentIdFromXml(xmlString: string) {
  const componentId = xmlString.match(
    /<NewComponentId>([\s\S]*?)<\/NewComponentId>/,
  )
  return componentId ? componentId[1] : null
}

// Interface for component design data structure
export interface ComponentDesign {
  componentName: string
  componentDescription: string
  library: Array<{
    name: string
    components: string[]
    description: string
  }>
  retrievedAugmentationContent?: string
}

// Parse XML string with format:
// <ComponentDesign>
//   <ComponentName>name</ComponentName>
//   <ComponentDescription>description</ComponentDescription>
//   <Libraries>
//     <Library>
//       <Name>library name</Name> OR <n>library name</n>
//       <Components>
//         <Component>component1</Component>
//         <Component>component2</Component>
//         ...
//       </Components>
//       <Description>description text</Description>
//     </Library>
//     ...
//   </Libraries>
// </ComponentDesign>
export function transformComponentDesignFromXml(
  xmlString: string,
): ComponentDesign {
  try {
    // Extract component name
    const nameMatch = xmlString.match(
      /<ComponentName>([\s\S]*?)<\/ComponentName>/,
    )
    const componentName = nameMatch ? nameMatch[1].trim() : "componentName"

    // Extract component description
    const descMatch = xmlString.match(
      /<ComponentDescription>([\s\S]*?)<\/ComponentDescription>/,
    )
    const componentDescription = descMatch
      ? descMatch[1].trim()
      : "componentDescription"

    // Extract libraries
    const libraries = []

    // Find all Library tags content
    const libraryRegex = /<Library>([\s\S]*?)<\/Library>/g
    let libraryMatch

    while ((libraryMatch = libraryRegex.exec(xmlString)) !== null) {
      const libraryContent = libraryMatch[1]

      // Extract library name - support both <Name> and <n> tags
      let libNameMatch = libraryContent.match(/<Name>([\s\S]*?)<\/Name>/)
      if (!libNameMatch) {
        // Try alternative tag <n>
        libNameMatch = libraryContent.match(/<n>([\s\S]*?)<\/n>/)
      }
      const name = libNameMatch ? libNameMatch[1].trim() : ""

      // Extract components
      const components = []
      const componentRegex = /<Component>([\s\S]*?)<\/Component>/g
      let componentMatch

      while ((componentMatch = componentRegex.exec(libraryContent)) !== null) {
        components.push(componentMatch[1].trim())
      }

      // Extract description
      const libDescMatch = libraryContent.match(
        /<Description>([\s\S]*?)<\/Description>/,
      )
      const description = libDescMatch ? libDescMatch[1].trim() : ""

      libraries.push({ name, components, description })
    }

    return {
      componentName,
      componentDescription,
      library: libraries,
    }
  } catch (error) {
    console.error("Error processing Component Design XML:", error)
    throw new Error(`Failed to parse Component Design XML: ${error}`)
  }
}
