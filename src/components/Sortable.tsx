import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isNil, isObject } from 'lodash-es'
import { CSSProperties, useMemo, useState } from 'react'

// https://github.com/react-component/field-form/blob/f251058fbf3f3943469bff13bb9739795bfd4ebe/src/utils/valueUtil.ts#L114C1-L141C2
export function move<T>(array: T[], moveIndex: number, toIndex: number) {
  const { length } = array
  if (moveIndex < 0 || moveIndex >= length || toIndex < 0 || toIndex >= length) {
    return array
  }
  const item = array[moveIndex]
  const diff = moveIndex - toIndex

  if (diff > 0) {
    // move left
    return [...array.slice(0, toIndex), item, ...array.slice(toIndex, moveIndex), ...array.slice(moveIndex + 1, length)]
  }
  if (diff < 0) {
    // move right
    return [...array.slice(0, moveIndex), ...array.slice(moveIndex + 1, toIndex + 1), item, ...array.slice(toIndex + 1, length)]
  }
  return array
}

export type UniqueSortableItem<K extends string = 'id'> = {
  disabled?: boolean
} & { [key in K]: UniqueIdentifier }

export type SortableItemStrut<K extends string> = UniqueIdentifier | UniqueSortableItem<K>

export interface SortableProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onDragStart' | 'onDragEnd' | 'onDragMove' | 'onDragCancel' | 'onDragOver'> {
  uniqueKey?: Exclude<keyof T, 'disabled'>
  // item 列表，T 类型要是是唯一 id，或者是包含唯一 id 字段的对象
  items: T[]
  /**
   * item 渲染函数
   * @param args                  回调函数参数
   * @param args.item             当前 item
   * @param args.index            当前 item 的索引
   * @param args.dragHandlerProps 如果有自定义的拖拽手柄，需要把这个属性传递给 DOM
   */
  itemRenderer: (args: { item: T; index: number; dragHandlerProps: SyntheticListenerMap | undefined }) => React.ReactNode
  /**
   * 列表的顺序发生变化时触发
   * @param args              回调函数参数
   * @param args.from         从哪个位置开始拖拽
   * @param args.to           拖拽到哪个位置
   * @param args.sortedArray 重新排序后的新数组，通常你可以直接使用这个数据来 `setState` 或者触发 Redux action
   */
  onChange: (args: { from: number; to: number; sortedArray: T[] }) => void
  onDragStart?: (evt: DragStartEvent) => void
  onDragMove?: (evt: DragMoveEvent) => void
  onDragOver?: (evt: DragOverEvent) => void
  onDragEnd?: (evt: DragEndEvent) => void
  onDragCancel?: (evt: DragCancelEvent) => void
  /**
   *  如果有自定义的拖拽手柄，需要把这个属性设为 true，否则整个 item 都可以触发拖拽
   */
  customDragHandler?: boolean
}

/**
 * 可拖拽排序的列表，目前是仅开放了垂直方向的排序，拖动范围限制在容器内。
 *
 * @template T: `UniqueIdentifier | { id: UniqueIdentifier }`
 * @example
 * const itemRenderer: SortableProps<ChoiceQuestionOptionItem>['itemRenderer'] = () => {}
 * const handleSwapOption: SortableProps<ChoiceQuestionOptionItem>['onChange'] = ({ sortedArray }) => {
 *   setOptions(sortedArray)
 * }
 *
 * <Sortable<ChoiceQuestionOptionItem>
 *   customDragHandler={true}
 *   items={options}
 *   itemRenderer={itemRenderer}
 *   onChange={handleSwapOption}
 * />
 *
 * @see SortableProps
 */
export function Sortable<T extends SortableItemStrut<K>, K extends string = 'id'>({
  uniqueKey = 'id' as Exclude<keyof T, 'disabled'>,
  items,
  itemRenderer,
  onChange,
  customDragHandler,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragMove,
  onDragCancel,
  ...props
}: SortableProps<T>) {
  /*
   * https://github.com/clauderic/dnd-kit/issues/296#issuecomment-849841749
   * 解决拖拽时点击事件失效的问题
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const getIndex = (id: UniqueIdentifier) => items.findIndex(item => (isObject(item) ? item[uniqueKey] === id : item === id))

  const activeIndex = activeId ? getIndex(activeId) : -1

  const _items = useMemo(
    () => items.map(item => (isObject(item) ? { id: item[uniqueKey], ...item } : item) as UniqueIdentifier | { id: UniqueIdentifier }),
    [items]
  )

  return (
    // 这一层空的 div 主要是为了让 `restrictToParentElement` 更精确
    <div {...props}>
      <DndContext
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        sensors={sensors}
        onDragStart={({ active }) => {
          onDragStart?.({ active })
          if (!active) {
            return
          }
          setActiveId(active.id)
        }}
        onDragMove={onDragMove}
        onDragEnd={evt => {
          onDragEnd?.(evt)
          setActiveId(null)
          const { over } = evt
          if (over) {
            const overIndex = getIndex(over.id)
            if (activeIndex !== overIndex) {
              onChange({ from: activeIndex, to: overIndex, sortedArray: move([...items], activeIndex, overIndex) })
            }
          }
        }}
        onDragOver={onDragOver}
        onDragCancel={evt => {
          onDragCancel?.(evt)
          setActiveId(null)
        }}
      >
        <SortableContext items={_items} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => {
            const id = (isObject(item) ? item[uniqueKey] : item) as UniqueIdentifier
            return (
              <SortableItem<T, K>
                uniqueKey={uniqueKey}
                item={item}
                index={index}
                key={id ?? index}
                customDragHandler={customDragHandler}
                itemRenderer={itemRenderer}
              />
            )
          })}
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SortableItemProps<T> {
  itemRenderer: SortableProps<T>['itemRenderer']
  item: T
  uniqueKey: Exclude<keyof T, 'disabled'>
  index: number
  customDragHandler?: boolean
}

function SortableItem<T extends SortableItemStrut<K>, K extends string = 'id'>({
  item,
  uniqueKey = 'id' as Exclude<keyof T, 'disabled'>,
  index,
  customDragHandler,
  itemRenderer,
}: SortableItemProps<T>) {
  const _item = isObject(item) ? item : { [uniqueKey]: item as UniqueIdentifier, disabled: false }
  const { isDragging, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: _item[uniqueKey] as UniqueIdentifier,
    disabled: {
      draggable: _item.disabled,
      droppable: _item.disabled,
    },
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }
  // 如果有自定义的拖拽手柄，item 自身的光标样式就不要用 pointer 了
  attributes.role = customDragHandler ? '' : 'button'
  const itemContent = itemRenderer({
    item: item,
    index: index,
    dragHandlerProps: customDragHandler ? listeners : undefined,
  })

  return isNil(itemContent) ? itemContent : (
      <div ref={setNodeRef} style={style} {...attributes} {...(!customDragHandler && listeners)}>
        {itemContent}
      </div>
    )
}
