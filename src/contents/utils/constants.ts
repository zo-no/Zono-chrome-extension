export const CONTAINER_ID = "PH-Copilot-Container"
// export const TEXTAREA_SELECTOR =
//   'textarea.rta__textarea[placeholder="What do you think?"]' // 旧版 ProductHunt 的输入框标签
export const TEXTAREA_SELECTOR = 'textarea[placeholder]:not([placeholder=""])' // ProductHunt 更新了标签，现在要使用这个新的判断
export const COMMENT_FORM_SELECTOR = '[data-test="comment-form"]'