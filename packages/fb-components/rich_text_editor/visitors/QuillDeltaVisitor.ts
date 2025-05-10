import { isEqual, isObject, isString } from 'lodash-es'
import Delta, { AttributeMap, Op } from 'quill-delta'
import { emojiConfig } from '../../emoji/emoji_config'
import { EmbeddedAssetType, EmbeddedResourceType, TextMentionSign } from '../../rich_text/types'

export default abstract class QuillDeltaVisitor<T, R> {
  protected constructor(
    private content: Op[],
    public result: T
  ) {
    this.walkThrough()
  }

  abstract visitText(text: Op): R

  abstract visitChannel(channel: Op): R

  abstract visitTopic(channel: Op): R

  abstract visitEmoji(emoji: Op): R

  abstract visitMention(mention: Op): R

  abstract visitLink(link: Op): R

  abstract visitQuestion(link: Op): void

  abstract visitImage(image: Op, inline: boolean): void | R

  abstract visitVideo(video: Op): void

  abstract visitHeader(header: Op[], attributes: AttributeMap): void

  abstract visitParagraph(paragraph: Op[], attributes: AttributeMap): void

  abstract visitBlockquote(blockquote: Op, children: R[]): void

  abstract visitQuoteLine(group: Op[][]): R[]

  abstract visitList(list: Op, children: R[]): void

  abstract visitListItem(group: Op[][]): R[]

  abstract visitCodeBlock(code: Op, children: R[]): void

  abstract visitCodeLine(group: Op[][]): R[]

  abstract visitDivider(divider: Op, inline: boolean): void | R

  /**
   * 每行预处理
   * @param line
   */
  // 默认实现
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preprocess(line: Op[], attributes: AttributeMap): Op[] {
    return line
  }

  parseInlines(insert: string | Record<string, unknown>, attributes: AttributeMap) {
    const content: Array<R> = []
    if (!isString(insert)) {
      // 没有 _type 但是有 source，这个奇怪的格式是来自自定义欢迎语的图片
      if (!insert['_type'] && insert['source']) {
        insert['_type'] = EmbeddedAssetType.Image
        content.push(this.visitImage({ insert }, true) as R)
        // 如果是 divider, 那就是分割线
      } else if ('divider' in insert) {
        content.push(this.visitDivider({ insert }, true) as R)
      } else {
        console.warn('[RichText] Parse inline failed,', JSON.stringify(insert), 'must be string')
      }
      return content
    }
    // 分离出 emoji [xxx][yyy]
    for (const part of insert.split(/(\[.*?])/g)) {
      if (!part) continue
      const name = part.slice(1, -1)
      if (part.startsWith('[') && part.endsWith(']') && emojiConfig[name]) {
        content.push(this.visitEmoji({ insert: name }))
      } else if (attributes.at) {
        // @ 类型节点
        const data = attributes['at'] as string
        // FIXME 欢迎消息里的富文本，@格式 attribute.at 的值是一串 id，不是 IM 那样的 ${@!id} 格式，未来需要统一所有富文本格式
        // 处理成一致 ${@!id} 的格式
        const at = data[0] === '$' ? data : `\${@${TextMentionSign.User}${data}}`
        content.push(this.visitMention({ insert: part, attributes: { at } }))
      }
      // @ts-expect-error 这个奇怪的格式是欢迎消息的 @加入人数
      else if (insert === 'user.count' && attributes.placeholder?.content === 'user.count') {
        const at = 'user.count'
        content.push(this.visitMention({ insert: part, attributes: { at } }))
      } else if (attributes.channel) {
        // # 类型节点
        const data = attributes['channel'] as string
        // FIXME 欢迎消息里的富文本，@格式 attribute.at 的值是一串 id，不是 IM 那样的 ${#id} 格式，未来需要统一所有富文本格式
        // 处理成一致 ${#!id} 的格式
        const channel = data[0] === '$' ? data : `\${#${data}}`
        content.push(this.visitChannel({ insert: part, attributes: { channel } }))
      } else if (attributes.tag) {
        content.push(this.visitTopic({ insert: part, attributes }))
      } else if (attributes.link) {
        content.push(this.visitLink({ insert: part, attributes }))
      } else {
        content.push(this.visitText({ insert: part, attributes }))
      }
    }
    return content
  }

  getLineContent(group: Op[]) {
    return group.map(op => (op.insert ? this.parseInlines(op.insert, op.attributes ?? {}) : [])).flat()
  }

  parseGroup(attributes: AttributeMap, group: Op[][]) {
    // 这个 if-else 分支最后的 else 分支里的外层有个对 group 的 for 循环，其他 if-else-if 分支的 for 循环不在外层
    // 要自己处理，也就是说，if-else-if 用来处理包含多行的一块区域，例如列表或者是代码块
    if (attributes.list) {
      const children = this.visitListItem(group)
      this.visitList({ attributes }, children)
    } else if (attributes.blockquote) {
      const children = this.visitQuoteLine(group)
      this.visitBlockquote({ attributes }, children)
    } else if (attributes['code-block']) {
      const children = this.visitCodeLine(group)
      this.visitCodeBlock({ attributes }, children)
    } else {
      for (const groupElement of group) {
        if (attributes['header']) {
          this.visitHeader(groupElement, attributes)
        } else {
          this.visitParagraph(groupElement, attributes)
        }
      }
    }
  }

  walkThrough() {
    let prevAttributes: AttributeMap = {}
    const group: Op[][] = []
    // 消费 group
    const consumeGroup = () => {
      if (group.length > 0) {
        this.parseGroup(prevAttributes, group)
        group.length = 0
      }
    }

    new Delta(this.content).eachLine(({ ops: originOps }, attributes, index) => {
      const ops = this.preprocess(originOps, attributes)

      // 单行块级元素直接解析，不需要走 group，所以进入下次循环前需要先消费掉 group
      const onlyBlockInsert = ops.length === 1 && isObject(ops[0].insert) ? ops[0].insert : null

      // 欢迎消息的富文本中的图片格式与富文本消息不一样，把它转成富文本消息的格式
      if (onlyBlockInsert && !('_type' in onlyBlockInsert) && 'source' in onlyBlockInsert) {
        onlyBlockInsert['_type'] = EmbeddedAssetType.Image
      }

      // Fanbook 的富文本图片格式没有遵守规范，需要特殊处理，只有 Top Level 的元素在这里处理，如果是 Inline 的元素到 parseGroup 里面
      if (onlyBlockInsert?.['_type'] == EmbeddedAssetType.Image) {
        consumeGroup()
        this.visitImage(ops[0], false)
      }
      // Fanbook 的富文本图片格式没有遵守规范，需要特殊处理，只有 Top Level 的元素在这里处理，如果是 Inline 的元素到 parseGroup 里面
      else if (onlyBlockInsert?.['_type'] == EmbeddedAssetType.Video) {
        consumeGroup()
        this.visitVideo(ops[0])
      } else if (onlyBlockInsert && 'divider' in onlyBlockInsert) {
        consumeGroup()
        this.visitDivider(ops[0], false)
      } else if (onlyBlockInsert?.['_type'] == EmbeddedResourceType.Question) {
        // FIXME 问答卡片 后续转成 link mode card 来处理
        consumeGroup()
        this.visitQuestion(ops[0])
      }
      // 对 insert 的 isString 判断是针对 Fanbook 富文本的不标准格式
      else if ((isEqual(attributes, prevAttributes) && isString(ops?.[0]?.insert)) || index === 0) {
        group.push(ops)
      } else {
        consumeGroup()
        group.push(ops)
      }
      prevAttributes = attributes
    })
    consumeGroup()
  }
}
