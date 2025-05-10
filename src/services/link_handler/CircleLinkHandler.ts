import { ParsedUrl } from 'query-string'
import { showCircleDetailModal } from '../../features/circle/CircleModal.tsx'
import { LinkHandler } from './LinkHandler.ts'

export const CIRCLE_LINK_PATTERN = /https?:\/\/([a-zA-Z0-9-]+\.)?fanbook\.(cc|mobi)\/circle\/([a-zA-Z0-9_]{2,20})(\?.*)?$/

export default class CircleLinkHandler extends LinkHandler {
  // 从链接获取 postId，需要保证链接是圈子链接，可以用 `canHandle` 方法确认
  static parseShareLink(url: string): string | undefined {
    const match = url.match(CIRCLE_LINK_PATTERN)
    return !match ? undefined : match[3]
  }

  static getShareLink({ postId }: { postId: string }) {
    const env = import.meta.env.FANBOOK_ENV ? `?env=${import.meta.env.FANBOOK_ENV}` : ''
    const pathname = `circle/${postId}`
    return `${import.meta.env.FANBOOK_SHARE_HOST}/${pathname}${env}`
  }

  canHandle(url: string): boolean {
    return CIRCLE_LINK_PATTERN.test(url)
  }

  protected handle(url: ParsedUrl): void {
    const postId = CircleLinkHandler.parseShareLink(url.url)
    if (!postId) return
    showCircleDetailModal({ postId })
  }
}
