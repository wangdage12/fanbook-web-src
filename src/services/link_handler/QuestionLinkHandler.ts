import { QUESTION_LINK_PATTERN } from 'fb-components/components/messages/common'
import { ParsedUrl } from 'query-string'
import { showQuestionDetailModal } from '../../features/question/QuestionModal'
import { LinkHandler } from './LinkHandler'

export default class QuestionLinkHandler extends LinkHandler {
  static parseShareLink(url: string) {
    const questionRegex = /\/question\/([a-zA-Z0-9_]{2,20})\/([a-zA-Z0-9_]{2,20})/
    const match = url.match(questionRegex)
    if (match) {
      const guildId = match[1]
      const questionId = match[2]
      return { guildId, questionId }
    }
  }

  static getShareLink({ guildId, questionId }: { guildId?: string; questionId: string; answerId?: string }) {
    if (!guildId) throw new Error('guildId is empty')
    const pathname = `question/${guildId}/${questionId}`
    const env = import.meta.env.FANBOOK_ENV ? `?env=${import.meta.env.FANBOOK_ENV}` : ''
    return `${import.meta.env.FANBOOK_SHARE_HOST}/${pathname}${env}`
  }

  canHandle(url: string): boolean {
    return QUESTION_LINK_PATTERN.test(url)
  }

  protected handle(url: ParsedUrl): void {
    const { guildId, questionId } = QuestionLinkHandler.parseShareLink(url.url) ?? {}
    if (!guildId || !questionId) return
    showQuestionDetailModal({ questionId })
  }
}
