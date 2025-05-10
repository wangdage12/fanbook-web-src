import React, { useEffect, useMemo } from 'react'
import { parseAlignment } from './helpers'

export default function AlignWidget({ alignment, children }: { alignment: string; children: React.ReactElement }) {
  const [h, v] = useMemo(() => parseAlignment(alignment).map(v => (v + 1) / 2), [alignment])
  const ref = React.createRef<HTMLDivElement>()

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([parent, child]) => {
      // 不加 `requestAnimationFrame` 会导致 `child.target.getBoundingClientRect()` 的值不对
      requestAnimationFrame(() => {
        if (!ref.current || !child) return
        // 使用 `getBoundingClientRect` 而不是 `contentRect` 是因为这里触发时 `contentRect` 为 0，具体的起因不清楚
        const childRect = child.target.getBoundingClientRect()
        ref.current.style.transform = `translate(${(parent.contentRect.width - childRect.width) * h}px, ${
          (parent.contentRect.height - childRect.height) * v
        }px)`
      })
    })

    observer.observe(ref.current!.parentElement!)
    observer.observe(ref.current!)

    // 如果子节点是撑满父节点的，那么就不需要设置宽高了
    if ((ref.current!.children[0] as HTMLElement)?.style?.aspectRatio) {
      Object.assign(ref.current!.style, { width: 'auto', height: 'auto' })
    }

    return () => observer.disconnect()
  }, [ref.current])

  return (
    // 让子节点的宽度由内容决定，而不是父节点的宽度，这符合 flutter 的行为
    <div
      ref={ref}
      style={{
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      {children}
    </div>
  )
}
