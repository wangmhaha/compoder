/**
 * Creates a mock ReadableStream that streams the strData in random-sized chunks
 * @param strData The string data to stream
 * @param options Configuration options
 * @param options.interval Time interval between chunks in ms (default: 10)
 * @param options.minChunkSize Minimum number of characters per chunk (default: 5)
 * @param options.maxChunkSize Maximum number of characters per chunk (default: 50)
 * @returns A ReadableStream that emits chunks of the strData
 */
export function createMockStream(
  strData: string,
  options: {
    interval?: number
    minChunkSize?: number
    maxChunkSize?: number
  } = {},
) {
  const { interval = 10, minChunkSize = 5, maxChunkSize = 50 } = options

  return new ReadableStream<string>({
    async start(controller) {
      let position = 0
      const dataLength = strData.length

      // 如果输入字符串为空，立即关闭流
      if (dataLength === 0) {
        controller.close()
        return
      }

      const processNextChunk = async () => {
        // 如果已处理完所有数据，关闭流
        if (position >= dataLength) {
          controller.close()
          return
        }

        // 生成随机块大小（范围在最小和最大之间）
        const remainingLength = dataLength - position
        const effectiveMaxSize = Math.min(maxChunkSize, remainingLength)
        const effectiveMinSize = Math.min(minChunkSize, effectiveMaxSize)

        // 计算当前块的大小
        const chunkSize = Math.floor(
          Math.random() * (effectiveMaxSize - effectiveMinSize + 1) +
            effectiveMinSize,
        )

        // 从当前位置获取块
        const chunk = strData.substring(position, position + chunkSize)
        position += chunkSize

        // 将块加入队列
        controller.enqueue(chunk)

        // 如果还有数据，安排处理下一个块
        if (position < dataLength) {
          await new Promise(resolve => setTimeout(resolve, interval))
          await processNextChunk()
        } else {
          controller.close()
        }
      }

      // 开始处理第一个块
      await processNextChunk()
    },

    cancel() {
      // Stream取消时什么都不做，因为我们使用async/await和递归，而不是setInterval
    },
  })
}
