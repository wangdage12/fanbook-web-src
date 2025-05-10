import { TopLevelBlock } from '@contentful/rich-text-types/dist/types/types'
import type { Dayjs } from 'dayjs'
import { ChannelType } from '../../struct/ChannelStruct'
import { ReactionStruct, SimpleUserStruct } from '../../struct/type'

export enum MessageType {
  start = 'start',
  Welcome = 'newJoin',
  text = 'text',
  RichText = 'richText',
  image = 'image',
  sticker = 'stickerEntity',
  Voice = 'voice',
  video = 'video',
  recall = 'recall',
  reaction = 'reaction',
  pinned = 'pinned',
  top = 'top', // 置顶消息操作
  Friend = 'friend', // 成为好友后产生的消息
  GuildNotice = 'userGuildNotice', // 私信的社区通知消息
  RedPacket = 'redPacket',
  CircleShare = 'circleShareEntity',
  QuestionShare = 'questionShare',
  AnswerShare = 'answerShare',
  ActivityShare = 'activityShare',
  // 邀请多人加入
  MultiJoin = 'multi_join',
  // 这个类型的数据没有 channelId，看过去应该是社区级别的加入通知，目前没有用到
  NewJoinNote = 'newJoinNote',
  // 个人频道新的图片布局消息卡片
  GraphicMixing = 'graphic-mixing',
  // 系统主动删除通知
  DelMsgNotice = 'delMsgNotice',
  MessageCard = 'messageCard',
  MessageCardOperate = 'messageCardOperate',
  File = 'file',
  Unsupported = 'unsupported',
}

/**
 * 消息发送的状态, 仅本地发送时存在
 */
export enum MessageCurrentStatus {
  normal = 0,
  sending = 1,
  failed = 2,
}

export enum MessageStatus {
  normal,

  ///社区或对方禁止私聊
  noMutualGuilds,

  ///黑名单
  noMutualFriends,

  ///不需要离线通知
  noOfflineNotice,

  ///不再频道
  noInChannel,

  ///受慢速模式控制
  slowMode,

  ///消息发起者被举报过多禁用私信
  isBan,

  /// 陌生人消息限制
  strangerLimit,

  /// AT everyone 次数超过限制
  mentionEveryoneLimit,

  /// 自定义错误，比如社区禁止私信
  customBlockedTips,

  /// 临时消息在 UI 上会在下方显示仅你可见，由 OpenAPI 触发（仅客户端定义）
  Ephemeral = 9999,
}

export enum MessageReferenceType {
  ForwardMessage = 'forward_message',
}

export interface MessageContentStruct {
  type: MessageType
}

export enum FileType {
  Picture,
  Video,
  Audio,
  document,
  Zip,
  Apk,
  Unknown,
}

export interface FileStruct extends MessageContentStruct {
  type: MessageType.File
  file_id: string
  file_name: string
  file_url: string
  file_type: FileType
  file_ext: string
  file_size: number
  created: number
  status: number
  file_hash: string
  cloudsvr: number
  file_desc: string
  updated: number
  client: number
  file_path: string
  bucket_id: string
}

export type MessageExtraDataStrangerStruct = {
  type: 'stranger'
  data: {
    status: number
    from_user_id: string
    send_msg_count?: number
    max_msg_count: number
    messageStatus: unknown
  }
}

type MessageExtraDataMentionEveryoneLimitedStruct = {
  type: 'mention_everyone_limit'
}

export type MessageExtraDataCustomStruct = {
  type: 'custom'
  data: {
    tips: string
  }
}

export type MessageExtraDataStruct = MessageExtraDataStrangerStruct | MessageExtraDataCustomStruct | MessageExtraDataMentionEveryoneLimitedStruct

export interface RecallMessageContentStruct extends MessageContentStruct {
  id: string
  type: MessageType.recall
  // 0 表示对自己删除 ，1 表示对全员删除，undefined 表示不是删除动作
  deleted: 0 | 1 | undefined
  // 为空说明是对全员删除消息，为当前用户说明对当前用户删除消息
  deleted_user: string
  // 如果这个字段不为空，则要在除了这个用户的其他用户视角去删除消息
  only_user_id?: string
}

export interface ReactionMessageContentStruct extends MessageContentStruct {
  id: string
  action: 'add' | 'del'
  emoji: ReactionStruct
}

export interface PinnedOperationContentStruct extends MessageContentStruct {
  id: string
  action: 'pin' | 'unpin'
}

/**
 * 置顶消息的数据不在 content 里面，而是和 message 同级
 */
export interface TopMessageStruct extends MessageStruct {
  top_id: string
  top_user_id: string
  top_time: string
  action: 'top' | 'untop'
  hide?: boolean
}

export interface KeyRecord {
  me: boolean
  count: number
  user_ids?: string
}

export type KeyData = Record<string, KeyRecord | undefined>

export interface GuildNoticeMessageContentStruct extends MessageContentStruct {
  desc: string
  guild_id: string
  msg: string
  operation_type: number
  role_id: string
  type: MessageType
}

export interface MessageStruct<T extends MessageContentStruct = MessageContentStruct> {
  nonce?: string
  guild_id?: string
  channel_id: string
  user_id: string
  message_id: bigint
  content: T
  time: Dayjs
  recall?: string
  reactions?: ReactionStruct[]
  pin?: string
  quote_l1?: string
  quote_l2?: string
  extra_data?: MessageExtraDataStruct
  status?: MessageStatus

  mentions?: Array<{ nickname: string; user_id: string }>
  mention_roles?: string[]
  mention_channels?: string[]

  // 以下是接口返回的字段，平时不会用到
  // 这个字段只有接收服务端消息时才有
  author?: SimpleUserStruct
  member?: { nick: string; roles: string[] }
  desc?: string
  // 本地发送消息创建的结构提没有 channel_type
  channel_type?: ChannelType
  // 个人频道消息体 额外字段
  quote_total?: number
  quote_users?: string[]
  quote_author?: Array<{ avatar: string; user_id: string }>

  views?: number

  message_reference?: {
    channel_id: string
    message_id: string
    guild_id?: string
    table?: string
    type: MessageReferenceType
  }

  // 以下为本地字段
  messageStatus?: MessageCurrentStatus
  deleted?: boolean
  // 消息卡片的 key 数据
  message_card?: KeyData
  // 拥有此标记说明是 ws 接收的消息
  fromWs?: boolean
}

export interface RichTextMessageContentStruct extends MessageContentStruct {
  title?: string
  v2: string
  parsed: TopLevelBlock[]
}

export interface TextMessageContentStruct extends MessageContentStruct {
  text: string
  contentType: number
}

export interface MessageCommonProps {
  isAdjacentToPrev?: boolean
  isAdjacentToNext?: boolean
  rounded?: boolean
}
