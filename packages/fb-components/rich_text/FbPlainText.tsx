import { Fragment, useContext, useMemo } from 'react'
import reactStringReplace from 'react-string-replace'
import EmojiIcon from '../components/EmojiIcon'
import { emojiConfig } from '../emoji/emoji_config'
import RichTextContext from './RichTextContext'
import './style.css'

export const TEXT_MENTION_PATTERN = /(\$\{@[!&]\d+})/g
export const TEXT_CHANNEL_PATTERN = /(\$\{#\d+})/g

/**
 * from https://uibakery.io/regex-library/url
 */
export const HTTP_URL_PATTERN = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.?[a-zA-Z0-9()]{0,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*)/
/**
 * from https://uibakery.io/regex-library/url
 *
 * can without http(s)://
 *
 */
export const URL_PATTERN = /^(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

/**
 * 以纯文本形式显示 Fanbook 的文本数据，支持 @、#、链接、表情等
 *
 * @param data  例如：`你好，${@123456}，${#123456}， [微笑] 其他正文`
 * @constructor
 */
export default function FbPlainText({ data, className = '', colorful = true }: { colorful?: boolean; data: string; className?: string }) {
  const richTextContext = useContext(RichTextContext)
  return useMemo(() => {
    let key = 0

    let node = reactStringReplace(data, HTTP_URL_PATTERN, match => {
      if (colorful) {
        return (
          <a key={key++} onClick={() => richTextContext.handleUrl(match)}>
            {match}
          </a>
        )
      } else {
        return <span key={key++}>{match}</span>
      }
    })

    node = reactStringReplace(node, TEXT_MENTION_PATTERN, match => (
      <Fragment key={key++}>
        {(() => {
          const mentionRole = match[3] === '&'
          const id = match.slice(4, -1)
          if (mentionRole) {
            return richTextContext.renderRole({ id, text: match, marks: [] })
          } else {
            return richTextContext.renderUser({ id, text: match, marks: [], colorful })
          }
        })()}
      </Fragment>
    ))

    node = reactStringReplace(node, TEXT_CHANNEL_PATTERN, match => (
      <Fragment key={key++}>
        {(() => {
          const id = match.slice(3, -1)
          return richTextContext.renderChannel({ id, text: match })
        })()}
      </Fragment>
    ))

    node = reactStringReplace(node, /\[(.*?)]/g, match =>
      emojiConfig[match] ?
        <EmojiIcon key={key++} size={16} className={'align-text-bottom'} name={match} />
      : <Fragment key={key++}>[{match}]</Fragment>
    )

    return <span className={`plain-text ${className}`}>{node}</span>
  }, [data])
}
