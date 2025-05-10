import clsx from 'clsx'
import React from 'react'

interface SelectionListProps<T> {
  data: T[]
  className?: string
  itemRenderer: (item: T, index: number) => React.ReactNode
  keyGenerator?: (item: T, index: number) => string
  itemClassName?: string
  selected?: string
  onChange?: (key: string, data: T) => void | Promise<void>
}

/**
 * 维护了选中状态的列表
 *
 * @param data          数据列表
 * @param className     列表容器的类名
 * @param itemClassName 列表项的类名
 * @param itemRenderer  列表项的渲染器
 * @param keyGenerator  列表项的 key 生成器
 * @param onChange
 * @param selected      选中的列表项的 key
 */
export default function SelectionList<T>({
  data,
  className,
  itemClassName = 'h-10 !justify-start px-2 text-[var(--fg-b100)]',
  itemRenderer,
  keyGenerator = (_, i) => i.toString(),
  onChange,
  selected,
}: SelectionListProps<T>) {
  const [selection, setSelection] = React.useState<string | undefined>(selected)

  const handleSelect = (key: string, data: T) => {
    const result = onChange?.(key, data)
    if (result instanceof Promise) {
      result.then(() => setSelection(key)).catch(() => {})
    } else {
      setSelection(key)
    }
  }

  return (
    <div className={className}>
      {data.map((item, index) => {
        const key = keyGenerator(item, index)

        return (
          <div
            key={key}
            className={clsx([itemClassName, key === selection && 'bg-fgB10', 'icon-bg-btn !px-2 flex items-center !rounded-[10px]'])}
            onClick={() => handleSelect(key, item)}
          >
            {itemRenderer(item, index)}
          </div>
        )
      })}
    </div>
  )
}
