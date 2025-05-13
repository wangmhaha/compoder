# Storybook Stories Testing and Fixing Rules

## Overview

When the user references this rule document, please follow these steps:

1. Directly run the tests for the stories file

   - The user must provide the stories filename
   - Use the following command format for testing:

   ```bash
   npm run test:storybook <stories-filename>
   ```

2. Handle connection errors

   - If the test error shows that it cannot connect to the Storybook service
   - Use the following command to start the Storybook service:

   ```bash
   npm run storybook
   ```

   - After starting the service, rerun the test command from step 1

3. Analyze test results and make necessary fixes

## Common Test Failure Scenarios and Fix Methods

### 1. Element Not Found Issues

**Symptoms**: Test error "Unable to find an element with..."

**Common Causes**:

- Element selector is incorrect
- The actual content of the element doesn't match the test expectation
- DOM structure has changed
- Component is rendered in another location in the DOM tree (Modal/Drawer)

**Fix Methods**:

1. Use more precise selectors
2. Use `getAllByText` instead of `getByText` to avoid multi-matching issues
3. Use partial text matching: `getByText(/partialtext/i)`
4. For Modal/Drawer components, search for elements directly at the document level

### 2. Special Handling for Modal and Drawer Components

Since Modal and Drawer components are usually rendered at the root of the DOM tree (typically implemented via Portal), rather than in the Storybook canvas, special handling is required:

**Modal Component Test Template**:

```typescript
// Helper function to get the Modal element rendered at the DOM root
const getModalElement = () => {
  // Adjust selector according to the actual component library
  return document.querySelector(".modal-class-name") as HTMLElement | null
}

export const TestModalStory: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
  },
  play: async ({ args }) => {
    // Wait for Modal rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get Modal element
    const modalElement = getModalElement()
    expect(modalElement).not.toBeNull()
    if (!modalElement) return

    // Find elements within the Modal
    const modal = within(modalElement)
    const confirmButton = modal.getByText("Confirm")
    await userEvent.click(confirmButton)

    // Verify results
    expect(args.onConfirm).toHaveBeenCalled()
  },
}
```

**Drawer Component Test Template**:

```typescript
// Helper function to get the Drawer element rendered at the DOM root
const getDrawerElement = () => {
  // Adjust selector according to the actual component library
  return document.querySelector(".drawer-class-name") as HTMLElement | null
}

export const TestDrawerStory: Story = {
  args: {
    open: true,
    onClose: fn(),
  },
  play: async ({ args }) => {
    // Wait for Drawer rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get Drawer element
    const drawerElement = getDrawerElement()
    expect(drawerElement).not.toBeNull()
    if (!drawerElement) return

    // Find elements within the Drawer
    const drawer = within(drawerElement)
    const closeButton = drawer.getByText("Close")
    await userEvent.click(closeButton)

    // Verify results
    expect(args.onClose).toHaveBeenCalled()
  },
}
```

### 3. Callback Function Testing Issues

**Symptoms**: "[AsyncFunction xxx] is not a spy or a call to a spy!"

**Cause**: Used regular functions instead of mock functions provided by the testing framework

**Fix Method**: Use `fn()` to create trackable mock functions:

```typescript
// Incorrect approach
onAction: () => {},
onAsyncAction: async () => { return Promise.resolve(); }

// Correct approach
onAction: fn(),
onAsyncAction: fn(async () => Promise.resolve())
```

### 4. Rendering Timing Issues

**Symptoms**: Tests occasionally fail, cannot be reliably reproduced

**Cause**: Asynchronous rendering timing issues, components may not be fully rendered before the test executes

**Fix Methods**:

1. Add appropriate wait times
2. Use `findBy` instead of `getBy` (queries with waiting)
3. For necessary waiting, add delays:

```typescript
// Wait for component rendering to complete
await new Promise(resolve => setTimeout(resolve, 100))
```

## Real Case: Fixing AssetProfileCheckerDetail and UnableValidateModal Tests

### Problem Description

The tests for these components failed because they render as Drawer and Modal at the DOM root, not within the canvas.

### Solution

1. **Add helper functions to get elements at the DOM root**:

```typescript
// Get Modal element
const getModalElement = () => {
  return document.querySelector(".modal-class-name") as HTMLElement | null
}

// Get Drawer element
const getDrawerElement = () => {
  return document.querySelector(".drawer-class-name") as HTMLElement | null
}
```

2. **Modify test code to use helper functions**:

```typescript
play: async ({ args }) => {
  // Wait for component rendering
  await new Promise(resolve => setTimeout(resolve, 100))

  // Get the element at the DOM root
  const modalElement = getModalElement()
  expect(modalElement).not.toBeNull()
  if (!modalElement) return

  // Use within to search within the root element
  const modal = within(modalElement)

  // Remaining test logic...
}
```

3. **Ensure callbacks use fn() wrapping**:

```typescript
validateAssetProps: {
  // ...
  onValidate: fn(async (data) => Promise.resolve()),
  onUnableValidate: fn()
}
```

4. **Add waiting for asynchronous operations**:

```typescript
// Wait for Modal/Drawer to fully render
await new Promise(resolve => setTimeout(resolve, 100))
```

## Code Review Checklist

- [ ] Confirm that tests for Modal/Drawer components use the correct DOM query method
- [ ] All callback functions are wrapped with `fn()`
- [ ] Asynchronous rendering operations have appropriate waiting
- [ ] Reasonable failure handling exists, such as `if(!element) return`
- [ ] Correct query selectors are used, taking into account case sensitivity and partial matching
- [ ] CSS selector class names are adjusted correctly for the specific component library

By following these rules, you can effectively solve issues with special components like Modal and Drawer in Storybook tests, making the tests more stable and reliable.
