import axios from 'axios'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { keyBy } from 'lodash-es'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { InteractiveMessageStruct, InteractiveType } from './DMStruct.ts'
import { DmChannelStruct, DmState } from './dmSlice'

interface DmListResponse {
  time: number
  lists: DmChannelStruct[]
}

// 过滤不支持的频道类型
const excludedTypes = [
  ChannelType.UserFollow,
  ChannelType.GroupDm,
  ChannelType.ActivityCalendar,
  ChannelType.FriendNotification,
  ChannelType.SystemNotification,
  ChannelType.GroupChannel,
  ChannelType.PersonalChannel,
]

export async function getDmList(time?: number): Promise<Pick<DmState, 'time' | 'channels'>> {
  const result = await axios.post<undefined, DmListResponse>(
    '/api/dm/dmList2',
    {
      data: { user_id: LocalUserInfo.userId, last_time: time },
    },
    {
      'axios-retry': {
        retries: Infinity,
      },
    }
  )
  return {
    time: result.time,
    channels: keyBy(
      result.lists
        .filter(item => !('post_type' in item) && !excludedTypes.includes(item.type))
        .map(item => {
          item.type = item.type ?? ChannelType.DirectMessage
          return item
        }),
      item => item.channel_id
    ),
  }
}

export async function removeDirectMessageChannel(userId?: string, channelId?: string): Promise<void> {
  await axios.post(
    '/api/dm/del',
    {
      user_id: userId,
      channel_id: channelId,
    },
    { toast: true }
  )
}

export async function createDirectMessageChannel(userId?: string, recipientId?: string): Promise<DmChannelStruct> {
  const res = await axios.post<undefined, DmChannelStruct>('/api/dm/create', {
    user_id: userId,
    recipient_id: recipientId,
  })
  // 私信频道不能有 guild_id，不知道为什么服务端返回了
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete res.guild_id
  return res
}

//私聊的参数
const ChannelTypeDmNumber = 3
//群组的参数
const ChannelTypeGroupNumber = 10

export async function getRecipientId(channelId: string, isGroup = false): Promise<string> {
  const data = await axios.post<undefined, { recipient_id: string }>('/api/channel/info', {
    channel_id: channelId,
    type: isGroup ? ChannelTypeGroupNumber : ChannelTypeDmNumber,
  })
  const res = data
  return res.recipient_id
}

export async function updateDmInfo(guildId?: string, channelId?: string): Promise<void> {
  await axios.post('/api/channel/upDm', {
    channel_id: channelId,
    from_id: guildId,
  })
}

export async function setTopChannel(channelId: string, isTop: boolean): Promise<void> {
  await axios.post('/api/dm/stick', {
    channel_id: channelId,
    stick: isTop ? 1 : 0,
  })
}

export async function getInteractiveMsg({
  channelId,
  messageId,
  behavior = 'before',
  type,
  size = 20,
}: {
  channelId: string
  messageId?: string
  behavior?: string
  type?: InteractiveType
  size?: number
}): Promise<InteractiveMessageStruct[]> {
  const res = await axios.post<undefined, InteractiveMessageStruct[]>('/api/circleMsg/getList', {
    channel_id: channelId,
    message_id: messageId,
    size,
    behavior,
    type: type === 0 ? undefined : type,
  })
  return res.map(item => {
    try {
      item.message_id = BigInt(item.message_id)
    } catch (err) {
      console.error(err)
    }
    item.quote_id = item.quote_id == '0' ? undefined : item.quote_id
    item.quote_l1 = item.quote_l1 == '0' ? undefined : item.quote_l1
    item.quote_l2 = item.quote_l2 == '0' ? undefined : item.quote_l2
    item.relacted_id = item.relacted_id == '0' ? undefined : item.relacted_id
    return item
  })
}
