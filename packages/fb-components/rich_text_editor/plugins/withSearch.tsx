import { Editor, Operation, Range } from 'slate'
import { ReactEditor } from 'slate-react'
import { CustomInline } from '../custom-editor'

export type SearchEditor = Editor & {
  search: RegExp
  searchStartPosition: Range | undefined
  // 通过选中 @字符到光标之间的内容，来自动替换掉搜索字符
  selectReplacement(): void
}

/**
 * 为编辑器添加搜索功能，例如 @ 触发用户搜索，# 触发频道搜索
 *
 * @param config                 key 为搜索触发字符，通常是单字符，例如 @ 或 #，理论上可以是任意字符串
 * @param config.elementType     此搜索结果如果被填充到富文本，应该使用的元素类型，你可以在编译器的类型提示中看到此类型的定义
 * @param config.onSearch        当满足搜索条件时，会调用此函数，参数是搜索的内容，`undefined` 表示关闭搜索，空字符串表示用户键入了搜索字符，但是未输入内容
 * @param editor                 Slate Editor
 * @param options                最大搜索字符数，默认 12
 */
export default function withSearch<T extends Editor>(
  config: Record<
    string,
    {
      elementType: CustomInline['type']
      onSearch: (search: undefined | '' | string) => void
    }
  >,
  editor: T,
  options?: {
    maxLength?: number
  }
) {
  const e = editor as never as SearchEditor
  const { isInline, isVoid, markableVoid, onChange } = editor

  editor.isInline = element => {
    return Object.values(config).some(e => e.elementType === element.type) ? true : isInline(element)
  }

  editor.isVoid = element => {
    return Object.values(config).some(e => e.elementType === element.type) ? true : isVoid(element)
  }

  editor.markableVoid = element => {
    return Object.values(config).some(e => e.elementType === element.type) || markableVoid(element)
  }

  editor.onChange = (options?: { operation?: Operation }) => {
    if (ReactEditor.isFocused(editor)) {
      handleChange()
    } else {
      // 点击工具栏插入会失焦, 20 ms 重新聚焦, 因需要延迟再触发
      setTimeout(handleChange, 20)
    }
    onChange(options)
  }

  const matchChars = Object.keys(config).join('')
  e.search = new RegExp(`^([${matchChars}])([^${matchChars}\x20]{1,${options?.maxLength ?? 12}})$`)
  e.selectReplacement = () => {
    if (e.searchStartPosition) {
      e.select(e.searchStartPosition)
      e.searchStartPosition = undefined
    }
  }

  function handleChange() {
    // 避免无焦点时显示搜索结果
    if (!ReactEditor.isFocused(editor)) return

    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection)

      const wordBefore = Editor.before(editor, start, { unit: 'word' })

      const before = wordBefore && Editor.before(editor, wordBefore)

      const beforeRange = before && Editor.range(editor, before, start)
      const beforeText = beforeRange && Editor.string(editor, beforeRange)

      const openOneAndCloseOthers = (open: string, value: string) => {
        for (const char in config) {
          if (char === open) {
            config[char].onSearch(value)
          } else {
            config[char].onSearch(undefined)
          }
        }
      }

      const beforeMatch = beforeText && beforeText.match(e.search)
      if (beforeMatch) {
        e.searchStartPosition = beforeRange
        openOneAndCloseOthers(beforeMatch[1], beforeMatch[2])
        // setSearch({ sign: beforeMatch[0][0], text: beforeMatch[1] })
      } else {
        const charBefore = Editor.before(editor, start, { unit: 'character' })
        if (charBefore) {
          const charBeforeRange = Editor.range(editor, charBefore, start)
          const charTyped = Editor.string(editor, charBeforeRange)

          // 如果用户输入的是空格，直接关闭搜索
          if (charTyped == ' ') {
            e.searchStartPosition = undefined
            Object.values(config).forEach(e => e.onSearch(undefined))
          } else if (charTyped in config) {
            openOneAndCloseOthers(charTyped, '')
            e.searchStartPosition = charBeforeRange
          } else {
            Object.values(config).forEach(e => e.onSearch(undefined))
            e.searchStartPosition = undefined
          }
        }
        // 进入这个分支说明光标位置在最前面
        else {
          Object.values(config).forEach(e => e.onSearch(undefined))
        }
      }
    }
  }

  return editor
}
