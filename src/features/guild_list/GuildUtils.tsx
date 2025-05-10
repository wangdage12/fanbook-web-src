import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { CircleChannelStruct, CircleTagType } from 'fb-components/circle/types.ts'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildBanLevelType, GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { isNil, keyBy } from 'lodash-es'
import AppRoutes from '../../app/AppRoutes'
import { router } from '../../app/router'
import { store } from '../../app/store'
import { ChannelPermission, PermissionService } from '../../services/PermissionService'
import LinkHandlerPresets from '../../services/link_handler/LinkHandlerPresets.ts'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import { showCircleTagDetailModal } from '../circle/tag/CircleTagDetail.tsx'
import { DmHelper } from '../dm/dmSlice'
import GuildAPI, { JoinGuildArgs } from '../guild_container/guildAPI'
import { InviteUtils } from '../invite/utils'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { OpenMiniProgramOptions } from '../mp-inner/util.ts'
import { guildListActions } from './guildListSlice'

export default class GuildUtils {
  // utils
  // 通过id查找guild，id无效或者列表不存在则返回第一个社区
  // static getGuildOrFirst(guildId?: string): GuildStruct | undefined {
  //   if (!guildId) return GuildUtils.getFirstGuild()
  //   const guild = GuildUtils.getGuildById(guildId)
  //   return guild ?? GuildUtils.getFirstGuild()
  // }

  static getGuildList(): GuildStruct[] {
    return store.getState().guild.list ?? []
  }

  static getGuildById(guildId?: string): GuildStruct | undefined {
    return guildId ? (store.getState().guild.list as GuildStruct[]).find(e => e.guild_id == guildId) : undefined
  }

  static getFirstGuild(): GuildStruct | undefined {
    return store.getState().guild.list.find(e => e.banned_level != GuildBanLevelType.Dismiss)
  }

  // 获取上次离开社区最后选中的频道id
  // 频道不存在时返回undefined
  static getLastSelectedChannelId(guildId: string): string | undefined {
    const channelId = store.getState().guild.selectedChannelIdMap[guildId]
    if (!channelId) return undefined
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return undefined
    const channel = guild.channels[channelId]
    // 如果是音视频频道，返回 undefined
    return channel && ![ChannelType.guildVideo, ChannelType.guildVoice].includes(channel.type) ? channelId : undefined
  }

  static selectGuild(guildId: string) {
    let url = `${AppRoutes.CHANNELS}/${guildId}`
    // 如果是私信，跳转到私信频道
    if (guildId === AppRoutes.AT_ME) {
      const channelId = DmHelper.getLastDm()?.channel_id
      if (channelId) url = `${url}/${channelId}`
      router.navigate(url).then()
      return
    }

    const channelId = GuildUtils.getLastSelectedChannelId(guildId) ?? GuildUtils.getFirstAccessibleTextChannel(guildId)?.channel_id

    if (channelId) {
      url = `${url}/${channelId}`
    }
    router.navigate(url).then()
  }

  static selectChannel(channel: ChannelStruct) {
    const { guild_id, channel_id } = channel

    if (!guild_id || !channel_id) return
    switch (channel.type) {
      case ChannelType.guildText:
      case ChannelType.GuildQuestion:
        router.navigate(`${AppRoutes.CHANNELS}/${guild_id}/${channel_id}`).then()
        store.dispatch(guildListActions.updateSelectedChannelId([guild_id, channel_id]))
        break
      case ChannelType.guildVideo:
      case ChannelType.guildVoice:
        // 音视频频道不记录选中频道
        router.navigate(`${AppRoutes.CHANNELS}/${guild_id}/${channel_id}`).then()
        break
      case ChannelType.CircleTopic:
        showCircleTagDetailModal({ tagId: channel_id, sourceGuildId: guild_id, type: CircleTagType.Topic })
        break
      case ChannelType.Link:
        if (channel.link) {
          const url = new URL(channel.link)
          const isWxMp = url.protocol == 'wxminiprogram'
          if (isWxMp) {
            showUnsupportedFeatureToast()
            return
          }
          LinkHandlerPresets.instance.common.handleUrl(channel.link, {
            guildId: guild_id,
            isFromDM: false,
          } as OpenMiniProgramOptions)
        }
        break
      default:
        showUnsupportedFeatureToast()
    }
  }

  /**
   * 通过频道 id 查找频道，注意如果 guild 为空时，会遍历所有社区查找
   * @param guild
   * @param channelId
   */
  static getChannelById(guild: string | GuildStruct | null | undefined, channelId: string): ChannelStruct | undefined {
    let guildData: GuildStruct | undefined
    if (isNil(guild)) {
      for (const g of store.getState().guild.list) {
        if (g.channels[channelId]) {
          return g.channels[channelId]
        }
      }
      return
    }

    if (typeof guild == 'string') {
      guildData = GuildUtils.getGuildById(guild)
    } else {
      guildData = guild
    }
    if (!guildData) return
    return guildData.channels[channelId]
  }

