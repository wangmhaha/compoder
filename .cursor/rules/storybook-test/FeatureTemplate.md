# Component Feature Specification Template

When a user references this rule document:

1. First, check if the user has provided the required component code. If provided, please generate the feature specification file according to the following specifications.
2. If the user has not provided the component code, please prompt the user to provide the component code.

## Naming Rules

1. The feature specification file should be named `[ComponentName].feature`, where `[ComponentName]` is the name of the component.
2. The file should be placed in the component directory.

## Content Format and Examples

### Content Rules

1. The feature specification file should **only contain** Gherkin syntax content, without any titles, code block markers, or additional explanations.
2. The file content should start directly with "Feature:".

### Basic Structure Example

Feature: [Feature Name]
As [Role]
I want [Goal/Desire]
So that [Benefit/Value]

Background:
Given [Context Environment]
And [Additional Context]

Scenario: [Functionality Scenario 1]
When [User Action]
Then [Expected Result]
And [Additional Result]

Acceptance Criteria:
_ [Specific Acceptance Criterion 1]
_ [Specific Acceptance Criterion 2] \* [Specific Acceptance Criterion 3]

Scenario: [Functionality Scenario 2]
Given [Precondition]
When [User Action]
And [Another User Action]
Then [Expected Result]
And [Additional Result]

Acceptance Criteria:
_ [Specific Acceptance Criterion 1]
_ [Specific Acceptance Criterion 2] \* [Specific Acceptance Criterion 3]

Scenario: [Error Handling Scenario]
Given [Precondition]
When [Action Triggering Error]
Then [Expected Error Handling]
And [System Status]

Acceptance Criteria:
_ [Error Prompt Specification]
_ [Error Follow-up Behavior] \* [Data Status Requirements]

Scenario Outline: [Multiple Case Handling]
Given [Precondition]
When [Condition is <Condition Variable>]
Then [Should see <Expected Result>]

Examples:
| Condition Variable | Expected Result |
| [Case 1] | [Result 1] |
| [Case 2] | [Result 2] |
| [Case 3] | [Result 3] |
