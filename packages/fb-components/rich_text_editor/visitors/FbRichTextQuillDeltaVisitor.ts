import { first, isEmpty, isEqual, last, remove } from 'lodash-es'
import { AttributeMap, Op } from 'quill-delta'
import { Descendant, Element } from 'slate'
import { EmbeddedAssetType, TextMentionSign } from '../../rich_text/types'
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
import QuillDeltaVisitor from './QuillDeltaVisitor'

const linkType: Record<string, LinkMode> = {
  link_card: 'card',
}

const headerMap: Record<string, BLOCKS> = {
  '1': 'h1',
  '2': 'h2',
  '3': 'h3',
}

const listMap: Record<string, BLOCKS> = {
  'ordered': 'numbered-list',
  'bullet': 'bulleted-list',
}

export class FbRichTextQuillDeltaVisitor extends QuillDeltaVisitor<Descendant[], Descendant> {
  getEmptyText(): CustomText[] {
    return [{ text: '' }]
  }

  constructor(children: Op[]) {
    super(children, [])
  }

  walkThrough() {
    super.walkThrough()
    // 为了避免 slate 报错，前后加一个空节点
    const firstNode = first(this.result)
    const lastNode = last(this.result)
    if (firstNode && (firstNode as Element).type === 'paragraph') {
      const el = firstNode as Element
      el.children.unshift({ text: '' })
    }
    if (lastNode && (lastNode as Element).type === 'paragraph') {
      const el = lastNode as Element
      el.children.push({ text: '' })
    }
    // last(this.result)?.push(this.getEmptyText());
  }

  visitText(text: Op) {
    const { insert, attributes } = text as {
      insert: string
      attributes?: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; code?: boolean }
    }
    const _text: CustomText = {
      text: insert,
      ...attributes,
    }
    return _text
  }

  visitChannel(channel: Op) {
    const { insert, attributes } = channel as { insert: string; attributes: { channel: string } }
    const _channel: ChannelElement = {
      type: 'channel',
      name: insert[0] === '#' ? insert.substring(1) : insert,
      id: attributes.channel.slice(3, -1),
      children: this.getEmptyText(),
    }
    return _channel
  }

  visitTopic(topic: Op) {
    const { insert, attributes } = topic as { insert: string; attributes: { tag: string } }
    const _topic: TopicElement = {
      type: 'topic',
      name: insert[0] === '#' ? insert.slice(1, -1) : insert,
      id: attributes.tag,
      children: this.getEmptyText(),
    }
    return _topic
  }

  visitEmoji(emoji: Op) {
    const { insert } = emoji as { insert: string }
    const _emoji: EmojiElement = {
      type: 'emoji',
      name: insert,
      children: this.getEmptyText(),
    }
    return _emoji
  }

  visitMention(mention: Op) {
    const { insert, attributes } = mention as { insert: string; attributes: { at: string } }
    const [_, sign, id] = /\${@([!&]+)(\d+)}/.exec(attributes.at) ?? [undefined, TextMentionSign.User, '0']
    const _mention: MentionElement = {
      type: 'mention',
      sign: sign as TextMentionSign,
      name: insert[0] === '@' ? insert.substring(1) : insert,
      id,
      children: [{ text: '' }],
    }
    return _mention
  }

  visitLink(link: Op) {
    const { insert, attributes } = link as {
      insert: string
      attributes: {
        link: string
        _type: string
        bold?: boolean
        italic?: boolean
        underline?: boolean
        strike?: boolean
        code?: boolean
      }
    }
    const { link: url, _type, ..._attributes } = attributes
    const _link: LinkElement = {
      type: 'link',
      url,
      mode: linkType[_type] ?? 'text',
      children: [{ text: insert, ..._attributes }],
    }
    return _link
  }

  visitImage(image: Op, inline: boolean) {
    const { insert } = image as {
      insert: { _type: string; source: string; width: number; height: number; localSource?: string }
    }
    // 上传后数据存在更多字段, 需要覆盖回去
    const { localSource, source, ..._insert } = insert
    const _image: MediaBlock = {
      ..._insert,
      type: EmbeddedAssetType.Image,
      url: insert.source,
      localUrl: insert.localSource,
      // width: insert.width,
      // height: insert.height,
      children: [{ text: '' }],
    }

    this.result.push(_image)

    if (inline) {
      // inline image 在 自定义欢迎语中使用
      return { text: '' }
    }
  }

  visitVideo(video: Op): void {
    const { insert } = video as {
      insert: {
        _type: string
        source: string
        width: number
        height: number
        localSource?: string
        thumbUrl?: string
        localThumbUrl?: string
        duration?: number
      }
    }
    // 上传后数据存在更多字段, 需要覆盖回去
    const { localSource, source, ..._insert } = insert
    const _video: MediaBlock = {
      ..._insert,
      type: EmbeddedAssetType.Video,
      url: source,
      localUrl: localSource,
      // thumbUrl: insert.thumbUrl,
      // localThumbUrl: insert.localThumbUrl,
      // width: insert.width,
      // height: insert.height,
      // duration: insert.duration,
      children: [{ text: '' }],
    }
    this.result.push(_video)
  }

  visitHeader(header: Op[], attributes: AttributeMap) {
    this.result.push({
      type: headerMap[`${attributes.header}`],
      children: header.length > 0 ? this.getLineContent(header) : this.getEmptyText(),
    })
  }

  visitParagraph(paragraph: Op[]): void {
    //, attributes: AttributeMap
    this.result.push({
      type: 'paragraph',
      children: paragraph.length > 0 ? this.getLineContent(paragraph) : this.getEmptyText(),
    })
  }

  visitBlockquote(blockquote: Op, children: ParentBlock[]) {
    this.result.push({
      type: 'block-quote',
      children,
    } as ParentBlock)
  }

  visitQuoteLine(group: Op[][]) {
    return group.map(item => {
      let children = this.getLineContent(item)
      if (!children.length) children = this.getEmptyText()
      return {
        type: 'quote-line',
        children,
      } as ParentBlock
    })
  }

  visitList(list: Op, children: ParentBlock[]) {
    const { attributes } = list as { attributes: { list: string } }
    this.result.push({
      type: listMap[attributes.list],
      children,
    } as ParentBlock)
  }

  visitListItem(group: Op[][]) {
    return group.map(item => {
      return {
        type: 'list-item',
        children: item.length > 0 ? this.getLineContent(item) : this.getEmptyText(),
      } as ParentBlock
    })
  }

  visitCodeBlock(code: Op, children: ParentBlock[]) {
    this.result.push({
      type: 'code-block',
      children,
    } as ParentBlock)
  }

  visitCodeLine(group: Op[][]) {
    return group.map(item => {
      return {
        type: 'code-line',
        children: item.length > 0 ? this.getLineContent(item) : this.getEmptyText(),
      } as ParentBlock
    })
  }

  visitDivider(divider: Op, inline: boolean) {
    const _divider = {
      type: 'divider',
      children: [{ text: '' }],
    } as ParentBlock

    this.result.push(_divider)

    if (inline) {
      // inline image 在 自定义欢迎语中使用
      return { text: '' }
    }
  }

  visitQuestion(link: Op) {
    const { insert } = link as { insert: { link: string } }
    const _link: LinkElement = {
      type: 'link',
      url: insert.link,
      mode: 'card',
      children: [{ text: insert.link }],
    }
    return _link
  }

  preprocess(line: Op[], attributes: AttributeMap): Op[] {
    // 兼容删除空行的情况
    remove(line, op => isEqual(op, { insert: '' }) && isEmpty(attributes))
    return line
  }
}
