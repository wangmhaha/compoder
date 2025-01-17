# MongoDB API 生成指南

本指南用于生成基于 MongoDB 的 API 端点。

## 用户输入

请提供以下信息：

1. MongoDB Schema 定义，包括：
   - 数据结构及其类型
   - 必填字段
   - 默认值
   - 验证规则

例如：

```typescript
// 在 lib/db/[modelName]/schema.ts 中
import mongoose, { Schema, model } from "mongoose"
import { DataType, ItemType } from "./types"

// 子文档 Schema
const ItemSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// 主文档 Schema
const DataSchema = new Schema(
  {
    field1: {
      type: String,
      required: true,
    },
    field2: {
      type: String,
      required: true,
    },
    items: {
      type: [ItemSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

// 导出 Model
export const Model = mongoose.models.Data || model<DataType>("Data", DataSchema)

// 在 types.ts 中定义对应的类型
export interface ItemType {
  _id: mongoose.Types.ObjectId
  value: string
  createdAt: Date
}

export interface DataType {
  _id: mongoose.Types.ObjectId
  field1: string
  field2: string
  items: ItemType[]
  createdAt: Date
  updatedAt: Date
}
```

2. API 请求类型定义，包括：
   - 请求方法（GET/POST/PUT/DELETE）
   - 请求参数及其类型
   - 响应数据结构（可选）

例如：

```typescript
// 在 app/api/[modelName]/type.d.ts 中
declare namespace ApiNamespace {
  export interface RequestType {
    param1: string // 参数1说明
    param2: string // 参数2说明
    param3: string // 参数3说明
  }
}
```

## 生成步骤

1. 基于用户输入的类型定义以及 MongoDB Schema，实现数据库操作（查询或变更）
2. 创建对应的 API 路由处理器

## 详细步骤

### 1. 实现数据库操作

根据 API 的请求方法，在 Schema 文件同级目录下实现对应的操作：

#### 查询操作 (lib/db/[modelName]/selectors.ts)

```typescript
import { Model } from "./schema"
import { FilterQuery } from "mongoose"
import { DataType } from "./types"

export async function queryOperation({
  param1,
  param2,
  page,
  pageSize,
}: {
  param1: string
  param2: string
  page: number
  pageSize: number
}) {
  try {
    const skip = (page - 1) * pageSize

    // 1. 构建查询条件
    let searchQuery: FilterQuery<DataType> = {
      field1: param1,
    }

    if (param2) {
      searchQuery.field2 = {
        $regex: param2,
        $options: "i",
      }
    }

    // 2. 执行查询
    const [data, total] = await Promise.all([
      Model.find(searchQuery)
        .select("field1 field2 field3")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Model.countDocuments(searchQuery),
    ])

    // 3. 处理返回数据
    const formattedData = data.map(item => ({
      id: item._id,
      value: item.field1,
      extra: item.field2,
    }))

    return {
      data: formattedData,
      total,
    }
  } catch (error) {
    console.error("Error in query operation:", error)
    throw error
  }
}
```

#### 变更操作 (lib/db/[modelName]/mutations.ts)

```typescript
import { Model } from "./schema"

export async function databaseOperation({
  param1,
  param2,
  param3,
}: {
  param1: string
  param2: string
  param3: string
}) {
  try {
    // 1. 查找记录
    const record = await Model.findById(param1)
    if (!record) {
      throw new Error("Record not found")
    }

    // 2. 执行更新操作
    const targetIndex = record.items.findIndex(
      (item: ItemType) => item._id.toString() === param2,
    )
    if (targetIndex === -1) {
      throw new Error("Target not found")
    }

    record.items[targetIndex].value = param3
    await record.save()

    // 3. 返回结果
    return {
      _id: record._id,
      ...record.toObject(),
    }
  } catch (error) {
    console.error("Error in database operation:", error)
    throw error
  }
}
```

### 2. 创建 API 路由处理器

在 API 类型定义同级目录下，根据操作类型实现对应的路由：

#### 列表查询（app/api/[modelName]/list/route.ts）

