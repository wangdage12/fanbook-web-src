import { QuestionAnswerContentType, QuestionAnswerStruct, QuestionStruct } from 'fb-components/question/types'
import { splitMediaAndBody } from 'fb-components/rich_text/split.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text'
import { useEffect, useMemo, useState } from 'react'
import { BusinessError } from '../../base_services/interceptors/response_interceptor'
import AnswerLinkHandler from '../../services/link_handler/AnswerLinkHandler.ts'
import QuestionLinkHandler from '../../services/link_handler/QuestionLinkHandler.ts'
import QuestionApi from './questionAPI.ts'

export interface QuestionParams {
  guildId?: string
  questionId?: string
}

export function useQuestionDetail(share: string | QuestionParams, enableHttpCache = false) {
  const { questionId } = useMemo(() => {
    if (typeof share === 'string') {
      const { guildId, questionId } = QuestionLinkHandler.parseShareLink(share) || {}
      return { guildId, questionId }
    }
    return share
  }, [share])

  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<QuestionStruct | undefined>()

  const fetchData = async (questionId: string) => {
    try {
      const detail = await QuestionApi.questionDetail(questionId, enableHttpCache)
      const { body } = splitMediaAndBody(detail.question.content)
      detail.question.parsed = transformRichText(body)
      setDetail(detail)
      setLoading(false)
    } catch (e) {
      if (e instanceof BusinessError) {
        console.log('useQuestionDetail BusinessError', questionId, e.desc, e.code)
      } else {
        console.log('useQuestionDetail parse error', questionId, e)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!questionId) {
      setDetail({ deleted: true, question: { question_id: questionId } } as QuestionStruct)
      return
    }
    fetchData(questionId).then()
  }, [questionId])
  return { loading, detail }
}

export interface AnswerParams {
  guildId?: string
  questionId?: string
  answerId?: string
}

export function useAnswerDetail(share: string | AnswerParams, enableHttpCache = false) {
  const { questionId, answerId } = useMemo(() => {
    if (typeof share === 'string') {
      const { guildId, questionId, answerId } = AnswerLinkHandler.parseShareLink(share) || {}
      return { guildId, questionId, answerId }
    }
    return share
  }, [share])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<QuestionAnswerStruct | undefined>()

  const fetchData = async (questionId: string, answerId: string) => {
    try {
      const detail = await QuestionApi.answerDetail({ questionId, answerId, enabledCache: enableHttpCache })

      if (detail.answer.content_type === QuestionAnswerContentType.RichText) {
        detail.answer.parsed = transformRichText(detail.answer.content)
      } else {
        detail.answer.parsed = transformRichText(splitMediaAndBody(detail.answer.content).body)
      }
      setDetail(detail)
      setLoading(false)
    } catch (e) {
      if (e instanceof BusinessError) {
        console.log('useAnswerDetail BusinessError', questionId, e.desc, e.code)
      } else {
        console.log('useAnswerDetail parse error', questionId, e)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!questionId || !answerId) {
      setDetail({ deleted: true, answer: { question_id: questionId, answer_id: answerId } } as QuestionAnswerStruct)
      return
    }
    fetchData(questionId, answerId).then()
  }, [questionId, answerId])
  return { loading, detail }
}
