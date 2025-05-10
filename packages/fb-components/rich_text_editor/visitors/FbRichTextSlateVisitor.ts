import { Op } from 'quill-delta'
import { Descendant, Editor } from 'slate'
import { EmbeddedAssetType, TextMentionSign } from '../../rich_text/types.ts'
import {
  BLOCKS,
  ChannelElement,
  CustomText,
  EmojiElement,
  LinkElement,
  LinkMode,
  MediaBlock,
  MentionElement,
  ParentBlock,
  TopicElement,
} from '../custom-editor'
import SlateVisitor from './SlateVisitor.ts'

export interface RichTextStruct {
  ops: Op[]
  mentions: string[]
  mention_roles: string[]
}

const headerMap: Partial<Record<BLOCKS, number>> = {
  h1: 1,
  h2: 2,
  h3: 3,
}

const listMap: Partial<Record<BLOCKS, string>> = {
  'numbered-list': 'ordered',
  'bulleted-list': 'bullet',
}

const linkType: Partial<Record<LinkMode, string>> = {
  card: 'link_card',
}

/**
 * 将 Slate 格式转换成 Fb 的富文本格式
 */
export class FbRichTextSlateVisitor extends SlateVisitor<RichTextStruct> {
  constructor(content: Descendant[], editor: Editor) {
    super(content, editor, { ops: [], mentions: [], mention_roles: [] })
  }

  visitText(text: CustomText): void {
    this.result.ops.push({
      insert: text.text,
      attributes:
        text.bold || text.italic || text.underline || text.strike || text.code ?
          {
            bold: text.bold,
            italic: text.italic,
            underline: text.underline,
            strike: text.strike,
            code: text.code,
          }
        : undefined,
    })
  }

  visitChannel(channel: ChannelElement): void {
    this.result.ops.push({
      insert: `#${channel.name}`,
      attributes: {
        channel: `\${#${channel.id}}`,
      },
    })
  }

  visitEmoji(emoji: EmojiElement): void {
    this.result.ops.push({
      insert: `[${emoji.name}]`,
    })
  }

  visitMention(el: MentionElement): void {
    this.result.ops.push({
      insert: `@${el.name ?? ''}`,
      attributes: {
        at: `\${@${el.sign}${el.id}}`,
      },
    })
    if (el.sign === TextMentionSign.Role) {
      this.result.mention_roles.push(el.id)
    } else {
      this.result.mentions.push(el.id)
    }
  }

  visitTopic(topic: TopicElement) {
    this.result.ops.push({
      insert: `#${topic.name}#`,
      attributes: {
        tag: topic.id,
        _type: 'hashtag',
      },
    })
  }

  visitLink(link: LinkElement): void {
    for (const child of link.children) {
      this.visitText(child)
      const last = this.result.ops.at(-1)
      if (!last) continue
      last.attributes = { link: link.url, _type: linkType[link.mode], ...last.attributes }
      if (link.mode === 'card') {
        // 块状元素
        this.result.ops.push({ insert: '\n' })
      }
    }
  }

  visitParagraph(): void {
    this.result.ops.push({ insert: '\n' })
  }

  visitBlockquote(): void {
    // ignore
  }

  visitQuoteLine(): void {
    this.result.ops.push({ insert: '\n', attributes: { blockquote: true } })
  }

  visitList(): void {
    // ignore
  }

  visitListItem(item: ParentBlock, parent: ParentBlock): void {
    this.result.ops.push({ insert: '\n', attributes: { list: listMap[parent.type] } })
    return
  }

  visitCodeBlock(): void {
    // ignore
  }

  visitCodeLine(): void {
    this.result.ops.push({ insert: '\n', attributes: { 'code-block': true } })
  }

  visitHeader(header: ParentBlock): void {
    this.result.ops.push({ insert: '\n', attributes: { header: headerMap[header.type] } })
  }

  visitDivider(): void {
    this.result.ops.push({ insert: { divider: '' } }, { insert: '\n' })
  }

  visitImage(media: MediaBlock) {
    const { url, localUrl, ..._media } = media
    // 上传后数据存在更多字段, 需要覆盖回去
    this.result.ops.push(
      {
        insert: {
          ..._media,
          _type: EmbeddedAssetType.Image,
          // width: media.width,
          // height: media.height,
          source: url,
          localSource: localUrl,
        },
      },
      { insert: '\n' }
    )
  }

  visitVideo(media: MediaBlock) {
    const { url, localUrl, ..._media } = media
    // 上传后数据存在更多字段, 需要覆盖回去
    this.result.ops.push(
      {
        insert: {
          ..._media,
          _type: EmbeddedAssetType.Video,
          fileType: EmbeddedAssetType.Video,
          source: url,
          localSource: localUrl,
          // width: media.width,
          // height: media.height,
          // duration: media.duration,
          // thumbUrl: media.thumbUrl,
          // localThumbUrl: media.localThumbUrl,
        },
      },
      { insert: '\n' }
    )
  }
}
