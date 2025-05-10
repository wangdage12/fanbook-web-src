import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CircleChannelStruct } from 'fb-components/circle/types'
import { AudiovisualChannelStatus, ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildBanLevelType, GuildStruct, RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type'
import { cloneDeep, keyBy, merge } from 'lodash-es'
import { RootState, store } from '../../app/store'
import { PermissionEvent, PermissionService } from '../../services/PermissionService'
import GuildAPI from '../guild_container/guildAPI'
import { getGuildLevel } from '../guild_level/guild-level-slice'
import { RoleAPI } from '../role/roleAPI'
import GuildUtils from './GuildUtils'

interface GuildListState {
  // 当前选中社区id
  currentGuildId?: string
  // 当前选中频道id
  currentChannelId?: string
  list: GuildStruct[]
  listReady: boolean
  selectedChannelIdMap: { [key: string]: string }
  collapseCateIds: Record<string, boolean>
}

const initialState: GuildListState = {
  currentGuildId: undefined,
  currentChannelId: undefined,
  list: [],
  listReady: false,
  selectedChannelIdMap: {},
  collapseCateIds: {},
}

const fetchingGuild: Record<string, Promise<GuildStruct>> = {}

const addGuild = createAsyncThunk<
  GuildStruct,
  string,
  {
    state: RootState
  }
>('guild/addGuild', async (guildId: string, thunkAPI) => {
  const guild = thunkAPI.getState().guild.list.find(e => e.guild_id == guildId)
  if (guild) return guild
  if (fetchingGuild[guildId] != undefined) {
    return fetchingGuild[guildId]
  }
  // 获取社区助力等级
  store.dispatch(getGuildLevel([guildId]))
  fetchingGuild[guildId] = GuildAPI.getFullGuildInfo(guildId)
    .then(g => {
      g.channels = keyBy(g.channels, 'channel_id')
      return g
    })
    .finally(() => {
      delete fetchingGuild[guildId]
    })
  return fetchingGuild[guildId]
})

const getGuildRoles = createAsyncThunk<
  { guild_id: string; roles: RoleStruct[] },
  {
    guildId: string
    channelId?: string
  },
  { state: RootState }
>('guild/getGuildRoles', async ({ guildId, channelId }) => {
  const roles = await RoleAPI.getRoles({ guildId, channelId })
  return { guild_id: guildId, roles }
})

/**
 * 将一个频道移动到一个分类里，通常入参只需要 channelId 和 categoryId，但是频道的顺序是 `guild.channels_lists` 决定的，所以需要
 * 同时更新这个数组，这个函数就是用于这个目的。
 *
 * @param channels      所有频道的映射，从 `GuildStruct` 获取
 * @param channelList   频道顺序，从 `GuildStruct` 获取
 * @param channelId     需要移动的频道id
 * @param categoryId    目标分类id
 */
function moveChannelToCategory({
  channels,
  channelList,
  channelId,
  categoryId,
}: {
  channels: Record<string, ChannelStruct>
  guildId: string
  channelId: string
  categoryId?: string
  channelList: string[]
}) {
  channelList = [...channelList]
  const removeIndex = channelList.findIndex(e => e === channelId)
  if (removeIndex >= 0) {
    channelList.splice(removeIndex, 1)
  }

  const categoryIndex = channelList.findIndex(e => e === categoryId)
  let insertIndex = categoryIndex + 1
  for (; insertIndex < channelList.length; insertIndex++) {
    const channel = channels[channelList[insertIndex]]
    if (channel.type === ChannelType.Category) {
      break
    }
  }
  if (insertIndex >= 0) {
    channelList.splice(insertIndex, 0, channelId)
  } else {
    channelList.unshift(channelId)
  }
  return channelList
}

export const guildListSlice = createSlice({
  name: 'guild/list',
  initialState: initialState,
  reducers: {
    updateCurrentId: (state, action: PayloadAction<{ guildId: string; channelId?: string }>) => {
      state.currentGuildId = action.payload.guildId
      state.currentChannelId = action.payload.channelId
    },
    updateListReady: (state, action: PayloadAction<boolean>) => {
      state.listReady = action.payload
    },
    updateList: (state, action: PayloadAction<GuildStruct[]>) => {
      // 合并旧数据的圈子信息 避免先调用圈子详情后在调用该函数导致数据丢失 {...action.payload} 避免修改不可变数据
      const nextList = cloneDeep(action.payload).map(item => {
        const prevItem = state.list.find(_item => _item.guild_id == item.guild_id)
        prevItem?.circle && (item.circle = { ...prevItem?.circle, ...item.circle })
        return item
      })
      state.list = nextList
    },
    replaceGuild: (state, { payload }: PayloadAction<GuildStruct>) => {
      const newGuild = payload
      const guildIdx = state.list.findIndex(e => e.guild_id == newGuild.guild_id)
      state.list.splice(guildIdx, 1, newGuild)
    },
    removeGuild: (state, { payload }: PayloadAction<string>) => {
      const guildIdx = state.list.findIndex(e => e.guild_id == payload)
      guildIdx > -1 && state.list.splice(guildIdx, 1)
    },
    mergeGuild: (state, { payload }: PayloadAction<Partial<GuildStruct>>) => {
      const newGuild = payload
      const guild = state.list.find(e => e.guild_id == newGuild.guild_id)
      if (!guild) return
      Object.assign(guild, newGuild)
    },
    mergeChannel: (state, { payload }: PayloadAction<Partial<ChannelStruct> & Pick<ChannelStruct, 'guild_id' | 'channel_id'>>) => {
      const newChannel = payload
      newChannel.type && (newChannel.type = parseInt(newChannel.type as unknown as string))
      const guild = state.list.find(e => e.guild_id == newChannel.guild_id)
      if (!guild) return
      const channel = newChannel.channel_id ? guild.channels[newChannel.channel_id] : null
      if (!channel) return
      Object.assign(channel, newChannel)
      GuildUtils.sortChannelList(guild)
    },

    // 用于更新圈子频道信息
    mergeCircleChannel: (state, data: PayloadAction<Partial<CircleChannelStruct> & Pick<CircleChannelStruct, 'guild_id' | 'channel_id'>>) => {
      const newChannel = data.payload
      const guild = state.list.find(e => e.guild_id == newChannel.guild_id)
      if (!guild) return
      Object.assign(guild.circle, newChannel)
    },

    // 给圈子话题频道改版使用的，在点击旧版本圈子话题频道时，通过这个方法会被替换为新版链接频道
    replaceChannelInPosition: (
      state,
      {
        payload: { from, channel },
      }: PayloadAction<{
        from: string
        channel: ChannelStruct
      }>
    ) => {
      const guild = state.list.find(e => e.guild_id == channel.guild_id)
      if (!guild) return
      delete guild.channels[from]
      guild.channels[channel.channel_id] = channel
      const position = guild.channel_lists.indexOf(from)
      if (position > -1) {
        guild.channel_lists.splice(position, 1, channel.channel_id)
      } else {
        guild.channel_lists.unshift(channel.channel_id)
      }
    },

    deleteChannel: (
      state,
      {
        payload: { channel, channel_lists },
      }: PayloadAction<{
        channel: ChannelStruct
        channel_lists?: string[]
      }>
    ) => {
      const { guild_id, channel_id } = channel
      const guild = state.list.find(e => e.guild_id == guild_id)
      if (!guild) return
      const channelData = guild.channels[channel_id]
      if (!channelData) return
      delete guild.channels[channel_id]
      if (channel.type === ChannelType.Category) {
        Object.values(guild.channels)
          .filter(e => e.parent_id == channel_id)
          .forEach(e => {
            e.parent_id = '0'
          })
      }
      channel_lists && (guild.channel_lists = channel_lists)
    },
    /// 通用的更新频道任意字段的函数，如果用到其他的，尽可能改成这个
    updateChannel: (state, { payload }: PayloadAction<Partial<ChannelStruct>>) => {
      const guild = state.list.find(e => e.guild_id == payload.guild_id)
      if (!guild) return
      const channel = payload.channel_id ? guild.channels[payload.channel_id] : null
      if (!channel) return

      if ('parent_id' in payload && payload.parent_id !== channel.parent_id) {
        guild.channel_lists = moveChannelToCategory({
          channels: guild.channels,
          channelList: guild.channel_lists,
          guildId: guild.guild_id,
          channelId: channel.channel_id,
          categoryId: payload.parent_id as never,
        })
      }

      Object.assign(channel, payload)
    },

    updateChannelState: (
      state,
      action: PayloadAction<{
        guildId: string
        channelId: string
        state: AudiovisualChannelStatus
      }>
    ) => {
      const guild = state.list?.find(item => item.guild_id === action.payload.guildId)
      if (guild) {
        const channel = guild.channels[action.payload.channelId]
        if (channel) {
          channel.active = action.payload.state
        }
      }
      state.list = state.list ? [...state.list] : []
    },
    updateSelectedChannelId: (state, action: PayloadAction<[string, string]>) => {
      state.selectedChannelIdMap[action.payload[0]] = action.payload[1]
    },
    toggleCollapseCate: (state, action: PayloadAction<string>) => {
      const cateId = action.payload
      if (state.collapseCateIds[cateId]) {
        delete state.collapseCateIds[cateId]
        state.collapseCateIds = { ...state.collapseCateIds }
      } else {
        state.collapseCateIds[cateId] = true
        state.collapseCateIds = { ...state.collapseCateIds }
      }
    },
    updateGuild: (state, action: PayloadAction<Partial<GuildStruct>>) => {
      const guildIdx = (state.list || []).findIndex(e => e.guild_id == action.payload.guild_id)
      const guild = state.list[guildIdx]
      state.list = [...state.list.slice(0, guildIdx), { ...guild, ...action.payload }, ...state.list.splice(guildIdx + 1, state.list.length)]
    },
    updateChannelPermission(state, { payload: { id, guild_id, channel_id, allows, deny, action_type } }: PayloadAction<PermissionOverwrite>) {
      const guild = state.list.find(g => g.guild_id === guild_id)
      if (!guild) return
      const channel = guild.channels?.[channel_id ?? ''] ?? (guild.circle?.channel_id === channel_id ? guild.circle : undefined)
      const overwrites = channel?.overwrite
      console.assert(overwrites, 'updateChannelPermission: overwrites must be initialized')
      if (!overwrites) return
      overwrites[id] =
        !overwrites[id] ?
          { id, guild_id, channel_id, allows, deny, action_type }
        : {
            ...overwrites[id],
            allows,
            deny,
          }
    },
    updateRole(
      state,
      {
        payload: { guild_id, roles: role },
      }: PayloadAction<{
        guild_id: string
        roles: RoleStruct
      }>
    ) {
      const index = state.list.findIndex(g => g.guild_id === guild_id)
      if (index > -1) {
        const guild = state.list[index]
        guild.roles = {
          ...guild.roles,
          [role.role_id]: {
            ...guild.roles[role.role_id],
            ...role,
          },
        }
      }
    },
    updateRoles(
      state,
      {
        payload: { guild_id, roles },
      }: PayloadAction<{
        guild_id: string
        roles: RoleStruct[]
      }>
    ) {
      const index = state.list.findIndex(g => g.guild_id === guild_id)
      if (index > -1) {
        const guild = state.list[index]
        // 深度合并
        guild.roles = merge(guild.roles, keyBy(roles, 'role_id'))
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addGuild.fulfilled, (state, { meta: { arg: guildId }, payload }) => {
        const guild = state.list?.find(item => item.guild_id === guildId)
        if (guild) return
        GuildUtils.formatGuildData(payload)
        state.list.unshift(payload)
      })
      .addCase(getGuildRoles.fulfilled, (state, { payload }) => {
        guildListSlice.caseReducers.updateRoles(state, { payload, type: 'guild/list/updateRole' })
      })
  },
})

export default guildListSlice.reducer

// selectors
export const guildListSelectors = {
  showLoading: (state: RootState) => !state.guild.listReady,
  selectGuildList: (state: RootState) => state.guild.list,
  currentGuildId: (state: RootState) => state.guild.currentGuildId,
  collapseCateIds: (state: RootState) => state.guild.collapseCateIds,
  guild: (guildId?: string, returnDefault?: boolean) => (state: RootState) => {
    const guild = guildId ? state.guild.list.find(e => e.guild_id === guildId) : undefined
    if (guild) {
      return guild
    }
    if (returnDefault) {
      return state.guild.list.find(e => e.banned_level != GuildBanLevelType.Dismiss)
    }
  },
  roles: (guildId?: string) => (state: RootState) => {
    return guildId ? state.guild.list.find(e => e.guild_id === guildId)?.roles : undefined
  },
  rootRole: (guildId?: string) => (state: RootState) => {
    const roles = guildListSelectors.roles(guildId)(state)
    return roles ? Object.values(roles).find(role => role.t == RoleType.Owner) : undefined
  },
  channelSlowMode: (guildId: string | undefined, channelId?: string) => {
    return (state: RootState) => {
      if (!guildId) return undefined
      return channelId ? state.guild.list.find(e => e.guild_id === guildId)?.channels?.[channelId]?.slow_mode : undefined
    }
  },

  // permissionOverwrites: (state: RootState) => (guildId: string, channelId: string, overwriteId: string) => {
  //   return state.guild.list
  //     .find((e) => e.guildId === guildId)
  //     ?.channels.find((c) => c.channelId === channelId)
  //     ?.overwrite.find((o) => o.id === overwriteId)
  // },
  // permission: (guildId: string) => (state: RootState) => state.guild.list.find((e) => e.guildId === guildId)?.permissions ?? 0,
}

export const guildListActions = { ...guildListSlice.actions, addGuild, getGuildRoles }

// 监听社区的角色信息发生修改
export interface GuildRoleUpdateStruct {
  guild_id: string
  roles: RoleStruct
}

export interface GuildRolesUpdateStruct {
  guild_id: string
  roles: RoleStruct[]
}

export const handleCircleUpdate = ({ data }: { data: CircleChannelStruct }) => {
  store.dispatch(guildListActions.mergeCircleChannel(data))
  PermissionService.stream.emit(PermissionEvent.GuildCircleUpdated, data)
}

export const handleRoleUpdate = ({ data }: { data: GuildRoleUpdateStruct }) => {
  store.dispatch(guildListActions.updateRole(data))
  PermissionService.stream.emit(PermissionEvent.GuildRoleUpdated, data)
}

export const handleRolesUpdate = ({ data }: { data: GuildRolesUpdateStruct }) => {
  store.dispatch(guildListActions.updateRoles(data))
  PermissionService.stream.emit(PermissionEvent.GuildRoleUpdated, data)
}

export const handleVoiceStateUpdate = ({
  channel_id,
  guild_id,
  data: { active },
}: {
  channel_id: string
  guild_id: string
  data: { active: AudiovisualChannelStatus }
}) => {
  store.dispatch(
    guildListActions.updateChannelState({
      channelId: channel_id,
      guildId: guild_id,
      state: active,
    })
  )
}

export const handleSilenceStateUpdate = ({ data: { guild_id, endtime } }: { data: { guild_id: string; endtime: number } }) => {
  store.dispatch(
    guildListActions.updateGuild({
      guild_id,
      no_say: endtime > 0 ? Date.now() / 1000 + endtime : endtime,
    })
  )
}
