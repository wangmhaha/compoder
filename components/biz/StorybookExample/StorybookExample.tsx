import React from "react"
import { Button } from "@/components/ui/button"
import { StorybookExampleProps } from "./interface"

const StorybookExample: React.FC<StorybookExampleProps> = ({ title }) => {
  return (
    <>
      <div className="m-4 p-4 bg-red-500  text-white">{title}</div>
      <Button variant="default">StorybookExample</Button>
    </>
  )
}

export default StorybookExample
