import { BaseEditor } from 'slate'

/**
 * 定义分割线
 */
export default function withDivider<T extends BaseEditor>(editor: T) {
  const { isVoid, markableVoid, isElementReadOnly } = editor

  const TYPE = 'divider'

  editor.isVoid = element => {
    return TYPE == element.type ? true : isVoid(element)
  }

  editor.isElementReadOnly = element => (TYPE == element.type ? true : isElementReadOnly(element))

  editor.markableVoid = element => {
    return TYPE == element.type ? true : markableVoid(element)
  }

  return editor
}
