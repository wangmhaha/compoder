# Generate Business Component with Shadcn UI

Generate a business component that uses Shadcn UI base components, following the project's component structure.

## Input Format

Describe your component requirements in natural language, including:

- What the component should display/do
- Any interactions or behaviors needed
- Layout and styling preferences (optional)

Example inputs:

```
"Create a user profile card that shows the user's information including their photo, name, and a short bio"
```

or

```
"I need a search input component with a search button. When users type, it should show suggestions below the input"
```

## Analysis Steps

1. Component Analysis:

   - Determine the core functionality and purpose
   - Identify the data/content to be displayed
   - Understand user interactions and behaviors

2. Shadcn UI Component Selection:
   - Based on the requirements, determine appropriate Shadcn UI components
   - For data display: Card, Avatar, Badge, etc.
   - For user input: Input, Select, Textarea, etc.
   - For interactions: Button, Dialog, Dropdown, etc.
   - For layout: Tabs, Accordion, ScrollArea, etc.

## Output Structure

```
components/biz/[ComponentName]/
├── [ComponentName].tsx         // Main component file
├── [ComponentName].stories.tsx // Storybook stories
├── interface.ts               // TypeScript interfaces
├── helpers.ts                // Helper functions
└── index.ts                  // Barrel export file
```

## Rules

1. Component File ([ComponentName].tsx):

   - Import required Shadcn UI components from "@/components/ui/"
   - Use TypeScript and React.FC type
   - Follow functional component pattern
   - Import interfaces from "./interface"

2. Stories File ([ComponentName].stories.tsx):

   - Include basic story setup with Meta and StoryObj
   - Provide example usage with meaningful props
   - Enable autodocs
   - Use centered layout

3. Interface File (interface.ts):

   - Define and export component props interface
   - Include JSDoc comments for props documentation
   - Use proper TypeScript types

4. Helpers File (helpers.ts):

   - Include utility functions specific to the component
   - Export all helpers

5. Index File (index.ts):
   - Barrel export the main component
   - Export component props type

## Example

Input:

```
"Create a user profile card that shows the user's information including their photo, name, and a short bio"
```

Analysis:

- Component purpose: Display user profile information
- Required data: photo, name, bio
- Suggested Shadcn UI components:
  - Card: For the container layout
  - Avatar: For user photo display
  - Typography components: For name and bio text

Output:

```typescript
// UserProfileCard.tsx
import React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserProfileCardProps } from "./interface"

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  bio,
  avatarUrl,
}) => {
  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold">{name}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  )
}

export default UserProfileCard
```

```typescript
// interface.ts
interface UserProfileCardProps {
  /**
   * @description User's full name
   */
  name: string

  /**
   * @description User's biography or description
   */
  bio: string

  /**
   * @description URL to user's avatar image
   */
  avatarUrl?: string
}

export type { UserProfileCardProps }
```

```typescript
// index.ts
export { default as UserProfileCard } from "./UserProfileCard"
export type { UserProfileCardProps } from "./interface"
```

## Notes

- Follow React best practices and TypeScript conventions
- Use proper import paths for Shadcn UI components
- Include proper TypeScript types and interfaces
- Follow the project's existing component structure
- Use JSDoc comments for documentation
- Analyze the natural language input to determine:
  1. Component name and purpose
  2. Required props and their types
  3. Appropriate Shadcn UI components based on requirements
  4. Component layout and structure
  5. Necessary interactions and behaviors
