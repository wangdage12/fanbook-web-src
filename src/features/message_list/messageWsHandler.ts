import {
  GuildNoticeMessageContentStruct,
  MessageStatus,
  MessageStruct,
  MessageType,
  PinnedOperationContentStruct,
  ReactionMessageContentStruct,
  RecallMessageContentStruct,
  TopMessageStruct,
} from 'fb-components/components/messages/types.ts'
import { isNumber } from 'lodash-es'
import { store } from '../../app/store'
import Ws, { WsAction } from '../../base_services/ws'
import StateUtils from '../../utils/StateUtils'
import handleMessageCardKey from '../../ws_handler/MessageCardKeyHandler.ts'
import { ensureChannelExists } from '../dm/dmSlice'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { GuildUserUtils } from '../role/guildUserSlice'
import { topMessageActions } from '../top_message/TopMessageSlice'
import MessageService, { SyncUpdateDataToServerStruct, extractUserInfoFromMessages } from './MessageService'
import MessageUtils from './MessageUtils'
import parseMessage from './transformer'
import { ChannelUnreadMention, DMChannels, MessageChannels, unreadActions } from './unreadSlice'

function handlePinMessage({ content, channel_id, user_id }: MessageStruct<PinnedOperationContentStruct>) {
  MessageService.instance.togglePin({
    channelId: channel_id,
    targetMessageId: BigInt(content.id),
    action: content.action,
    performer: user_id,
  })
}

function handleUpLastRead({ data }: { data: SyncUpdateDataToServerStruct }) {
  store.dispatch(unreadActions.receiveUnreadSyncFromServer(data))
}

// 处理社区公告 转换为 私信逻辑处理
function handleDmGuildNotice(args: { data: MessageStruct<GuildNoticeMessageContentStruct> }) {
  parseMessage(args.data)

  // 私信消息不能有 guild_id
  delete args.data.guild_id
  // 这个地方服务端给的是 i64，需要转成 string
  args.data.channel_id = args.data.channel_id.toString()
  // 描述信息在 content 中，需要把它放到 message 中
  args.data.desc = args.data.content.desc
  Ws.instance.emit(WsAction.Push, args)
}

// 处理互动消息 转换为 私信逻辑处理
// function handleDmInteractiveMsg(args: { data: MessageStruct<GuildNoticeMessageContentStruct> }) {
//   parseMessage(args.data)

//   // 私信消息不能有 guild_id
//   delete args.data.guild_id
//   // 这个地方服务端给的是 i64，需要转成 string
//   args.data.channel_id = args.data.channel_id.toString()
//   // 描述信息在 content 中，需要把它放到 message 中
//   args.data.desc = args.data.content.desc
//   Ws.instance.emit(WsAction.Push, args)
// }

async function handleEphemeralPush({ data }: { data: MessageStruct }) {
  // @ts-expect-error 临时消息特有的字段 user_ids => [user_id, user_id, ...] | 'all'
  const userIds: string[] = Array.isArray(data.user_ids) ? data.user_ids : [data.user_ids]
  const canISee = [LocalUserInfo.userId, 'all'].some(item => userIds.includes(item))
  if (!canISee) return

  data.status = MessageStatus.Ephemeral
  return handlePush({ data })
}

async function handlePush({ data }: { data: MessageStruct }) {
  if (data.channel_type == undefined) {
    return
  }
  parseMessage(data)

  if (data.content.type === MessageType.NewJoinNote) return

  extractUserInfoFromMessages([data])
  if (MessageChannels.includes(data.channel_type)) {
    const isDmMessage = data.channel_type && DMChannels.includes(data.channel_type)
    if (isDmMessage) {
      await ensureChannelExists(data)
    }

    data.fromWs = true
    const { type } = data.content
    // 可显示的实体消息才需要添加到消息列表
    if (MessageUtils.isDisplayableMessage(type)) {
      MessageService.instance.addMessage(data, true)

      // 检查是否包含 @ 我
      let mention: ChannelUnreadMention | undefined
      const localUser = StateUtils.localUser
      const mentionUsersContainsMe = data.mentions?.find(m => m.user_id === localUser.user_id)
      const mentionRolesContainsMe = !!(
        data.guild_id &&
        data.mention_roles?.some(
          id => id === data.guild_id || (data.guild_id && GuildUserUtils.getRoleIds(data.guild_id, localUser.user_id).includes(id))
        )
      )
      if (mentionUsersContainsMe || mentionRolesContainsMe) {
        mention = {
          userId: data.user_id,
          messageId: data.message_id.toString(),
        }
      }

      store.dispatch(
        unreadActions.increaseUnreadNum({
          guildId: data.guild_id,
          channelId: data.channel_id,
          messageId: data.message_id.toString(),
          mention,
          onlyShowDot:
            // 收到不是自己发的消息时，需要递增未读数
            data.user_id === StateUtils.localUser?.user_id ||
            // 当前所处频道接收消息并且处于底部，不需要加未读数，因为会自动滚动
            (MessageService.currentChannel.channelId === data.channel_id &&
              !MessageService.instance.hasMoreNextMessages(data.channel_id) &&
              MessageService.currentChannel.atBottom) ||
            !MessageUtils.shouldIncrementRedDotCount(data.content.type),
        })
      )
    }
    /// 正常非实体消息都会走 WsAction.PUSH_NON_ENTITY 通道，这里处理的是历史问题导致无法迁移的通知
    else {
      Ws.instance.emit(WsAction.PushNonEntity, { data })
    }
  } else {
    if (data.user_id !== LocalUserInfo.userId) {
      // 非消息类型频道的信息通知
      store.dispatch(
        unreadActions.increaseUnreadNum({
          guildId: data.guild_id,
          channelId: data.channel_id,
          messageId: data.message_id.toString(),
        })
      )
    }
  }
}

