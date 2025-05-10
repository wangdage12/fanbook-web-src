import { BaseEditor } from 'slate'

/**
 * 让 Editor 获得显示 emoji 的能力
 */
export default function withEmoji<T extends BaseEditor>(editor: T) {
  const { isInline, isVoid, markableVoid, isElementReadOnly } = editor

  const TYPE = 'emoji'

  editor.isInline = element => (TYPE == element.type ? true : isInline(element))

  editor.isVoid = element => (TYPE == element.type ? true : isVoid(element))

  editor.isElementReadOnly = element => (TYPE == element.type ? true : isElementReadOnly(element))

  editor.markableVoid = element => (TYPE == element.type ? true : markableVoid(element))

  return editor
}
