import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { isNil, mapValues, maxBy, omitBy, orderBy } from 'lodash-es'
import { matchPath } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes.ts'
import { router } from '../../app/router.tsx'
import { RootState, store } from '../../app/store'
import { convertSnowflakeToDate } from '../../utils/snowflake_generator.ts'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import MessageService from '../message_list/MessageService'
import { getDmList, getRecipientId } from './DmAPI'
import { InteractiveMessageStruct, InteractiveMessageType } from './DMStruct.ts'
import { createDMChannelStruct, generateDMChannel, insertToFirst, topExistingDmChannel } from './utils'

export enum SpecialRecipientId {
  GuildNotice = '1',
  CircleNews = '2',
  UserFollow = '3',
  ActivityCalendar = '4',
}

export enum DMChannelStatus {
  Active,
  Inactive,
}

export interface DmChannelStruct extends ChannelStruct {
  icon: string
  // offline: 0
  recipient_id?: string
  status: DMChannelStatus
  stick_sort: number
  top: number
  top_sort: number
  // user_icon: []
}

export interface DmState {
  isFetching: boolean
  isShowRisk: boolean
  // 记录上一次私信频道的 id, 用于展示上一次的私信频道
  lastChannelId?: string
  // 从私信跳转过来时，需要将该私信置顶
  temporaryPinChannel?: DmChannelStruct
  channels: Record<string, DmChannelStruct>
  time: number
  // ws 新增的互动消息列表
  interactiveMsgList: InteractiveMessageStruct[]
}

const initialState: DmState = { isShowRisk: true, isFetching: false, channels: {}, time: 0, interactiveMsgList: [] }

const fetchDmList = createAsyncThunk('dm/fetchDmList', async (time: number) => {
  const result = await getDmList(time > 0 ? time : undefined)
  const unread = store.getState().unread
  const { channels } = result

  MessageService.instance
    .pullOfflineData(
      ChannelType.DirectMessage,
      mapValues(
        omitBy(channels, c => c.status === DMChannelStatus.Inactive),
        item => ({ id: unread[item.guild_id]?.[item.channel_id]?.startId ?? null, type: item.type })
      ),
      { '0': Object.values(channels).map(c => c.channel_id) }
    )
    .catch(e => {
      console.error('Failed to pull offline data', e)
    })
  return result
})

const dmSlice = createSlice({
  name: 'dm',
  initialState,
  reducers: {
    update: (
      state: DmState,
      {
        payload: {
          channel: { channel_id, ...rest },
          messageId,
          isStick,
        },
      }: PayloadAction<{
        channel: Partial<DmChannelStruct> & { channel_id: string }
        messageId?: string | bigint
        isStick?: boolean
      }>
    ) => {
      const originChannel = state.channels[channel_id]
      if (isNil(isStick)) {
        // 如果没有传入 isStick，则使用原来的值
        isStick = originChannel ? originChannel.stick_sort > 0 : false
      }
      let sort: number | undefined
      if (messageId) {
        try {
          sort = convertSnowflakeToDate(BigInt(messageId)) / 1000
        } catch (error) {
          console.error(`[MessageService] Failed to create dm channel due to ${error}`)
        }
      }
      const extra =
        !isNil(sort) ?
          isStick ?
            {
              stick_sort: sort,
              top: sort,
              top_sort: sort,
            }
          : { top_sort: sort, top: sort }
        : {}
      state.channels[channel_id] = { ...state.channels[channel_id], channel_id: channel_id, ...rest, ...extra }
      return state
    },
    lastChannelId: (state, { payload }: PayloadAction<string>) => {
      state.lastChannelId = payload
    },
    temporaryPin: (state, { payload }: PayloadAction<DmChannelStruct | undefined>) => {
      state.temporaryPinChannel = payload
    },
    hideRisk: state => {
      state.isShowRisk = false
    },
    addInteractiveMsg: (state, { payload }: PayloadAction<InteractiveMessageStruct>) => {
      // 同步消息时如果是删除需要修改之前消息的状态
      switch (payload.circle_type) {
        case InteractiveMessageType.postDel:
        case InteractiveMessageType.questionCancel:
          state.interactiveMsgList = state.interactiveMsgList.map(item => {
            if (item.post_id === payload.post_id) {
              item.post_status = SwitchType.No
              item.comment_status = SwitchType.No
              item.quote_status = SwitchType.No
            }
            return item
          })
          break
        case InteractiveMessageType.commentDel:
        case InteractiveMessageType.questionAnswerCancel:
        case InteractiveMessageType.answerAnswerCancel:
        case InteractiveMessageType.replyCommentCancel:
          state.interactiveMsgList = state.interactiveMsgList.map(item => {
            // 删除评论时，需要将评论的状态置为已删除
            if (item.relacted_id === payload.relacted_id) {
              item.comment_status = SwitchType.No
            }
            // 删除评论时，需要将引用该评论的评论状态置为已删除
            if ([item.quote_id, item.quote_l1, item.quote_l2].includes(payload.relacted_id)) {
              item.comment_status = SwitchType.No
              item.quote_status = SwitchType.No
            }
            return item
          })
          break
        default:
          break
      }

      state.interactiveMsgList.unshift(payload)
    },
    clearInteractiveMsg: state => {
      state.interactiveMsgList = []
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDmList.pending, state => {
        state.isFetching = true
      })
      .addCase(fetchDmList.fulfilled, (state, action) => {
        return { ...state, ...action.payload, isFetching: false }
      })
      .addCase(fetchDmList.rejected, state => {
        state.isFetching = false
      })
  },
})

