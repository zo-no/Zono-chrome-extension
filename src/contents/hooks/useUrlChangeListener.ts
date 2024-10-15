/**
 * 监听 URL 变化，回到 ProductHunt 页面时可以重新观察 DOM 变化，注入插件的功能组件
 */
import { useEffect } from "react"

export const useUrlChangeListener = (onUrlChange: () => void) => {
  useEffect(() => {
    const handleUrlChange = () => onUrlChange()

    window.addEventListener("popstate", handleUrlChange)

    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function () {
      originalPushState.apply(this, arguments)
      handleUrlChange()
    }

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments)
      handleUrlChange()
    }

    return () => {
      window.removeEventListener("popstate", handleUrlChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [onUrlChange])
}