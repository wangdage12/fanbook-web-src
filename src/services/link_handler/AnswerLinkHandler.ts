import { ANSWER_LINK_PATTERN } from 'fb-components/components/messages/common'
import { ParsedUrl } from 'query-string'
import { showAnswerDetailModal } from '../../features/question/AnswerModal'
import { LinkHandler } from './LinkHandler'

export default class AnswerLinkHandler extends LinkHandler {
  // 从链接获取 postId，需要保证链接是圈子链接，可以用 `canHandle` 方法确认
  static parseShareLink(url: string) {
    const answerRegex = /\/answer\/([a-zA-Z0-9_]{2,20})\/([a-zA-Z0-9_]{2,20})\/([a-zA-Z0-9_]{2,20})/
    const match = url.match(answerRegex)
    if (match) {
      const guildId = match[1]
      const questionId = match[2]
      const answerId = match[3]
      return { guildId, questionId, answerId }
    }
  }

  static getShareLink({ guildId, questionId, answerId }: { guildId?: string; questionId: string; answerId?: string }) {
    if (!guildId) throw new Error('guildId is empty')
    const env = import.meta.env.FANBOOK_ENV ? `?env=${import.meta.env.FANBOOK_ENV}` : ''
    const pathname = `answer/${guildId}/${questionId}/${answerId}`
    return `${import.meta.env.FANBOOK_SHARE_HOST}/${pathname}${env}`
  }

  canHandle(url: string): boolean {
    return ANSWER_LINK_PATTERN.test(url)
  }

  protected handle(url: ParsedUrl): void {
    const { guildId, questionId, answerId } = AnswerLinkHandler.parseShareLink(url.url) ?? {}
    if (!guildId || !questionId || !answerId) return
    showAnswerDetailModal({ questionId, answerId })
  }
}
