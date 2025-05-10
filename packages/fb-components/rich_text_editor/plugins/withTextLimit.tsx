import { Editor } from 'slate'

export default function withTextLimit<T extends Editor>(options: number, editor: T) {
  const { insertText } = editor
  editor.insertText = text => {
    if (Editor.string(editor, []).length < options) {
      insertText(text)
    } else {
      console.log('max limit reached!')
    }
  }
  return editor
}
