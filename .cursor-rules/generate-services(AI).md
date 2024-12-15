# Service Layer Code Generation Rules

## Input Files Pattern

- `@/app/api/{module}/types.d.ts`: Contains API interface definitions
- `@/app/api/{module}/{action}/route.ts`: Contains API route implementations

## Output Files Pattern

- `@/app/services/{module}/{module}.service.ts`: Service layer implementation

## Generation Rules

1. Service File Structure:

```typescript
import { getInstance } from '../request'
import { {ModuleName}Api } from '@/app/api/{module}/types'

const request = getInstance()

export const {actionName}{ModuleName} = async (
  params: {ModuleName}Api.{Action}Request
): Promise<{ModuleName}Api.{Action}Response> => {
  const response = await request.{method}('/{module}/{action}', {requestConfig})
  return response.data
}
```

2. Function Naming Convention:

- For GET endpoints: use `get{ModuleName}{Action}` (e.g., `getUserList`, `getOrderDetail`)
- For POST endpoints: use `create{ModuleName}`
- For PUT endpoints: use `update{ModuleName}`
- For DELETE endpoints: use `delete{ModuleName}`

3. Type Definition Pattern:

```typescript
declare namespace {ModuleName}Api {
  export interface {Action}Request {
    // Request parameters
  }

  export interface {Action}Response {
    // Response data structure
  }
}
```

## Variables Explanation

- `{module}`: The lowercase module name (e.g., "user", "order", "codegen")
- `{ModuleName}`: The PascalCase module name (e.g., "User", "Order", "Codegen")
- `{action}`: The action name (e.g., "list", "detail", "create")
- `{Action}`: The PascalCase action name (e.g., "List", "Detail", "Create")
- `{method}`: HTTP method in lowercase (e.g., "get", "post", "put", "delete")
- `{requestConfig}`: Request configuration object based on HTTP method:
  - GET: `{ params }`
  - POST/PUT: `data`
  - DELETE: `{ params }` or empty

## Example

For a module named "codegen" with a "list" action:

Input types.d.ts:

```typescript
declare namespace CodegenApi {
  export interface ListRequest {
    page: number
    pageSize: number
    name?: string
    fullStack?: "React" | "Vue"
  }

  export interface ListResponse {
    data: any[]
    total: number
  }
}
```

Generated service.ts:

```typescript
import { getInstance } from "../request"
import { CodegenApi } from "@/app/api/codegen/types"

const request = getInstance()

export const getCodegenList = async (
  params: CodegenApi.ListRequest,
): Promise<CodegenApi.ListResponse> => {
  const response = await request.get("/codegen/list", { params })
  return response.data
}
```

## Notes

1. Maintain consistent file structure and naming conventions
2. Ensure type safety between API definitions and service implementations
3. Follow RESTful API naming conventions
4. Use proper error handling and async/await patterns
5. Keep service functions focused and single-responsibility