  /**
   * 根据频道 id 查找频道，该函数与 getChannelById 的区别在于，会检查圈子频道等特殊频道
   */
  static getAnyChannelById(guild: string | GuildStruct | null | undefined, channelId: string): ChannelStruct | CircleChannelStruct | undefined {
    let guildData: GuildStruct | undefined
    if (isNil(guild)) {
      for (const g of store.getState().guild.list) {
        if (g.channels[channelId]) {
          return g.channels[channelId]
        } else if (g.circle.channel_id === channelId) {
          return g.circle
        }
      }
      return
    }
    if (typeof guild == 'string') {
      guildData = GuildUtils.getGuildById(guild)
    } else {
      guildData = guild
    }
    if (!guildData) return
    return guildData.channels[channelId] ?? (guildData.circle.channel_id === channelId ? guildData.circle : undefined)
  }

  static getFirstAccessibleTextChannel(guildId: string): ChannelStruct | undefined {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return undefined
    return GuildUtils.getAccessibleChannels(guildId).find(e => e.type == ChannelType.guildText)
  }

  static getCurrentGuildId(): string | undefined {
    return store.getState().guild.currentGuildId
  }

  static getCurrentGuild(): GuildStruct | undefined {
    const guildId = this.getCurrentGuildId()
    if (!guildId) return undefined
    return GuildUtils.getGuildById(guildId)
  }

  static getCurrentChannelId(): string | undefined {
    return store.getState().guild.currentChannelId
  }

  /**
   * 获取当前频道，可能是圈子频道、社区频道、私信频道
   */
  static getCurrentChannel(): ChannelStruct | undefined {
    // 圈子路由
    if (/^\/channels\/\d+\/circle$/.test(location.pathname)) {
      return { channel_id: 'circle' } as ChannelStruct
    }
    const dmMatch = /^\/channels\/@me\/(\d+)/.exec(location.pathname)
    if (dmMatch?.[1]) {
      return DmHelper.getChannel(dmMatch[1])
    } else {
      const channelId = this.getCurrentChannelId()
      if (!channelId) return undefined
      return GuildUtils.getChannelById(null, channelId)
    }
  }

  // 有查看权限的频道列表
  static getAccessibleChannels(guildId: string): ChannelStruct[] {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return []
    const channelIds = Object.values(guild.channel_lists).filter(e => {
      return PermissionService.computeChannelPermissions(guild, e, LocalUserInfo.userId).has(ChannelPermission.ViewChannel)
    })
    return channelIds.map(e => guild.channels[e])
  }

  /**
   * 获取所有频道列表（排除已下线的话题频道）
   * @param guildId
   */
  static getOrderChannels(guildId: string): ChannelStruct[] {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return []
    return (guild?.channel_lists ?? [])
      .map(e => guild?.channels[e])
      .filter(e => e.type != ChannelType.PrivateTopic && e.type != ChannelType.PlazaNotice)
  }

  // 跳转到第一个有查看权限的文字频道
  static async gotoFirstAccessibleTextChannel(guildId: string) {
    const textChannelId = GuildUtils.getAccessibleChannels(guildId).find(e => e.type == ChannelType.guildText)?.channel_id
    let url = `/channels/${guildId}`
    if (textChannelId) {
      url = `${url}/${textChannelId}`
    }
    await router.navigate(url)
  }

  /**
   * 跳转到社区的某个频道
   * 若传入的channelId不存在，不会自动跳转到第一个可见的文字频道（需自动跳转请使用[gotoFirstAccessibleTextChannel]）
   * @param guildId
   * @param channelId 频道id
   */
  static async gotoChannel(guildId: string, channelId?: string) {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return
    let channel: ChannelStruct | undefined
    if (channelId) {
      channel = guild.channels[channelId]
    }
    channel ??= GuildUtils.getAccessibleChannels(guildId).find(e => e.channel_id == channelId)

    let url = `/channels/${guildId}`
    if (channel) {
      url = `${url}/${channel.channel_id}`
    }
    await router.navigate(url)
  }

  // 跳转到第一个社区
  static gotoFirstGuildOrDiscovery() {
    const firstGuild = (store.getState().guild.list as GuildStruct[])[0]
    if (firstGuild) {
      this.selectGuild(firstGuild.guild_id)
    } else {
      router.navigate(AppRoutes.DISCOVERY, { replace: true }).then()
    }
  }

