import { connectToDatabase } from "../mongo"
import { createCodegen } from "./mutaitons"
import { Codegen } from "./types"

const codegenData: Codegen[] = [
  {
    title: "Mui Codegen",
    description: "Code generator based on React and Mui",
    fullStack: "React",
    guides: ["Generate a login page", "Generate a Table component"],
    model: "gpt-4o",
    codeRendererUrl: "https://mui-renderer.pages.dev/artifacts",
    rules: [
      {
        type: "public-components",
        description: "Define which public components to use",
        dataSet: ["@mui/material", "@mui/icons-material"],
      },
      {
        type: "styles",
        description: "Define the rules for generating styles",
        prompt: "All styles must be written using sx prop only",
      },
    ],
  },
  {
    title: "Ant Design Codegen",
    description: "Code generator based on React and Ant Design",
    fullStack: "React",
    guides: ["Generate a login page", "Generate a Table component"],
    model: "gpt-4o",
    codeRendererUrl: "https://antd-renderer.pages.dev/artifacts",
    rules: [
      {
        type: "public-components",
        description: "Define which public components to use",
        dataSet: ["antd", "@ant-design/icons"],
      },
      {
        type: "styles",
        description: "Define the rules for generating styles",
        prompt: "Styles can only be written using tailwindcss",
      },
    ],
  },
]

export async function initCodegen() {
  await connectToDatabase()
  console.log("init codegen")
  await createCodegen(codegenData)
  console.log("init codegen success")
}

initCodegen()
