import { TopLevelBlock } from '@contentful/rich-text-types/dist/types/types'
import { LimitSize } from 'fb-components/components/type.ts'
import RichTextRenderer from 'fb-components/rich_text/RichTextRenderer.tsx'
import { useContext } from 'react'
import { GuildContext } from '../../home/GuildWrapper.tsx'
import { MessageCommonProps } from './type.ts'

import { MessageContentStruct } from 'fb-components/components/messages/types.ts'
import 'fb-components/rich_text/rich-text.css'
import { Op } from 'quill-delta'
import './rich-text-message.less'

export interface RichTextMessageContentStruct extends MessageContentStruct {
  title?: string
  v2: string | Op[]

  parsed: TopLevelBlock[]
}

export interface RichTextMessageProps extends MessageCommonProps {
  message: RichTextMessageContentStruct
  limitSize?: LimitSize
  onPreview?: (mediaIndex?: number) => void
}

export default function RichTextMessage({ message, limitSize, onPreview }: RichTextMessageProps) {
  const guild = useContext(GuildContext)
  return (
    <div className={'message-rich-text flex flex-col'}>
      {message.title && <div className={'message-rich-text-title'}>{message.title}</div>}
      <RichTextRenderer data={message.parsed} onPreview={onPreview} guildId={guild?.guild_id} limitSize={limitSize} />
    </div>
  )
}
