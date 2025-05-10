import { FB_MP_WEB_SDK_BRIDGE_CLOSE } from 'fanbook-sdk/src/bridge'
import { FbEvent } from 'fanbook-sdk/src/event'
import { getRandomString } from 'fanbook-sdk/src/utils'
import FbToast from 'fb-components/base_ui/fb_toast'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType'
import AppRoutes from '../../app/AppRoutes'
import { router } from '../../app/router'
import LinkHandlerPresets from '../../services/link_handler/LinkHandlerPresets'
import StateUtils from '../../utils/StateUtils'
import { DmHelper } from '../dm/dmSlice'
import GuildUtils from '../guild_list/GuildUtils'
import { MPInstances, openMiniProgram, physicalHeight, physicalWidth } from './util'

// 宿主小程序通信实例
export let FbEventInstance: FbEvent

export function initFbEvent() {
  if (FbEventInstance) {
    return FbEventInstance
  }

  const uniqueId = getRandomString(8)
  FbEventInstance = new FbEvent(
    { mode: 'host', uniqueId, channelName: uniqueId },
    {
      [FB_MP_WEB_SDK_BRIDGE_CLOSE]: ({ from }) => {
        const mpInstance = MPInstances[from]
        if (mpInstance) {
          delete MPInstances[from]
        }
      },
      getSystemInfo: () => {
        return {
          textScaleFactor: 1,
          devicePixelRatio: window.devicePixelRatio,
          locale: {
            countryCode: 'CN',
            languageCode: 'zh',
          },
          physicalSize: {
            width: physicalWidth,
            height: physicalHeight,
          },
          platformBrightness: 'light',
          viewPadding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          },
        }
      },
      getCurrentGuild: ({ from }) => {
        const { guildId: originGuildId } = MPInstances[from] ?? {}
        const guildId = originGuildId ?? GuildUtils.getCurrentGuildId()
        if (guildId) {
          const guild = GuildUtils.getGuildById(guildId)
          if (guild) {
            return {
              id: guild.guild_id,
              name: guild.name,
              ownerId: guild.owner_id,
            }
          }
        }
      },
      getCurrentChannel: ({ from }) => {
        const { guildId: originGuildId, channelId: originChannelId } = MPInstances[from] ?? {}

        if (originChannelId) {
          const dm = DmHelper.getChannel(originChannelId)
          if (dm) {
            return {
              id: dm.channel_id,
            }
          }
        }

        const channel = originChannelId ? GuildUtils.getChannelById(originGuildId, originChannelId) : GuildUtils.getCurrentChannel()
        if (channel) {
          return {
            id: channel.channel_id,
            name: channel.name,
          }
        }
      },
      getUserToken: () => {
        return { token: StateUtils.localUser.sign }
      },
      getUserInfo: () => {
        const user = StateUtils.localUser
        if (user) {
          return {
            userId: user.user_id,
            nickname: user.nickname,
            avatar: user.avatar,
            gender: user.gender,
            shortId: user.username,
          }
        }
      },
      isFromDmChannel: ({ from }) => {
        return MPInstances[from]?.isFromDM
      },
      getDmChannel({ from }) {
        const { channelId: originChannelId } = MPInstances[from] ?? {}
        const channel = originChannelId ? DmHelper.getChannel(originChannelId) : null
        if (channel) {
          return {
            id: channel.channel_id,
            type: channel.type,
            name: channel.name,
          }
        }
      },
      getAppVersion: () => {
        return import.meta.env.FANBOOK_VERSION ?? '1.0.0'
      },
      jump: (
        { from },
        option: {
          scene: string
          guildId?: string
          target?: string
          channelId?: string
          topicId?: string
          url?: string
        }
      ) => {
        const { guildId: originGuildId, channelId: originChannelId, isFromDM: originIsFromDM } = MPInstances[from] ?? {}
        if (typeof option !== 'object') return

        const scene: string = option['scene'] ?? 'guild'

        function openChatTarget(guildId: string, channelId?: string) {
          const pathUrl = channelId ? `${guildId}/${channelId}` : guildId
          router.navigate(`${AppRoutes.CHANNELS}/${pathUrl}`).then()
        }

        switch (scene) {
          case 'guild': {
            const guildId = option['guildId']
            const guild = GuildUtils.getGuildById(guildId)
            if (!guild) {
              FbToast.open({ content: '请先加入社区' })
              return
            }

            const target = option['target']
            switch (target) {
              case 'channel': {
                const channelId = option['channelId']
                openChatTarget(guild.guild_id, channelId)
                break
              }
              case 'circle': {
                const topicId = option['topicId']
                const search = topicId ? `?topicId=${topicId}` : ''
                router.navigate(`${AppRoutes.CHANNELS}/${guild.guild_id}/${AppRoutes.CIRCLE}${search}`).then()
                break
              }
              default:
                openChatTarget(guild.guild_id)
            }
            break
          }
          case 'appMarket':
            FbToast.open({ content: 'Fanbook web 端不支持打开应用市场, 请使用移动端打开' })
            break
          case 'link': {
            const url = option['url']
            if (url) {
              LinkHandlerPresets.instance.common.handleUrl(url, {
                guildId: originGuildId,
                channelId: originChannelId,
                isFromDM: originIsFromDM,
              })
            }
            break
          }
          case 'miniProgram':
            FbToast.open({ content: 'Fanbook web 端不支持打开微信小程序, 请使用移动端打开' })
            return
        }
      },
      openMiniProgram: ({ from }, option: { appId: string }) => {
        const { guildId, channelId, isFromDM } = MPInstances[from] ?? {}
        window.focus()
        // 通过小程序打开小程序时, 环境变量要传递下去
        return openMiniProgram(option.appId, { guildId, channelId, isFromDM })
      },
      uploadFile: async (_, option: string[]) => {
        if (!option || option.length < 3) return ''

        const [base64Str, fileName, fileType] = option

        let fType = CosUploadFileType.unKnow
        switch (fileType.trim().split('/')[0]) {
          case 'image':
            fType = CosUploadFileType.image
            break
          case 'video':
            fType = CosUploadFileType.video
            break
          case 'doc':
            fType = CosUploadFileType.doc
            break
          case 'audio':
            fType = CosUploadFileType.audio
            break
          case 'live':
            fType = CosUploadFileType.live
            break
          default:
            break
        }
        const url = await UploadCos.getInstance().uploadFile({ file: base64Str, fileName, fileType, type: fType })
        return url
      },
    }
  )
  window.addEventListener('unload', () => {
    FbEventInstance.destroy()
  })
  //@ts-expect-error 临时挂载到 window 上 debug
  window.FbEventInstance = FbEventInstance
  //@ts-expect-error 临时挂载到 window 上 debug
  window.MPInstances = MPInstances
  return FbEventInstance
}
