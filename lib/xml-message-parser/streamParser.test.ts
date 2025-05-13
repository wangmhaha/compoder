import { StreamParser } from "./stream-parser"
import {
  APP_TSX_CONTENT,
  DATA_WITH_1_FILE,
  DATA_WITH_2_FILES,
  DATA_WITH_3_FILES,
  INTERFACE_TS_CONTENT,
  MINI_CPN_TSX_CONTENT,
} from "./mock/data"
import { createMockStream } from "./mock/mock-stream"
import * as fs from "fs"

/**
 * Comprehensive test suite for the StreamParser component
 *
 * The StreamParser is an XML parser that:
 * - Can parse XML content in chunks (streaming mode)
 * - Handles tag opening and closing events
 * - Parses attributes in XML tags
 * - Handles self-closing tags
 * - Works in strict or non-strict mode
 * - Can process raw content within specified tags
 */
describe("StreamParser", () => {
  /**
   * Basic functionality tests for StreamParser
   * Testing simple cases with single tags and attributes
   */
  describe("Basic functionality", () => {
    let parser: StreamParser
    let openTagEvents: Array<{ name: string; attrs: Record<string, string> }>
    let closeTagEvents: string[]

    beforeEach(() => {
      // Initialize parser in non-strict mode
      parser = new StreamParser({ strict: false, parseAsRawContentTags: [] })
      openTagEvents = []
      closeTagEvents = []

      parser.onOpenTag = tagData => {
        openTagEvents.push({ name: tagData.name, attrs: tagData.attrs })
      }

      parser.onCloseTag = tagData => {
        closeTagEvents.push(tagData.name)
      }
    })

    test("should parse a single complete tag with attributes correctly", () => {
      // Test with a simple tag containing an attribute
      parser.write('<ComponentArtifact name="MiniCpn">')
      parser.close()

      expect(openTagEvents.length).toBe(1)
      expect(openTagEvents[0].name).toBe("ComponentArtifact")
      expect(openTagEvents[0].attrs).toEqual({ name: "MiniCpn" })
    })

    test("should parse a complex XML document correctly", () => {
      // Test with the complex test XML data
      const strictParser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      let errorCalled = false

      strictParser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      strictParser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      strictParser.onError = err => {
        console.error("err是：", err)
        errorCalled = true
      }

      // Write all data at once
      strictParser.write(DATA_WITH_3_FILES).close()

      // Verify basic parsing worked
      expect(openTagCalls.length).toBe(4)
      expect(closeTagCalls.length).toBe(4)

      // Verify first tag was ComponentArtifact with correct attributes
      expect(openTagCalls[0][0]).toBe("ComponentArtifact")
      expect(openTagCalls[0][1]).toEqual({ name: "MiniCpn" })

      // Verify ComponentFile tags exist
      const componentFiles = openTagCalls.filter(
        call => call[0] === "ComponentFile",
      )
      expect(componentFiles.length).toBe(3)
      expect(componentFiles[0][1]).toEqual({
        fileName: "App.tsx",
        isEntryFile: "true",
      })

      // No errors and end callback called
      expect(errorCalled).toBe(false)
    })
  })

  /**
   * Streaming parsing tests
   * Testing the parser's ability to handle content delivered in chunks
   */
  describe("Streaming parsing", () => {
    test("should handle standard streaming input (multiple chunks)", () => {
      const streamParser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      const streamOpenTagEvents: Array<{
        name: string
        attrs: Record<string, string>
      }> = []
      const streamCloseTagEvents: string[] = []

      streamParser.onOpenTag = tagData => {
        streamOpenTagEvents.push({ name: tagData.name, attrs: tagData.attrs })
      }

      streamParser.onCloseTag = tagData => {
        streamCloseTagEvents.push(tagData.name)
      }

      // Simulate streaming by breaking the input into logical chunks
      streamParser.write("<Component")
      streamParser.write("Artifact ")
      streamParser.write('name="Mini')
      streamParser.write('Cpn">')
      streamParser.close()

      expect(streamOpenTagEvents.length).toBe(1)
      expect(streamOpenTagEvents[0].name).toBe("ComponentArtifact")
      expect(streamOpenTagEvents[0].attrs).toEqual({ name: "MiniCpn" })
    })

    test("should handle extreme chunking (character by character)", () => {
      const extremeParser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      const extremeOpenTagEvents: Array<{
        name: string
        attrs: Record<string, string>
      }> = []
      const extremeCloseTagEvents: string[] = []

      extremeParser.onOpenTag = tagData => {
        extremeOpenTagEvents.push({ name: tagData.name, attrs: tagData.attrs })
      }

      extremeParser.onCloseTag = tagData => {
        extremeCloseTagEvents.push(tagData.name)
      }

      // Send the tag character by character to test extreme chunking
      extremeParser.write("<")
      extremeParser.write("Component")
      extremeParser.write(" ")
      extremeParser.write('id="test" ')
      extremeParser.write('class="special" ')
      extremeParser.write('data-value="complex-value"')
      extremeParser.write(">")
      extremeParser.close()

      expect(extremeOpenTagEvents.length).toBe(1)
      expect(extremeOpenTagEvents[0].name).toBe("Component")
      expect(extremeOpenTagEvents[0].attrs).toEqual({
        id: "test",
        class: "special",
        "data-value": "complex-value",
      })
    })

    test("should handle streaming of complex XML by line", () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      let errorCalled = false

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onError = () => (errorCalled = true)

      // Split the test data into lines and feed line by line
      const chunks = DATA_WITH_3_FILES.split("\n")
      chunks.forEach(chunk => {
        parser.write(chunk + "\n")
      })
      parser.close()

      // Verify that tags were correctly parsed
      expect(openTagCalls.length).toBe(4)
      expect(closeTagCalls.length).toBe(4)
      expect(errorCalled).toBe(false)
    })
  })

  /**
   * Raw content handling tests
   * Testing the parser's ability to treat specified tags as raw content containers
   */
  describe("Raw content handling", () => {
    test("should process specified tags as raw content", () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      const rawContentCalls: Array<[string, string]> = []
      let errorCalled = false

      // Create a parser that treats ComponentFile tags as raw content
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onRawContent = (tagData, content) =>
        rawContentCalls.push([tagData.name, content])
      parser.onError = () => (errorCalled = true)

      // Process the full test XML data
      parser.write(DATA_WITH_3_FILES).close()

      // Verify ComponentArtifact tag is present
      const componentArtifactTag = openTagCalls.find(
        call => call[0] === "ComponentArtifact",
      )
      expect(componentArtifactTag).toBeDefined()

      // Verify ComponentFile tags were parsed
      const componentFileTags = openTagCalls.filter(
        call => call[0] === "ComponentFile",
      )
      expect(componentFileTags.length).toBe(3)

      // Verify raw content was captured
      expect(rawContentCalls[0][0]).toBe("ComponentFile")
      expect(typeof rawContentCalls[0][1]).toBe("string")

      expect(errorCalled).toBe(false)
    })
  })

  test("onRawContent should return right content when chunk is small", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => (rawContent += content)

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_1_FILE, {
      minChunkSize: 1,
      maxChunkSize: 3,
    })

    await parser.pipe(stream)
    rawContent = rawContent.trim()
    const componentFileContent = DATA_WITH_1_FILE.match(
      /<ComponentFile.*?>([\s\S]*?)<\/ComponentFile>/,
    )?.[1]?.trim()

    expect(rawContent).toBe(componentFileContent)
    expect(errorCalled).toBe(false)
  })
  test("onRawContent should return right content when chunk is big", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => (rawContent += content)

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_1_FILE, {
      minChunkSize: 50,
      maxChunkSize: 100,
    })

    await parser.pipe(stream)
    rawContent = rawContent.trim()
    const componentFileContent = DATA_WITH_1_FILE.match(
      /<ComponentFile.*?>([\s\S]*?)<\/ComponentFile>/,
    )?.[1]?.trim()

    expect(rawContent).toBe(componentFileContent)
    expect(errorCalled).toBe(false)
  })

  test("onRawContent should return right content when chunk is huge", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => (rawContent += content)

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_1_FILE, {
      minChunkSize: 10000,
      maxChunkSize: 10000,
    })

    await parser.pipe(stream)
    rawContent = rawContent.trim()
    const componentFileContent = DATA_WITH_1_FILE.match(
      /<ComponentFile.*?>([\s\S]*?)<\/ComponentFile>/,
    )?.[1]?.trim()

    expect(rawContent).toBe(componentFileContent)
    expect(errorCalled).toBe(false)
  })

  test("onRawContent should return right content when chunk range is big", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => (rawContent += content)

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_1_FILE, {
      minChunkSize: 1,
      maxChunkSize: 5000,
    })

    await parser.pipe(stream)
    rawContent = rawContent.trim()
    const componentFileContent = DATA_WITH_1_FILE.match(
      /<ComponentFile.*?>([\s\S]*?)<\/ComponentFile>/,
    )?.[1]?.trim()

    expect(rawContent).toBe(componentFileContent)
    expect(errorCalled).toBe(false)
  })

  test("onRawContent should return right content when chunk is huge & multiple files", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent_APP_TSX_CONTENT = ""
    let rawContent_MINI_CPN_TSX_CONTENT = ""
    let rawContent_INTERFACE_TS_CONTENT = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => {
      const fileName = tagData.attrs.fileName
      switch (fileName) {
        case "App.tsx":
          rawContent_APP_TSX_CONTENT += content
          break
        case "MiniCpn.tsx":
          rawContent_MINI_CPN_TSX_CONTENT += content
          break
        case "interface.ts":
          rawContent_INTERFACE_TS_CONTENT += content
          break
        default:
          break
      }
    }

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_3_FILES, {
      minChunkSize: 10000,
      maxChunkSize: 10000,
    })

    await parser.pipe(stream)

    expect(rawContent_APP_TSX_CONTENT.trim()).toBe(APP_TSX_CONTENT.trim())
    expect(rawContent_MINI_CPN_TSX_CONTENT.trim()).toBe(
      MINI_CPN_TSX_CONTENT.trim(),
    )
    expect(rawContent_INTERFACE_TS_CONTENT.trim()).toBe(
      INTERFACE_TS_CONTENT.trim(),
    )
    expect(errorCalled).toBe(false)
  })

  test("onRawContent should return right content when chunk is big & multiple files", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent_APP_TSX_CONTENT = ""
    let rawContent_MINI_CPN_TSX_CONTENT = ""
    let rawContent_INTERFACE_TS_CONTENT = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => {
      const fileName = tagData.attrs.fileName
      switch (fileName) {
        case "App.tsx":
          rawContent_APP_TSX_CONTENT += content
          break
        case "MiniCpn.tsx":
          rawContent_MINI_CPN_TSX_CONTENT += content
          break
        case "interface.ts":
          rawContent_INTERFACE_TS_CONTENT += content
          break
        default:
          break
      }
    }

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_3_FILES, {
      minChunkSize: 50,
      maxChunkSize: 100,
    })

    await parser.pipe(stream)

    expect(rawContent_APP_TSX_CONTENT.trim()).toBe(APP_TSX_CONTENT.trim())
    expect(rawContent_MINI_CPN_TSX_CONTENT.trim()).toBe(
      MINI_CPN_TSX_CONTENT.trim(),
    )
    expect(rawContent_INTERFACE_TS_CONTENT.trim()).toBe(
      INTERFACE_TS_CONTENT.trim(),
    )
    expect(errorCalled).toBe(false)
  })

  test("onRawContent should return right content when chunk is small & multiple files", async () => {
    const parser = new StreamParser({
      strict: false,
      parseAsRawContentTags: ["ComponentFile"],
    })

    let rawContent_APP_TSX_CONTENT = ""
    let rawContent_MINI_CPN_TSX_CONTENT = ""
    let rawContent_INTERFACE_TS_CONTENT = ""
    let errorCalled = false

    parser.onRawContent = (tagData, content) => {
      const fileName = tagData.attrs.fileName
      switch (fileName) {
        case "App.tsx":
          rawContent_APP_TSX_CONTENT += content
          break
        case "MiniCpn.tsx":
          rawContent_MINI_CPN_TSX_CONTENT += content
          break
        case "interface.ts":
          rawContent_INTERFACE_TS_CONTENT += content
          break
        default:
          break
      }
    }

    parser.onError = () => (errorCalled = true)

    // Create a ReadableStream with very small chunks
    const stream = createMockStream(DATA_WITH_3_FILES, {
      minChunkSize: 1,
      maxChunkSize: 3,
    })

    await parser.pipe(stream)

    expect(rawContent_APP_TSX_CONTENT.trim()).toBe(APP_TSX_CONTENT.trim())
    expect(rawContent_MINI_CPN_TSX_CONTENT.trim()).toBe(
      MINI_CPN_TSX_CONTENT.trim(),
    )
    expect(rawContent_INTERFACE_TS_CONTENT.trim()).toBe(
      INTERFACE_TS_CONTENT.trim(),
    )
    expect(errorCalled).toBe(false)
  }, 20000)

  /**
   * Self-closing tag tests
   * Testing the parser's ability to handle self-closing XML tags
   */
  describe("Self-closing tags", () => {
    test("should handle self-closing tags correctly", () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])

      // Process XML with a self-closing tag
      const xmlWithSelfClosingTag = "<root><selfClosing /></root>"
      parser.write(xmlWithSelfClosingTag).close()

      // Verify both tags were processed correctly
      expect(openTagCalls.length).toBe(2)
      expect(closeTagCalls.length).toBe(2)

      // Verify self-closing tag was both opened and closed
      expect(openTagCalls[1][0]).toBe("selfClosing")
      expect(closeTagCalls[0][0]).toBe("selfClosing")
    })
  })

  /**
   * Error handling tests
   * Testing error reporting in strict and non-strict modes
   */
  describe("Error handling", () => {
    test("should report unclosed tags in strict mode", () => {
      let errorMessage = ""

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onError = error => (errorMessage = error.message)

      // Process invalid XML with an unclosed tag
      const incompleteXml = "<root><unclosed>"
      parser.write(incompleteXml).close()

      // Verify error was reported in strict mode
      expect(errorMessage).toContain("Unclosed tags")
    })

    test("should ignore errors in non-strict mode", () => {
      let errorCalled = false

      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onError = () => (errorCalled = true)

      // Process invalid XML with an unclosed tag
      const incompleteXml = "<root><unclosed>"
      parser.write(incompleteXml).close()

      // Verify no error was reported in non-strict mode
      expect(errorCalled).toBe(false)
    })
  })

  /**
   * Stream API tests
   * Testing the parser's ability to handle ReadableStream input
   */
  describe("Stream API", () => {
    test("should parse correctly from a ReadableStream", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      let errorCalled = false

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream from the test data using createMockStream
      const stream = createMockStream(DATA_WITH_3_FILES, {
        minChunkSize: 10,
        maxChunkSize: 30,
      })

      // Use pipe to parse the stream
      await parser.pipe(stream)

      // Verify parsing results
      expect(openTagCalls.length).toBe(4)
      expect(closeTagCalls.length).toBe(4)
      expect(errorCalled).toBe(false)
    })

    test("should handle very small chunks from stream", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      let errorCalled = false

      const parser = new StreamParser({
        strict: true,
        debug: true,
        logger: {
          log: (message, ...args) => {
            // 输出到文件、存储到变量或使用测试框架的日志方法
            fs.appendFileSync(
              "parser-debug.log",
              `${message} ${args.map(a => JSON.stringify(a)).join(" ")}\n`,
            )
          },
          error: (message, ...args) => {
            fs.appendFileSync(
              "parser-error.log",
              `ERROR: ${message} ${args
                .map(a => JSON.stringify(a))
                .join(" ")}\n`,
            )
          },
        },
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with very small chunks
      const stream = createMockStream(DATA_WITH_2_FILES, {
        minChunkSize: 1,
        maxChunkSize: 5,
      })

      await parser.pipe(stream)

      expect(openTagCalls.length).toBe(3)
      expect(closeTagCalls.length).toBe(3)
      expect(errorCalled).toBe(false)
    }, 10000)

    test("should handle large chunks from stream", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      let errorCalled = false

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with larger chunks
      const stream = createMockStream(DATA_WITH_3_FILES, {
        minChunkSize: 50,
        maxChunkSize: 100,
      })

      await parser.pipe(stream)

      expect(openTagCalls.length).toBe(4)
      expect(closeTagCalls.length).toBe(4)
      expect(errorCalled).toBe(false)
    })

    test("should process raw content tags correctly when streamed", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      const rawContentCalls: Array<[string, string]> = []
      let errorCalled = false

      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onRawContent = (tagData, content) =>
        rawContentCalls.push([tagData.name, content])
      parser.onError = () => (errorCalled = true)

      // Create a stream with medium-sized chunks
      const stream = createMockStream(DATA_WITH_3_FILES, {
        minChunkSize: 20,
        maxChunkSize: 40,
      })

      await parser.pipe(stream)

      // Verify ComponentArtifact tag is present
      const componentArtifactTag = openTagCalls.find(
        call => call[0] === "ComponentArtifact",
      )
      expect(componentArtifactTag).toBeDefined()

      // Verify ComponentFile tags were processed
      const componentFileTags = openTagCalls.filter(
        call => call[0] === "ComponentFile",
      )
      expect(componentFileTags.length).toBe(3)

      // Verify raw content was captured
      expect(rawContentCalls[0][0]).toBe("ComponentFile")
      expect(typeof rawContentCalls[0][1]).toBe("string")

      expect(errorCalled).toBe(false)
    })

    test("should handle unclosed tags in strict mode when streamed", async () => {
      let errorMessage = ""

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onError = error => (errorMessage = error.message)

      // Create a stream with incomplete XML
      const incompleteXml = "<root><unclosed>"
      const stream = createMockStream(incompleteXml, {
        minChunkSize: 3,
        maxChunkSize: 6,
      })

      await parser.pipe(stream)

      // Verify error was reported in strict mode
      expect(errorMessage).toContain("Unclosed tags")
    })

    test("should handle varying chunk sizes with complex XML structure", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      const rawContentCalls: Array<[string, string]> = []
      let endCalled = false

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onRawContent = (tagData, content) =>
        rawContentCalls.push([tagData.name, content])
      parser.onEnd = () => (endCalled = true)

      // Create a stream with random sized chunks that often split tags
      const stream = createMockStream(DATA_WITH_3_FILES, {
        minChunkSize: 2,
        maxChunkSize: 25,
      })

      await parser.pipe(stream)

      // Verify all ComponentFile tags were found
      const componentFiles = openTagCalls.filter(
        call => call[0] === "ComponentFile",
      )
      expect(componentFiles.length).toEqual(3) // There are 3 ComponentFile tags in the sample data

      // Verify first ComponentFile has correct attributes
      expect(componentFiles[0][1]).toEqual({
        fileName: "App.tsx",
        isEntryFile: "true",
      })

      // Verify end callback was called
      expect(endCalled).toBe(true)
    })

    test("should handle streamed self-closing tags correctly", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []

      const parser = new StreamParser({
        strict: true,
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])

      // XML with self-closing tags that will be split across chunks
      const xmlWithSelfClosingTags = `
        <root>
          <item id="1" />
          <item id="2" name="second item" />
          <item id="3" type="special" value="42" />
        </root>
      `

      const stream = createMockStream(xmlWithSelfClosingTags, {
        minChunkSize: 3,
        maxChunkSize: 8,
      })

      await parser.pipe(stream)

      // Verify all tags were found (1 root + 3 items)
      expect(openTagCalls.length).toBe(4)

      // Verify all tags were closed
      expect(closeTagCalls.length).toBe(4)

      // Check if self-closing item tags with attributes were parsed correctly
      const itemTags = openTagCalls.filter(call => call[0] === "item")
      expect(itemTags.length).toBe(3)

      // Check attributes of the third item
      const thirdItem = itemTags[2]
      expect(thirdItem[1]).toEqual({
        id: "3",
        type: "special",
        value: "42",
      })
    })

    test("should handle streamed data with broken XML syntax in non-strict mode", async () => {
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      let errorCalled = false

      const parser = new StreamParser({
        strict: false, // Non-strict mode should be more forgiving
        parseAsRawContentTags: ["ComponentFile"],
      })

      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onError = () => (errorCalled = true)

      // XML with some syntax issues
      const brokenXml = `
        <root>
          <item>Valid item</unclosedCorrectly>
          <unclosed>
          <selfClosing / >
          <attributesWithNoQuotes id=1 name=test />
        </root>
      `

      const stream = createMockStream(brokenXml, {
        minChunkSize: 2,
        maxChunkSize: 10,
      })

      await parser.pipe(stream)

      // In non-strict mode, it should still parse what it can without errors
      expect(errorCalled).toBe(false)
      expect(openTagCalls.length).toBe(5)
      expect(closeTagCalls.length).toBe(4)
    })
  })

  /**
   * onChunk callback tests
   * Testing the onChunk callback functionality with different chunk sizes
   */
  describe("onChunk callback", () => {
    test("should receive all chunks when chunk is small", async () => {
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      let receivedContent = ""
      let errorCalled = false

      parser.onChunk = chunk => (receivedContent += chunk)
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with very small chunks
      const stream = createMockStream(DATA_WITH_1_FILE, {
        minChunkSize: 1,
        maxChunkSize: 3,
      })

      await parser.pipe(stream)

      // Verify that all content was received through onChunk
      expect(receivedContent).toBe(DATA_WITH_1_FILE)
      expect(errorCalled).toBe(false)
    })

    test("should receive all chunks when chunk is medium", async () => {
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      let receivedContent = ""
      let errorCalled = false

      parser.onChunk = chunk => (receivedContent += chunk)
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with medium chunks
      const stream = createMockStream(DATA_WITH_1_FILE, {
        minChunkSize: 50,
        maxChunkSize: 100,
      })

      await parser.pipe(stream)

      // Verify that all content was received through onChunk
      expect(receivedContent).toBe(DATA_WITH_1_FILE)
      expect(errorCalled).toBe(false)
    })

    test("should receive all chunks when chunk is large", async () => {
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      let receivedContent = ""
      let errorCalled = false

      parser.onChunk = chunk => (receivedContent += chunk)
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with large chunks
      const stream = createMockStream(DATA_WITH_1_FILE, {
        minChunkSize: 10000,
        maxChunkSize: 10000,
      })

      await parser.pipe(stream)

      // Verify that all content was received through onChunk
      expect(receivedContent).toBe(DATA_WITH_1_FILE)
      expect(errorCalled).toBe(false)
    })

    test("should receive all chunks with varying sizes", async () => {
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      let receivedContent = ""
      let errorCalled = false

      parser.onChunk = chunk => (receivedContent += chunk)
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with varying chunk sizes
      const stream = createMockStream(DATA_WITH_1_FILE, {
        minChunkSize: 1,
        maxChunkSize: 5000,
      })

      await parser.pipe(stream)

      // Verify that all content was received through onChunk
      expect(receivedContent).toBe(DATA_WITH_1_FILE)
      expect(errorCalled).toBe(false)
    })

    test("should receive all chunks correctly with multiple files", async () => {
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      let receivedContent = ""
      let chunkCount = 0
      let errorCalled = false

      parser.onChunk = chunk => {
        receivedContent += chunk
        chunkCount++
      }
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with varying chunk sizes
      const stream = createMockStream(DATA_WITH_3_FILES, {
        minChunkSize: 10,
        maxChunkSize: 50,
      })

      await parser.pipe(stream)

      // Verify that all content was received through onChunk
      expect(receivedContent).toBe(DATA_WITH_3_FILES)
      expect(chunkCount).toBeGreaterThan(1) // Ensure multiple chunks were processed
      expect(errorCalled).toBe(false)
    })

    test("should handle onChunk alongside other callbacks", async () => {
      const parser = new StreamParser({
        strict: false,
        parseAsRawContentTags: ["ComponentFile"],
      })

      let receivedContent = ""
      const openTagCalls: Array<[string, Record<string, string>]> = []
      const closeTagCalls: Array<[string]> = []
      const rawContentCalls: Array<[string, string]> = []
      let errorCalled = false

      parser.onChunk = chunk => (receivedContent += chunk)
      parser.onOpenTag = tagData =>
        openTagCalls.push([tagData.name, tagData.attrs])
      parser.onCloseTag = tagData => closeTagCalls.push([tagData.name])
      parser.onRawContent = (tagData, content) =>
        rawContentCalls.push([tagData.name, content])
      parser.onError = () => (errorCalled = true)

      // Create a ReadableStream with small chunks
      const stream = createMockStream(DATA_WITH_2_FILES, {
        minChunkSize: 5,
        maxChunkSize: 20,
      })

      await parser.pipe(stream)

      // Verify that all content was received through onChunk
      expect(receivedContent).toBe(DATA_WITH_2_FILES)

      // Verify that other callbacks also worked correctly
      expect(openTagCalls.length).toBe(3) // ComponentArtifact + 2 ComponentFiles
      expect(closeTagCalls.length).toBe(3)
      expect(rawContentCalls.length).toBeGreaterThan(0)
      expect(errorCalled).toBe(false)
    })
  })
})
