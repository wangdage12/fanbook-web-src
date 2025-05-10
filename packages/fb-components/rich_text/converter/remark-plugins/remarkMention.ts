import { Inline, INLINES } from '@contentful/rich-text-types'
import { findAndReplace, Replace } from 'mdast-util-find-and-replace'
import { TEXT_MENTION_PATTERN } from '../../FbPlainText'
import { InlineEntryHyperlinkType, TextMentionSign } from '../../types'

type Root = import('mdast').Root
export const CHANNEL_MENTION_PATTERN = /(\$\{#\d+})/g

export default function remarkMention() {
  const replaceMention: Replace = (value: string) => {
    let type: InlineEntryHyperlinkType | undefined
    switch (value[3]) {
      case TextMentionSign.Role:
        type = InlineEntryHyperlinkType.MentionRole
        break
      case TextMentionSign.User:
        type = InlineEntryHyperlinkType.MentionUser
        break
      case '#':
        type = InlineEntryHyperlinkType.Channel
        break
    }
    if (!type) return false

    const id = value.slice(4, -1)

    return {
      nodeType: INLINES.ENTRY_HYPERLINK,
      value: '',
      marks: [],
      content: [],
      data: {
        id,
        type,
        text: '@',
      },
    } as Inline as never
  }

  const replaceChannel: Replace = (value: string) => {
    const id = value.slice(3, -1)
    return {
      nodeType: INLINES.ENTRY_HYPERLINK as never,
      data: {
        id,
        type: InlineEntryHyperlinkType.Channel,
        text: '#',
      },
      value: '',
      children: [],
      content: [],
    } as Inline as never
  }

  function transformer(tree: Root) {
    findAndReplace(tree, [
      [TEXT_MENTION_PATTERN, replaceMention],
      [CHANNEL_MENTION_PATTERN, replaceChannel],
    ])
  }

  return transformer
}
