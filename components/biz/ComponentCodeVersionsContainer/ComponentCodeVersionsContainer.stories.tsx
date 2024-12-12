import type { Meta, StoryObj } from "@storybook/react"
import { ComponentCodeVersionsContainer } from "./index"
import { useState } from "react"
import type { ComponentCodeVersionsContainerProps } from "./interface"
const ComponentCodeVersionsContainerWithState = (
  args: ComponentCodeVersionsContainerProps,
) => {
  const [activeVersion, setActiveVersion] = useState(args.activeVersion)

  return (
    <ComponentCodeVersionsContainer
      {...args}
      activeVersion={activeVersion}
      onVersionChange={setActiveVersion}
    />
  )
}

const meta: Meta<typeof ComponentCodeVersionsContainer> = {
  title: "Biz/ComponentCodeVersionsContainer",
  component: ComponentCodeVersionsContainer,
  tags: ["autodocs"],
  render: args => <ComponentCodeVersionsContainerWithState {...args} />,
}

export default meta
type Story = StoryObj<typeof ComponentCodeVersionsContainer>

export const Default: Story = {
  args: {
    versions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    activeVersion: 3,
    bubbleContent: "This is version 3 content",
    children: <div>Version content goes here</div>,
  },
}

export const WithContent: Story = {
  args: {
    versions: [1, 2, 3],
    activeVersion: 2,
    bubbleContent: "This is the content for version 2",
    children: <div className="h-screen">Additional content can go here</div>,
  },
}

export const ManyVersions: Story = {
  args: {
    versions: [1, 2, 3, 4, 5, 6, 7, 8],
    activeVersion: 4,
    bubbleContent: "Content description for version 4",
    children: <div>Content for version 4</div>,
  },
}
