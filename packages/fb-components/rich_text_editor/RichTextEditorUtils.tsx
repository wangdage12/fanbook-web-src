import isHotkey from 'is-hotkey'
import { isString } from 'lodash-es'
import React from 'react'
import { Descendant, Editor, Range, Element as SlateElement, Node as SlateNode, Path as SlatePath, Range as SlateRange, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { NodeInsertNodesOptions } from 'slate/dist/interfaces/transforms/node'
import { TextMentionSign } from '../rich_text/types.ts'
import { ChannelStruct } from '../struct/ChannelStruct.ts'
import {
  BLOCKS,
  ChannelElement,
  CustomBlock,
  CustomElement,
  EmojiElement,
  LinkElement,
  LinkMode,
  MARKS,
  MentionElement,
  ParentBlock,
  TEXT_ALIGN_TYPE,
} from './custom-editor'

export interface MentionStruct {
  id: string
  name: string
  color?: number
  sign: TextMentionSign
}

export const EMPTY_SLATE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export const LIST_TYPES = ['numbered-list', 'bulleted-list']
export const CODE_BLOCK_TYPES = ['code-block']
export const BLOCK_QUOTE_TYPES = ['block-quote']
export const TEXT_ALIGN_TYPES: TEXT_ALIGN_TYPE[] = ['left', 'center', 'right', 'justify']

const SHORTCUT: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+s': 'strike',
  // 'mod+`': 'code', // 不支持 `code`
}

const HOTKEYS: Record<string, string> = {
  'tab': 'tab',
  // 'enter': 'enter',
}

export default class RichTextEditorUtils {
  static isMarkActive(editor: Editor, format: MARKS) {
    const marks = Editor.marks(editor) as never as Record<MARKS, boolean>
    return marks ? marks[format] : false
  }

  static toggleMark(editor: Editor, format: MARKS) {
    const isActive = RichTextEditorUtils.isMarkActive(editor, format)
    if (isActive) {
      editor.removeMark(format)
    } else {
      editor.addMark(format, true)
    }
  }

