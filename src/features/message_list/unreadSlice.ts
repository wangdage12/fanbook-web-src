import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type.ts'
import { cloneDeep, get, set } from 'lodash-es'
import { RootState, store } from '../../app/store'
import Ws, { WsAction } from '../../base_services/ws.ts'
import { ChannelPermission, GuildRoleAssignmentEvent, PermissionEvent, PermissionService } from '../../services/PermissionService.ts'
import { ChannelStatusStruct } from '../../ws_handler/ChannelStatusHandler.ts'
import { GuildRoleUpdateStruct } from '../guild_list/guildListSlice.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { GuildUserUtils } from '../role/guildUserSlice.ts'
import MessageService, { SyncUpdateDataToServerStruct } from './MessageService'

export interface ChannelUnreadMention {
  userId: string
  messageId: string
}

interface ChannelUnread {
  num: number
  // 未读消息的起始 id
  startId?: string
  // 应该叫 ReceivedId 比较好，表示曾经接收过的最大的 message id
  latestReadId?: string
  mentions: ChannelUnreadMention[]
}

export type UnreadState = Record<string, Record<string, ChannelUnread>>

const initialState: UnreadState = {}

interface ClearUnreadPayload {
  guildId?: string
  channelId: string
  type?: ChannelType
}

export const DMChannels = [
  ChannelType.DirectMessage,
  ChannelType.CircleNews,
  ChannelType.GuildNotice,
  ChannelType.ActivityCalendar,
  ChannelType.GroupDm,
  // ChannelType.GroupChannel,
]

export const MessageChannels = [ChannelType.guildText, ChannelType.GroupChannel, ...DMChannels]

// 消息来源 push ws action
export const FromPushChannels = [
  ChannelType.guildText,
  ChannelType.DirectMessage,
  ChannelType.GuildNotice,
  ChannelType.GroupDm,
  ChannelType.GroupChannel,
]

