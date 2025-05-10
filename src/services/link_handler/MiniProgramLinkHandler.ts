import queryString, { ParsedUrl } from 'query-string'
import AppRoutes from '../../app/AppRoutes.ts'
import { HomeContentType, getHomeContentType } from '../../app/util.ts'
import { currentLocation } from '../../components/with/WithLocation.tsx'
import { DmHelper } from '../../features/dm/dmSlice.ts'
import GuildUtils from '../../features/guild_list/GuildUtils.tsx'
import { OpenMiniProgramOptions, openMiniProgram } from '../../features/mp-inner/util.ts'
import { LinkHandler } from './LinkHandler.ts'

const OfficialSite = [
  '.fanbook.cn',
  '.fanbook.mobi',
  '.fanbook.cc', // 测试环境
]

function isDomainMatch(hostname: string, domainSuffixes: string[]) {
  for (const suffix of domainSuffixes) {
    if (hostname.endsWith(suffix)) {
      return true
    }
  }
  return false
}

export default class MiniProgramLinkHandler extends LinkHandler {
  canHandle(urlString: string): boolean {
    return this.matchQueryRule(urlString) || this.matchPathRule(urlString)
  }
  matchQueryRule(urlString: string): boolean {
    const { query } = queryString.parseUrl(urlString)
    // "https://open.fanbook.mobi?enter_type=message_card&view=1&fb_redirect&open_type=mp"
    return query.open_type === 'mp' && 'fb_redirect' in query
  }

  matchPathRule(urlString: string): boolean {
    const { pathname, hostname } = new URL(urlString)
    const pathSegments = pathname.split('/').slice(1)
    return isDomainMatch(hostname, OfficialSite) && pathSegments.length === 2 && pathSegments[0] === 'mp'
  }

  protected handle(url: ParsedUrl, extra: object | undefined, originUrl: string): void {
    if (extra) {
      const { guildId = undefined, channelId = undefined, isFromDM = false } = extra as OpenMiniProgramOptions
      openMiniProgram(originUrl, { guildId, channelId, isFromDM })
      return
    }
    const contentType = getHomeContentType(currentLocation.current?.pathname ?? '')
    let options: OpenMiniProgramOptions = {}
    if ([HomeContentType.Guild, HomeContentType.Dm].includes(contentType)) {
      switch (contentType) {
        case HomeContentType.Guild: {
          const guildId = GuildUtils.getCurrentGuildId()
          // 如果当前页面不是在圈子内, 则需要传递 channelId
          const channelId = !currentLocation.current?.pathname.includes(AppRoutes.CIRCLE) ? GuildUtils.getCurrentChannelId() : undefined
          options = { guildId, channelId, isFromDM: false }
          break
        }
        case HomeContentType.Dm: {
          const channelId = DmHelper.getLastChannelId()
          options = { channelId, isFromDM: true }
          break
        }
        default:
          break
      }
    }
    openMiniProgram(originUrl, options)
  }
}
