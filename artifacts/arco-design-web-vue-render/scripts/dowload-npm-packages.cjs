const fs = require("fs")
const path = require("path")
const https = require("https")

// npm包列表
const npmPackages = [
  "@tailwindcss/browser@4.1.4/dist/index.global.min.js",
  "@vue/devtools-api@7.7.2/dist/index.js",
  "@vue/devtools-kit@7.7.2/dist/index.min.js",
  "@vue/devtools-shared@7.7.2/dist/index.min.js",
  "@vue/runtime-dom@3.2.0/dist/runtime-dom.esm-browser.js",
  "@vue/shared@3.2.0/dist/shared.esm-bundler.js",
  "@vueuse/core@9.6.0/index.mjs",
  "@vueuse/shared@9.6.0/index.mjs",

  "arco-design-web-vue-mjs@0.0.1/dist/arco-full.css",
  "arco-design-web-vue-mjs@0.0.1/dist/arco-vue-icon.mjs",
  "arco-design-web-vue-mjs@0.0.1/dist/arco-vue.mjs",

  "axios-mock-adapter@1.21.1/dist/axios-mock-adapter.js",
  "axios@1.0.0/dist/esm/axios.js",
  "birpc@2.3.0/dist/index.mjs",
  "hookable@5.5.3/dist/index.mjs",
  "perfect-debounce@1.0.0/dist/index.mjs",
  "pinia@2.0.22/dist/pinia.esm-browser.js",
  "vue-demi@0.13.11/lib/index.mjs",
  "vue-i18n@9.2.0-beta.36/dist/vue-i18n.esm-browser.js",
  "vue-router@4.0.16/dist/vue-router.esm-browser.js",
]

// 定义目标目录
const targetDir = path.resolve(__dirname, "../public/npm")

// 从jsdelivr下载文件的函数
async function downloadFile(packagePath, targetPath) {
  return new Promise((resolve, reject) => {
    // 构建jsdelivr URL
    const jsdelivrUrl = `https://cdn.jsdelivr.net/npm/${packagePath}`

    // 确保目标目录存在
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })

    // 创建写入流
    const fileStream = fs.createWriteStream(targetPath)

    // 发起HTTPS请求
    https
      .get(jsdelivrUrl, response => {
        if (response.statusCode === 404) {
          fileStream.close()
          reject(new Error(`文件未找到: ${jsdelivrUrl}`))
          return
        }

        response.pipe(fileStream)

        fileStream.on("finish", () => {
          fileStream.close()
          console.log(`✓ 已下载: ${packagePath}`)
          resolve()
        })
      })
      .on("error", err => {
        fs.unlink(targetPath, () => {})
        reject(err)
      })
  })
}

// 主函数
async function main() {
  console.log("开始下载npm包文件...")

  try {
    // 确保目标根目录存在
    fs.mkdirSync(targetDir, { recursive: true })

    // 遍历并下载所有包
    for (const packagePath of npmPackages) {
      const targetPath = path.join(targetDir, packagePath)
      try {
        await downloadFile(packagePath, targetPath)
      } catch (error) {
        console.error(`下载 ${packagePath} 时出错:`, error.message)
      }
    }

    console.log("所有文件下载完成！")
  } catch (error) {
    console.error("发生错误:", error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
