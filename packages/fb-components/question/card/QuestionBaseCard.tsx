import { formatCount } from 'fb-components/utils/common'
import { CSSProperties, ReactNode, useMemo } from 'react'
import GuildFooterMark from '../../components/GuildFooterMark'
import { getFirstMediaFromOps } from '../../rich_text/transform_rich_text'
import QuestionItemMedia from '../QuestionItemMedia'
import { QuestionStruct } from '../types'
import QuestionAnswerSkeleton from './skeleton/QuestionAnswerSkeleton'

const ValidContent = ({
  detail,
  isOtherGuild,
  mediaInfo,
  authorName,
  onClick,
}: {
  detail: QuestionStruct
  isOtherGuild: boolean
  mediaInfo?: ReturnType<typeof getFirstMediaFromOps>
  authorName?: ReactNode
  onClick?: (detail: QuestionStruct) => void
}) => {
  const { author, question, guild } = detail
  return (
    <div className={'flex w-[340px] cursor-pointer flex-col'} onClick={() => onClick?.(detail)}>
      <div className="line-clamp-2 leading-[22px]">
        <span className="text-[16px] font-medium leading-[18px]">{question?.title}</span>
      </div>
      <div className="flex">
        <div className="flex flex-1 flex-col justify-between">
          <div className="line-clamp-2 leading-[22px]">
            <span className="text-[14px] leading-[18px] text-[var(--fg-b60)]">
              {authorName ?? author?.nickname}
              {' 发起的提问'}
            </span>
          </div>
          <div className="mt-[8px] flex gap-[12px] break-all text-[12px] text-[var(--fg-b40)]">
            <span>{formatCount(question?.view_count)}浏览</span>
            <span>{formatCount(question?.answer_count)}回答</span>
          </div>
        </div>
        <QuestionItemMedia {...mediaInfo} />
      </div>
      {isOtherGuild && guild && <GuildFooterMark data={guild}></GuildFooterMark>}
    </div>
  )
}

const InvalidContent = () => {
  return <div className={'text-[16px] leading-[24px] text-[var(--fg-b40)]'}>分享的问题已被删除</div>
}

interface QuestionBaseCardProp {
  detail?: QuestionStruct
  loading?: boolean
  style?: CSSProperties
  className?: string
  currentGuildId?: string
  /** 是否隐藏服务器来源标识 */
  hiddenGuildOrigin?: boolean
  authorName?: ReactNode
  onClick?: (detail: QuestionStruct) => void
}

function QuestionBaseCard({
  className = '',
  loading = false,
  detail,
  currentGuildId,
  hiddenGuildOrigin = false,
  authorName,
  onClick,
  style,
}: QuestionBaseCardProp) {
  const isOtherGuild = useMemo(() => {
    return currentGuildId ? currentGuildId !== detail?.guild?.guild_id : false
  }, [currentGuildId, detail])

  const firstMedia = useMemo(
    () => (detail && !detail.deleted && detail.question.content ? getFirstMediaFromOps(detail.question.content) : undefined),
    [detail]
  )

  return (
    <div style={style} className={`max-w-[360px] overflow-hidden rounded-lg bg-[var(--fg-white-1)] p-[10px] ${className}`}>
      {loading ?
        <QuestionAnswerSkeleton />
      : !detail || detail?.deleted ?
        <InvalidContent />
      : <ValidContent
          onClick={onClick}
          authorName={authorName}
          detail={detail}
          isOtherGuild={hiddenGuildOrigin ? false : isOtherGuild}
          mediaInfo={firstMedia}
        />
      }
    </div>
  )
}

export default QuestionBaseCard
