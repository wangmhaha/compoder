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
        content: match[3].trim(),
      })
    }

    return {
      componentName,
      files: componentFiles,
    }
  } catch (error) {
    console.error("Error processing Component Artifact XML:", error)
    throw error
  }
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
