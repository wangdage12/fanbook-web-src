/**
 * 修复 tailwind css base 样式与 antd 冲突
 */
let mutationObserver: MutationObserver | null = null

function callback() {
  const head = document.head
  const tailwindStyleTag = head.querySelector('[data-id="reset"]')
  if (tailwindStyleTag && tailwindStyleTag !== head.firstChild) {
    head.insertBefore(tailwindStyleTag.cloneNode(), head.firstChild)
    // 使用 requestAnimationFrame 过快移除,而上面添加的样式未生效, 使用 setTimeout 避免过快移除导致样式丢失
    setTimeout(() => tailwindStyleTag.parentNode?.removeChild(tailwindStyleTag), 0)
  }
}

export default function fixCssOrder() {
  if (mutationObserver) {
    return
  }
  mutationObserver = new MutationObserver(callback)
  mutationObserver.observe(document.head, { childList: true })
  requestAnimationFrame(callback)
}