  static isBlockActive(editor: Editor, format: string, blockType: 'type' | 'align' = 'type') {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as ParentBlock)[blockType] === format,
      })
    )

    return !!match
  }

  static toggleBlock(editor: Editor, format: BLOCKS | TEXT_ALIGN_TYPE) {
    const isActive = RichTextEditorUtils.isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format as TEXT_ALIGN_TYPE) ? 'align' : 'type')
    const isList = LIST_TYPES.includes(format)
    const isCodeBlock = CODE_BLOCK_TYPES.includes(format)
    const isBlockQuote = BLOCK_QUOTE_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (LIST_TYPES.includes(n.type) || CODE_BLOCK_TYPES.includes(n.type) || BLOCK_QUOTE_TYPES.includes(n.type)) &&
        !TEXT_ALIGN_TYPES.includes(format as TEXT_ALIGN_TYPE),
      split: true,
    })

    let newProperties: Partial<CustomBlock>
    if (TEXT_ALIGN_TYPES.includes(format as TEXT_ALIGN_TYPE)) {
      newProperties = {
        align: isActive ? undefined : (format as TEXT_ALIGN_TYPE),
      }
    } else {
      newProperties = {
        type:
          isActive ? 'paragraph'
          : isList ? 'list-item'
          : isCodeBlock ? 'code-line'
          : isBlockQuote ? 'quote-line'
          : (format as BLOCKS),
      }
    }
    // 块状元素不可嵌套
    Transforms.setNodes<SlateElement>(editor, newProperties, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && !Editor.isVoid(editor, n),
      mode: 'highest',
    })

    if (!isActive && (isList || isCodeBlock || isBlockQuote)) {
      const block: SlateElement = { type: format as BLOCKS, children: [] }
      Transforms.wrapNodes(editor, block, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && !Editor.isVoid(editor, n),
        mode: 'highest',
      })
    }
  }

  static getCurrentNode<T extends CustomElement['type']>(editor: Editor, type: T) {
    const [match] = Editor.nodes<Extract<CustomElement, { type: T }>>(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
    })
    return match
  }

  /**
   * 判断是否未框选
   */
  static isCollapsed(editor: Editor) {
    const { selection } = editor
    const isCollapsed = selection ? SlateRange.isCollapsed(selection) : true
    return !!isCollapsed
  }

  static isLinkActive(editor: Editor) {
    const [link] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
    return !!link
  }

  static unwrapLink(editor: Editor) {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
  }

  static wrapLink(editor: Editor, { url, name, mode }: { url: string; name?: string; mode?: LinkMode }) {
    // if (RichTextEditorUtils.isLinkActive(editor)) {
    //   RichTextEditorUtils.unwrapLink(editor)
    // }
    const isLinkActive = RichTextEditorUtils.isLinkActive(editor)
    const isCollapsed = RichTextEditorUtils.isCollapsed(editor)
    // 选中的是 link 且没有框选 替换内容 仅此处可以变化为 card
    if (isLinkActive && isCollapsed) {
      const [node, path] = RichTextEditorUtils.getCurrentNode(editor, 'link') ?? []
      const link: LinkElement = {
        type: 'link',
        url,
        mode: mode ?? node?.mode ?? 'text',
        children: [{ text: name ?? node?.children[0]?.text ?? url }],
      }
      Transforms.removeNodes(editor, { at: path })
      Transforms.insertNodes(editor, link),
        {
          at: SlatePath.next(path),
          select: true,
        }
      setTimeout(() => {
        ReactEditor.focus(editor)
      }, 20)
      // 选中的不是 link 且没有框选 插入 link
    } else if (!isLinkActive && isCollapsed) {
      const link: LinkElement = {
        type: 'link',
        url,
        mode: mode ?? 'text',
        children: [{ text: name ?? url }],
      }
      Transforms.insertNodes(editor, link, {
        select: true,
      })
      setTimeout(() => {
        ReactEditor.focus(editor)
      }, 20)
      // 框选 若选中包含 link 则取消 link 再包裹
    } else {
      isLinkActive && RichTextEditorUtils.unwrapLink(editor)
      const link: LinkElement = {
        type: 'link',
        url,
        mode: mode ?? 'text',
        children: [],
      }
      Transforms.wrapNodes(editor, { ...link, mode: 'text', children: [] } as LinkElement, { split: true })
      Transforms.collapse(editor, { edge: 'end' })
    }
  }

  static handleEditorShortcut(editor: Editor, event: React.KeyboardEvent<HTMLDivElement>) {
    for (const hotkey in SHORTCUT) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault()
        const mark = SHORTCUT[hotkey]
        RichTextEditorUtils.toggleMark(editor, mark as MARKS)
        return true
      }
    }
    return false
  }

  static handleEditorHotKey(editor: Editor, event: React.KeyboardEvent<HTMLDivElement>) {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault()
        switch (HOTKEYS[hotkey]) {
          case 'tab':
            RichTextEditorUtils.insertArbitrary(editor, '  ')
            return true
        }
      }
    }
    return false
  }

  static insertArbitrary(editor: Editor, el: CustomElement | CustomElement[] | string, options?: NodeInsertNodesOptions<SlateNode>) {
    // if (position) {
    //   // Transforms.select(editor, position)
    //   if (isString(el)) {
    //     editor.insertText(el)
    //   } else {
    //     Transforms.insertNodes(editor, el)
    //   }
    //   Transforms.move(editor)
    //   // setPosition(undefined)
    // } else {
    if (isString(el)) {
      editor.insertText(el, { voids: false })
    } else {
      Transforms.insertNodes(editor, el, { voids: false, ...options })
      Transforms.move(editor)
    }
    // }
    // 不加延迟 slate 会报错
    setTimeout(() => {
      ReactEditor.focus(editor)
    }, 20)
  }

  static insertDivider(editor: Editor) {
    const el: CustomBlock = {
      type: 'divider',
      children: [{ text: '' }],
    }
    RichTextEditorUtils.insertVoidBlock(editor, el)
    RichTextEditorUtils.scrollToInsert(editor, 60)
  }

  static insertChannel(editor: Editor, channel: ChannelStruct) {
    const el: ChannelElement = {
      type: 'channel',
      name: channel.name,
      id: channel.channel_id,
      children: [{ text: '' }],
    }
    // mode: 'highest' 在 link 插入会在其上级插入 避免 link 内部插入
    RichTextEditorUtils.insertArbitrary(editor, el, { mode: 'highest' })
  }

  static insertMention(editor: Editor, data: MentionStruct) {
    const { id, sign, name, color } = data

    if (sign === TextMentionSign.User) {
      RichTextEditorUtils.insertArbitrary(
        editor,
        {
          type: 'mention',
          id,
          name,
          sign: TextMentionSign.User,
          children: [{ text: '' }],
        },
        // mode: 'highest' 在 link 插入会在其上级插入 避免 link 内部插入
        { mode: 'highest' }
      )
    } else {
      const mention: MentionElement = {
        type: 'mention',
        id,
        name: `@${name}`,
        sign: TextMentionSign.Role,
        roleColor: color ? color : undefined,
        children: [{ text: '' }],
      }
      // mode: 'highest' 在 link 插入会在其上级插入 避免 link 内部插入
      RichTextEditorUtils.insertArbitrary(editor, mention, { mode: 'highest' })
    }
  }

  static insertEmoji(editor: Editor, name: string) {
    const emoji: EmojiElement = {
      type: 'emoji',
      name,
      children: [{ text: '' }],
    }
    // mode: 'highest' 在 link 插入会在其上级插入 避免 link 内部插入
    RichTextEditorUtils.insertArbitrary(editor, emoji, { mode: 'highest' })
  }

  static insertEmptyLine(editor: Editor, options?: NodeInsertNodesOptions<SlateNode>) {
    RichTextEditorUtils.insertArbitrary(
      editor,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      options
    )
  }

  // 插入无行内元素的 block 判断是否在最后一行 如果是则插入一个空行
  static insertVoidBlock(editor: Editor, nodes: CustomElement | CustomElement[]) {
    const { selection } = editor
    const atEnd = selection ? !editor.after(selection) : true
    const _nodes = Array.isArray(nodes) ? nodes : [nodes]
    if (atEnd) {
      _nodes.push({
        type: 'paragraph',
        children: [{ text: '' }],
      })
    }
    RichTextEditorUtils.insertArbitrary(editor, _nodes)
  }

  static scrollToInsert(editor: Editor, height: number) {
    setTimeout(() => {
      ReactEditor.focus(editor as never)
      const dom = ReactEditor.toDOMNode(editor, editor)
      dom.scrollBy({ top: height, behavior: 'smooth' })
    }, 100)
  }

  /**
   * 在超链接末尾按下空格要退出超链接编辑
   */
  static listenToBreakLinkBySpace(editor: Editor, event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === ' ' && !event.nativeEvent.isComposing) {
      const linkNode = RichTextEditorUtils.getCurrentNode(editor, 'link')
      if (linkNode) {
        const path = linkNode[1]
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const selection = editor.selection!
        if (!Range.isCollapsed(selection)) return
        const cursorAtEnd = editor.isEnd(Range.end(selection), path)
        if (cursorAtEnd) {
          Transforms.move(editor, { unit: 'offset', distance: 1 })
        }
      }
    }
  }
}
