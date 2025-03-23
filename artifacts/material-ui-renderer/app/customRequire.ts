export const customRequire = (moduleName: string) => {
  const modules: { [key: string]: any } = {
    // base modules
    react: require("react"),
    "react-dom": require("react-dom"),
    "@mui/material": require("@mui/material"),
    "@mui/icons-material": require("@mui/icons-material"),
    "@mui/x-date-pickers": require("@mui/x-date-pickers"),
    "@mui/x-tree-view": require("@mui/x-tree-view"),
  }

  if (modules[moduleName]) {
    return modules[moduleName]
  }

  if (moduleName.startsWith("@mui/icons-material/")) {
    const componentName = moduleName.replace("@mui/icons-material/", "")
    return modules["@mui/icons-material"][componentName]
  }

  if (moduleName.startsWith("@mui/material/")) {
    const componentName = moduleName.replace("@mui/material/", "")
    return modules["@mui/material"][componentName]
  }

  throw new Error(`Module ${moduleName} not found`)
}
