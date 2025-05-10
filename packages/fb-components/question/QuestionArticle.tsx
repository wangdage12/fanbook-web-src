import clsx from 'clsx'
import { forwardRef, useContext } from 'react'
import GuildInfoBox from '../components/GuildInfoBox'
import LoadMore from '../components/LoadMore'
import TenSizeTag from '../components/TenSizeTag'
import RichTextRenderer from '../rich_text/RichTextRenderer'
import { GuildInfoStruct, SimpleUserStruct } from '../struct/type'
import DateTimeUtils from '../utils/DateTimeUtils'
import QuestionContext from './QuestionContext'
import useMediaForTextMode from './hooks/useMediaForTextMode'
import { QuestionAnswerArticleStruct, QuestionAnswerContentType, QuestionArticleStruct, QuestionTagStruct } from './types'

interface QuestionArticleProps {
  data: QuestionArticleStruct
  author?: SimpleUserStruct
  tags?: Array<QuestionTagStruct>
  guild?: GuildInfoStruct
}

const QuestionArticle = forwardRef<HTMLDivElement, QuestionArticleProps>(({ data, author, tags, guild }: QuestionArticleProps, ref) => {
  const context = useContext(QuestionContext)
  const { element: mediaElement, body } = useMediaForTextMode(data.content)

  // 最大行数为屏幕高度的 1/3
  const maxLines = Math.floor(window.screen.height / 3 / 26)
  return (
    <>
      <div ref={ref}>
        <LoadMore textMode={{ maxLines, lineHeight: 26 }} className={'text-base'}>
          <RichTextRenderer data={body} guildId={data.guild_id} />
        </LoadMore>
        {mediaElement}
      </div>

      {author && (
        <div className={'author-avatar-info flex items-center gap-1.5 pt-[14px] text-xs'}>
          {context.buildAvatar(author, 20)}
          {context.buildName(author)}
        </div>
      )}
      <div className={'pt-2 text-xs text-[var(--fg-b40)]'}>
        <div>
          <span>提问于&nbsp;{DateTimeUtils.format(data.created_at * 1000)}</span>
          <span>&nbsp;{data.geo_region}</span>
        </div>
        <div className={'mt-1.5 h-4'}>
          {!!tags?.length && (
            <>
              相关标签：
              {tags.map(e => e.name).join('、')}
            </>
          )}
        </div>
      </div>
      {!!context.guildVisible && !!guild && (
        <div className={'pt-3'}>
          <GuildInfoBox data={guild} onClick={context.onGuildClick} />
        </div>
      )}
    </>
  )
})

QuestionArticle.displayName = 'QuestionArticle'

export default QuestionArticle

interface AnswerArticleProps {
  data: QuestionAnswerArticleStruct
  author?: SimpleUserStruct
  tags?: Array<QuestionTagStruct>
  guild?: GuildInfoStruct
}

export function AnswerArticle({ data, author, guild }: AnswerArticleProps) {
  const context = useContext(QuestionContext)
  const { element: mediaElement, body } = useMediaForTextMode(data.content, data.content_type)

  return (
    <div className={'message-rich-text text-base'}>
      {author && (
        <div className={'author-avatar-info flex items-center gap-1.5 pb-[2px] pt-[14px] text-[15px] font-bold'}>
          {context.buildAvatar(author, 32)}
          {context.buildName(author)}
        </div>
      )}

      <div
        className={clsx([
          'message-rich-text pt-1 text-base',
          data.content_type === QuestionAnswerContentType.RichText ? 'question-answer-rich' : 'question-answer-text',
        ])}
      >
        <RichTextRenderer data={body} guildId={data.guild_id} />
      </div>
      {/*图片展示*/}
      {mediaElement}

      <div className={'flex gap-1'}>
        {!!data.is_choose && <TenSizeTag className="mt-2 flex-shrink-0" text="推荐答案" />}
        {!!data.is_questioner_liked && <TenSizeTag color="gray" className="mt-2 flex-shrink-0" text="题主赞过" />}
      </div>

      <div className={'pb-4 pt-3 text-xs text-[var(--fg-b40)]'}>
        <div>
          <span>回答于&nbsp;{DateTimeUtils.format(data.created_at * 1000)}</span>
          <span>&nbsp;{data.geo_region}</span>
        </div>
      </div>
      {!!context.guildVisible && !!guild && <GuildInfoBox data={guild} onClick={context.onGuildClick} />}
    </div>
  )
}