export default dmSlice.reducer

export const dmActions = {
  fetchDmList,
  ...dmSlice.actions,
}

export const dmSelectors = {
  isShowRisk: (state: RootState) => state.dm.isShowRisk,
  isDMFetching: (state: RootState) => state.dm.isFetching,
  time: (state: RootState) => state.dm.time,
  channel: (channelId: string) => (state: RootState) => state.dm.channels[channelId],
  sortedChannels: (state: RootState) => {
    const channels = orderBy(Object.values(state.dm.channels), ['stick_sort', 'top_sort'], ['desc', 'desc'])
    if (state.dm.temporaryPinChannel) {
      insertToFirst(channels, state.dm.temporaryPinChannel)
    }
    return channels
  },
  interactiveMsgList: (state: RootState) => state.dm.interactiveMsgList,
}

export class DmHelper {
  static getLastDm(): DmChannelStruct | undefined {
    const dm = store.getState().dm
    // 如果有上一次的私信频道，且该频道是激活状态，则返回该频道
    if (dm.lastChannelId) {
      const channel = dm.channels[dm.lastChannelId]
      if (channel && channel.status === DMChannelStatus.Active) {
        return channel
      }
    }
    return maxBy(
      // 过滤掉已经删除的私信
      Object.values(store.getState().dm.channels).filter(channel => channel.status === DMChannelStatus.Active),
      e => e.top_sort
    )
  }

  static getChannel(channelId: string): DmChannelStruct | undefined {
    return store.getState().dm.channels[channelId]
  }

  static getLastChannelId(): string | undefined {
    return store.getState().dm.lastChannelId
  }
}

export function handleDmTop({ data }: { data: { channel_id: string; stick_sort: number; top_sort: number } }) {
  store.dispatch(dmActions.update({ channel: data }))
  store.dispatch(dmActions.temporaryPin())
}

export function handleDmDel({ data }: { data: { channel_id: string } }) {
  store.dispatch(dmActions.update({ channel: { ...data, status: DMChannelStatus.Inactive } }))
  store.dispatch(dmActions.temporaryPin())

  if (matchPath(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${data.channel_id}`, window.location.pathname)) {
    router.navigate(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}`).then()
  }
}

export async function ensureChannelExists(data: { channel_id: string; message_id: string | bigint; channel_type?: ChannelType; user_id?: string }) {
  if (data.channel_type == undefined) {
    return
  }
  // 这些特殊的私信不是能被用户创建的私信，它们的 recipient id 都是常量
  const specialChannels: Partial<Record<ChannelType, SpecialRecipientId>> = {
    [ChannelType.GuildNotice]: SpecialRecipientId.GuildNotice,
    [ChannelType.CircleNews]: SpecialRecipientId.CircleNews,
    [ChannelType.UserFollow]: SpecialRecipientId.UserFollow,
    [ChannelType.ActivityCalendar]: SpecialRecipientId.ActivityCalendar,
  }

  if (data.channel_type in specialChannels) {
    const recipientId = specialChannels[data.channel_type] as string
    let channel = topExistingDmChannel(recipientId)
    if (!channel) {
      channel = {
        ...createDMChannelStruct(data.channel_id, recipientId),
        type: data.channel_type,
      }
    }
    store.dispatch(dmActions.update({ channel, messageId: data.message_id }))
  } else {
    let recipientId = data.user_id
    if (recipientId === LocalUserInfo.userId) {
      recipientId = await getRecipientId(data.channel_id)
    }
    try {
      await generateDMChannel({ recipientId, messageId: data.message_id })
    } catch (err) {
      console.error(`[MessageService] Failed to create dm channel due to ${err}`)
    }
  }
}
