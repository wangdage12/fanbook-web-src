import { useKeyPress } from 'ahooks'
import { List, ListProps } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

interface KeyboardNavigationListProps<T> extends Omit<ListProps<T>, 'renderItem'> {
  onSelect?: (item: T) => void
  renderItem: (item: T, index: number, selected: boolean) => React.ReactElement
}

/**
 * 扩展 antd 的 List，提供键盘导航能力：
 * 1. 鼠标经过 | 上下键：切换选中项
 * 2. 鼠标点击 | Tab | Enter：选中当前选中项
 */
export default function KeyboardNavigationList<T>({ renderItem, ...props }: KeyboardNavigationListProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [enableMouseOver, setEnableMouseOver] = useState(true)
  const listRef = React.useRef<HTMLDivElement>(null)

  useKeyPress(
    e => ['Enter', 'Tab', 'ArrowDown', 'ArrowUp'].includes(e.key),
    e => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        props.onSelect?.(props.dataSource![selectedIndex])
        return
      }
      if (e.key === 'ArrowDown') {
        setEnableMouseOver(false)
        setSelectedIndex(i => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (i === props.dataSource!.length - 1) return i
          return i + 1
        })
        return
      }
      if (e.key === 'ArrowUp') {
        setEnableMouseOver(false)
        setSelectedIndex(i => {
          if (i === 0) return 0
          return i - 1
        })
      }
    },
    { target: window }
  )

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({
      inline: 'nearest',
      block: 'nearest',
    })
  }, [selectedIndex])

  const enableMouseMove = useCallback(() => {
    setEnableMouseOver(true)
  }, [])

  return (
    <div ref={listRef} onMouseMoveCapture={enableMouseMove}>
      <List
        {...props}
        renderItem={(item, index) =>
          React.cloneElement(renderItem(item, index, index === selectedIndex), {
            'data-index': index,
            onClick: () => props.onSelect?.(item),
            onMouseOver: () => {
              if (enableMouseOver) setSelectedIndex(index)
            },
          })
        }
      />
    </div>
  )
}
