Feature: StorybookExample Button Component
As a user
I want to use a button component with a customizable title
So that I can display different button labels in my application

Background:
Given the StorybookExample component is properly imported
And the component is rendered with required props

Scenario: Displaying a button with default title
Given the component is initialized
When the component is rendered with title "storybook example"
Then a button should be displayed
And the button text should be "storybook example"

Acceptance Criteria:
- Button should use the default variant style
- Button text should match the provided title prop
- Button should be properly centered

Scenario: Changing the button title
Given the component is initialized
When the component is rendered with a different title "new title"
Then a button should be displayed
And the button text should be "new title"

Acceptance Criteria:
- Button should update its text when the title prop changes
- Button should maintain its styling when the title changes

Scenario Outline: Testing different title lengths
Given the component is initialized
When the component is rendered with title "<Title>"
Then a button should be displayed
And the button text should be "<Title>"

Examples:
| Title | 
| Short | 
| Medium length title |
| This is a very long title for testing purposes | 