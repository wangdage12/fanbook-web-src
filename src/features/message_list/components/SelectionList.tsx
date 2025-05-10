import clsx from 'clsx'
import React, { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'

interface SelectionListProps<T> extends Omit<HTMLAttributes<never>, 'onSelect'> {
  itemBuilder: (data: T) => ReactNode
  data: Array<{ header?: { child: ReactNode; keyPrefix?: string }; items: T[] }>
  keyGen: (data: T) => string
  onClose?: () => void
  onSelect: (data: T) => void
  onUpdateResultCount?: (count: number) => void
}

// noinspection com.haulmont.rcb.ArrayToJSXMapInspection
export function SelectionList<T>({ itemBuilder, data, keyGen, onClose, onUpdateResultCount, onSelect, className, ...props }: SelectionListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(0)
  const [mouseEnabled, setMouseEnabled] = useState(true)

  const children: ReactNode[] = []
  const itemCountRef = useRef(0)
  let itemCount = 0

  // 处理键盘上下键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == 'ArrowDown' || e.key === 'ArrowUp') {
        let newIndex = e.key === 'ArrowDown' ? selected + 1 : selected - 1
        if (newIndex < 0) {
          newIndex = itemCountRef.current - 1
        } else if (newIndex >= itemCountRef.current) {
          newIndex = 0
        }
        setMouseEnabled(false)
        setSelected(newIndex)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const item = containerRef.current?.querySelector(`[data-index="${selected}"]`)
        item?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      } else if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, itemCountRef.current])

  // 用键盘上下键切换后需要滚动到可视区域
  useEffect(() => {
    if (!mouseEnabled) {
      containerRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [selected])

  for (let i = 0; i < data.length; i++) {
    const { header, items } = data[i]
    if (header) {
      children.push(
        <div className={'flex flex-shrink-0 basis-9 items-center pl-2 text-xs text-[var(--fg-b60)]'} key={i}>
          {header.child}
        </div>
      )
    }
    for (let j = 0; j < items.length; j++) {
      children.push(
        <div
          key={`${header?.keyPrefix ?? ''}${keyGen(items[j])}`}
          className={clsx([mouseEnabled ? 'cursor-pointer' : 'cursor-none', 'rounded-lg px-2', itemCount == selected && 'bg-[var(--fg-b5)]'])}
          data-index={itemCount}
          onMouseOver={handleMouseOverItem}
          onClick={() => handleSelect(items[j])}
        >
          {itemBuilder(items[j])}
        </div>
      )
      itemCount++
    }
  }

  itemCountRef.current = itemCount
  // `onUpdateResultCount` 外部极可能用来 `setState`，所以不能同步
  setTimeout(() => onUpdateResultCount?.(itemCount))
  if (itemCount === 0) return null

  // noinspection com.haulmont.rcb.ArrayToJSXMapInspection
  return (
    <div ref={containerRef} onMouseMoveCapture={() => setMouseEnabled(true)} className={clsx([className, 'select-none'])} {...props}>
      {children}
    </div>
  )

  function handleMouseOverItem(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (mouseEnabled) setSelected(parseInt(e.currentTarget.dataset.index!))
  }

  function handleSelect(data: T) {
    onSelect(data)
  }
}
