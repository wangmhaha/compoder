interface ParserOptions {
  strict: boolean
  /**
   * 需要被解析为原始内容的标签，举例：
   * 对于如下流式输出的数据：
   * <a>
   *   <b>
   *     <c></c>
   *   </b>
   * </a>
   * 如果 parseAsRawContentTags: ['b'] ，那么当解析到 b标签后，后续内容 ` <c></c>`不会触发 c标签的开启/关闭回调，而是触发b标签的onRowContent回调
   *
   * @type {string[]}
   * @memberof ParserOptions
   */
  parseAsRawContentTags: string[]
  /**
   * 是否开启调试日志，开启后会打印详细的执行过程日志方便调试
   *
   * @type {boolean}
   * @memberof ParserOptions
   */
  debug?: boolean
  /**
   * 自定义日志处理器，用于在不同环境下输出日志
   * 如果不提供，默认使用console.log/console.error
   *
   * @type {{ log: (message: string, ...args: any[]) => void, error: (message: string, ...args: any[]) => void }}
   * @memberof ParserOptions
   */
  logger?: {
    log: (message: string, ...args: any[]) => void
    error: (message: string, ...args: any[]) => void
  }
}

// 定义解析器状态枚举
enum ParserState {
  TEXT, // 标签外的文本
  TAG_OPEN, // 开始标签，刚遇到<
  TAG_NAME, // 解析标签名
  TAG_ENDING, // 标签结束，遇到>
  CLOSING_TAG_OPEN, // 结束标签，遇到</
  CLOSING_TAG_NAME, // 解析结束标签名
  ATTR_NAME_START, // 准备解析属性名（刚遇到空白）
  ATTR_NAME, // 解析属性名
  ATTR_NAME_END, // 属性名结束，等待=
  ATTR_VALUE_START, // 属性值开始，等待"或'
  ATTR_VALUE, // 解析属性值
  SELF_CLOSING_START, // 自闭合标签开始，遇到/
  RAW_CONTENT, // 处于原始内容模式
  RAW_CONTENT_POTENTIAL_END, // 在原始内容中遇到可能的结束标签
}

interface TagData {
  name: string
  attrs: Record<string, string>
}

export class StreamParser {
  // Parser state
  private state: ParserState = ParserState.TEXT
  private strict: boolean
  private buffer: string = ""
  private position: number = 0
  private tagStack: TagData[] = []
  private debug: boolean = false
  private logger: {
    log: (message: string, ...args: any[]) => void
    error: (message: string, ...args: any[]) => void
  }

  // 当前处理的数据
  private currentTagName: string = ""
  private currentAttrs: TagData["attrs"] = {}
  private currentAttrName: string = ""
  private currentAttrValue: string = ""
  private attrQuoteChar: string = ""

  // 原始内容处理
  private parseAsRawContentTags: string[] = []
  // 保存潜在的未完成的闭合标签
  private pendingClosingTag: string = ""
  // 保存未发送的原始内容
  private pendingRawContent: string = ""
  // 当前潜在闭合标签匹配位置
  private potentialEndTagMatchPos: number = 0

  // Event handlers
  public onOpenTag: ((tagData: TagData) => void) | null = null
  public onCloseTag: ((tagData: TagData) => void) | null = null
  public onRawContent: ((tagData: TagData, content: string) => void) | null =
    null
  public onError: ((error: Error) => void) | null = null
  public onEnd: (() => void) | null = null
  /**
   * 每处理完一个chunk后的回调
   */
  public onChunk: ((chunk: string) => void) | null = null

  constructor({
    strict,
    parseAsRawContentTags,
    debug = false,
    logger,
  }: ParserOptions) {
    this.strict = strict
    this.parseAsRawContentTags = parseAsRawContentTags
    this.debug = debug
    this.logger = logger || {
      log: console.log.bind(console),
      error: console.error.bind(console),
    }

    this.log("INFO", "Initialized with options:", {
      strict,
      parseAsRawContentTags,
      debug,
    })
  }