function handlePinned({ data }: { data: MessageStruct }) {
  Ws.instance.emit(WsAction.PushNonEntity, { data })
}

function handleTop({ data }: { data: MessageStruct }) {
  parseMessage(data)
  store.dispatch(topMessageActions.toggleTop({ ...data, action: WsAction.Top } as TopMessageStruct))
}

function handleUnTop({ data }: { data: MessageStruct }) {
  parseMessage(data)
  store.dispatch(topMessageActions.toggleTop({ ...data, action: WsAction.UnTop } as TopMessageStruct))
}

function handleRecall(message: MessageStruct) {
  const content = message.content as RecallMessageContentStruct

  /// 数字 3 应该是表示敏感消息删除
  if (message.status == 3) {
    if (content.only_user_id !== null && content.only_user_id !== LocalUserInfo.userId) {
      MessageService.instance.deleteMessage(message.guild_id, message.channel_id, BigInt(content.id))
    }
    return
  }

  if (isNumber(content.deleted)) {
    if (
      content.deleted_user == null || // 说明是全员删除
      content.deleted_user === StateUtils.localUser?.user_id // 说明是对当前用户删除
    ) {
      MessageService.instance.deleteMessage(message.guild_id, message.channel_id, BigInt(content.id))
    }
  } else {
    MessageService.instance.recallMessage(message.channel_id, BigInt(content.id), message.user_id)
  }
}

function handlePushNonEntity({ data: message }: { data: MessageStruct }) {
  /// 如果是 WsAction.PUSH 转发过来的，不需要重复解析消息
  if (isNumber(message.time)) parseMessage(message)

  const { type } = message.content
  if (type === MessageType.recall) {
    handleRecall(message)
  } else if (type === MessageType.reaction) {
    const content = message.content as ReactionMessageContentStruct
    content.emoji.name = decodeURIComponent(content.emoji.name)
    MessageService.instance.reactMessage({
      channelId: message.channel_id,
      // performer: data.user_id,
      me: message.user_id === LocalUserInfo.userId,
      action: content.action,
      name: content.emoji.name,
      targetMessageId: BigInt(content.id),
    })
  } else if (type === MessageType.pinned) {
    handlePinMessage(message as MessageStruct<PinnedOperationContentStruct>)
  } else if (type === MessageType.MessageCardOperate) {
    handleMessageCardKey(message as never)
  }
}

function clearMessage() {
  MessageService.instance.clear()
}

export function messageWsInit() {
  Ws.instance.on(WsAction.UpLastRead, handleUpLastRead)
  Ws.instance.on(WsAction.DmGuildNotice, handleDmGuildNotice)

  // 初始化逻辑
  Ws.instance.on(WsAction.Push, handlePush)
  Ws.instance.on(WsAction.EphemeralPush, handleEphemeralPush)
  // Pin 操作 也属于非实体消息，直接转发
  Ws.instance.on(WsAction.Pinned, handlePinned)

  // 置顶操作 也属于非实体消息，直接转发
  Ws.instance.on(WsAction.Top, handleTop)
  Ws.instance.on(WsAction.UnTop, handleUnTop)

  // 非实体消息通知。也就是那些操作消息，比如撤回消息，不会被展示成消息 UI 的那些。
  Ws.instance.on(WsAction.PushNonEntity, handlePushNonEntity)
  Ws.instance.on(WsAction.Init, clearMessage)
  return () => {
    Ws.instance.off(WsAction.UpLastRead, handleUpLastRead)
    Ws.instance.off(WsAction.DmGuildNotice, handleDmGuildNotice)
    // 初始化逻辑
    Ws.instance.off(WsAction.Push, handlePush)
    // Pin 操作 也属于非实体消息，直接转发
    Ws.instance.off(WsAction.Pinned, handlePinned)

    // 置顶操作 也属于非实体消息，直接转发
    Ws.instance.off(WsAction.Top, handleTop)
    Ws.instance.off(WsAction.UnTop, handleUnTop)

    // 非实体消息通知。也就是那些操作消息，比如撤回消息，不会被展示成消息 UI 的那些。
    Ws.instance.off(WsAction.PushNonEntity, handlePushNonEntity)
    Ws.instance.off(WsAction.Init, clearMessage)
  }
}
