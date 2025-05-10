import { formatCount } from 'fb-components/utils/common'
import { CSSProperties, ReactNode, useMemo } from 'react'
import GuildFooterMark from '../../components/GuildFooterMark'
import FbPlainText from '../../rich_text/FbPlainText'
import { richText2PlainText } from '../../rich_text/converter/rich_text_to_plain_format'
import { getFirstMediaFromOps } from '../../rich_text/transform_rich_text'
import QuestionItemMedia from '../QuestionItemMedia'
import { QuestionAnswerStruct } from '../types'
import QuestionAnswerSkeleton from './skeleton/QuestionAnswerSkeleton'

const ValidContent = ({
  detail,
  isOtherGuild,
  mediaInfo,
  authorName,
  onClick,
}: {
  detail: QuestionAnswerStruct
  isOtherGuild: boolean
  mediaInfo: ReturnType<typeof getFirstMediaFromOps>
  authorName?: ReactNode
  onClick?: (detail: QuestionAnswerStruct) => void
}) => {
  const { answer, author, question, guild } = detail
  return (
    <div className={'flex w-[340px] cursor-pointer flex-col'} onClick={() => onClick?.(detail)}>
      <div className="line-clamp-2 leading-[22px]">
        <span className="text-[16px] font-medium leading-[18px]">{question?.title}</span>
      </div>
      <div className="flex">
        <div className="flex flex-1 flex-col justify-between">
          <div className="line-clamp-2 leading-[22px]">
            <span className="break-all text-[14px] leading-[18px] text-[var(--fg-b60)]">
              {authorName ?? author?.nickname}:&nbsp;
              <FbPlainText data={richText2PlainText(answer?.parsed)} />
            </span>
          </div>
          <div className="mt-[8px] flex gap-[12px] text-[12px] text-[var(--fg-b40)]">
            <span>{formatCount(answer?.like_count)}点赞</span>
            <span>{formatCount(answer?.reply_count)}评论</span>
          </div>
        </div>
        <QuestionItemMedia {...mediaInfo} />
      </div>
      {isOtherGuild && guild && <GuildFooterMark data={guild}></GuildFooterMark>}
    </div>
  )
}

const InvalidContent = () => {
  return <div className={'text-[16px] leading-[24px] text-[var(--fg-b40)]'}>分享的回答已被删除</div>
}

interface AnswerBaseCardProp {
  detail?: QuestionAnswerStruct
  loading?: boolean
  style?: CSSProperties
  className?: string
  currentGuildId?: string
  /** 是否隐藏服务器来源标识 */
  hiddenGuildOrigin?: boolean
  authorName?: ReactNode
  onClick?: (detail: QuestionAnswerStruct) => void
}

function AnswerBaseCard({
  className = '',
  loading = false,
  detail,
  currentGuildId,
  hiddenGuildOrigin = false,
  onClick,
  style,
  authorName,
}: AnswerBaseCardProp) {
  const isOtherGuild = useMemo(() => {
    return currentGuildId ? currentGuildId !== detail?.guild?.guild_id : false
  }, [currentGuildId, detail])

  const firstMedia = useMemo(
    () => (detail && !detail.deleted && detail.answer.content ? getFirstMediaFromOps(detail.answer.content) : undefined),
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

export default AnswerBaseCard
