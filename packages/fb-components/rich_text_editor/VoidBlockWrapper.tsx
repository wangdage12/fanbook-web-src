import { useHover } from 'ahooks'
import { forwardRef, useRef } from 'react'
import { Node, Transforms } from 'slate'
import { ReactEditor, useFocused, useSelected, useSlateStatic } from 'slate-react'
import { RenderElementProps } from 'slate-react/dist/components/editable'
import RichTextEditorUtils from './RichTextEditorUtils'

interface VoidBlockWrapperProps extends RenderElementProps {
  className?: string
  deletable?: boolean
  cardLayout?: boolean
  bordered?: boolean
  selectable?: boolean
  onHover?: () => void
}

const VoidBlockWrapper = forwardRef<HTMLDivElement | null, VoidBlockWrapperProps>(
  ({ className = '', deletable = false, cardLayout = true, selectable = true, bordered = false, element, attributes, children }, ref) => {
    const editor = useSlateStatic()
    const focused = useFocused()
    const selected = useSelected()
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const isHover = useHover(wrapperRef)

    const handleClick = () => {
      setTimeout(() => {
        const { selection } = editor
        if (!focused) {
          return
        }
        if (!selection) return
        const node = editor.next({
          at: selection,
        })
        // 在最后一行插入空行
        if (!node) {
          const path = [editor.children.length]
          RichTextEditorUtils.insertEmptyLine(editor, { at: path, mode: 'highest' })
        } else {
          const [, path] = node
          const elements = Node.elements(editor, { from: path, to: path })
          const item = elements.next()
          if (item && !item.done) {
            const [elem] = item.value
            // 如果是 void 元素则插入空行
            if (editor.isVoid(elem)) {
              RichTextEditorUtils.insertEmptyLine(editor)
            }
          }
        }
        setTimeout(() => {
          // 移动光标到下一行
          Transforms.move(editor, { distance: 1, unit: 'line' })
        }, 20)
      }, 20)
    }

    const handleDelete = () => {
      const path = ReactEditor.findPath(editor, element)
      Transforms.removeNodes(editor, { at: path })
    }

    // const _children =
    //   deletable ?
    //     <Tooltip title="删除">
    //       <div>{children}</div>
    //     </Tooltip>
    //   : children

    return (
      <div
        {...attributes}
        ref={_ref => {
          if (typeof attributes.ref === 'function') attributes.ref(_ref)
          else if ('ref' in attributes) attributes.ref.current = _ref
          if (typeof ref === 'function') ref(_ref)
          else if (ref) ref.current = _ref

          wrapperRef.current = _ref
        }}
        className={`${className} cursor-pointer relative border-[3px] border-transparent ${bordered ? 'border-[var(--fg-b20)] ' : ''} ${
          (selectable && selected) || isHover ? '!border-[var(--fg-blue-1)] border-[3px]' : ''
        } ${cardLayout ? 'w-fit rounded-lg overflow-hidden' : ''}
        `}
        contentEditable={false}
      >
        {children}
        {deletable && (
          <div className="flex-center absolute z-0 right-[4px] top-[4px] h-[32px] w-[32px] cursor-pointer rounded-[8px] bg-[var(--fg-widget)] text-[20px] text-[var(--fg-white-1)]">
            <iconpark-icon name="Delete" onClick={handleDelete}></iconpark-icon>
          </div>
        )}
        <div className="absolute w-full h-[8px] bottom-0 cursor-text" onClick={handleClick}></div>
      </div>
    )
  }
)

VoidBlockWrapper.displayName = 'VoidBlockWrapper'

export default VoidBlockWrapper
