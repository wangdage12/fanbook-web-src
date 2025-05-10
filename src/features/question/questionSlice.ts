import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { QuestionAnswerStruct, QuestionArticleStruct, QuestionStruct, QuestionTagStruct } from 'fb-components/question/types'
import { SwitchType } from 'fb-components/struct/type'
import { intersectionWith, unionWith } from 'lodash-es'
import { RootState } from '../../app/store'
import { PaginationResp } from '../../types'
import { QuestionSearchInfo } from './questionAPI.ts'

export enum ArticleType {
  question = 'question',
  answer = 'answer',
  reply = 'reply',
  subReply = 'subReply',
}

export interface ArticleStatus {
  loading: boolean
  hasMore?: boolean
}

interface ListStatus {
  topQuestionId?: string
}

export type QuestionContentStruct = Partial<QuestionStruct & ArticleStatus>

export type QuestionAnswerContentStruct = Partial<QuestionAnswerStruct & ArticleStatus>

export enum QuestionTypeKey {
  All = 'all',
  Selected = 'selected',
  Collection = 'collection',
}

interface QuestionState {
  questionList: PaginationResp<QuestionStruct> & ArticleStatus & ListStatus & { type: QuestionTypeKey }
  questionSearchList: PaginationResp<QuestionSearchInfo> & ArticleStatus & ListStatus
  tags: QuestionTagStruct[]
  publishing: boolean
}

const initialState: QuestionState = {
  questionList: {
    loading: false,
    list: [],
    next: 1,
    hasMore: true,
    last_id: undefined,
    session: undefined,
    type: QuestionTypeKey.All,
  },
  questionSearchList: {
    loading: false,
    list: [],
    next: 1,
    hasMore: true,
    last_id: undefined,
    session: undefined,
  },
  tags: [],
  publishing: false,
}

export const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    addQuestionToList: (state, { payload }: PayloadAction<QuestionStruct>) => {
      // 若在精选列表中，不添加
      if (state.questionList.type === QuestionTypeKey.Selected) {
        return
      }
      if (state.questionList.topQuestionId) {
        state.questionList.list = [state.questionList.list[0], payload, ...state.questionList.list.slice(1)]
      } else {
        state.questionList.list = [payload, ...state.questionList.list]
      }
    },

    setQuestionList: (
      state,
      {
        payload,
      }: PayloadAction<{
        info: Partial<PaginationResp<QuestionStruct> & ArticleStatus & ListStatus & { type: QuestionTypeKey }>
        init?: boolean
      }>
    ) => {
      const { info, init } = payload
      const { list, topQuestionId } = state.questionList
      const { next = 1, loading = false, hasMore = false, list: _list = [], type = QuestionTypeKey.All } = info
      let changeList = _list
      if (!init) {
        changeList = unionWith(list, _list, (prev, next) => prev.question.question_id === next.question.question_id)
        const diff = intersectionWith(_list, list, (prev, next) => prev.question.question_id === next.question.question_id)
        if (diff.length > 0) {
          changeList = changeList.map(item => {
            const _item = diff.find(_item => _item.question.question_id === item.question.question_id)
            if (_item) {
              return _item
            }
            return item
          })
        }
      }
      const _topQuestionId = _list.find(item => item.question.is_top)?.question.question_id

      if (_topQuestionId && _topQuestionId !== topQuestionId) {
        changeList =
          topQuestionId ?
            changeList.map(item => {
              if (item.question.question_id === topQuestionId) {
                return {
                  ...item,
                  question: {
                    ...item.question,
                    is_top: SwitchType.No,
                  },
                }
              }
              return item
            })
          : changeList
      }

      const findTopIndex = changeList.findIndex(item => item.question.question_id === _topQuestionId)

      if (findTopIndex !== -1 && type === QuestionTypeKey.All) {
        changeList = [changeList[findTopIndex], ...changeList.filter(item => item.question.question_id !== _topQuestionId)]
      }

      state.questionList = {
        ...info,
        next,
        loading,
        hasMore,
        type,
        list: changeList,
        topQuestionId: _topQuestionId ?? topQuestionId,
      }
    },
    setQuestionSearchListList: (
      state,
      {
        payload,
      }: PayloadAction<{
        info: Partial<PaginationResp<QuestionSearchInfo> & ArticleStatus & ListStatus>
        init?: boolean
      }>
    ) => {
      const { info, init } = payload
      const { list } = state.questionSearchList
      const { next = 1, loading = false, hasMore = false, list: _list = [] } = info
      state.questionSearchList = {
        ...info,
        next,
        loading,
        hasMore,
        list: init ? _list : [...list, ..._list],
      }
    },
    setTags: (state, { payload }: PayloadAction<QuestionTagStruct[]>) => {
      state.tags = payload
    },

    increaseViewCount: (state, { payload: questionId }: PayloadAction<string>) => {
      // 更新列表答案数量
      const question = state.questionList.list.find(e => e.question.question_id === questionId)
      if (!question) return
      question.question.view_count = (question.question.view_count ?? 0) + 1
    },
    deleteQuestion: (state, { payload: questionId }: PayloadAction<string>) => {
      const index = state.questionList.list.findIndex(item => item.question.question_id === questionId)
      if (index === -1) return
      state.questionList.list.splice(index, 1)
    },
    updateAnswerCount: (
      state,
      {
        payload: { questionId, updateCount },
      }: PayloadAction<{
        questionId: string
        updateCount: number
      }>
    ) => {
      // 更新列表答案数量
      const question = state.questionList.list.find(e => e.question.question_id === questionId)
      if (!question) return
      question.question.answer_count = (question.question.answer_count ?? 0) + updateCount
    },
    updateQuestionProperty: (
      state,
      {
        payload: { questionId, property, value },
      }: PayloadAction<{
        questionId: string
        property: keyof QuestionArticleStruct
        value: string | number
      }>
    ) => {
      const question = state.questionList.list.find(e => e.question.question_id === questionId)
      if (!question) return
      // @ts-expect-error 还有更好的写法？
      question.question[property] = value
      if (property === 'is_top' && value === SwitchType.Yes) {
        const topQuestion = state.questionList.list.find(item => item.question.question_id === questionId)
        if (topQuestion) {
          topQuestion.question.is_top = SwitchType.Yes
          state.questionList.list = [topQuestion, ...state.questionList.list.filter(item => item.question.question_id !== questionId)]
        }
      }
      if (property === 'is_collected' && value === SwitchType.No) {
        // 在收藏列表
        if (state.questionList.type === QuestionTypeKey.Collection) {
          const { is_collected } = question.question
          if (is_collected === SwitchType.No) {
            state.questionList.list = state.questionList.list.filter(item => item.question.question_id !== questionId)
          } else {
            const _question = {
              ...question,
              question: {
                ...question.question,
                is_collected,
              },
            }
            state.questionList.list = [_question, ...state.questionList.list.filter(item => item.question.question_id !== questionId)]
          }
        }
      }
    },
  },
})

export default questionSlice.reducer

export const questionActions = {
  ...questionSlice.actions,
}

export const questionSelectors = {
  selectedQuestionFromList:
    (questionId?: string) =>
    (state: RootState): QuestionContentStruct | undefined =>
      questionId ? state.question.questionList.list.find(question => question.question.question_id === questionId) : undefined,
  questionList: (state: RootState) => state.question.questionList,
  questionSearchList: (state: RootState) => state.question.questionSearchList,
  publishing: (state: RootState) => state.question.publishing,
}
