import { useDebounceFn, useSize } from 'ahooks'
import clsx from 'clsx'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface HorizontalScrollWithButtonProps {
  className?: string
  listClassName?: string
  children: ReactNode
}

/**
 * 一个横线滚动列表，带左右滚动按钮
 *
 * @param className
 * @param listClassName
 * @param children
 * @constructor
 */
export default function HorizontalScrollWithButton({ className, listClassName, children }: HorizontalScrollWithButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)
  const [leftEnabled, setLeftEnabled] = useState(false)
  const [rightEnabled, setRightEnabled] = useState(false)
  const size = useSize(listRef)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const scrollable = list.scrollWidth > rootRef.current!.offsetWidth
    setScrollable(scrollable)
    if (scrollable) {
      updateNavButtonState()
    }
  }, [size])

  const { run: updateNavButtonState } = useDebounceFn(
    () => {
      const target = listRef.current!
      setLeftEnabled(target.scrollLeft > 0)
      setRightEnabled(target.scrollLeft < target.scrollWidth - target.clientWidth)
    },
    {
      wait: 100,
    }
  )

  const handleClickScrollButton = (dir: -1 | 1) => {
    const distance = (listRef.current!.clientWidth * 3) / 4
    listRef.current!.scrollBy({
      left: dir * distance,
      behavior: 'smooth',
    })
  }

  return (
    <div ref={rootRef} className={clsx([className, 'flex w-full items-center gap-2'])}>
      <div ref={listRef} className={clsx([listClassName, 'scrollbar-hide flex-1 overflow-x-auto'])} onScroll={updateNavButtonState}>
        {children}
      </div>
      {scrollable && (
        <div className={'flex gap-2 h-6'}>
          <iconpark-icon
            class={clsx(['icon-bg-btn', !leftEnabled && 'disabled'])}
            name={'Left'}
            size={16}
            onClick={() => handleClickScrollButton(-1)}
          />
          <iconpark-icon
            class={clsx(['icon-bg-btn', !rightEnabled && 'disabled'])}
            name={'Right'}
            size={16}
            onClick={() => handleClickScrollButton(1)}
          />
        </div>
      )}
    </div>
  )
}