  static sortChannelList(guild: GuildStruct): void {
    const channelLists = guild.channel_lists ?? []
    const channelMap: { [key: string]: ChannelStruct } = {}
    for (const channel of Object.values(guild.channels)) {
      channelMap[channel.channel_id] = channel
      // 兼容处理 若 channel_lists 缺少, 则补全
      if (!channelLists.includes(channel.channel_id)) {
        channelLists.push(channel.channel_id)
      }
    }

    const orderedChannels: ChannelStruct[] = []
    const orderedCategories: ChannelStruct[] = []
    for (const c of channelLists) {
      if (channelMap[c] && orderedChannels.findIndex(element => element.channel_id === c) < 0) {
        orderedChannels.push(channelMap[c])
        if (channelMap[c].type == ChannelType.Category) {
          orderedCategories.push(channelMap[c])
        }
      }
    }

    const orderedChannels2: ChannelStruct[] = []
    // TODO：parentId 存在几种情况 0 '' null undefined，需统一下
    orderedChannels2.push(
      ...orderedChannels.filter(element => {
        return (
          ['0', '', null, undefined].includes(element.parent_id) && element.type !== ChannelType.Category && element.type !== ChannelType.Metaverse
        )
      })
    )

    // const orderedCategories = orderedChannels.filter((element) => element.type === ChannelType.category)
    for (const c of orderedCategories) {
      if (!orderedChannels2.includes(c)) orderedChannels2.push(c)
      orderedChannels2.push(
        ...orderedChannels.filter(
          element => element.parent_id === c.channel_id && element.type !== ChannelType.Category && element.type !== ChannelType.Metaverse
        )
      )
    }

    const newChannelList = orderedChannels2.map(e => e.channel_id)
    guild.channel_lists = newChannelList
  }

  // static findGuildIndex(guildId: string): number {
  //   return (store.getState().guild.list as GuildStruct[]).findIndex((e) => e.guild_id == guildId)
  // }

  // 主动加入社区
  // 包含请求、选中社区、弹出领取身份组弹窗
  static async joinGuild(args: JoinGuildArgs, autoJumpToGuild: boolean = true) {
    const { data: joinRes } = await GuildAPI.joinGuild(args)
    if (joinRes.code != 1000) {
      switch (joinRes.code) {
        case 1050:
        case 1011:
        case 1010:
        case 1078:
        case 1067:
        case 1100:
        case 1074:
          FbToast.open({ content: joinRes.desc ?? joinRes.message, key: 'join-error' })
          return
        default: {
          return new Promise<void>(resolve => {
            const { destroy: close } = showFbModal({
              type: 'error',
              title: '邀请链接已失效',
              content: '无法加入社区，可能的原因是：邀请码到期或失效、你已被社区拒绝加入、分享者暂无邀请权限。',
              showCancelButton: false,
              okText: '知道了',
              onOk: () => {
                close()
                resolve()
              },
            })
          })
        }
      }
    }
    const { guild_id, channel_id } = args
    const res = await store.dispatch(guildListActions.addGuild(guild_id))
    if (res.payload) {
      const _guild = res.payload as GuildStruct
      if (!autoJumpToGuild) {
        FbToast.open({ content: `已加入社区 「${_guild.name}」`, key: 'guild-join' })
        return
      }
      if (channel_id) {
        await this.gotoChannel(guild_id, channel_id)
      } else {
        await this.gotoFirstAccessibleTextChannel(guild_id)
      }
      // 有领取身份组问卷
      if (_guild.user_pending && [2, 3].includes(_guild.verification_level)) {
        return new Promise<void>(resolve => {
          // 由于首页`RouteListener`同步路由参数有延迟所以需要延迟一会获取当前选中社区id
          setTimeout(() => {
            if (this.getCurrentGuildId() == guild_id) {
              InviteUtils.showRoleQuestionnaireModal({ guildId: guild_id, afterObtain: () => resolve() })
            } else {
              resolve()
            }
          }, 300)
        })
      }
    }
  }

  // 格式化服务端过来的guild数据
  static formatGuildData(guild: GuildStruct) {
    guild.channels = keyBy(guild.channels, 'channel_id')
    for (const cid in guild.channels) {
      guild.channels[cid].overwrite = keyBy(guild.channels[cid].overwrite, 'id')
    }
    guild.roles = keyBy(guild.roles, 'role_id')
    this.sortChannelList(guild)
  }

  static isInGuild(guildId?: string) {
    return guildId ? store.getState().guild.list.findIndex(e => e.guild_id == guildId) != -1 : false
  }

  // 获取频道/分类被删除后的位置列表
  static getPositionsAfterDeleteChannel(guild: GuildStruct, deleteChannelId: string): string[] {
    const channel = guild.channels[deleteChannelId]
    if (!channel) return guild.channel_lists
    // 删除非频道分类
    if (channel.type !== ChannelType.Category) return guild.channel_lists.filter(e => guild.channels[e].channel_id != deleteChannelId)
    // 删除频道分类
    const noParentChannelIds = guild.channel_lists.filter(e => guild.channels[e].parent_id == deleteChannelId)
    const newChannelList = guild.channel_lists.filter(e => e != deleteChannelId && !noParentChannelIds.includes(e))
    const firstCategoryIdx = newChannelList.findIndex(e => guild.channels[e].type === ChannelType.Category)
    const insertIdx = firstCategoryIdx === -1 ? newChannelList.length : firstCategoryIdx
    newChannelList.splice(insertIdx, 0, ...noParentChannelIds)
    return newChannelList
  }

  // 社区是否禁言中
  static isMuted(guild: GuildStruct) {
    return (guild.no_say ?? 0) * 1000 > Date.now()
  }
}
