import { BLOCKS, Block, EntryLinkBlock, Hyperlink, INLINES, Inline, Text, TopLevelBlock, TopLevelBlockEnum } from '@contentful/rich-text-types'
import { isEmpty, isEqual, isString, remove } from 'lodash-es'
import { AttributeMap, Op } from 'quill-delta'
import { HTTP_URL_PATTERN } from '../../rich_text/FbPlainText'
import { EmbeddedAssetType, EmbeddedResourceType, InlineEntryHyperlinkType, TextMentionSign } from '../../rich_text/types'
import QuillDeltaVisitor from './QuillDeltaVisitor'

function parseMarks(attributes: AttributeMap) {
  return attributes ?
      Object.entries(attributes)
        .filter(([, v]) => v)
        .map(([k]) => ({ type: k }))
    : []
}

export class ContentfulQuillDeltaVisitor extends QuillDeltaVisitor<TopLevelBlock[], Block | Inline | Text> {
  constructor(children: Op[]) {
    super(children, [])
  }

  getEmptyText() {
    return [
      {
        nodeType: 'text',
        data: {},
        value: '\n',
        marks: [],
      },
    ] as Text[]
  }

  visitText(text: Op) {
    const { insert, attributes } = text as {
      insert: string
      attributes?: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; code?: boolean }
    }
    return {
      nodeType: 'text',
      value: insert,
      marks: parseMarks(attributes ?? {}),
      data: {},
    } as Text
  }

  visitChannel(channel: Op) {
    const { insert, attributes } = channel as { insert: string; attributes: { channel: string } }
    const { channel: id } = attributes
    return {
      nodeType: INLINES.ENTRY_HYPERLINK,
      value: insert,
      marks: [],
      content: [],
      data: {
        type: InlineEntryHyperlinkType.Channel,
        id: id.slice(3, -1),
      },
    } as Inline
  }

  visitTopic(topic: Op) {
    const { insert, attributes } = topic as { insert: string; attributes: { tag: string } }
    const { tag: id } = attributes
    return {
      nodeType: INLINES.ENTRY_HYPERLINK,
      value: insert,
      marks: [],
      content: [],
      data: {
        type: InlineEntryHyperlinkType.Topic,
        id,
      },
    } as Inline
  }

  visitEmoji(emoji: Op) {
    const { insert } = emoji as { insert: string }
    return {
      nodeType: INLINES.EMBEDDED_ENTRY,
      content: [],
      data: { name: insert },
    } as Inline
  }

  visitMention(mention: Op) {
    const { insert, attributes } = mention as { insert: string; attributes: { at: string } }
    const { at: id } = attributes
    return {
      nodeType: INLINES.ENTRY_HYPERLINK,
      value: insert,
      marks: [],
      content: [],
      data: {
        type: id[3] === TextMentionSign.Role ? InlineEntryHyperlinkType.MentionRole : InlineEntryHyperlinkType.MentionUser,
        id: id.slice(4, -1),
        text: insert,
      },
    } as Inline
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
    const { link: uri, _type, ..._attributes } = attributes
    return _type === 'link_card' ?
        ({
          nodeType: BLOCKS.EMBEDDED_ENTRY,
          content: [
            {
              nodeType: 'text',
              value: insert,
              marks: parseMarks(_attributes),
              data: {},
            },
          ],
          data: { target: { sys: { type: 'Link', linkType: 'Entry', id: uri } }, uri, mode: _type, type: 'link' },
        } as EntryLinkBlock)
      : ({
          nodeType: INLINES.HYPERLINK,
          content: [
            {
              nodeType: 'text',
              value: insert,
              marks: parseMarks(_attributes),
              data: {},
            },
          ],
          data: { uri, mode: _type },
        } as Hyperlink)
  }

  visitQuestion(link: Op) {
    const { insert } = link as { insert: { link: string } }
    this.result.push({
      data: {
        type: EmbeddedResourceType.Question,
        link: insert.link,
      },
      nodeType: BLOCKS.EMBEDDED_RESOURCE,
      content: [],
    })
  }

  visitImage(image: Op, inline: boolean) {
    const { insert } = image as {
      insert: { _type: string; source: string; width: number; height: number; localSource?: string }
    }
    const _image = {
      nodeType: BLOCKS.EMBEDDED_ASSET,
      content: [],
      data: {
        type: EmbeddedAssetType.Image,
        src: insert.source,
        width: insert.width,
        height: insert.height,
        localSrc: insert.localSource,
      },
    } as TopLevelBlock

    if (inline) {
      // inline image 在 自定义欢迎语中使用
      return _image
    }

    this.result.push(_image)
  }

  visitVideo(video: Op) {
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
    this.result.push({
      nodeType: BLOCKS.EMBEDDED_ASSET,
      content: [],
      data: {
        type: EmbeddedAssetType.Video,
        src: insert.source,
        width: insert.width,
        height: insert.height,
        preview: insert.thumbUrl,
        duration: insert.duration,
        localSrc: insert.localSource,
        localPreview: insert.localThumbUrl,
      },
    })
  }

  visitHeader(header: Op[], attributes: AttributeMap) {
    this.result.push({
      nodeType: `heading-${attributes['header']}` as TopLevelBlockEnum,
      content: header.length > 0 ? this.getLineContent(header) : this.getEmptyText(),
      data: {},
    })
  }

  visitParagraph(paragraph: Op[]) {
    this.result.push({
      data: {},
      nodeType: BLOCKS.PARAGRAPH,
      content: paragraph.length > 0 ? this.getLineContent(paragraph) : this.getEmptyText(),
    })
  }

  visitBlockquote(blockquote: Op, children: Block[]) {
    this.result.push({
      nodeType: BLOCKS.QUOTE,
      content: children,
      data: {},
    } as TopLevelBlock)
  }

  visitQuoteLine(group: Op[][]) {
    return group.map(item => {
      return {
        nodeType: BLOCKS.PARAGRAPH,
        content: item.length > 0 ? this.getLineContent(item) : this.getEmptyText(),
        data: {},
      } as Block
    })
  }

  visitList(list: Op, children: Block[]) {
    const { attributes } = list as { attributes: { list: string } }
    const nodeType = attributes.list == 'bullet' ? BLOCKS.UL_LIST : BLOCKS.OL_LIST
    this.result.push({
      nodeType: nodeType,
      content: children,
      data: {},
    } as TopLevelBlock)
  }

  visitListItem(group: Op[][]) {
    return group.map(
      item =>
        ({
          nodeType: BLOCKS.LIST_ITEM,
          content: [
            {
              nodeType: BLOCKS.PARAGRAPH,
              content: item.length > 0 ? this.getLineContent(item) : this.getEmptyText(),
              data: {},
            },
          ],
          data: [],
        }) as Block
    )
  }

  visitCodeBlock(code: Op, children: Text[]) {
    this.result.push({
      nodeType: BLOCKS.EMBEDDED_ENTRY,
      content: children,
      data: { type: 'code' },
    })
  }

  visitCodeLine(group: Op[][]) {
    return group
      .map(groupItem =>
        groupItem.map(
          item =>
            ({
              nodeType: 'text',
              value: item.insert as string,
              marks: [{ type: 'code' }],
            }) as Text
        )
      )
      .flat()
  }

  visitDivider(divider: Op, inline: boolean) {
    const _divider = {
      data: {},
      nodeType: BLOCKS.HR,
      content: [],
    } as TopLevelBlock
    if (inline) {
      // inline divider 在 自定义欢迎语中使用
      return _divider
    }
    this.result.push(_divider)
  }

  preprocess(line: Op[], attributes: AttributeMap): Op[] {
    // 兼容删除空行的情况
    remove(line, op => isEqual(op, { insert: '' }) && isEmpty(attributes))
    // 把 URL 字符串解析成超链接
    for (let i = line.length - 1; i >= 0; i--) {
      const { insert } = line[i]
      if (isString(insert)) {
        const parts: Op[] = insert.split(HTTP_URL_PATTERN).map(part => {
          if (part.startsWith('http://') || part.startsWith('https://')) {
            return {
              insert: part,
              attributes: { link: part },
            }
          }
          return {
            ...line[i],
            insert: part,
          }
        })
        line.splice(i, 1, ...parts)
      }
    }
    return line
  }
}
