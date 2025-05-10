import { useHover } from 'ahooks'
import { useContext, useEffect, useRef } from 'react'
import { useSelected, useSlate } from 'slate-react'
import { RenderElementProps } from 'slate-react/dist/components/editable'
import EmojiIcon from '../components/EmojiIcon.tsx'
import BaseLinkCard from '../components/LinkCard.tsx'
import { EmbeddedAssetType } from '../rich_text/types.ts'
import InlineWrapper from './InlineWrapper.tsx'
import RichTextEditorUtils from './RichTextEditorUtils.tsx'
import { RichTextContext } from './RichTextWrapper.tsx'
import VoidBlockWrapper from './VoidBlockWrapper.tsx'
import { ChannelElement, EmojiElement, LinkElement, MentionElement } from './custom-editor'
import { ImageBlockRenderer, VideoBlockRenderer } from './plugins/withMedia.tsx'

export interface RichTextRenderElementProps extends RenderElementProps {
  Channel?: (props: RenderElementProps) => JSX.Element
  Mention?: (props: RenderElementProps) => JSX.Element
  LinkCard?: (props: Omit<RenderElementProps, 'children'>) => JSX.Element
}

export default function RichTextElementRenderer(props: RichTextRenderElementProps) {
  const { attributes, children, element, Channel, Mention, LinkCard } = props
  const { type } = element
  switch (type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'h1':
      return <h1 {...attributes}>{children}</h1>
    case 'h2':
      return <h2 {...attributes}>{children}</h2>
    case 'h3':
      return <h3 {...attributes}>{children}</h3>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'list-item': {
      const { align: textAlign } = element as { align: 'center' | 'left' | 'right' | 'justify' }
      return (
        <li {...attributes} style={{ textAlign }}>
          {children}
        </li>
      )
    }
    case 'code-block':
      return <pre {...attributes}>{children}</pre>
    case 'code-line':
      return <code {...attributes}>{children}</code>
    case 'channel':
      return Channel ? <Channel {...props} /> : <UneditableTag {...props} context={`#${(element as ChannelElement).name}`} />
    case 'mention':
      return Mention ? <Mention {...props} /> : <UneditableTag {...props} context={`@${(element as MentionElement).name}`} />
    case 'emoji':
      return <Emoji {...props} />
    case EmbeddedAssetType.Image:
      return <ImageBlockRenderer {...props} />
    case EmbeddedAssetType.Video:
      return <VideoBlockRenderer {...props} />
    case 'divider': {
      return (
        <VoidBlockWrapper attributes={attributes} element={element} selectable={false} cardLayout={false}>
          <hr />
          {children}
        </VoidBlockWrapper>
      )
    }
    case 'link':
      return <Hyperlink {...props} LinkCard={LinkCard} />
    case 'quote-line':
    case 'paragraph':
    default: {
      const { align: textAlign } = element as { align: 'center' | 'left' | 'right' | 'justify' }
      return (
        <p {...attributes} style={{ textAlign }}>
          {children}
        </p>
      )
    }
  }
}

const UneditableTag = ({ element, attributes, children, context }: RenderElementProps & { context?: string }) => {
  return (
    <span className="mx-0.5" {...attributes}>
      {context ?? element.type}
      <InlineWrapper>{children}</InlineWrapper>
    </span>
  )
}

function Emoji({ element, attributes, children }: RenderElementProps) {
  const { name } = element as EmojiElement
  return (
    <span className="mx-0.5" {...attributes}>
      <EmojiIcon name={name} size={16} className="align-text-bottom" />
      <InlineWrapper>{children}</InlineWrapper>
    </span>
  )
}

function Hyperlink({
  LinkCard,
  ...props
}: RenderElementProps & {
  LinkCard?: (props: Omit<RenderElementProps, 'children'>) => JSX.Element
}) {
  const { attributes, children, element } = props
  const { url, mode = 'text' } = element as LinkElement
  const linkRef = useRef<HTMLElement | null>(null)
  const isSelected = useSelected()
  const isHover = useHover(linkRef)
  const editor = useSlate()
  const isCollapsed = RichTextEditorUtils.isCollapsed(editor)
  const richtextContext = useContext(RichTextContext)

  const isText = mode === 'text'

  useEffect(() => {
    // 鼠标悬浮时, 选择 及没有框选 显示 toolbar
    richtextContext?.toggleHoverToolbar('link', linkRef.current, isHover && isSelected && isCollapsed, element)
  }, [isHover, isSelected, isCollapsed])

  useEffect(() => {
    return () => richtextContext?.toggleHoverToolbar('link', null, false, element)
  }, [])
  const { ref, ..._attributes } = attributes
  return isText ?
      <a
        ref={_ref => {
          if (typeof ref === 'function') {
            ref(_ref)
          } else if ('current' in ref) {
            ref.current = _ref
          }
          linkRef.current = _ref
        }}
        {..._attributes}
        href={url}
        className={`${isSelected || isHover ? '!underline' : ''}`}
      >
        <InlineWrapper>{children}</InlineWrapper>
      </a>
    : <VoidBlockWrapper ref={linkRef as React.RefObject<HTMLDivElement>} attributes={attributes} element={element} className="w-fit">
        {LinkCard ?
          <LinkCard attributes={attributes} element={element} />
        : <BaseLinkCard url={url} />}
        {children}
      </VoidBlockWrapper>
}