```typescript
import { NextResponse } from "next/server"
import { queryOperation } from "@/lib/db/[modelName]/selectors"
import type { ApiNamespace } from "../type"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"

export async function GET(request: Request) {
  try {
    // 1. 验证会话
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    // 2. 连接数据库
    await connectToDatabase()

    // 3. 从 URL 获取查询参数
    const { searchParams } = new URL(request.url)
    const param1 = searchParams.get("param1")
    const param2 = searchParams.get("param2")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    if (!param1) {
      return NextResponse.json(
        { error: "Missing required parameter: param1" },
        { status: 400 },
      )
    }

    // 4. 执行查询操作
    const result = await queryOperation({
      param1,
      param2,
      page,
      pageSize,
    })

    // 5. 返回结果
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in GET operation:", error)
    return NextResponse.json(
      { error: "Query operation failed" },
      { status: 500 },
    )
  }
}
```

#### 创建操作（app/api/[modelName]/create/route.ts）

```typescript
import { NextResponse } from "next/server"
import { createOperation } from "@/lib/db/[modelName]/mutations"
import type { ApiNamespace } from "../type"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"

export async function POST(request: Request) {
  try {
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    // 从请求体获取数据
    const body = (await request.json()) as ApiNamespace.CreateRequest
    const { param1, param2, param3 } = body

    // 执行创建操作
    const result = await createOperation({
      param1,
      param2,
      param3,
    })

    // 返回创建的资源
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error in POST operation:", error)
    return NextResponse.json(
      { error: "Create operation failed" },
      { status: 500 },
    )
  }
}
```

#### 更新操作（app/api/[modelName]/edit/route.ts）

```typescript
import { NextResponse } from "next/server"
import { updateOperation } from "@/lib/db/[modelName]/mutations"
import type { ApiNamespace } from "../type"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"

export async function PUT(request: Request) {
  try {
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    // 从请求体获取数据
    const body = (await request.json()) as ApiNamespace.EditRequest
    const { id, param1, param2 } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 },
      )
    }

    // 执行更新操作
    const result = await updateOperation({
      id,
      param1,
      param2,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in PUT operation:", error)
    return NextResponse.json(
      { error: "Update operation failed" },
      { status: 500 },
    )
  }
}
```

#### 删除操作（app/api/[modelName]/delete/route.ts）

```typescript
import { NextResponse } from "next/server"
import { deleteOperation } from "@/lib/db/[modelName]/mutations"
import type { ApiNamespace } from "../type"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"

export async function DELETE(request: Request) {
  try {
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    // 从 URL 获取参数
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 },
      )
    }

    // 执行删除操作
    await deleteOperation({ id })

    // 返回空响应，表示删除成功
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in DELETE operation:", error)
    return NextResponse.json(
      { error: "Delete operation failed" },
      { status: 500 },
    )
  }
}
```

## 文件结构示例

```
lib/
  db/
    [modelName]/
      schema.ts      # MongoDB Schema 定义
      types.ts       # TypeScript 类型定义
      selectors.ts   # 查询操作
      mutations.ts   # 变更操作
app/
  api/
    [modelName]/     # 例如：componentCode
      type.d.ts      # API 类型定义
      create/        # 创建操作
        route.ts
      detail/        # 详情操作
        route.ts
      edit/          # 编辑操作
        route.ts
      list/          # 列表操作
        route.ts
      save/          # 保存操作
        route.ts
```

## 注意事项

1. 类型定义：

   - 在 `type.d.ts` 中使用命名空间组织相关类型
   - 确保类型定义清晰且完整
   - 为每个参数添加注释说明用途

2. 数据库操作：

   - 查询操作（GET）：
     - 支持分页
     - 支持搜索和过滤
     - 优化查询性能（使用 lean、select 等）
   - 变更操作（POST/PUT/DELETE）：
     - 实现适当的错误处理
     - 返回统一的数据结构
     - 使用 try-catch 包装所有操作

3. API 路由：
   - 必须包含会话验证
   - 必须包含数据库连接
   - 统一的错误处理和响应格式
   - GET 请求从 URL 参数获取数据
   - POST/PUT 请求从请求体获取数据
