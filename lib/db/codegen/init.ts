import { connectToDatabase } from "../mongo"
import { createCodegen } from "./mutaitons"
import { Codegen } from "./types"

const codegenData: Codegen[] = [
  // {
  //   title: "Mui Codegen",
  //   description: "Code generator based on React and Mui",
  //   fullStack: "React",
  //   guides: ["Generate a login page", "Generate a Table component"],
  //   model: "gpt-4o",
  //   codeRendererUrl: "https://mui-renderer.pages.dev/artifacts",
  //   rules: [
  //     {
  //       type: "public-components",
  //       description: "Define which public components to use",
  //       dataSet: ["@mui/material", "@mui/icons-material"],
  //     },
  //     {
  //       type: "styles",
  //       description: "Define the rules for generating styles",
  //       prompt: "All styles must be written using sx prop only",
  //     },
  //   ],
  // },
  // {
  //   title: "Ant Design Codegen",
  //   description: "Code generator based on React and Ant Design",
  //   fullStack: "React",
  //   guides: ["Generate a login page", "Generate a Table component"],
  //   model: "gpt-4o",
  //   codeRendererUrl: "https://antd-renderer.pages.dev/artifacts",
  //   rules: [
  //     {
  //       type: "public-components",
  //       description: "Define which public components to use",
  //       dataSet: ["antd", "@ant-design/icons"],
  //     },
  //     {
  //       type: "styles",
  //       description: "Define the rules for generating styles",
  //       prompt: "Styles can only be written using tailwindcss",
  //     },
  //   ],
  // },
  {
    title: "Element Plus Codegen",
    description: "Code generator based on Element Plus",
    fullStack: "Vue",
    guides: ["Generate a login page", "Generate a Table component"],
    model: "gpt-4o",
    codeRendererUrl: "https://element-plus-renderer.pages.dev/artifacts",
    rules: [
      {
        type: "public-components",
        description: "Define which public components to use",
        dataSet: ["element-plus"],
      },
    ],
  },
  {
    title: "Shadcn/UI Codegen",
    description: "Code generator based on Shadcn/UI",
    fullStack: "React",
    guides: ["Generate a login page", "Generate a Table component"],
    model: "gpt-4o",
    codeRendererUrl: "https://shadcn-ui-renderer.pages.dev/artifacts",
    rules: [
      {
        type: "public-components",
        description: "Define which public components to use",
        dataSet: ["shadcn/ui"],
      },
    ],
  },
  {
    title: "React Tailwind CSS Component Codegen",
    description: "Code generator based on Tailwind CSS",
    fullStack: "React",
    guides: ["Generate a login page", "Generate a Table component"],
    model: "gpt-4o",
    codeRendererUrl: "https://tailwind-renderer.pages.dev/artifacts",
    rules: [
      {
        type: "public-components",
        description: "Define which public components to use",
        dataSet: ["tailwindcss"],
      },
    ],
  },
  {
    title: "My Company Private Component Codegen",
    description: "Code generator based on private components",
    fullStack: "React",
    guides: ["Generate a login page", "Generate a Table component"],
    model: "gpt-4o",
    codeRendererUrl: "https://private-component-renderer.pages.dev/artifacts",
    rules: [
      {
        type: "public-components",
        description: "Define which public components to use",
        dataSet: ["private-components"],
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
