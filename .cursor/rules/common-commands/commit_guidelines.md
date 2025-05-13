# Commit Guidelines

When users reference this rule document, the system will generate a commit message for the current branch according to the following standards:

## Commit Message Structure

Each commit message should follow this format:

```
<type>: <subject>

<body>
```

### Components

1. **Type**: Describes the category of the change

   - `build`: Changes that affect the build system or external dependencies
   - `feat`: A new feature
   - `fix`: A bug fix
   - `docs`: Documentation only changes
   - `style`: Changes that do not affect the meaning of the code (formatting, etc.)
   - `refactor`: A code change that neither fixes a bug nor adds a feature
   - `perf`: A code change that improves performance
   - `test`: Adding missing tests or correcting existing tests
   - `chore`: Other changes that don't modify source or test files

2. **Subject**: A concise description of the change in imperative mood

   - Start with lowercase
   - No period at the end
   - Limited to 50 characters

3. **Body**: Detailed description of the changes
   - Separated from subject by a blank line
   - Use numbered list for multiple changes
   - Explain what and why vs. how

## Example

```
build: optimize build configuration for ESM and CJS format output

1. Update version to 0.2.1
2. Adjust output path structure to support both ESM and CJS formats
3. Modify main, module and types fields in package.json to point to new output paths
4. Update tsconfig to adapt to the new build output structure
```

## Workflow

1. Check status to see what files have been changed:

   ```
   git status
   ```

2. Review the changes to understand what needs to be committed:

   ```
   git diff --staged
   ```

3. Create a commit with an appropriate type and descriptive message:

   ```
   git commit -m "<type>: <subject>" -m "<numbered list of changes>"
   ```

4. The commit should clearly communicate:
   - What category of change was made (in the type)
   - What the change accomplishes (in the subject)
   - What specific modifications were made (in the body)
