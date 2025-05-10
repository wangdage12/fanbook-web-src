import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import QuestionItemMedia from 'fb-components/question/QuestionItemMedia'
import { QuestionStruct } from 'fb-components/question/types.ts'
import { getFirstMediaFromOps } from 'fb-components/rich_text/transform_rich_text.ts'
import { SwitchType } from 'fb-components/struct/type'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils.ts'
import { formatCount } from 'fb-components/utils/common'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuestionTypeKey } from '../questionSlice'

function QuestionItem({
  detail,
  selectedQuestionId,
  type = QuestionTypeKey.All,
}: {
  detail: QuestionStruct
  selectedQuestionId?: string
  type?: QuestionTypeKey
}) {
  const { question } = detail
  const { question_id, title, content, is_top, is_digest, is_resolved, resolved_at, created_at, replied_at, view_count, answer_count } = question
  const firstMedia = useMemo(() => getFirstMediaFromOps(content), [question])
  const time = useMemo(
    () =>
      DateTimeUtils.format(Math.max(replied_at ?? 0, resolved_at ?? 0, created_at ?? 0) * 1000, {
        showJustNow: true,
        showWithinDay: true,
        showTimeBeyondOneDay: false,
      }),
    [replied_at, resolved_at, created_at]
  )

  const navigate = useNavigate()
  const navToDetail = useCallback(() => {
    navigate(question_id)
  }, [detail])

  return (
    <div className={'pr-1'}>
      <div
        className={`mb-[8px] flex w-full cursor-pointer rounded-[12px] border-[1.5px] bg-[var(--fg-white-1)] p-[12px] ${
          selectedQuestionId === question_id ? 'border-[var(--fg-blue-1)]' : 'border-transparent'
        } after:clear-both after:table hover:shadow-[0_4px_8px_0_rgba(26,32,51,0.1)]`}
        onClick={navToDetail}
      >
        <div className="flex flex-1 flex-col justify-between">
          <div className="line-clamp-2 leading-[22px]">
            {is_top && type === QuestionTypeKey.All ?
              <TenSizeTag text="置顶" color="yellow" className="mr-[6px] align-[.1em]" />
            : is_digest ?
              <TenSizeTag text="精" className="mr-[6px] align-[.1em]" />
            : null}
            {is_resolved === SwitchType.Yes ?
              <TenSizeTag text="已解决" color="gray" bordered className="mr-[6px] align-[.1em]" />
            : null}
            <span className="text-[16px] leading-[18px]">{title}</span>
          </div>
          <div className="mt-[8px] flex gap-[12px] text-[12px] text-[var(--fg-b40)]">
            <span>{formatCount(view_count)}浏览</span>
            <span>{formatCount(answer_count)}回答</span>
            <span>{time}</span>
          </div>
        </div>
        {firstMedia && <QuestionItemMedia {...firstMedia} />}
      </div>
    </div>
  )
}

export default QuestionItem
