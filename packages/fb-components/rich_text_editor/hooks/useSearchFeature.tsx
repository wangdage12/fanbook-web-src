/* eslint-disable react-compiler/react-compiler */
import { useClickAway ,useSize} from 'ahooks'
import clsx from 'clsx'
import { Portal } from 'fb-components/components/Portal.tsx'
import { isKeyHotkey } from 'is-hotkey'
import React, { useEffect, useRef } from 'react'
import { BasePoint, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { CustomElement, ParentBlock } from '../custom-editor'
import { SearchEditor } from '../plugins/withSearch.tsx'

type SearchValue = string | '' | undefined

export interface UseSearchFeatureResult {
  /**
   * Slate onKeyDown 事件处理函数，用于处理搜索结果的键盘导航
   * @example
   * function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
   *    if (mentionSearchKeyDownHandler(event)) return;
   *  }
   */

  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => boolean

  // 弹出的搜索列表 UI
  element: React.ReactNode
  // 在搜索内容改变时，需要调用此函数，以便更新搜索结果
  setSearch: (search: SearchValue) => void
}

export interface UseSearchFeatureOptions {
  // 是否使用弹出形态的搜索列表 UI，这会自动在顶层创建节点，所搜结果跟随输入光标，你只需要随便将 element 挂载到任意节点即可
  usePopup?: boolean
  elementWrapper?: React.ReactElement
  className?: string
  onClose?: () => void
}

const WIDTH = 480
const MAX_HEIGHT = 410

/**
 * 此 Hook 不直接使用，可以使用此 Hook 扩展出具体的搜索功能，例如 @ 和 # 搜索
 * @returns
 */
export function useSearchFeature(
  editor: SearchEditor,
  buildElement: (search: SearchValue, setSearch: (search: SearchValue) => void, updateResultCount: (count: number) => void) => React.ReactNode,
  options?: UseSearchFeatureOptions
): UseSearchFeatureResult {
  const ref = useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState<SearchValue>(undefined)
  const [resultCount, setResultCount] = React.useState(0)
  const size = useSize(document.body)

  useEffect(() => {
    if (search === undefined) options?.onClose?.()
  }, [search])

  useClickAway(e => {
    // data-search 用于阻止点击时关闭搜索框，用在输入框外的触发搜索按钮上
    if ('search' in (e.target as HTMLElement).dataset) return
    setSearch(undefined)
  }, ref)

  const keepInputFocus = () => {
    if (search !== undefined) {
      ReactEditor.focus(editor)
    }
  }

  // popup 模式下，如果没有搜索结果，需要把位置移动到屏幕外，否则下次显示时会出现闪烁
  useEffect(() => {
    if (options?.usePopup && (search === undefined || resultCount === 0)) {
      const el = ref.current
      if (!el) return
      el.style.left = '-9999px'
    }
  }, [search, resultCount, options?.usePopup])

  useEffect(() => {
    if (!options?.usePopup) return

    if (search !== undefined) {
      requestAnimationFrame(() => {
        const range = editor.searchStartPosition
        if (!range) return
        const el = ref.current
        if (!el) return
        const domRange = ReactEditor.toDOMRange(editor, range)
        const rect = domRange.getBoundingClientRect()
        // 如果超出屏幕下边界，那么放到上方
        if (rect.top + MAX_HEIGHT + 24 > window.innerHeight) {
          el.style.top = `${rect.top - 5 - ref.current.offsetHeight}px`
        } else {
          el.style.top = `${rect.top + 24}px`
        }
        // 如果超出屏幕右边界，那么放到左侧
        if (rect.left + WIDTH > window.innerWidth) {
          el.style.left = `${rect.left - WIDTH}px`
        } else {
          el.style.left = `${rect.left}px`
        }
      })
    }
  }, [resultCount, search, editor, size?.width, size?.height, options?.usePopup])

  const display = search === undefined || resultCount === 0 ? 'none' : 'block'
  let element = undefined

  if (search !== undefined) {
    element = buildElement(search, setSearch, setResultCount)
    if (options?.elementWrapper) {
      element = React.cloneElement(
        options.elementWrapper,
        {
          ref,
          style: {
            display,
          },
        },
        element
      )
    }

    if (options?.usePopup) {
      element = (
        <Portal>
          <div
            className={clsx(['fixed overflow-y-scroll rounded-lg', options?.className])}
            ref={ref}
            onClick={keepInputFocus}
            style={{
              top: '-9999px',
              left: '-9999px',
              width: WIDTH,
              maxHeight: MAX_HEIGHT,
              zIndex: 10000,
              boxShadow: '0px 8px 16px 0px rgba(0, 0, 0, 0.1)',
            }}
          >
            {element}
          </div>
        </Portal>
      )
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): boolean {
    const { selection } = editor

    /**
     * 用键盘左右键移动到 inline 元素后，需要跳过它，否则会出现光标在 inline 元素上的情况
     * 本来这应该通过 isSelectable 控制，但是一旦 isSelectable = false，会导致 insert 时
     * 光标未知错误问题，所以目前先通过键盘事件控制
     * @param next
     */
    function getDistance(next?: BasePoint): number {
      if (next) {
        const el = editor.fragment(next)[0]
        if (el) {
          for (const child of (el as ParentBlock).children) {
            if (editor.isInline(child as CustomElement)) {
              return 2
            }
          }
        }
      }
      return 1
    }

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    if (selection && Range.isCollapsed(selection)) {
      const { nativeEvent } = e
      if (isKeyHotkey('left', nativeEvent)) {
        e.preventDefault()
        Transforms.move(editor, { unit: 'offset', reverse: true, distance: getDistance(editor.before(selection)) })
        return true
      }
      if (isKeyHotkey('right', nativeEvent)) {
        e.preventDefault()
        Transforms.move(editor, { unit: 'offset', distance: getDistance(editor.after(selection)) })
        return true
      }
    }

    if (search === undefined || resultCount === 0) return false
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault()
      return true
    }
    return false
  }

  return {
    setSearch,
    onKeyDown,
    element,
  }
}
