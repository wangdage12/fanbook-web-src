import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { pinyin } from 'pinyin-pro'
import { store } from '../../app/store'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { createDirectMessageChannel, updateDmInfo } from './DmAPI'
import { DMChannelStatus, DmChannelStruct, dmActions } from './dmSlice'

export async function generateDMChannel({
  recipientId,
  guildId,
  messageId,
}: {
  recipientId?: string
  guildId?: string
  messageId?: string | bigint
}): Promise<DmChannelStruct | null> {
  if (!recipientId) return null
  // 创建私信频道数据
  const channel = await createChannel(recipientId)
  // 如果进入私信是有来源的，则更新社区的来源
  if (channel) {
    await updateDmInfo(guildId, channel.channel_id)
    // const guild = GuildUtils.getGuildById(guildId)
    // channel.formGuildId = guildId
    // if (guild) {
    //   channel.formGuildName = guildName
    // }
  }
  store.dispatch(dmActions.update({ channel, messageId }))
  return channel
}

export function topExistingDmChannel(recipientId: string) {
  // 已经存在的聊天就不在创建
  const channel = Object.values(store.getState().dm.channels).find(item => item.recipient_id === recipientId)
  if (channel) {
    // 即使数据列表中有了这条数据，也要将它更新到第一的位置。
    if (channel.status !== DMChannelStatus.Active) {
      // const _channel = await createDirectMessageChannel(LocalUserInfo.userId, recipientId)

      return { ...channel, status: DMChannelStatus.Active }
    }
    return channel
  }
}

export async function createChannel(recipientId: string): Promise<DmChannelStruct> {
  // 已经存在的聊天就不在创建
  let channel = topExistingDmChannel(recipientId)
  if (channel) {
    return channel
  }
  // 开始创建频道
  channel = await createDirectMessageChannel(LocalUserInfo.userId, recipientId)
  const { channel_id } = channel

  // 有可能因为网络延迟问题，一个正在创建请求正在进行的时候又来了重复的创建请求，在网络完成时去重会不生效，所以在网络完成后还要做一次去重
  if (channel_id !== null) {
    const localChannel = store.getState().dm.channels[channel_id]
    if (localChannel !== undefined) {
      return localChannel
    }
  }
  return {
    ...createDMChannelStruct(channel_id, recipientId),
    ...channel,
    recipient_id: recipientId,
    status: DMChannelStatus.Active,
  }
}

export const createDMChannelStruct = (channel_id: string, recipient_id: string): DmChannelStruct => {
  return {
    channel_id,
    type: ChannelType.DirectMessage,
    status: DMChannelStatus.Active,
    icon: '',
    guild_id: '',
    name: '',
    parent_id: '',
    stick_sort: 0,
    top: 0,
    top_sort: 0,
    overwrite: {},
    slow_mode: 0,
    announcement_mode: false,
    recipient_id,
  } as DmChannelStruct
}

const pinYinDictionary: Map<string, string> = new Map()

function getShortPinyin(str: string): string {
  const pinyinArray = pinyin(str, {
    pattern: 'first',
    type: 'array',
  })
  return pinyinArray.join('')
}

// function for checking if a string matches another string
export function checkMatch(src: string, check: string): boolean {
  if (!pinYinDictionary.has(src)) {
    pinYinDictionary.set(
      src,
      `${src} ${getShortPinyin(src)} ${pinyin(src, {
        pattern: 'pinyin',
        toneType: 'none',
        type: 'array',
        nonZh: 'consecutive',
        v: true,
      }).join('')}`.toLowerCase()
    )
  }
  check = check.replace(/ /g, '').toLowerCase()
  const dictionary = pinYinDictionary.get(src)
  return dictionary ? dictionary.includes(check) : false
}

// 将此条消息加入到第一的位置
export function insertToFirst(channels: DmChannelStruct[], channel: DmChannelStruct): void {
  const index = channels.findIndex(_channel => _channel.channel_id === channel.channel_id)
  if (index === -1) {
    // 没有找到指定的用户
    return
  }
  // 移除原位置的用户
  channels.splice(index, 1)
  if (channel.stick_sort !== 0) {
    // 如果是置顶用户，将其移动到最上面
    channels.unshift(channel)
  } else {
    // 如果是非置顶用户，找到最后一个置顶用户的索引
    const lastStickIndex = channels.findLastIndex(_channel => _channel.stick_sort !== 0)
    if (lastStickIndex === -1) {
      // 如果没有置顶用户，将其移动到最上面
      channels.unshift(channel)
    } else {
      // 将非置顶用户插入到最后一个置顶用户的后面
      channels.splice(lastStickIndex + 1, 0, channel)
    }
  }
}

// 关闭删除消息频道（不显示）
// export async function closeChannel(item: DmChannelStruct | null, { syncServers = false }: { syncServers?: boolean } = {}): Promise<void> {
//   if (item === null) return
//   if (item.type === DmChannelStructType.dm || item.type === DmChannelStructType.circlePostNews || item.type === DmChannelStructType.circleTogether) {
//     try {
//       // 多端同步的时候不再请求社区
//       if (!syncServers) {
//         await ChannelApi.removeDirectMessageChannel(Global.user.id, item.id)
//       }
//     } catch (e) {
//       logger.info('getChat closeChannel error: $e')
//       // 如果频道不存在，不返回，删除
//       if (e instanceof RequestArgumentError && e.code === 1021) {
//         return
//       }
//     }
//   }
//   const message = InMemoryDb.getMessageList(item.id).lastMessage
//   if (message !== null) {
//     unawaited(ChannelUtil.instance.setUnreadAndSync(message, { sync: true, upNow: true }))
//   }
//   // 不显示聊天 取消置顶
//   if ((item.type === DmChannelStructType.dm || item.type === DmChannelStructType.group_dm || item.type.isCircleTogether) && item.isStop) {
//     await DirectMessageController.to.topChange(false, item)
//   }
//   removeChannelById(item.id)
//   await selectDirectChannel(null)
// }

// 删除频道
// export function removeChannelById(channelId: string): void {
//   Db.deleteChannelImBox(channelId)
//   ChatTable.clearChatHistory(channelId)
//   Db.channelBox.delete(channelId)
//   _channels = _channels.filter((element) => element.id !== channelId)
//   _ids = _channels.map((e) => e.id)
//   _syncFilterChannels()
//   updateUnread()
//   update()
// }
