import React, { useEffect, useState } from "react"
import { transform } from "@babel/standalone"
import path from "path-browserify"
import { ErrorDisplay } from "./ErrorDisplay"
import { ErrorBoundary } from "./ErrorBoundary"
import {
  DynamicComponentRendererProps,
  ModuleCache,
  ExportsObject,
} from "./interface"

const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({
  files,
  entryFile,
  customRequire,
  onError,
  onSuccess,
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const modules: ModuleCache = {}

    const processFile = (filename: string): any => {
      if (modules[filename]) {
        return modules[filename].exports
      }
      const code = files[filename]
      if (!code) {
        throw new Error(`File not found: ${filename}`)
      }

      const transformedCode = transform(code, {
        filename,
        presets: ["react", "env", "typescript"],
        plugins: ["transform-modules-commonjs"],
      }).code

      const exports: ExportsObject = {}
      const myModule = { exports }

      const ComponentModule = new Function(
        "require",
        "module",
        "exports",
        "__filename",
        "React",
        transformedCode!,
      )

      ComponentModule(
        (importPath: string) => {
          const resolvedPath = importPath.startsWith(".")
            ? path.join(path.dirname(filename), importPath).replace(/^\//, "")
            : importPath

          const possiblePaths = [
            resolvedPath,
            resolvedPath + ".ts",
            resolvedPath + ".tsx",
            resolvedPath + "/index.ts",
            resolvedPath + "/index.tsx",
            resolvedPath.replace(/\.(ts|tsx)$/, ""),
          ]

          const normalizedPath = Object.keys(files).find(file =>
            possiblePaths.includes(file),
          )

          if (normalizedPath) {
            return processFile(normalizedPath)
          }
          return customRequire(importPath)
        },
        myModule,
        exports,
        filename,
        require("react"),
      )

      modules[filename] = myModule
      return myModule.exports
    }

    const parseComponents = async () => {
      try {
        setError(null)
        processFile(entryFile)
        setComponent(() => modules[entryFile].exports.default)
        onSuccess()
      } catch (error: any) {
        console.error("parseComponents error:", error)
        setError("parse component error: " + error.message)
        onError("parse component error: " + error.message)
      }
    }

    parseComponents()
  }, [files, entryFile, customRequire, onError])

  if (error) {
    return <ErrorDisplay errorMessage={error} />
  }

  if (!Component) {
    return null
  }

  return (
    <ErrorBoundary onError={onError} files={files}>
      <Component />
    </ErrorBoundary>
  )
}

export default DynamicComponentRenderer
