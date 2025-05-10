import { RenderPlaceholderProps } from 'slate-react'

function RichTextPlaceholderRenderer({ children, attributes }: RenderPlaceholderProps) {
  return (
    <span className="message-rich-text-placeholder" {...attributes}>
      {children}
    </span>
  )
}

export default RichTextPlaceholderRenderer
