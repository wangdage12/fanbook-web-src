import { useEffect, useRef } from 'react'

/**
 * 用于在列表的高度变化时保持底部对齐，内容向上增长
 * @param listContainer
 */
export function useKeepAlignBottomOnHeightChange(listContainer: HTMLDivElement | null) {
  const height = useRef(0)
  const numChildren = useRef(0)

  useEffect(() => {
    if (!listContainer) return
    if (listContainer.childElementCount > 1) throw new Error('listContainer should have only one child')

    const innerDom = listContainer.children[0]
    const observer = new ResizeObserver(([entry]) => {
      const newHeight = entry.contentRect.height
      // 如果高度增加了，需要保持位置，减少了不管，如果真出现减少了，不能反向滚回去
      // 如果之前的子对象数量和现在的不一样，说明是刚刚加载了新的消息，也不需要处理
      if (height.current !== 0 && newHeight > height.current && innerDom.childElementCount === numChildren.current) {
        listContainer.scrollBy(0, newHeight - height.current)
      }
      height.current = newHeight
      numChildren.current = innerDom.childElementCount
    })
    observer.observe(innerDom)
    return () => {
      observer.disconnect()
    }
  }, [listContainer])
}