const clearUnread = createAsyncThunk('unread/clearUnread', async ({ channelId, type = ChannelType.guildText }: ClearUnreadPayload, { abort }) => {
  if (FromPushChannels.includes(type)) {
    const maximumId = MessageService.instance.getMessages(channelId)?.max()?.toString()
    if (maximumId) return maximumId
    else abort(`There is no message in ${channelId}`)
    return
  }
})
export const unreadSlice = createSlice({
  name: 'unread',
  initialState,
  reducers: {
    /**
     * 将本地未读数和服务端未读数合并
     * @param state
     * @param payload
     */
    mergeUnreadData: (
      state,
      {
        payload: { merge, existingGuildsAndChannels },
      }: PayloadAction<{
        merge: UnreadState
        existingGuildsAndChannels: Record<string, Set<string>>
      }>
    ) => {
      const newState = cloneDeep(state)
      for (const [_guildId, channels] of Object.entries(merge)) {
        const guildId = _guildId ?? '0'
        newState[guildId] ??= {}
        for (const [channelId, { num, startId, latestReadId, mentions }] of Object.entries(channels)) {
          console.assert(channelId != '0', 'BUG!!!1. channel_id should not be 0')
          const unread = (newState[guildId][channelId] ??= {
            num: 0,
            mentions: [],
          })

          unread.num = Math.max(0, unread.num + num)
          unread.startId ??= startId
          unread.latestReadId = latestReadId ?? unread.latestReadId
          unread.mentions.push(...mentions)
        }
      }

      // 如果你要强制修改未读数用来测试，可以在这里覆盖一些值
      // set(newState, ['397721645994737664', '488648418898477056'], {
      //   num: 50,
      //   startId: '532523384681005056',
      //   mentions: [
      // { userId: '135315423557062656', messageId: '527475997914693632' } as ChannelUnreadMention,
      // { userId: '86654728397791232', messageId: '528503599085387776' } as ChannelUnreadMention,
      // ],
      // })

      // 从本地状态中移除 merge 中已经不存在的社区和频道
      for (const [guildId, channels] of Object.entries(newState)) {
        if (!(guildId in existingGuildsAndChannels)) continue

        for (const channelId of Object.keys(channels)) {
          if (!existingGuildsAndChannels[guildId].has(channelId)) {
            // console.debug('[Unread] Remove disappeared channel', guildId, channelId)
            delete newState[guildId][channelId]
          }
        }
      }
      return newState
    },
    increaseUnreadNum: (
      state,
      {
        payload: { guildId, channelId, messageId, mention, onlyShowDot, num = 0 },
      }: PayloadAction<
        ClearUnreadPayload & {
          messageId: string
          mention?: ChannelUnreadMention
          /** 是否仅显示小红点 */
          onlyShowDot?: boolean
          /** 覆盖未读数 */
          num?: number
        }
      >
    ) => {
      console.assert(channelId != '0', 'BUG!!!2. channel_id should not be 0')
      guildId ||= '0'
      // 社区 id 不存在说明是私信
      state[guildId] ??= {}
      state[guildId][channelId] ??= { num: 0, mentions: [] }
      if (state[guildId][channelId].num === 0) {
        state[guildId][channelId].startId ??= messageId
      }
      if (!onlyShowDot) {
        state[guildId][channelId].num++
      } else if (num > 0) {
        state[guildId][channelId].num = Math.max(num, state[guildId][channelId].num)
      }
      state[guildId][channelId].latestReadId = messageId
      if (mention) {
        state[guildId][channelId].mentions.push(mention)
      }
    },
    /**
     * 减少未读数的数量，`withoutCheck` 的意思是不要验证数据，你需要保证你要减少的频道是存在数据的
     *
     * @param state
     * @param guildId     社区 id，如果是私信可不传
     * @param channelId   必须得频道 id
     * @param distance    要较少的未读数的数量
     * @param newStartId  新的未读消息起始位置
     */
    decreaseUnreadNumWithoutCheck: (
      state,
      {
        payload: { guildId, channelId, distance, newStartId },
      }: PayloadAction<
        ClearUnreadPayload & {
          distance: number
          newStartId?: bigint
        }
      >
    ) => {
      guildId ||= '0'
      const old = state[guildId][channelId]
      const mentions = old.mentions
      if (newStartId) {
        for (let i = 0; i < mentions.length; i++) {
          if (BigInt(mentions[i].messageId) <= newStartId) {
            mentions.shift()
          }
        }
      }
      const num = Math.max(0, old.num - distance)
      state[guildId][channelId] = { num, startId: num === 0 ? undefined : newStartId?.toString(), mentions }
    },
    receiveUnreadSyncFromServer(state, { payload: { un_read, read_id, guild_id, channel_id } }: PayloadAction<SyncUpdateDataToServerStruct>) {
      guild_id ||= '0'
      console.assert(channel_id != '0', 'BUG!!!4. channel_id should not be 0')
      const newVal: ChannelUnread = {
        num: un_read ?? 0,
        startId: read_id,
        mentions: [],
      }
      set(state, [guild_id, channel_id], newVal)
    },
    deleteChannel(state, { payload: { guildId, channelId } }: PayloadAction<ClearUnreadPayload>) {
      guildId ||= '0'
      delete state[guildId][channelId]
    },
    updateReceivedId(
      state,
      {
        payload: { guildId, channelId, receivedId },
      }: PayloadAction<{
        guildId?: string | null
        channelId: string
        receivedId: string
      }>
    ) {
      guildId ||= '0'
      if (!state[guildId]) {
        state[guildId] = {}
      }
      if (!state[guildId][channelId]) {
        state[guildId][channelId] = {
          num: 0,
          mentions: [],
        }
      }
      state[guildId][channelId].latestReadId = receivedId
    },
  },
  extraReducers: builder => {
    builder
      .addCase(
        clearUnread.fulfilled,
        (
          state,
          {
            meta: {
              arg: { guildId = '0', channelId, type = ChannelType.guildText },
            },
            payload,
          }
        ) => {
          const newVal: ChannelUnread = {
            num: 0,
            mentions: [],
            startId: undefined,
            latestReadId: MessageChannels.includes(type) ? payload : state[guildId]?.[channelId]?.latestReadId,
          }

          set(state, [guildId, channelId], newVal)
          if (FromPushChannels.includes(type)) {
            MessageService.instance.syncUnreadDataToServer(channelId, undefined, guildId)
          }
        }
      )
      .addCase(clearUnread.rejected, () => {
        // 如果无法取到频道内的消息，会导致此问题，这种情况发生在进入频道时，频道内的消息
        // 还没有加载出来，忽略本次 action 即可。
      })
  },
})

export default unreadSlice.reducer

// actions

export const unreadActions = { ...unreadSlice.actions, clearUnread }

// selectors
export const unreadSelectors = {
  unreadNum: (guildId?: string, channelId?: string) => (state: RootState) => get(state.unread, [guildId ?? '0', channelId ?? '0', 'num'], 0),
  dmUnreadNum: (state: RootState) => {
    const unreadState = state.unread['0']
    if (!unreadState) return 0
    return Object.keys(state.dm.channels).reduce((acc, cur) => {
      acc += unreadState[cur]?.num ?? 0
      return acc
    }, 0)
  },
  unread:
    (guildId?: string, channelId?: string) =>
    (state: RootState): ChannelUnread =>
      get(state.unread, [guildId ?? '0', channelId ?? '0'], {
        num: 0,
        startId: undefined,
        mentions: [],
      } as ChannelUnread),
  guildUnreadStatus: (guildId: string) => (state: RootState) => {
    const guild = state.unread[guildId]
    if (!guild) return { num: false, mentions: 0 }

    return Object.entries(guild).reduce(
      (acc, [cid, cur]) => {
        const cType = GuildUtils.getChannelById(guildId, cid)?.type
        if (cType === ChannelType.PrivateTopic) return acc
        acc.num ||= !!cur.num
        acc.mentions += cur.mentions.length
        return acc
      },
      { num: false, mentions: 0 }
    )
  },
}

