# Storybook Stories Generation Rules

When the user references this rule document:

1. First, check if the user has provided the required feature file. If provided, please generate StorybookStories according to the following specifications.
2. If the user has not provided the feature file, please prompt the user to provide the feature file.

## Basic Structure

Each component's Stories file should include the following basic structure:

```typescript
import { StoryObj, Meta } from "@storybook/react"
import { expect, userEvent, within, fn } from "@storybook/test"
import MyComponent from "./MyComponent"

const meta: Meta<typeof MyComponent> = {
  title: "module path/component filename/component name",
  component: MyComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Concise description of component functionality",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Key properties of the component, typically callback functions
    onSomeAction: { action: "onSomeAction" },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Mock data definition
const mockData = [
  /*...*/
]

/**
 * Basic example story
 */
export const Basic: Story = {
  args: {
    // Properties needed by the component
  },
  play: async ({ canvasElement }) => {
    // Component interaction test logic
  },
}
```

## Story Naming Rules

1. Each story name should clearly express the functionality or use case shown in that story
2. Use camelCase naming, such as: `ViewAssetList`, `FilterAssets`
3. Story names should correspond to scenarios described in the Feature file

## Mock Data Preparation

1. Prepare sufficiently complete mock data for the component, ensuring the data structure meets the component interface requirements
2. Use type annotations to ensure type safety: `const mockData: SomeType[] = [...]`
3. Mock data should cover various scenarios, including edge cases

## Property Configuration

1. Provide all properties required by the component in the `args` object
2. Use functions to simulate callbacks: `onAction: fn()`
3. Asynchronous functions should return Promises: `onAsyncAction: async () => Promise.resolve()`

## Interaction Testing

Each component story should include a `play` function to test user interactions:

1. Use `within(canvasElement)` to get the canvas
2. Use `userEvent` to simulate user interactions (clicking, typing, etc.)
3. Use `expect` to verify interaction results
4. Test key functionality points and user flows

## Matching with Feature File

1. Each scenario described in the Feature file should have a corresponding story
2. The story's `play` function should validate the acceptance criteria of the scenario
3. The verification pattern should follow: find element->interact->verify result

## Story Types

Should include the following key story types:

1. **Basic Display Story**: Shows the component's default state and basic functionality
2. **Interaction Story**: Shows user interaction with the component
3. **Edge Case Story**: Shows special states or boundary conditions
4. **Error Handling Story**: Shows error states and validation

## Test Assertion Best Practices

1. Verify component rendering: `expect(element).toBeInTheDocument()`
2. Verify text content: `expect(element).toHaveTextContent("expected text")`
3. Verify callback invocation: `expect(args.onAction).toHaveBeenCalled()`
4. Verify callback parameters: `expect(args.onAction).toHaveBeenCalledWith(expect.objectContaining({...}))`

### Callback Parameter Verification Explained

Verifying parameters passed to callback functions is an important part of ensuring correct component behavior. Here are the best practices for parameter verification:

1. **Simplify Object Comparison**: When verifying complex object parameters, use `expect.objectContaining()` to verify only key properties rather than the entire object

```typescript
expect(args.onViewAsset).toHaveBeenCalledWith(
  expect.objectContaining({
    id: 123,
    name: "Asset Name",
  }),
)
```

2. **Use Static Values Directly**: To avoid reference issues, use hardcoded values in verification rather than referencing variables

```typescript
// Recommended
expect(args.onAction).toHaveBeenCalledWith(
  expect.objectContaining({ id: 10001 }),
)
// Not recommended
expect(args.onAction).toHaveBeenCalledWith(mockData[0])
```

3. **Appropriately Verify Deep Structures**: For nested objects, nested `expect.objectContaining()` can be used

```typescript
expect(args.onSubmit).toHaveBeenCalledWith(
  expect.objectContaining({
    user: expect.objectContaining({
      name: "John",
      role: "Admin",
    }),
  }),
)
```

4. **Verify Array Type Parameters**: For array parameters, use `expect.arrayContaining()`

```typescript
expect(args.onSelect).toHaveBeenCalledWith(expect.arrayContaining([1, 2, 3]))
```

5. **Flexibly Handle Uncertain Parameters**: When parameters might be null or other values, use conditional verification

```typescript
// If aiCheckedResult might be null
if (mockAsset.aiCheckedResult) {
  expect(args.onAction).toHaveBeenCalledWith(
    expect.objectContaining({
      aiCheckedResult: expect.objectContaining({
        confidence: expect.any(Number),
      }),
    }),
  )
}
```

## Writing Stories for Complex Components

For complex components (such as modal dialogs, drawers, etc.), consider:

1. Testing open/close functionality
2. Testing form validation
3. Testing submission functionality
4. Testing cancel operations
5. Testing read-only mode (if applicable)

## Examples

### Simple Component Story

```typescript
export const Basic: Story = {
  args: {
    label: "Click me",
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: /click me/i })
    await userEvent.click(button)
    expect(args.onClick).toHaveBeenCalled()
  },
}
```

### Complex Component Story

```typescript
export const FilterAndSubmit: Story = {
  args: {
    data: mockData,
    onFilter: fn(),
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Operate filter
    const filterInput = canvas.getByPlaceholderText("Search...")
    await userEvent.type(filterInput, "test")

    // Select option
    const option = canvas.getByText("Option 1")
    await userEvent.click(option)

    // Submit form
    const submitButton = canvas.getByText("Submit")
    await userEvent.click(submitButton)

    // Verify results
    expect(args.onFilter).toHaveBeenCalled()
    expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: "test",
        option: "Option 1",
      }),
    )
  },
}
```

## Code Review Checklist

- [ ] Each Feature scenario has a corresponding Story
- [ ] All Stories have descriptive comments
- [ ] All Stories have appropriate `play` functions to test interactions
- [ ] Ensure mock data is complete and correctly typed
- [ ] Verify important UI elements exist and are interactive
- [ ] Verify callback functions are correctly called
- [ ] Story names are clear and meaningful
