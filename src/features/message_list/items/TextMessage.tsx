import clsx from 'clsx'
import EmojiIcon from 'fb-components/components/EmojiIcon.tsx'
import { MessageContentStruct, MessageStruct } from 'fb-components/components/messages/types.ts'
import { emojiConfig } from 'fb-components/emoji/emoji_config'
import { MALL_LINK_PATTERN } from 'fb-components/link_cards/MallCard.tsx'
import { HTTP_URL_PATTERN, TEXT_MENTION_PATTERN } from 'fb-components/rich_text/FbPlainText.tsx'
import { isString } from 'lodash-es'
import { Fragment, HTMLAttributes, ReactNode, useMemo } from 'react'
import reactStringReplace from 'react-string-replace'
import RoleName from '../../../components/realtime_components/RoleName'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../../components/user_card'
import LinkHandlerPresets from '../../../services/link_handler/LinkHandlerPresets.ts'
import MessageUtils from '../MessageUtils'
import ImChannelLink from '../components/ImChannelLink.tsx'
import LinkParser from '../components/LinkParser.tsx'

export const COMMAND_PATTERN = /\$\{\/(.+?)}/g

export enum TextContentMask {
  Mention = 1,
  Command = 2,
  // PureEmoji = 4,
  ChannelLink = 8,
  UrlLink = 16,
  Emoji = 32,

  /// 隐身消息，只对发送者和被@的用户可见
  // Hide = 64,

  /// 是否命令可点击
  // Clickable = 128,
}

export interface TextMessageContentStruct extends MessageContentStruct {
  text: string
  contentType: number
}

export interface TextMessageProps {
  message: MessageStruct<TextMessageContentStruct>
  guildId?: string
}

export default function TextMessage({ message, guildId }: TextMessageProps) {
  return <PlainTextMessage message={message} guildId={guildId} className={'item-max-width break-words message-text'} />
}

export interface PlainTextMessageProps {
  colorful?: boolean
  plainColor?: boolean
  message: MessageStruct | string
  guildId?: string
}

export function PlainTextMessage({ colorful = true, message, guildId, ...htmlAttributes }: PlainTextMessageProps & HTMLAttributes<never>) {
  const { replacedText, links } = useMemo(() => {
    const links: string[] = []
    let key = 0
    let replacedText = reactStringReplace(isString(message) ? message : MessageUtils.toText(message), /(\n)/g, () => <br key={key++} />)

    replacedText = reactStringReplace(replacedText, HTTP_URL_PATTERN, match => {
      links.push(match)
      let displayContent: ReactNode = match

      if (MALL_LINK_PATTERN.test(match)) {
        displayContent = 'Fanbook 商城'
      }

      if (colorful) {
        return (
          <a key={key++} onClick={() => LinkHandlerPresets.instance.common.handleUrl(match, { guildId })}>
            {displayContent}
          </a>
        )
      } else {
        return <span key={key++}>{displayContent}</span>
      }
    })

    replacedText = reactStringReplace(replacedText, COMMAND_PATTERN, match => (
      <span key={key++} className={'text-[var(--fg-blue-1)]'}>
        {match}
      </span>
    ))

    replacedText = reactStringReplace(replacedText, TEXT_MENTION_PATTERN, match => (
      <Fragment key={key++}>
        {(() => {
          const mentionRole = match[3] === '&'
          const id = match.slice(4, -1)
          if (mentionRole) {
            return <RoleName colorful={colorful} className={'message-inline-embed'} prefix={'@'} roleId={id} />
          } else {
            return (
              <UserCard userId={id} guildId={guildId} placement={'rightBottom'}>
                <RealtimeNickname
                  prefix={'@'}
                  className={clsx('cursor-default', ['message-inline-embed', colorful && 'text-[var(--fg-blue-1)]'])}
                  userId={id}
                />
              </UserCard>
            )
          }
        })()}
      </Fragment>
    ))

    replacedText = reactStringReplace(replacedText, /(\$\{#\d+})/g, match => (
      <Fragment key={key++}>
        {(() => {
          const id = match.slice(3, -1)
          return <ImChannelLink id={id} colorful={colorful} />
        })()}
      </Fragment>
    ))

    replacedText = reactStringReplace(replacedText, /\[(.*?)]/g, match =>
      emojiConfig[match] ?
        <EmojiIcon key={key++} size={16} className={'message-inline-embed align-text-bottom'} name={match} />
      : <Fragment key={key++}>[{match}]</Fragment>
    )

    return { replacedText, links }
  }, [message, colorful])

  return (
    <span {...htmlAttributes}>
      <span>{replacedText}</span>
      {links.length == 1 && colorful && <LinkParser links={links} />}
    </span>
  )
}
