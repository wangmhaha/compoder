import { createApp } from "vue"
// 先导入Element Plus的样式
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/src/message.scss"
// 再导入Element Plus组件
import ElementPlus from "element-plus"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

import App from "./App.vue"

// import "~/styles/element/index.scss";

// or use cdn, uncomment cdn link in `index.html`

import "~/styles/index.scss"
import "uno.css"

// 创建应用实例
const app = createApp(App)
// 使用Element Plus
app.use(ElementPlus)
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用
app.mount("#app")
