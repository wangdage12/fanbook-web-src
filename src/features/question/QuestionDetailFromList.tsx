// 问题详情页路由组件
import { QuestionArticleStruct } from 'fb-components/question/types.ts'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts'
import QuestionDetail from './QuestionDetail.tsx'
import { QuestionActions } from './QuestionMenuDropdown.tsx'
import { questionActions, questionSelectors } from './questionSlice.ts'

export function QuestionDetailFromList() {
  const { questionId } = useParams()
  const detail = useAppSelector(questionSelectors.selectedQuestionFromList(questionId))
  const dispatch = useAppDispatch()

  function onQuestionPropertyChange(property: keyof QuestionArticleStruct, value: string | number) {
    questionId && dispatch(questionActions.updateQuestionProperty({ questionId: questionId, property, value }))
  }

  const actions: QuestionActions = {
    onView: () => {
      questionId && dispatch(questionActions.increaseViewCount(questionId))
    },
    onCollect: res => {
      onQuestionPropertyChange('is_collected', res)
    },
    onTop: res => {
      onQuestionPropertyChange('is_top', res)
    },
    onDigest: res => {
      onQuestionPropertyChange('is_digest', res)
    },
    onUpdatePermission: res => {
      onQuestionPropertyChange('read_permission', res)
    },
    onDeleteQuestion: () => {
      questionId && dispatch(questionActions.deleteQuestion(questionId))
    },
    onAnswer: (/*answer*/) => {
      questionId && dispatch(questionActions.updateAnswerCount({ questionId: questionId, updateCount: 1 }))
    },
  }

  return <QuestionDetail questionId={questionId} originDetail={detail} {...actions}></QuestionDetail>
}
