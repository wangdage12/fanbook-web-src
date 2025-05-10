import { ParsedQuery, ParsedUrl } from 'query-string'
import AppRoutes from '../../app/AppRoutes.ts'
import { router } from '../../app/router.tsx'
import { store } from '../../app/store.ts'
import { dmActions } from '../../features/dm/dmSlice.ts'
import { generateDMChannel } from '../../features/dm/utils.ts'
import { LinkHandler } from './LinkHandler.ts'

// https://fanbook.mobi/dm?recipient=496970706111025152
export const DM_LINK_PATTERN = /https?:\/\/([a-zA-Z0-9-]+\.)?fanbook\.(cn|cc|mobi)\/dm(\?.*)?$/

export default class DMLinkHandler extends LinkHandler {
  // 从链接获取 postId，需要保证链接是圈子链接，可以用 `canHandle` 方法确认
  static parseShareLink(url: string, query: ParsedQuery): { dmChannelId?: string } {
    return {
      dmChannelId: query.recipient as string,
    }
  }

  static getShareLink({ dmChannelId }: { dmChannelId: string }) {
    return `https://fanbook.mobi/dm?recipient=${dmChannelId}`
  }

  canHandle(url: string): boolean {
    return DM_LINK_PATTERN.test(url)
  }

  protected async handle(url: ParsedUrl, extra: { guildId: string }): Promise<void> {
    const { dmChannelId } = DMLinkHandler.parseShareLink(url.url, url.query)
    if (!dmChannelId) return
    const dmChannel = await generateDMChannel({ recipientId: dmChannelId, guildId: extra.guildId })
    if (dmChannel) {
      // 临时置顶
      store.dispatch(dmActions.temporaryPin(dmChannel))
      router.navigate(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${dmChannel.channel_id}`, { replace: true })
    }
  }
}
