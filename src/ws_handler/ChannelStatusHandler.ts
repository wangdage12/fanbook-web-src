import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type'
import { cloneDeep, keyBy } from 'lodash-es'
import { store } from '../app/store'
import { UserStruct } from '../components/realtime_components/realtime_nickname/UserAPI'
import { UserHelper } from '../components/realtime_components/realtime_nickname/userSlice'
import { DMChannelStatus, dmActions } from '../features/dm/dmSlice'
import { createDMChannelStruct } from '../features/dm/utils'
import GuildUtils from '../features/guild_list/GuildUtils'
import { guildListActions } from '../features/guild_list/guildListSlice'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import StateUtils from '../utils/StateUtils'

export interface ChannelStatusStruct {
  method: 'create' | 'createPrivate' | 'circle_update' | 'update' | 'delete' | 'positions' | 'dm_create'
  guild_id: string
  recipients?: UserStruct[]
  channel_id?: string
}

interface ChannelPositionsStruct extends ChannelStatusStruct {
  positions: string[]
  categroup?: Record<string, string>
}

// interface UpdatedAt {
//   type: Type
//   seconds: number
//   microseconds: number
// }

// export interface Type {
//   name: string
// }

interface ChannelDeleteStruct extends ChannelStatusStruct {
  channel_id: string
  operate_id: string
}

type ChannelCreateStruct = ChannelStatusStruct & ChannelStruct & { permission_overwrites: PermissionOverwrite[] }

type ChannelUpdateStruct = ChannelStatusStruct & ChannelStruct

export async function handleChannelStatus({ data }: { data: ChannelStatusStruct }) {
  const { method, guild_id } = data
  const guild = GuildUtils.getGuildById(guild_id)
  if (!guild) return
  const newGuild: GuildStruct = cloneDeep(guild)
  switch (method) {
    case 'create':
    case 'createPrivate': {
      const channel = cloneDeep(data) as ChannelCreateStruct
      channel.overwrite = keyBy(channel.permission_overwrites, 'id')
      const channelId = channel.channel_id
      if (newGuild.channel_lists.includes(channelId)) return
      newGuild.channel_lists.push(channelId)
      newGuild.channels[channel.channel_id] = channel
      GuildUtils.sortChannelList(newGuild)
      store.dispatch(guildListActions.replaceGuild(newGuild))
      break
    }

    case 'delete': {
      const { channel_id, operate_id } = data as ChannelDeleteStruct
      const channel = GuildUtils.getChannelById(guild_id, channel_id)
      if (!channel) return
      newGuild.channel_lists = GuildUtils.getPositionsAfterDeleteChannel(newGuild, channel_id)
      delete newGuild.channels[channel_id]
      store.dispatch(guildListActions.replaceGuild(newGuild))
      const currentChannelId = GuildUtils.getCurrentChannelId()
      if (currentChannelId != channel_id) return
      if (operate_id == StateUtils.localUser.user_id) {
        GuildUtils.gotoFirstAccessibleTextChannel(guild_id).then()
      } else {
        const user = await UserHelper.getUser(operate_id, guild_id)
        showFbModal({
          title: `${channel?.name} 已被 ${user?.gnick ?? user?.nickname} 删除`,
          closable: false,
          showCancelButton: false,
          maskClosable: false,
          keyboard: false,
          onOk() {
            GuildUtils.gotoFirstAccessibleTextChannel(guild_id)
          },
          onCancel() {
            GuildUtils.gotoFirstAccessibleTextChannel(guild_id)
          },
        })
      }
      break
    }
    case 'positions': {
      const { categroup, positions } = data as ChannelPositionsStruct
      newGuild.channel_lists = positions
      Object.entries(categroup ?? {}).forEach(([key, value]) => {
        const channel = GuildUtils.getChannelById(newGuild, key)
        if (channel) {
          channel.parent_id = value
        }
      })
      GuildUtils.sortChannelList(newGuild)
      store.dispatch(guildListActions.replaceGuild(newGuild))
      break
    }
    case 'update': {
      const channelData = data as ChannelUpdateStruct
      store.dispatch(guildListActions.mergeChannel(channelData))

      break
    }
    case 'circle_update':
      // This is deprecated
      break
    case 'dm_create': {
      ///如果是其他端创建了私聊频道，会通过这条ws消息同步创建信息
      let recipientId = ''
      data.recipients?.forEach(user => {
        const userId = user.user_id
        if (userId && userId !== LocalUserInfo.userId) {
          recipientId = userId
        }
      })
      if (!data.channel_id || !recipientId) {
        return
      }
      const channel = store.getState().dm.channels[data.channel_id] || createDMChannelStruct(data.channel_id, recipientId)
      store.dispatch(
        dmActions.update({
          channel: {
            ...channel,
            recipient_id: recipientId,
            status: DMChannelStatus.Active,
          },
        })
      )
      break
    }
    default:
  }
}
