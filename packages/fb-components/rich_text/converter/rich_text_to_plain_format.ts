import { Block, BLOCKS, Inline, INLINES } from '@contentful/rich-text-types'
import { Text, TopLevelBlock } from '@contentful/rich-text-types/dist/types/types'
import { EmbeddedAssetType, EmbeddedResourceType, InlineEntryHyperlinkType, TextMentionSign } from '../types'

export function richText2PlainText(data: TopLevelBlock[]): string {
  const walkthrough = (node: Block | Inline | Text): string => {
    switch (node.nodeType as BLOCKS & INLINES & Text) {
      case BLOCKS.OL_LIST:
      case BLOCKS.UL_LIST:
      case BLOCKS.LIST_ITEM:
      case BLOCKS.PARAGRAPH:
      case BLOCKS.EMBEDDED_ENTRY:
      case BLOCKS.QUOTE:
      case BLOCKS.HEADING_1:
      case BLOCKS.HEADING_2:
      case BLOCKS.HEADING_3:
      case BLOCKS.HEADING_4:
      case BLOCKS.HEADING_5:
      case BLOCKS.HEADING_6:
        return (node as Block).content.map(walkthrough).join('')
      case BLOCKS.EMBEDDED_ASSET:
        switch (node.data.type as EmbeddedAssetType) {
          case EmbeddedAssetType.Image:
            return '[图片]'
          case EmbeddedAssetType.Video:
            return '[视频]'
          default:
            return '[未知文件]'
        }
      case BLOCKS.EMBEDDED_RESOURCE:
        switch (node.data.type as EmbeddedResourceType) {
          case EmbeddedResourceType.Question:
            return '[问答]'
          default:
            console.warn('[MessageUtils.toPlainText] Do not know how to handle embedded resource type', node.data.type)
            return ''
        }
      case BLOCKS.HR:
        return ''
      case 'text':
        return (node as Text).value
      case INLINES.HYPERLINK:
        return (node as unknown as Text).value
      case INLINES.ENTRY_HYPERLINK:
        switch (node.data.type as InlineEntryHyperlinkType) {
          case InlineEntryHyperlinkType.MentionUser:
            return `\${@${TextMentionSign.User}${node.data.id}}`
          case InlineEntryHyperlinkType.MentionRole:
            return `\${@${TextMentionSign.Role}${node.data.id}}`
          case InlineEntryHyperlinkType.Channel:
            return `\${#${node.data.id}}`
          default:
            return ''
        }
      case INLINES.EMBEDDED_ENTRY:
        return `[${(node as Inline).data.name}]`

      default:
        console.warn('[MessageUtils.toPlainText] Do not know how to handle node type', node.nodeType)
        return ''
    }
  }
  return data.map(walkthrough).join('')
}
