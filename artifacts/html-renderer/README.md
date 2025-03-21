# HTML Renderer

HTML Renderer 是一个简单的 Next.js 应用，用于渲染从父窗口传递过来的完整 HTML 文档。它提供错误处理功能，确保渲染过程的稳定性。

## 功能

- 渲染完整的 HTML 文档
- 错误边界处理
- 错误显示组件

## 技术实现

HTML Renderer 使用 iframe 的 `srcdoc` 属性直接渲染 HTML 内容，而不是通过 JavaScript 动态写入 iframe 文档。这种方法有以下优势：

- 避免了嵌套 iframe 的性能问题
- 简化了通信机制
- 提高了渲染效率
- 减少了潜在的安全问题

### 错误传递机制

由于 HTML Renderer 本身就是作为 iframe 嵌入到外部应用中的，我们实现了一个多级错误传递机制：

1. 内部 iframe 中的 JavaScript 错误通过 `window.onerror` 捕获
2. 错误信息通过 `postMessage` 发送到 HTML Renderer
3. HTML Renderer 接收到错误消息后，通过 `onError` 回调函数将错误传递到最外层父窗口

这种机制确保了无论错误发生在哪一层，都能够被正确地捕获并传递到最外层的应用。

## 使用方法

父窗口可以通过 postMessage API 向 iframe 发送消息，格式如下：

```javascript
iframe.contentWindow.postMessage(
  {
    type: "artifacts",
    data: {
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                color: blue;
              }
            </style>
          </head>
          <body>
            <h1>Hello World</h1>
            <script>
              console.log("Hello from JavaScript");
            </script>
          </body>
        </html>
      `,
    },
  },
  "*",
)
```

## 错误处理

当渲染过程中发生错误时，HTML Renderer 会捕获错误并显示错误信息。同时，它会向父窗口发送错误消息：

```javascript
{
  type: 'artifacts-error',
  errorMessage: '错误信息'
}
```

## 成功回调

当 HTML 成功渲染后，HTML Renderer 会向父窗口发送成功消息：

```javascript
{
  type: "artifacts-success"
}
```
