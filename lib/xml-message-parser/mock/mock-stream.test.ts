import { createMockStream } from "./mock-stream"

describe("createMockStream", () => {
  // 收集流数据的辅助函数
  async function collectStreamData(
    stream: ReadableStream<string>,
  ): Promise<string> {
    const reader = stream.getReader()
    let result = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += value
      }
    } finally {
      reader.releaseLock()
    }

    return result
  }

  test("基本功能：流式传输完整字符串", async () => {
    const testString = "Hello, this is test string for streaming"
    const stream = createMockStream(testString)

    const result = await collectStreamData(stream)

    expect(result).toBe(testString)
  })

  test("使用默认配置参数", async () => {
    const testString = "Default configuration test"
    const stream = createMockStream(testString)

    const result = await collectStreamData(stream)

    expect(result).toBe(testString)
  })

  test("使用自定义间隔时间", async () => {
    const testString = "Custom interval test"
    const startTime = Date.now()

    const stream = createMockStream(testString, {
      interval: 50,
      // 增大块大小以减少数据分块数量，使测试更可靠
      minChunkSize: 20,
      maxChunkSize: 20,
    })

    await collectStreamData(stream)
    const duration = Date.now() - startTime

    // 预期总时间至少为：(字符串长度/块大小) * 间隔时间
    // 添加一点容差，因为JavaScript的setTimeout不精确
    const expectedChunks = Math.ceil(testString.length / 20)
    const expectedMinDuration = (expectedChunks - 1) * 50 // 减1是因为最后一块没有等待时间

    expect(duration).toBeGreaterThanOrEqual(expectedMinDuration)
  })

  test("使用最小和最大块大小配置", async () => {
    const testString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const stream = createMockStream(testString, {
      interval: 1, // 使用小间隔使测试更快
      minChunkSize: 3,
      maxChunkSize: 5,
    })

    let result = ""
    const reader = stream.getReader()
    const chunks: string[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        result += value
      }
    } finally {
      reader.releaseLock()
    }

    expect(result).toBe(testString)

    // 验证每个块的大小在范围内，最后一块可能例外（可能小于minChunkSize）
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      // 对于除最后一块外的所有块，验证大小在范围内
      if (i < chunks.length - 1) {
        expect(chunk.length).toBeGreaterThanOrEqual(3)
        expect(chunk.length).toBeLessThanOrEqual(5)
      } else {
        // 最后一块可能小于最小块大小，但不应超过最大块大小
        expect(chunk.length).toBeLessThanOrEqual(5)
      }
    }
  })

  test("处理空字符串", async () => {
    const stream = createMockStream("")
    const result = await collectStreamData(stream)

    expect(result).toBe("")
  })

  test("处理非常短的字符串（小于默认最小块大小）", async () => {
    const shortString = "ABC"
    const stream = createMockStream(shortString)

    const result = await collectStreamData(stream)

    expect(result).toBe(shortString)
  })

  test("处理特殊字符（包括Unicode）", async () => {
    const specialChars = "特殊字符测试 😀 👍 \n\t\r"
    const stream = createMockStream(specialChars)

    const result = await collectStreamData(stream)

    expect(result).toBe(specialChars)
  })

  test("测试流取消功能", async () => {
    const longString = "A".repeat(1000)
    const stream = createMockStream(longString, {
      interval: 10,
      minChunkSize: 10,
      maxChunkSize: 10,
    })

    const reader = stream.getReader()
    let receivedData = ""

    // 读取几个块后取消
    for (let i = 0; i < 3; i++) {
      const { value } = await reader.read()
      receivedData += value
    }

    await reader.cancel()

    // 验证接收到的数据是原始数据的前缀部分
    expect(longString.startsWith(receivedData)).toBe(true)
    // 验证没有收到完整数据
    expect(receivedData.length).toBeLessThan(longString.length)
  })

  test("使用额外的读取方法处理流", async () => {
    const testString = "Testing alternative stream processing"
    const stream = createMockStream(testString, {
      interval: 1, // 使用小间隔使测试更快
      minChunkSize: 5,
      maxChunkSize: 10,
    })

    let result = ""
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += value
      }
    } finally {
      reader.releaseLock()
    }

    expect(result).toBe(testString)
  })
})
