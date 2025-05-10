import { CircleTagType } from 'fb-components/circle/types.ts'
import { ParsedQuery, ParsedUrl } from 'query-string'
import { showCircleTagDetailModal } from '../../features/circle/tag/CircleTagDetail.tsx'
import { LinkHandler } from './LinkHandler.ts'

export const CIRCLE_LINK_TAG_PATTERN = /https?:\/\/([a-zA-Z0-9-]+\.)?fanbook\.(cn|cc|mobi)\/tag\/([a-zA-Z0-9_]{2,20})(\?.*)?$/

export interface CircleTagLinkParseStruct {
  tagId: string
  type?: CircleTagType
  guildId?: string
}
export default class CircleTagLinkHandler extends LinkHandler {
  // 从链接获取 tagId，需要保证链接是话题链接，可以用 `canHandle` 方法确认
  static parseShareLink(url: string, query: ParsedQuery): Partial<CircleTagLinkParseStruct> {
    const match = url.match(CIRCLE_LINK_TAG_PATTERN)
    const tagId = !match ? undefined : match[3]
    return {
      tagId,
      guildId: query.guild_id as string,
      type: (query.type as CircleTagType) === CircleTagType.Topic ? CircleTagType.Topic : CircleTagType.Tag,
    }
  }

  // type=tag 用于标识是圈子标签链接 还是 之前的圈子链接 type=tag 时需要传 guild_id
  static getShareLink({ tagId, guildId, type = CircleTagType.Tag }: CircleTagLinkParseStruct) {
    const env = import.meta.env.FANBOOK_ENV ? `?env=${import.meta.env.FANBOOK_ENV}` : ''
    const pathname = `tag/${tagId}`
    return `${import.meta.env.FANBOOK_SHARE_HOST}/${pathname}${env ? `${env}&type=${type}&guild_id=${guildId}` : `?type=${type}&guild_id=${guildId}`}`
  }

  canHandle(url: string): boolean {
    return CIRCLE_LINK_TAG_PATTERN.test(url)
  }

  protected handle(url: ParsedUrl, extra?: { guildId: string }): void {
    const { tagId, guildId = extra?.guildId, type = CircleTagType.Tag } = CircleTagLinkHandler.parseShareLink(url.url, url.query)
    if (!tagId) return
    showCircleTagDetailModal({ tagId: tagId, sourceGuildId: guildId || extra?.guildId, type })
  }
}
