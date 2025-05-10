import { useToggle } from 'ahooks'
import { Divider } from 'antd'
import AnswerContext from 'fb-components/question/AnswerContext.ts'
import QuestionAnswerItem from 'fb-components/question/QuestionAnswerItem.tsx'
import { QuestionAnswerStruct } from 'fb-components/question/types.ts'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import { SwitchType } from 'fb-components/struct/type'
import { useCallback, useMemo } from 'react'
import ShareMenuDropdown from '../../components/share/ShareMenuDropdown.tsx'
import { AnswerMenuDropdown } from './AnswerMenuDropdown.tsx'
import QuestionAnswerComment from './QuestionAnswerComment.tsx'
import { generateQuestionAfterHandler } from './generateQuestionAfterHandler.ts'

export function QuestionAnswer({
  data,
  onToggleLike,
  onComment,
  onDeleteReply,
  onDeleteAnswer,
  onToggleSuggest,
}: {
  data: QuestionAnswerStruct
  onToggleLike?: () => void
  onComment?: () => void
  onDeleteReply?: (deleteCount: number) => void
  onDeleteAnswer?: () => void
  onToggleSuggest?: (res: SwitchType) => void
}) {
  const { answer, author } = data
  const [displayReplyList, displayReplyListAction] = useToggle(false)

  const handleToggleReply = useCallback(() => {
    displayReplyListAction.toggle()
  }, [])

  const afterShareHandler = useMemo(() => {
    if (!answer) {
      return
    }
    const { question_id, answer_id, guild_id, content } = answer
    const { user_id = '', nickname = '' } = author ?? {}
    return generateQuestionAfterHandler({
      questionId: question_id,
      authorId: user_id,
      authorName: nickname,
      guildId: guild_id,
      answerId: answer_id,
      content: richText2PlainText(transformRichText(content)),
    })
  }, [data.answer])

  return (
    <AnswerContext.Provider
      value={{
        moreWrapper: children => (
          <AnswerMenuDropdown article={data} onDeleteAnswer={onDeleteAnswer} onToggleSuggest={onToggleSuggest}>
            {children}
          </AnswerMenuDropdown>
        ),
        btnsWrapper: (children, key) =>
          key === 'share' ?
            <ShareMenuDropdown key={key} guildId={answer.guild_id} channelId={answer.channel_id} afterHandler={afterShareHandler}>
              {children}
            </ShareMenuDropdown>
          : children,
      }}
    >
      <div className={'flex flex-col'} data-id={answer.answer_id}>
        <QuestionAnswerItem data={data} onReply={handleToggleReply} onLike={onToggleLike} />

        {/*子评论*/}
        <QuestionAnswerComment data={data} displayReplyList={displayReplyList} onComment={onComment} onDelete={onDeleteReply}></QuestionAnswerComment>
        <Divider className="my-0" />
      </div>
    </AnswerContext.Provider>
  )
}
