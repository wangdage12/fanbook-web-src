// 问题详情页卡片组件
import QuestionDetail, { BaseQuestionDetailProps } from './QuestionDetail.tsx'
import { QuestionActions } from './QuestionMenuDropdown.tsx'

type QuestionDetailFromCardProps = Omit<BaseQuestionDetailProps, 'originDetail'>

export function QuestionDetailFromCard({ questionId, guildVisible, onClose, onGuildClick }: QuestionDetailFromCardProps) {
  const actions: QuestionActions = {
    // onView: () => {},
    // onCollect: res => {},
    // onTop: res => {},
    // onDigest: res => {},
    // onUpdatePermission: res => {},
    // onDeleteQuestion: () => {},
    // onAnswer: answer => {},
  }

  return (
    <QuestionDetail guildVisible={guildVisible} questionId={questionId} {...actions} onClose={onClose} onGuildClick={onGuildClick}></QuestionDetail>
  )
}
