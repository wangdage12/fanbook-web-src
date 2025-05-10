import { Descendant, Editor } from 'slate'
import {
  ChannelElement,
  CustomBlock,
  CustomText,
  EmojiElement,
  LinkElement,
  MediaBlock,
  MentionElement,
  ParentBlock,
  TopicElement,
} from '../custom-editor'

export default abstract class SlateVisitor<T> {
  protected constructor(
    private content: Descendant[],
    private editor: Editor,
    public result: T
  ) {
    this.walkThrough()
  }

  isVoidBlock = (el: CustomBlock) => {
    return !Editor.isInline(this.editor, el) && Editor.isVoid(this.editor, el)
  }

  abstract visitText(text: CustomText): void

  abstract visitChannel(channel: ChannelElement): void

  abstract visitEmoji(emoji: EmojiElement): void

  abstract visitMention(mention: MentionElement): void

  visitTopic(topic: TopicElement): void {
    console.warn(`[SlateVisitor] Unknown element: ${JSON.stringify(topic)}`)
  }

  abstract visitLink(link: LinkElement): void

  abstract visitImage(image: MediaBlock): void

  abstract visitVideo(video: MediaBlock): void

  abstract visitHeader(header: ParentBlock): void

  abstract visitParagraph(paragraph: ParentBlock): void

  abstract visitBlockquote(blockquote: ParentBlock): void

  abstract visitQuoteLine(quote: ParentBlock, list: ParentBlock): void

  abstract visitList(list: ParentBlock): void

  abstract visitListItem(item: ParentBlock, list: ParentBlock): void

  abstract visitCodeBlock(code: ParentBlock): void

  abstract visitCodeLine(code: ParentBlock, list: ParentBlock): void

  abstract visitDivider(divider: ParentBlock): void

  inlineThrough(child: Descendant) {
    for (const el of (child as ParentBlock).children) {
      if (!('type' in el)) {
        this.visitText(el)
      } else {
        switch (el.type) {
          case 'channel':
            this.visitChannel(el)
            break
          case 'emoji':
            this.visitEmoji(el)
            break
          case 'mention':
            this.visitMention(el)
            break
          case 'topic':
            this.visitTopic(el)
            break
          case 'link':
            this.visitLink(el)
            break
          default:
            console.warn(`[SlateVisitor] Unknown element: ${JSON.stringify(el)}`)
            break
        }
      }
    }
  }

  blockThrough(children: Descendant[], parent?: Descendant) {
    for (const child of children) {
      // 存在子内容的块状元素, 先处理内联元素
      !this.isVoidBlock(child as CustomBlock) && this.inlineThrough(child)
      // 再处理块级元素
      switch ((child as CustomBlock | LinkElement).type) {
        case 'paragraph':
          this.visitParagraph(child as ParentBlock)
          break
        case 'h1':
        case 'h2':
        case 'h3':
          this.visitHeader(child as ParentBlock)
          break
        case 'block-quote':
          this.blockThrough((child as ParentBlock).children, child as ParentBlock)
          this.visitBlockquote(child as ParentBlock)
          break
        case 'quote-line':
          this.visitQuoteLine(child as ParentBlock, parent as ParentBlock)
          break
        case 'bulleted-list':
        case 'numbered-list':
          this.blockThrough((child as ParentBlock).children, child as ParentBlock)
          this.visitList(child as ParentBlock)
          break
        case 'list-item':
          this.visitListItem(child as ParentBlock, parent as ParentBlock)
          break
        case 'divider':
          this.visitDivider(child as ParentBlock)
          break
        case 'code-block':
          this.blockThrough((child as ParentBlock).children, child as ParentBlock)
          this.visitCodeBlock(child as ParentBlock)
          break
        case 'code-line':
          this.visitCodeLine(child as ParentBlock, parent as ParentBlock)
          break
        case 'image':
          this.visitImage(child as MediaBlock)
          break
        case 'video':
          this.visitVideo(child as MediaBlock)
          break
        // 当 link mode = 'card' 时, link 会被渲染成 block
        case 'link':
          this.visitLink(child as LinkElement)
          break
        default:
          console.warn(`[SlateVisitor] Unknown block: ${JSON.stringify(child)}`)
          break
      }
    }
  }

  walkThrough() {
    this.blockThrough(this.content)
  }
}
