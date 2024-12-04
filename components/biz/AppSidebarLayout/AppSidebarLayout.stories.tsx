import type { Meta, StoryObj } from "@storybook/react"

import { AppSidebarLayout } from "./AppSidebarLayout"

const meta = {
  title: "Biz/AppSidebarLayout",
  component: AppSidebarLayout,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    Story => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppSidebarLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
}

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
}