export class UnreadHelper {
  static hasData(guildId: string | undefined, channelId: string) {
    return !!get(store.getState().unread, [guildId ?? '0', channelId])
  }

  static getLocalUnread(
    channelId: string,
    guildId?: string
  ): {
    num: number
    startId?: bigint
    latestReadId?: bigint
    mentions: Array<{
      userId: string
      messageId: bigint
    }>
  } {
    const stored = get(store.getState().unread, [guildId ?? '0', channelId], {
      num: 0,
      mentions: [],
    } as ChannelUnread)

    const mentions =
      stored.mentions?.map(e => ({
        ...e,
        messageId: BigInt(e.messageId),
      })) ?? []

    return {
      num: stored.num,
      startId: stored.startId ? BigInt(stored.startId) : undefined,
      latestReadId: stored.latestReadId ? BigInt(stored.latestReadId) : undefined,
      mentions,
    }
  }

  static getUnreadStartId(guildId: string | undefined, channelId: string) {
    guildId ||= '0'
    const unread = store.getState().unread
    if (!unread[guildId]) return undefined
    return unread[guildId][channelId]?.startId
  }

  static clearUnread(channel: ChannelStruct) {
    if ([ChannelType.GuildQuestion, ChannelType.CircleTopic].includes(channel.type)) {
      store.dispatch(
        unreadActions.clearUnread({
          guildId: channel.guild_id,
          channelId: channel.channel_id,
          type: channel.type,
        })
      )
    }
  }
}

/// 监听所有频道的可见性变化，如果不可见了，需要从未读里删掉数据
export function unreadEventInit() {
  const recalculateGuild = (guild_id: string) => {
    const guild = GuildUtils.getGuildById(guild_id)
    if (!guild) return

    for (const { channel_id } of Object.values(guild.channels)) {
      recalculateChannel({ channel_id, guild })
    }
  }
  const recalculateChannel = ({ channel_id, guild }: { channel_id: string; guild: GuildStruct }) => {
    const p = PermissionService.computeChannelPermissions(guild, channel_id, LocalUserInfo.userId)
    if (!p.has(ChannelPermission.ViewChannel) && UnreadHelper.hasData(guild.guild_id, channel_id)) {
      store.dispatch(unreadActions.deleteChannel({ guildId: guild.guild_id, channelId: channel_id }))
    }
  }

  PermissionService.stream.on(PermissionEvent.GuildRoleAssigned, ({ guildId, userId }: GuildRoleAssignmentEvent) =>
    requestAnimationFrame(() => {
      if (userId === LocalUserInfo.userId) {
        recalculateGuild(guildId)
      }
    })
  )
  PermissionService.stream.on(PermissionEvent.OverwriteUpdated, (data: PermissionOverwrite) => {
    requestAnimationFrame(() => {
      const guild = GuildUtils.getGuildById(data.guild_id)
      console.assert(guild, 'BUG!!!. guild should not be undefined')
      if (!guild || !data.channel_id) return

      recalculateChannel({
        channel_id: data.channel_id,
        guild,
      })
    })
  })
  PermissionService.stream.on(PermissionEvent.GuildRoleUpdated, ({ guild_id, roles: role }: GuildRoleUpdateStruct) => {
    requestAnimationFrame(() => {
      const roles = GuildUserUtils.getRoleIds(guild_id, LocalUserInfo.userId)
      // 如果改变的角色包含我的角色，需要重新计算
      if (roles.includes(role.role_id)) {
        recalculateGuild(guild_id)
      }
    })
  })
  Ws.instance.on(WsAction.ChannelStatus, ({ data: { method, guild_id, channel_id } }: { data: ChannelStatusStruct }) => {
    if (method === 'delete' && channel_id) {
      store.dispatch(unreadActions.deleteChannel({ guildId: guild_id, channelId: channel_id }))
    }
  })

  return () => {
    PermissionService.stream.off(PermissionEvent.GuildRoleAssigned)
    PermissionService.stream.off(PermissionEvent.OverwriteUpdated)
    PermissionService.stream.off(PermissionEvent.GuildRoleUpdated)
    Ws.instance.off(WsAction.ChannelStatus)
  }
}
