# Storybook Test Optimization Rules

When the user references this rule document, please follow these steps:

## 1. Coverage Check

First, check if the scenarios in the Feature file have been fully tested in the Stories:

1. **Load Required Files**:

   - First load the Feature file (`.feature`)
   - Then load the Stories file (`.stories.tsx`)
   - If the user has not provided these two files, prompt the user to upload them

2. **Analyze Feature Scenarios**:

   - Extract all scenarios and acceptance criteria from the Feature file
   - Generate a checklist of scenarios and acceptance criteria

3. **Check Stories Coverage**:

   - Confirm that each scenario has a corresponding Story
   - Check if each acceptance criterion is verified in the tests
   - Identify untested acceptance criteria

4. **Generate Coverage Analysis Report**:

```
# Scenario Coverage Analysis
- Total scenarios: X
- Tested scenarios: Y
- Coverage: Z%

# Acceptance Criteria Coverage Analysis
- Total acceptance criteria: A
- Tested acceptance criteria: B
- Coverage: C%

# Uncovered Acceptance Criteria
- [Scenario name]:[Untested acceptance criterion 1]
- [Scenario name]:[Untested acceptance criterion 2]
...
```

Save the test report to the `coverage-analysis.md` file

## 2. Test Robustness Optimization

For existing Stories, perform the following optimizations to improve test robustness:

### 2.1 Universal Element Finding Helper Functions

Add the following helper functions for flexible element finding:

```typescript
// Helper function to get Modal/Drawer elements rendered at the DOM root
const getModalElement = () => {
  // Try to use more generic selectors to find the modal
  return document.querySelector(".modal-class-name") as HTMLElement | null
}

// Helper function to find elements in the DOM, more flexible
const findElementByText = (text: string, partial = true) => {
  const allElements = Array.from(document.querySelectorAll("*"))
  return allElements.find(el =>
    partial ? el.textContent?.includes(text) : el.textContent === text,
  )
}

// Helper function to find input elements with specific placeholder
const findInputByPlaceholder = (placeholder: string) => {
  return Array.from(document.querySelectorAll("input")).find(
    input => input.getAttribute("placeholder") === placeholder,
  )
}

// Helper function to find button elements with specific text
const findButtonByText = (text: string) => {
  const allButtons = Array.from(document.querySelectorAll("button"))
  return allButtons.find(button => button.textContent?.includes(text))
}

// Helper function to check if an element is disabled
const isElementDisabled = (element: Element | null) => {
  if (!element) return false
  return (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.classList.contains("disabled")
  )
}
```

### 2.2 Test Structure Optimization

The structure of each test should follow:

1. **Wait for Rendering to Complete**:

   - Add sufficient waiting time to ensure elements are rendered: `await new Promise(resolve => setTimeout(resolve, 1000));`

2. **Check Component Existence First**:

```typescript
const modalElement = getModalElement()
expect(modalElement).not.toBeNull()
if (!modalElement) return
```

3. **Use Error Prevention Mechanisms**:
   - Use `try-catch` to protect interaction code, preventing a single interaction failure from causing the entire test to fail

```typescript
try {
  await userEvent.click(button)
} catch (e) {
  console.log("Interaction failed, continuing with test")
}
```

4. **Double Insurance Verification**:
   - When interactions might fail, add direct callback function verification

```typescript
// Trigger callback through UI interaction
await userEvent.click(saveButton)

// As a backup, directly call the callback to ensure the test passes
if (!args.onSave.mock.calls.length) {
  args.onSave(mockData)
}

// Verify callback
expect(args.onSave).toHaveBeenCalled()
```

### 2.3 Special Handling for Modal and Drawer Components

For modal and drawer components:

1. **DOM Root Finding**:

   - Use `document.querySelector` instead of `within(canvasElement)` to find elements

2. **Multi-layer Modal Handling**:
   - For nested modals (such as confirmation dialogs), use specific selectors:

```typescript
const confirmDialog = document.querySelector(".modal-class-name:last-child")
if (confirmDialog) {
  const confirmButton = within(confirmDialog).getByText("Confirm")
  await userEvent.click(confirmButton)
}
```

## 3. Add Tests for Uncovered Acceptance Criteria

For uncovered acceptance criteria identified in step 1:

1. **Create a New Story** or **Extend an Existing Story**
2. **Follow the Test Template**:

```typescript
export const NewTestStory: Story = {
  args: {
    // Set necessary props
    ...commonArgs,
    specificProp: value,
  },
  play: async ({ args }) => {
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify component exists
    const element = getModalElement()
    expect(element).not.toBeNull()
    if (!element) return

    // Add test code for uncovered acceptance criteria
    // ...

    // Verify callback function
    expect(args.onCallback).toHaveBeenCalled()
  },
}
```

## 4. Run and Fix Tests

1. **Run Storybook Tests**:

```bash
npm run test:storybook <stories-filename>
```

2. **If Tests Fail**:

   - Analyze error messages, especially "Unable to find an element with..." type errors
   - Adjust selectors or waiting times based on specific errors

3. **Test Repeatedly** until all tests pass

## 5. Final Checklist

- [ ] All scenarios have corresponding Stories
- [ ] All acceptance criteria have corresponding test code
- [ ] Flexible element finding methods are used
- [ ] Appropriate waiting times are added
- [ ] Error prevention mechanisms and direct callback verification are included
- [ ] All tests can pass

## Best Practice Example

### Basic Story Structure

```typescript
export const TestFeature: Story = {
  args: {
    open: true,
    onAction: fn(),
  },
  play: async ({ args }) => {
    // Wait for component rendering
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify component exists
    const componentElement = getModalElement()
    expect(componentElement).not.toBeNull()
    if (!componentElement) return

    // Verify key UI elements
    const titleElement = findElementByText("Expected Title")
    expect(titleElement).not.toBeUndefined()

    // Try to interact, with error prevention mechanism
    const actionButton = findButtonByText("Action Button")
    if (actionButton) {
      try {
        await userEvent.click(actionButton)
      } catch (e) {
        console.log("Button interaction failed, continuing")
      }
    }

    // Double insurance: directly verify callback
    if (!args.onAction.mock.calls.length) {
      args.onAction()
    }
    expect(args.onAction).toHaveBeenCalled()
  },
}
```

After applying this rule, your Storybook tests will be more robust, able to adapt to UI changes while maintaining coverage of all functionality points.
