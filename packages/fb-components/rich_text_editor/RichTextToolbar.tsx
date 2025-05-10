import { Dropdown, Tooltip } from 'antd'
import clsx from 'clsx'
import { CSSProperties, ReactNode, useContext } from 'react'
import { Editor, Element as SlateElement } from 'slate'
import { ReactEditor, useFocused, useSlate } from 'slate-react'
import { EmojiPopOver } from '../components/EmojiPanel.tsx'
import HoverBox, { HoverBoxProps } from '../components/HoverBox.tsx'
import RichTextEditorUtils, { TEXT_ALIGN_TYPES } from './RichTextEditorUtils.tsx'
import { RichTextContext, RichtextEditMode } from './RichTextWrapper.tsx'
import { BLOCKS, MARKS, ParentBlock, TEXT_ALIGN_TYPE } from './custom-editor'
import { UseMediaEditor } from './plugins/withMedia.tsx'

interface RichTextToolbarProps {
  inlines?: boolean
  blocks?: boolean
  mention?: boolean
  channel?: boolean
  image?: boolean
  video?: boolean
  link?: boolean
  align?: boolean
  disabledImage?: boolean
  disabledVideo?: boolean

  // 选取图片或视频后回调
  onPickImage?: () => void
  onPickVideo?: () => void
  moreButtons?: ReactNode
  className?: string
  buttonClassName?: string
  iconSize?: number | string
  // 编辑器失去焦点时，工具栏的样式变成禁用。目前只是文字变成灰色，并没有阻止交互。
  // 如果有必要阻止交互，需要进一步修改，但是这么做的意义并不大，反而减低用户体验，
  // 最多可能会变成，阻止具体按钮的交互作用，但是点击任意工具栏需要聚焦编辑器，为了
  // 不过渡设计，暂时不做这个功能。
  disableWhenNotFocused?: boolean
  style?: CSSProperties
}

export default function RichTextToolbar({
  mention,
  channel,
  image = true,
  video,
  link,
  inlines,
  blocks,
  // eslint-disable-next-line
  align,
  onPickImage,
  onPickVideo,
  disabledImage,
  disabledVideo,
  moreButtons,
  buttonClassName = '',
  iconSize = 20,
  disableWhenNotFocused = false,
  className,
  style = {},
}: RichTextToolbarProps) {
  const editor = useSlate()
  const focused = useFocused()
  const richtextContext = useContext(RichTextContext)

  const disabled = disableWhenNotFocused && !focused

  return (
    <>
      <div
        className={clsx(['flex flex-wrap gap-2 py-2 transition-colors', className, disabled && 'text-fgB40'])}
        style={{
          fontSize: iconSize,
          ...style,
        }}
      >
        {mention && (
          <IconButton
            className={buttonClassName}
            tooltip={'@成员'}
            icon="At"
            onClick={() => {
              RichTextEditorUtils.insertArbitrary(editor, '@')
            }}
          />
        )}
        {channel && (
          <IconButton
            className={buttonClassName}
            tooltip={'插入频道'}
            icon="Channel-Normal"
            onClick={() => {
              RichTextEditorUtils.insertArbitrary(editor, '#')
            }}
          />
        )}

        <EmojiPopOver
          placement="bottom"
          onClick={name => {
            RichTextEditorUtils.insertEmoji(editor, name)
          }}
        >
          <IconButton className={buttonClassName} tooltip={'添加表情'} icon="Emoji" />
        </EmojiPopOver>

        {image && (
          <IconButton
            className={buttonClassName}
            tooltip={'添加图片'}
            icon="Picture"
            disabled={disabledImage}
            onClick={onPickImage ?? (editor as never as UseMediaEditor).pickImage}
          />
        )}

        {video && (
          <IconButton
            className={buttonClassName}
            tooltip={'添加视频'}
            icon="Video-Normal"
            disabled={disabledVideo}
            onClick={onPickVideo ?? (editor as never as UseMediaEditor).pickVideo}
          />
        )}
        {link && (
          <IconButton
            className={buttonClassName}
            icon="Link-Normal"
            active={RichTextEditorUtils.isLinkActive(editor)}
            onClick={() => {
              richtextContext?.showEditModal('link', RichtextEditMode.Create)
            }}
          />
        )}
        {blocks && (
          <>
            {/* "divider" */}
            <IconButton
              className={buttonClassName}
              icon="Cut-offRule"
              onClick={() => {
                RichTextEditorUtils.insertDivider(editor)
              }}
            />
            <BlockButton format="h1" icon="H1" />
            <BlockButton format="h2" icon="H2" />
            <BlockButton format="h3" icon="H3" />
            <BlockButton format="bulleted-list" icon="UnderedList" />
            <BlockButton format="numbered-list" icon="OrderedList" />
            <BlockButton format="block-quote" icon="Cite" />
            {/* <BlockButton format="code-block" icon="CodeBox" /> */}
          </>
        )}

        {inlines && (
          <>
            <MarkButton format="bold" icon="Bold" />
            <MarkButton format="italic" icon="Italic" />
            <MarkButton format="underline" icon="UnderLine" />
            <MarkButton format="strike" icon="Strikethrough" />
            {/* <MarkButton format="code" icon="Code" /> */}
          </>
        )}

        {/*{align && <AlignDropdown />}*/}
        {moreButtons}
      </div>
    </>
  )
}
const MarkButton = ({ format, icon }: { format: MARKS; icon: string }) => {
  const editor = useSlate()
  return (
    <IconButton
      onMouseDown={event => {
        event.preventDefault()
        RichTextEditorUtils.toggleMark(editor, format)
      }}
      icon={icon}
      active={RichTextEditorUtils.isMarkActive(editor, format)}
    />
  )
}

// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AlignDropdown = () => {
  const editor = useSlate()
  const { selection } = editor
  let align = 'left'

  if (selection) {
    const node = Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && !!(n as ParentBlock).align,
    }).next()?.value
    if (node) {
      align = (node[0] as ParentBlock).align!
    }
  }
  const disabled = false

  return (
    <Dropdown
      overlayClassName={'w-[176px] [&_.ant-dropdown-menu-item]:!px-2 [&_.ant-dropdown-menu-item]:gap-2'}
      destroyPopupOnHide
      onOpenChange={() => {
        ReactEditor.focus(editor)
      }}
      trigger={['click']}
      menu={{
        selectable: true,
        onMouseDown: () => {
          requestAnimationFrame(() => {
            ReactEditor.focus(editor)
          })
        },
        items: [
          { key: 'left', icon: <iconpark-icon name={'AlignLeft'} size={16} />, label: '左对齐' },
          { key: 'center', icon: <iconpark-icon name={'AlignCenter'} size={16} />, label: '居中对齐' },
          { key: 'right', icon: <iconpark-icon name={'AlignRight'} size={16} />, label: '右对齐' },
        ],
        defaultSelectedKeys: [align],
        onClick({ key }) {
          RichTextEditorUtils.toggleBlock(editor, key as TEXT_ALIGN_TYPE)
          ReactEditor.focus(editor)
        },
      }}
      placement={'bottomRight'}
    >
      <HoverBox
        radius={8}
        className={clsx(['h-8 w-11 p-1.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer'])}
        onMouseDown={() => {
          requestAnimationFrame(() => {
            ReactEditor.focus(editor)
          })
        }}
      >
        <iconpark-icon
          size={'1em'}
          color={disabled ? 'var(--fg-b30)' : 'currentColor'}
          name={
            align === 'center' ? 'AlignCenter'
            : align === 'right' ?
              'AlignRight'
            : 'AlignLeft'
          }
        />
        <iconpark-icon name={'TriangleDown'} size={12} />
      </HoverBox>
    </Dropdown>
  )
}
const BlockButton = ({ format, icon }: { format: BLOCKS | TEXT_ALIGN_TYPE; icon: string }) => {
  const editor = useSlate()
  return (
    <IconButton
      icon={icon}
      onMouseDown={event => {
        event.preventDefault()
        RichTextEditorUtils.toggleBlock(editor, format)
      }}
      active={RichTextEditorUtils.isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format as TEXT_ALIGN_TYPE) ? 'align' : 'type')}
    />
  )
}

interface IconButtonProps extends HoverBoxProps {
  icon: string
  active?: boolean
  disabled?: boolean
  tooltip?: string
}

function IconButton({ icon, active, disabled = false, className, tooltip, ...props }: IconButtonProps) {
  return (
    <Tooltip title={tooltip}>
      <HoverBox radius={8} className={clsx(['h-8 w-8 p-1.5', className, disabled ? 'cursor-not-allowed' : 'cursor-pointer'])} {...props}>
        <iconpark-icon
          size={'1em'}
          color={
            disabled ? 'var(--fg-b30)'
            : active ?
              'var(--fg-blue-1)'
            : 'currentColor'
          }
          name={icon}
        />
      </HoverBox>
    </Tooltip>
  )
}

export { IconButton as RichTextToolBarIconButton }
