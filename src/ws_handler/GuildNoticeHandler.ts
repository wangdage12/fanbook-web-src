import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { debounce } from 'lodash-es'
import { store } from '../app/store'
import { UserHelper } from '../components/realtime_components/realtime_nickname/userSlice.ts'
import GuildUtils from '../features/guild_list/GuildUtils'
import { guildListActions } from '../features/guild_list/guildListSlice'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import MessageService from '../features/message_list/MessageService.ts'
import { handleUpdate } from './utils.ts'

export interface GuildNoticeBaseStruct {
  method: 'userQuit' | 'joinGuild' | 'userRem' | 'userJoin' | 'joinSet' | 'upEmoji' | 'update'
  guild_id: string
}

export interface GuildNoticeStruct extends GuildNoticeBaseStruct {
  guild_member_dm_friend_setting?: string
  banner_config?: string
  icon_dynamic?: string
}

export interface GuildUserGuildStruct extends GuildNoticeBaseStruct {
  user_id: string
  operate_id?: string
}

// type GuildUpdateStruct = GuildNoticeStruct & Partial<GuildStruct>

export function handleGuildNotice({ data }: { data: GuildNoticeStruct }) {
  const { method, ..._data } = data
  switch (method) {
    // 社区信息更新
    case 'update': {
      const guildData = _data
      store.dispatch(guildListActions.mergeGuild(handleUpdate<Partial<GuildStruct>>(guildData)))
      break
    }

    // 用户被移出社区（社区有时有推两次ws，加debounce）
    case 'userRem': {
      const quitData = data as GuildUserGuildStruct
      if (quitData.user_id == LocalUserInfo.userId) {
        debounceShowUserRemoveModal(quitData)
        MessageService.instance.clearGuildMessage(quitData.guild_id)
      }
      break
    }

    // 用户主动退出
    case 'userQuit': {
      const quitData = _data as GuildUserGuildStruct
      if (quitData.user_id == LocalUserInfo.userId) {
        store.dispatch(guildListActions.removeGuild(quitData.guild_id))
        if (GuildUtils.getCurrentGuildId() == quitData.guild_id) {
          GuildUtils.gotoFirstGuildOrDiscovery()
        }
        MessageService.instance.clearGuildMessage(quitData.guild_id)
      }
      break
    }

    // 加入社区
    case 'joinGuild': {
      const joinData = _data as GuildUserGuildStruct
      if (joinData.user_id == LocalUserInfo.userId) {
        store.dispatch(guildListActions.addGuild(joinData.guild_id))
      }
      break
    }

    default:
  }
}

const debounceShowUserRemoveModal: (data: GuildNoticeStruct) => void = debounce(data => showUserRemoveModal(data), 100)

async function showUserRemoveModal(quitData: GuildUserGuildStruct) {
  const guildName = GuildUtils.getGuildById(quitData.guild_id)?.name ?? ''
  const username = quitData.operate_id ? (await UserHelper.getUser(quitData.operate_id))?.username ?? '' : ''
  showFbModal({
    type: 'error',
    title: '通知',
    content: `你已被 ${guildName} 的管理员 ${username} 移出该社区，可通过新的邀请链接再次加入。`,
    showCancelButton: false,
    maskClosable: false,
    closable: false,
    okText: '知道了',
    onOk() {
      store.dispatch(guildListActions.removeGuild(quitData.guild_id))
      if (GuildUtils.getCurrentGuildId() == quitData.guild_id) {
        GuildUtils.gotoFirstGuildOrDiscovery()
      }
    },
  })
}
