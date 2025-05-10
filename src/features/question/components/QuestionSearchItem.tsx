import Highlighter from 'fb-components/components/Highlighter'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils'
import { formatCount } from 'fb-components/utils/common'
import { useCallback, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { GuildContext } from '../../home/GuildWrapper'
import { QuestionSearchInfo, QuestionSearchRange } from '../questionAPI'

function QuestionSearchItem({
  detail,
  selectedQuestionId,
  selectedAnswerId,
  keyword,
}: {
  detail: QuestionSearchInfo
  selectedQuestionId?: string
  selectedAnswerId?: string
  keyword?: string
}) {
  const { question, type, answer, highlight } = detail
  const currentGuild = useContext(GuildContext)
  const {
    question_id,
    title: originTitle,
    /*is_top, is_digest,
    is_resolved,*/
    resolved_at,
    created_at,
    replied_at,
    view_count,
    answer_count,
  } = question
  const { like_count, reply_count, created_at: answerCreatedAt } = answer
  const { content } = highlight

  const isSelected =
    type === QuestionSearchRange.Answer ? selectedAnswerId === answer?.answer_id
    : selectedAnswerId ? false
    : selectedQuestionId === question_id

  const time = useMemo(
    () =>
      DateTimeUtils.format(
        (type === QuestionSearchRange.Answer ? answerCreatedAt : Math.max(replied_at ?? 0, resolved_at ?? 0, created_at ?? 0)) * 1000,
        {
          showJustNow: true,
          showWithinDay: true,
          showTimeBeyondOneDay: false,
        }
      ),
    [detail]
  )

  const navigate = useNavigate()
  const navToDetail = useCallback(() => {
    navigate(answer.answer_id ? `${question_id}/${answer.answer_id}` : question_id)
  }, [detail])

  return (
    <div className={'pr-1'}>
      <div
        className={`mb-[8px] flex w-full cursor-pointer rounded-[12px] border-[1.5px] bg-[var(--fg-white-1)] p-[12px] ${
          isSelected ? 'border-[var(--fg-blue-1)]' : 'border-transparent'
        } after:clear-both after:table hover:border-[var(--fg-blue-1)]`}
        onClick={navToDetail}
      >
        <div className="flex flex-1 flex-col justify-between">
          <div className="text mb-[8px] line-clamp-2 leading-[22px]">
            <span className="text-[16px] leading-[18px]">
              {/* {is_top ? (
              <TenSizeTag text="置顶" color="yellow" className="mr-[6px] align-[.1em]" />
            ) : is_digest ? (
              <TenSizeTag text="精" className="mr-[6px] align-[.1em]" />
            ) : null} */}
              {/* {is_resolved === SwitchType.Yes ? <TenSizeTag text="已解决" color="gray" bordered className="mr-[6px] align-[.1em]" /> : null} */}
              <Highlighter keyword={keyword} text={originTitle ?? ''} />
            </span>
          </div>
          {content.text && (
            <div className="text mb-[8px] line-clamp-2 leading-[22px]">
              <span className="break-all text-[14px] leading-[18px] text-[var(--fg-b60)]">
                {type === QuestionSearchRange.Answer && (
                  <>
                    <RealtimeNickname userId={answer.author.user_id} guildId={currentGuild?.guild_id}></RealtimeNickname>：
                  </>
                )}
                <Highlighter keyword={keyword} text={content.text} prefixSize={24} />
              </span>
            </div>
          )}
          <div className="flex gap-[12px] text-[12px] text-[var(--fg-b40)]">
            {type === QuestionSearchRange.Answer ?
              <>
                <span>{formatCount(like_count)}点赞</span>
                <span>{formatCount(reply_count)}评论</span>
              </>
            : <>
                <span>{formatCount(view_count)}浏览</span>
                <span>{formatCount(answer_count)}回答</span>
              </>
            }
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionSearchItem
