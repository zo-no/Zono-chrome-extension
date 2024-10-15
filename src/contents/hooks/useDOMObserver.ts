/**
 * ProductHunt 的打榜页面(/posts/*)，在不同尺寸屏幕下，评论表单的位置不同，所以需要监听 DOM 变化，重新注入 content
 * 当评论表单被找到时，调用 onCommentFormFound 回调函数
 * 当页面卸载时，停止观察 DOM 变化
 * 返回 observeDOMChanges 函数，用于手动停止观察 DOM 变化
 */
import { useCallback, useEffect, useRef } from "react"
import { COMMENT_FORM_SELECTOR } from "../utils/constants"

export const useDOMObserver = (onCommentFormFound: () => void) => {
  const observerRef = useRef<MutationObserver | null>(null)

  const observeDOMChanges = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const commentForm = document.querySelector(COMMENT_FORM_SELECTOR)
          if (commentForm) {
            onCommentFormFound()
            break
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    observerRef.current = observer
  }, [onCommentFormFound])

  useEffect(() => {
    observeDOMChanges()
    return () => observerRef.current?.disconnect()
  }, [observeDOMChanges])

  return observeDOMChanges
}
