# Business Component Testing Solution

Our business components use Storybook's built-in user behavior simulation testing for different scenarios. For details, see: https://storybook.js.org/docs/writing-tests

## How to Start Storybook User Behavior Simulation Testing

> You must start the Storybook documentation you want to test before starting the test, otherwise an error will occur.

Start Storybook with the following command:

```bash
npm run storybook
```

### Test All Components

```bash
npm run test:storybook
```

### Test Specific Components or Stories Files

You can also specify the testing scope more precisely:

```bash
# Test a specific component folder
npm run test:storybook <folder-name>

# Test a specific stories file
npm run test:storybook <story-filename>
```

Example:

```bash
# For example, to test the StorybookExample component, just enter the component's folder name StorybookExample
npm run test:storybook StorybookExample

# For example, to test the AppHeader.stories.tsx file, just enter the file name
npm run test:storybook AppHeader.stories.tsx
```

## Common Issues

### How AI Can Assist in Generating User Behavior Simulation Tests Based on Existing Component Code

1. Open Cursor Agent and select the model with the best coding capabilities (at the time of writing this document: Claude-3.7-Sonnet)

2. Enter `compoder storybook-test`

3. Drag and drop the component folder for which you need to add Storybook tests

Cursor Agent will sequentially execute the following steps:

1. Generate a feature file based on the component code
2. Generate (or optimize existing) stories file based on the feature file, including tests
3. Run tests and automatically fix errors based on error messages
4. Re-verify the correctness of tests (robustness, coverage)

The final generated files include:

- [ComponentName].feature // Feature file describing the component
- [ComponentName].stories.tsx // Stories file containing variants and corresponding tests for scenarios in the feature
- coverage-analysis.md // Test coverage analysis report

Testing has shown that in Cursor version 0.48.7, the entire process is mostly automated. After the process completes, human intervention is needed for:

- Confirming that the feature file meets expectations
- Confirming that test assertions meet expectations, as AI might use some "less rigorous" assertions while fixing test failures, leading to inaccurate test results.
