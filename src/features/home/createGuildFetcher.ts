import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { flatMap } from 'lodash-es'
import { store } from '../../app/store'
import { ChannelPermission, PermissionService } from '../../services/PermissionService.ts'
import StateUtils from '../../utils/StateUtils'
import { getGuildLevel } from '../guild_level/guild-level-slice'
import GuildUtils from '../guild_list/GuildUtils'
import { fetchGuildList } from '../guild_list/guildListAPI'
import { guildListActions } from '../guild_list/guildListSlice'
import MessageService from '../message_list/MessageService'
import { guildUserActions } from '../role/guildUserSlice'

const loadGuildList = (): Promise<GuildStruct[]> => {
  return new Promise(resolve => {
    const { list, listReady } = store.getState().guild
    if (listReady) {
      loadRemoteGuild().then()
      resolve(list)
    } else {
      loadRemoteGuild().then(res => {
        setTimeout(() => {
          resolve(res)
        }, 0)
      })
    }
  })
}
export default loadGuildList

const loadRemoteGuild = async (): Promise<GuildStruct[]> => {
  const list: GuildStruct[] = await fetchGuildList()
  const guildList = list.map(item => {
    const guild: GuildStruct = { ...item, guildPoster: GuildUtils.getGuildById(item.guild_id)?.guildPoster }
    // 这里处理了频道的 channel_lists 可能的问题
    GuildUtils.formatGuildData(guild)
    return guild
  })
  const unread = store.getState().unread
  store.dispatch(guildListActions.updateList(guildList))
  store.dispatch(guildListActions.updateListReady(true))
  store.dispatch(getGuildLevel(guildList.map(guild => guild.guild_id)))
  store.dispatch(
    guildUserActions.batchUpdate(
      guildList.map(e => ({
        guildId: e.guild_id,
        userId: StateUtils.localUser.user_id,
        //@ts-expect-error 兼容处理
        roles: e.user_roles ?? e.userRoles,
      }))
    )
  )
  const guild2channels = Object.fromEntries(
    guildList.map(g => [
      g.guild_id,
      Object.keys(g.channels).filter(c =>
        PermissionService.computeChannelPermissions(g, c, StateUtils.localUser.user_id).has(ChannelPermission.ViewChannel)
      ),
    ])
  )
  MessageService.instance
    .pullOfflineData(
      ChannelType.guildText,
      Object.fromEntries(
        flatMap(list, e => Object.values(e.channels)).map(item => [
          item.channel_id,
          { id: unread[item.guild_id]?.[item.channel_id]?.startId ?? null, type: item.type },
        ])
      ),
      guild2channels,
      guild2channels
    )
    .catch(e => {
      console.error('Failed to pull offline data', e)
    })
  return guildList
}
