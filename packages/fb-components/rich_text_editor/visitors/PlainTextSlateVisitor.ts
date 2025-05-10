import { HTTP_URL_PATTERN } from 'fb-components/rich_text/FbPlainText.tsx'
import { TextMentionSign } from 'fb-components/rich_text/types.ts'
import { Descendant, Editor } from 'slate'
import { ChannelElement, CustomText, EmojiElement, LinkElement, MentionElement } from '../custom-editor'
import SlateVisitor from './SlateVisitor.ts'
import { TextContentMask } from './type.ts'

export interface PlainTextStruct {
  text: string
  contentType: number
  mentions: string[]
  mention_roles: string[]
}

export class PlainTextSlateVisitor extends SlateVisitor<PlainTextStruct> {
  constructor(content: Descendant[], editor: Editor) {
    super(content, editor, { text: '', contentType: 0, mentions: [], mention_roles: [] })
  }

  visitText(text: CustomText): void {
    if (HTTP_URL_PATTERN.test(text.text)) {
      this.result.contentType |= TextContentMask.UrlLink
    }
    // 如果用户是手动输入的 ID，也需要解析成频道链接
    if (/\$\{#\d+}/.test(text.text)) {
      this.result.contentType |= TextContentMask.ChannelLink
    }
    this.result.text += text.text
  }

  visitChannel(channel: ChannelElement): void {
    this.result.text += `\${#${channel.id}}`
    this.result.contentType |= TextContentMask.ChannelLink
  }

  visitEmoji(emoji: EmojiElement): void {
    this.result.text += `[${emoji.name}]`
    this.result.contentType |= TextContentMask.Emoji
  }

  visitMention(el: MentionElement): void {
    this.result.text += `\${@${el.sign}${el.id}}`
    this.result.contentType |= TextContentMask.Mention
    if (el.sign === TextMentionSign.Role) {
      this.result.mention_roles.push(el.id)
    } else {
      this.result.mentions.push(el.id)
    }
  }

  visitParagraph(): void {
    this.result.text += '\n'
  }

  visitImage() {
    this.result.text += '[图片]'
  }

  visitVideo() {
    this.result.text += '[视频]'
  }

  visitLink(link: LinkElement): void {
    if (HTTP_URL_PATTERN.test(link.url)) {
      this.result.contentType |= TextContentMask.UrlLink
    }
    this.result.text += link.url
  }

  visitHeader(): void {
    this.result.text += '\n'
  }

  visitBlockquote(): void {}

  visitQuoteLine(): void {
    this.result.text += '\n'
  }

  visitList(): void {}

  visitListItem(): void {
    this.result.text += '\n'
  }

  visitCodeBlock(): void {}

  visitCodeLine(): void {
    this.result.text += '\n'
  }

  visitDivider(): void {
    this.result.text += '\n'
  }
}