  // Unified logging method with level and debug check
  private log(level: "INFO" | "ERROR", message: string, ...args: any[]): void {
    if (!this.debug) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}][StreamParser][${level}]`

    if (level === "ERROR") {
      this.logger.error(`${prefix} ${message}`, ...args)
    } else {
      this.logger.log(`${prefix} ${message}`, ...args)
    }
  }

  // Write a chunk of data to the parser
  public write(chunk: string): this {
    this.log(
      "INFO",
      `Received chunk (${chunk.length} chars):`,
      chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""),
    )

    // 检查是否有未完成的闭合标签需要处理
    if (
      this.pendingClosingTag &&
      this.state === ParserState.RAW_CONTENT_POTENTIAL_END
    ) {
      this.log("INFO", "Resuming potential end tag processing:", {
        pendingClosingTag: this.pendingClosingTag,
        potentialEndTagMatchPos: this.potentialEndTagMatchPos,
      })
    }

    // 添加新的chunk到buffer
    this.buffer += chunk

    this.log("INFO", `Buffer updated (${this.buffer.length} chars)`)

    this.parseBuffer()

    // 调用onChunk回调
    this.onChunk?.(chunk)

    return this
  }

  sendPendingRawContent() {
    if (this.state !== ParserState.RAW_CONTENT || !this.pendingRawContent) {
      return
    }
    this.onRawContent?.(
      this.getCurrentHandlingTagData(),
      this.pendingRawContent,
    )
    this.pendingRawContent = ""
  }

  // 解析buffer中的内容
  private parseBuffer(): void {
    this.log(
      "INFO",
      `Parsing buffer from position ${this.position}, state: ${
        ParserState[this.state]
      }`,
    )

    while (this.position < this.buffer.length) {
      const char = this.buffer[this.position]

      if (this.position % 100 === 0) {
        this.log(
          "INFO",
          `Position: ${this.position}, State: ${
            ParserState[this.state]
          }, Char: '${char}'`,
        )
      }
      const curTagData = this.getCurrentHandlingTagData()

      switch (this.state) {
        case ParserState.RAW_CONTENT:
          // 在原始内容模式中，检查是否遇到可能的结束标签
          if (char === "<") {
            // 进入潜在闭合标签状态
            this.sendPendingRawContent()
            this.state = ParserState.RAW_CONTENT_POTENTIAL_END
            this.pendingClosingTag = "<"
            this.potentialEndTagMatchPos = 1 // 已匹配到"<"，下一个应该是"/"
          } else {
            this.pendingRawContent += char
          }
          this.position++
          continue

        case ParserState.RAW_CONTENT_POTENTIAL_END:
          // 基于字符逐个匹配潜在的闭合标签
          const expectedEndTag = `</${curTagData.name}>`

          // 检查当前字符是否匹配期望的字符
          if (char === expectedEndTag[this.potentialEndTagMatchPos]) {
            // 字符匹配，更新匹配位置
            this.pendingClosingTag += char
            this.potentialEndTagMatchPos++

            // 检查是否完全匹配了闭合标签
            if (this.potentialEndTagMatchPos === expectedEndTag.length) {
              this.log("INFO", `Found complete closing tag: ${expectedEndTag}`)

              // 完全匹配，重置状态并触发关闭标签
              this.onCloseTag?.(curTagData)
              this.resetCurrentTagData()

              // 从标签栈中移除
              if (
                this.tagStack.length > 0 &&
                this.tagStack[this.tagStack.length - 1].name === curTagData.name
              ) {
                this.tagStack.pop()

                this.log(
                  "INFO",
                  `Tag "${curTagData.name}" removed from stack, remaining:`,
                  [...this.tagStack],
                )
              }

              // 检查父标签是否是原始内容标签
              if (this.tagStack.length > 0) {
                const parentTag = this.tagStack[this.tagStack.length - 1]
                if (this.parseAsRawContentTags.includes(parentTag.name)) {
                  this.log(
                    "INFO",
                    `Returning to RAW_CONTENT mode for parent tag "${parentTag}"`,
                  )

                  this.state = ParserState.RAW_CONTENT
                } else {
                  this.state = ParserState.TEXT
                }
              } else {
                this.state = ParserState.TEXT
              }

              // 重置匹配状态
              this.pendingClosingTag = ""
              this.potentialEndTagMatchPos = 0
            }
          } else {
            // 不匹配，回到RAW_CONTENT状态
            this.log(
              "INFO",
              "Tag end matching failed, returning to RAW_CONTENT state:",
              {
                expected: expectedEndTag[this.potentialEndTagMatchPos],
                got: char,
                pendingTag: this.pendingClosingTag,
              },
            )

            // 将已收集的pendingClosingTag作为内容发送
            this.pendingRawContent += this.pendingClosingTag

            // 重置状态
            this.state = ParserState.RAW_CONTENT
            this.pendingClosingTag = ""
            this.potentialEndTagMatchPos = 0

            // 不要增加position，这样当前字符会被下一次迭代处理
            this.position--
          }
          this.position++
          continue

        case ParserState.TEXT:
          this.handleTextState(char)
          break

        case ParserState.TAG_OPEN:
          this.handleTagOpenState(char)
          break

        case ParserState.TAG_NAME:
          this.handleTagNameState(char)
          break

        case ParserState.CLOSING_TAG_OPEN:
          this.handleClosingTagOpenState(char)
          break

        case ParserState.CLOSING_TAG_NAME:
          this.handleClosingTagNameState(char)
          break

        case ParserState.ATTR_NAME_START:
          this.handleAttrNameStartState(char)
          break

        case ParserState.ATTR_NAME:
          this.handleAttrNameState(char)
          break

        case ParserState.ATTR_NAME_END:
          this.handleAttrNameEndState(char)
          break

        case ParserState.ATTR_VALUE_START:
          this.handleAttrValueStartState(char)
          break

        case ParserState.ATTR_VALUE:
          this.handleAttrValueState(char)
          break

        case ParserState.SELF_CLOSING_START:
          this.handleSelfClosingStartState(char)
          break

        case ParserState.TAG_ENDING:
          this.handleTagEndingState(char)
          break
      }

      // 移动到下一个字符
      this.position++
    }

    // 处理完一个chunk，如果在原始内容状态，且有未发送的内容，发送它
    this.sendPendingRawContent()

    // 如果已处理完所有字符，清空buffer并重置position
    if (this.position >= this.buffer.length) {
      this.log("INFO", `Buffer processed completely, clearing buffer`)

      // 如果当前状态是RAW_CONTENT_POTENTIAL_END，保留pendingClosingTag供下一个chunk使用
      if (this.state !== ParserState.RAW_CONTENT_POTENTIAL_END) {
        this.buffer = ""
        this.position = 0
      } else {
        // 只保留pendingClosingTag
        this.buffer = ""
        this.position = 0
        this.log(
          "INFO",
          `Preserving potential end tag state for next chunk: ${this.pendingClosingTag}`,
        )
      }
    }
  }

  // 处理标签外的文本状态
  private handleTextState(char: string): void {
    if (char === "<") {
      // 开始一个新标签
      this.state = ParserState.TAG_OPEN
    }
    // 在文本状态下，其他字符直接忽略
  }

  // 处理开始标签状态
  private handleTagOpenState(char: string): void {
    if (char === "/") {
      // 这是一个结束标签 </tag>
      this.state = ParserState.CLOSING_TAG_OPEN
    } else if (this.isValidTagNameChar(char)) {
      // 开始收集标签名
      this.currentTagName = char
      this.state = ParserState.TAG_NAME
    } else {
      // 标签开始后应该是标签名或/，否则是错误的语法
      this.handleError(`Unexpected character after <: ${char}`)
    }
  }

  // 处理标签名状态
  private handleTagNameState(char: string): void {
    if (this.isWhitespace(char)) {
      // 标签名后面有空白，准备解析属性
      this.state = ParserState.ATTR_NAME_START
    } else if (char === ">") {
      // 标签结束，没有属性
      this.handleOpenTag()
    } else if (char === "/") {
      // 可能是自闭合标签
      this.state = ParserState.SELF_CLOSING_START
    } else {
      // 继续收集标签名
      this.currentTagName += char
    }
  }

  // 处理结束标签开始状态
  private handleClosingTagOpenState(char: string): void {
    if (this.isValidTagNameChar(char)) {
      // 开始收集结束标签名
      this.currentTagName = char
      this.state = ParserState.CLOSING_TAG_NAME
    } else {
      this.handleError(`Unexpected character after </: ${char}`)
    }
  }

  // 处理结束标签名状态
  private handleClosingTagNameState(char: string): void {
    if (char === ">") {
      // 结束标签结束
      this.handleCloseTag()
      this.currentTagName = ""
    } else if (!this.isWhitespace(char)) {
      // 继续收集标签名
      this.currentTagName += char
    }
    // 忽略结束标签名和>之间的空白
  }

  // 处理属性名开始状态
  private handleAttrNameStartState(char: string): void {
    if (this.isValidAttrNameChar(char)) {
      // 开始收集属性名
      this.currentAttrName = char
      this.state = ParserState.ATTR_NAME
    } else if (char === ">") {
      // 没有更多属性，标签结束
      this.handleOpenTag()
    } else if (char === "/") {
      // 自闭合标签
      this.state = ParserState.SELF_CLOSING_START
    } else if (!this.isWhitespace(char)) {
      this.handleError(`Unexpected character in attribute name: ${char}`)
    }
    // 忽略多余的空白
  }

  // 处理属性名状态
  private handleAttrNameState(char: string): void {
    if (this.isWhitespace(char)) {
      // 属性名结束，等待=
      this.state = ParserState.ATTR_NAME_END
    } else if (char === "=") {
      // 直接遇到=，属性名结束
      this.state = ParserState.ATTR_VALUE_START
    } else if (char === ">") {
      // 布尔属性，没有值
      this.currentAttrs[this.currentAttrName] = ""
      this.handleOpenTag()
    } else if (char === "/") {
      // 自闭合标签前的布尔属性
      this.currentAttrs[this.currentAttrName] = ""
      this.state = ParserState.SELF_CLOSING_START
    } else {
      // 继续收集属性名
      this.currentAttrName += char
    }
  }

  // 处理属性名结束状态
  private handleAttrNameEndState(char: string): void {
    if (char === "=") {
      // 找到=，准备解析属性值
      this.state = ParserState.ATTR_VALUE_START
    } else if (this.isWhitespace(char)) {
      // 忽略=前的空白
    } else if (this.isValidAttrNameChar(char)) {
      // 这是一个布尔属性，开始新属性
      this.currentAttrs[this.currentAttrName] = ""
      this.currentAttrName = char
      this.state = ParserState.ATTR_NAME
    } else if (char === ">") {
      // 这是一个布尔属性，标签结束
      this.currentAttrs[this.currentAttrName] = ""
      this.handleOpenTag()
    } else if (char === "/") {
      // 布尔属性后的自闭合标签
      this.currentAttrs[this.currentAttrName] = ""
      this.state = ParserState.SELF_CLOSING_START
    } else {
      this.handleError(`Unexpected character after attribute name: ${char}`)
    }
  }

  // 处理属性值开始状态
  private handleAttrValueStartState(char: string): void {
    if (char === '"' || char === "'") {
      // 属性值开始
      this.attrQuoteChar = char
      this.currentAttrValue = ""
      this.state = ParserState.ATTR_VALUE
    } else if (!this.isWhitespace(char)) {
      // 非标准但允许的无引号属性值
      this.currentAttrValue = char
      this.state = ParserState.ATTR_VALUE
      this.attrQuoteChar = "" // 标记为无引号属性
    }
    // 忽略=和引号之间的空白
  }

  // 处理属性值状态
  private handleAttrValueState(char: string): void {
    if (this.attrQuoteChar && char === this.attrQuoteChar) {
      // 引号闭合，属性值结束
      this.currentAttrs[this.currentAttrName] = this.currentAttrValue
      this.currentAttrName = ""
      this.currentAttrValue = ""
      this.state = ParserState.ATTR_NAME_START
    } else if (
      !this.attrQuoteChar &&
      (this.isWhitespace(char) || char === ">" || char === "/")
    ) {
      // 无引号属性值结束
      this.currentAttrs[this.currentAttrName] = this.currentAttrValue
      this.currentAttrName = ""
      this.currentAttrValue = ""

      if (this.isWhitespace(char)) {
        this.state = ParserState.ATTR_NAME_START
      } else if (char === ">") {
        this.handleOpenTag()
        // 这里需要后退一步，因为>也是一个有效的终止符
        this.position--
      } else if (char === "/") {
        this.state = ParserState.SELF_CLOSING_START
        // 同样需要后退
        this.position--
      }
    } else {
      // 继续收集属性值
      this.currentAttrValue += char
    }
  }

  // 处理自闭合标签开始状态
  private handleSelfClosingStartState(char: string): void {
    if (char === ">") {
      // 处理自闭合标签
      this.handleSelfClosingTag()
      this.state = ParserState.TEXT
    } else {
      this.handleError(`Expected > after / in self-closing tag, got ${char}`)
    }
  }

  // 处理标签结束状态
  private handleTagEndingState(char: string): void {
    // 这个状态主要是为了处理>字符，通常会立即转换到TEXT状态
    this.state = ParserState.TEXT
  }

  private getCurrentHandlingTagData(): TagData {
    return this.tagStack[this.tagStack.length - 1]
  }

  // 处理开始标签的完成
  private handleOpenTag(): void {
    const tagName = this.currentTagName

    this.log(
      "INFO",
      `Opening tag "${tagName}" with attributes:`,
      this.currentAttrs,
    )

    const tagData: TagData = { name: tagName, attrs: this.currentAttrs }
    // 触发开始标签回调
    this.onOpenTag?.(tagData)
    // 添加到标签栈
    this.tagStack.push(tagData)

    this.log("INFO", `Tag stack updated:`, [...this.tagStack])

    // 重置当前标签相关数据
    this.currentTagName = ""
    this.currentAttrs = {}

    // 检查是否是原始内容标签
    if (this.parseAsRawContentTags.includes(tagName)) {
      this.log("INFO", `Entering RAW_CONTENT mode for tag "${tagName}"`)
      this.state = ParserState.RAW_CONTENT
    } else {
      this.state = ParserState.TEXT
    }
  }

  // 处理结束标签的完成
  private handleCloseTag(): void {
    const tagName = this.currentTagName

    this.log("INFO", `Closing tag "${tagName}", current stack:`, [
      ...this.tagStack,
    ])

    // 验证标签嵌套是否正确
    if (this.strict && this.tagStack.length > 0) {
      const expectedTag = this.tagStack[this.tagStack.length - 1]
      if (expectedTag.name !== tagName) {
        this.log(
          "ERROR",
          `Tag mismatch: expected "${expectedTag}", got "${tagName}"`,
        )

        this.handleError(
          `Closing tag ${tagName} doesn't match last opened tag ${expectedTag}`,
        )
      }
    }

    // 触发结束标签回调
    this.onCloseTag?.({ name: tagName, attrs: this.currentAttrs })
    this.resetCurrentTagData()

    // 从标签栈中移除
    if (
      this.tagStack.length > 0 &&
      this.tagStack[this.tagStack.length - 1].name === tagName
    ) {
      this.tagStack.pop()

      this.log("INFO", `Tag "${tagName}" removed from stack, remaining:`, [
        ...this.tagStack,
      ])
    }

    // 检查父标签是否是原始内容标签
    if (this.tagStack.length > 0) {
      const parentTag = this.tagStack[this.tagStack.length - 1]
      if (this.parseAsRawContentTags.includes(parentTag.name)) {
        this.log(
          "INFO",
          `Returning to RAW_CONTENT mode for parent tag "${parentTag}"`,
        )

        this.state = ParserState.RAW_CONTENT
      }
    }
    if (this.state !== ParserState.RAW_CONTENT) {
      this.state = ParserState.TEXT
    }
  }

  // 处理自闭合标签
  private handleSelfClosingTag(): void {
    this.log(
      "INFO",
      `Self-closing tag "${this.currentTagName}" with attributes:`,
      this.currentAttrs,
    )
    const tagData: TagData = {
      name: this.currentTagName,
      attrs: this.currentAttrs,
    }

    // 触发开始和结束标签回调
    this.onOpenTag?.(tagData)
    this.onCloseTag?.(tagData)

    this.resetCurrentTagData()
  }

  private resetCurrentTagData(): void {
    this.currentTagName = ""
    this.currentAttrs = {}
    this.currentAttrName = ""
    this.currentAttrValue = ""
    this.attrQuoteChar = ""
  }

  // 处理解析错误
  private handleError(message: string): void {
    this.log("ERROR", `Error: ${message}`)

    if (this.strict) {
      this.onError?.(new Error(message))
    }
  }

  // 关闭解析器
  public close(): this {
    this.log(
      "INFO",
      `Parser closing, current state: ${ParserState[this.state]}`,
    )
    this.sendPendingRawContent()
    // 处理pending的闭合标签
    if (
      this.pendingClosingTag &&
      this.state === ParserState.RAW_CONTENT_POTENTIAL_END
    ) {
      // 将未完成的闭合标签作为原始内容发送
      this.log(
        "INFO",
        `Handling pending closing tag as raw content:`,
        this.pendingClosingTag,
      )
      const curTagData = this.getCurrentHandlingTagData()
      this.onRawContent?.(curTagData, this.pendingClosingTag)
      this.pendingClosingTag = ""
      this.potentialEndTagMatchPos = 0
      this.state = ParserState.RAW_CONTENT
    }

    // 解析最后的buffer
    this.parseBuffer()

    // 检查是否有未闭合的标签
    if (this.strict && this.tagStack.length > 0) {
      this.log("ERROR", `Unclosed tags:`, this.tagStack)

      this.onError?.(new Error(`Unclosed tags: ${this.tagStack.join(", ")}`))
    }

    // 触发结束回调
    this.onEnd?.()

    this.log("INFO", `Parser closed successfully`)

    return this
  }

  // 辅助方法：判断是否是合法的标签名字符
  private isValidTagNameChar(char: string): boolean {
    return /[a-zA-Z0-9\-_:.]/.test(char)
  }

  // 辅助方法：判断是否是合法的属性名字符
  private isValidAttrNameChar(char: string): boolean {
    return /[a-zA-Z0-9\-_:.]/.test(char)
  }

  // 辅助方法：判断是否是空白字符
  private isWhitespace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r"
  }

  // 从流中读取数据
  public async pipe(stream: ReadableStream) {
    this.log("INFO", `Piping from ReadableStream`)

    const reader = stream.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          this.log("INFO", `Stream ended, closing parser`)

          this.close()
          break
        }

        // 跳过空值
        if (value === undefined || value === null) {
          this.log("INFO", `Skipping null/undefined chunk`)

          continue
        }

        // 根据value类型处理
        if (typeof value === "string") {
          this.write(value)
        } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
          const str = new TextDecoder().decode(value)

          this.log(
            "INFO",
            `Decoded ArrayBuffer to string (${str.length} chars)`,
          )

          this.write(str)
        } else {
          this.log("ERROR", `Unsupported chunk type:`, typeof value)
        }
      }
    } catch (err) {
      this.onError?.(err as Error)
    }
  }
}
