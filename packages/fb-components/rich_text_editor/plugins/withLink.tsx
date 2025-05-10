import { ReactEditor } from 'slate-react'

/**
 * 定义分割线
 */
export default function withLink<T extends ReactEditor>(editor: T) {
  const { isInline, markableVoid, isVoid } = editor

  const TYPE = 'link'

  editor.isInline = element => (TYPE == element.type ? element.mode === 'text' : isInline(element))

  editor.isVoid = element => (TYPE == element.type ? element.mode === 'card' : isVoid(element))

  editor.markableVoid = element => (TYPE == element.type ? element.mode === 'card' : markableVoid(element))

  // editor.insertText = text => {
  //   if (text && isUrl(text)) {
  //     wrapLink(editor, text)
  //   } else {
  //     insertText(text)
  //   }
  // }

  // editor.insertData = data => {
  //   const text = data.getData('text/plain')

  //   if (text && isUrl(text)) {
  //     wrapLink(editor, text)
  //   } else {
  //     insertData(data)
  //   }
  // }

  return editor
}
