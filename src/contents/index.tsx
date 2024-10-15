import globalStyle from "data-text:~style.css"
import type { PlasmoContentScript } from "plasmo"
import { useEffect } from "react"
import { createRoot } from "react-dom/client"

// 配置内容脚本
export const config: PlasmoContentScript = {
  matches: ["<all_urls>"], // 在所有URL上运行此内容脚本
  run_at: "document_idle" // 在页面加载完成后运行
}

const MyComponent = () => {
  return <div>Hello, world!</div>
}

// 定义主要的覆盖组件
export default function PlasmoOverlay() {
  useEffect(() => {
    // 创建一个新的 div 元素作为我们的内容容器
    const contentContainer = document.createElement("div")
    contentContainer.id = "plasmo-content-container"
    // 将新创建的 div 添加到 body 的末尾 - 可以改成添加到其他指定元素内
    document.body.appendChild(contentContainer)
    // 创建 Shadow DOM
    const shadowRoot = contentContainer.attachShadow({ mode: "open" })
    // 注入全局样式到 shadowRoot，这样既可以在 contents 生效，还不会影响页面本身的样式
    const styleElement = document.createElement("style")
    styleElement.textContent = globalStyle
    shadowRoot.appendChild(styleElement)
    // 创建 content div
    const contentDiv = document.createElement("div")
    contentDiv.id = "plasmo-overlay-content"
    shadowRoot.appendChild(contentDiv)
    // 在这里渲染React组件到contentDiv
    createRoot(contentDiv).render(<MyComponent />)
  }, [])
  return null
}
