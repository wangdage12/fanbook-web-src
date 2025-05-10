import { PermissionOverwrite } from './type'

export enum ChannelType {
  guildText,
  guildVoice,
  guildVideo,
  // 私信
  DirectMessage,
  Category,
  guildCircle,
  guildLive,
  Link,
  liveRoom,
  task,
  // 群聊
  GroupDm,
  // 已废弃
  CircleTopic,

  // 已废弃
  circleNews,

  // 单个动态对应的圈子频道消息
  circlePostNews,

  // 官方运营频道，其表现和文字频道一致
  officialOperation,

  // 虚拟社区 已废弃
  Metaverse,

  //社区通知,
  GuildNotice,

  //圈子消息聚合频道,
  CircleNews,

  // 用户关注通知频道
  UserFollow,

  // 活动日历
  ActivityCalendar,

  // 问答频道
  GuildQuestion,
  PrivateTopic = 22,
  SystemNotification,
  FriendNotification = 25,
  // 公告
  PlazaNotice,

  GroupChannel,

  PersonalChannel,

  unsupported = 255,
}

export enum AudiovisualChannelStatus {
  Active = '1',
  Inactive = '0',
}

// export interface ChannelItem {
//   guild_id: string
//   channelId: string
//   name: string
//   link?: string
//   type: ChannelType
//   userLimit?: number
//   parentId: '0' | null | '' | string
//   active: AudiovisualChannelStatus
// }

export enum MediaModerationMode {
  // 指定主持人
  Moderator = 0,
  // 临时主持人
  TemporaryModerator = 1,
  // 自由模式
  Free = 2,
}

export interface PersonalChannelStruct {
  channel_id: string
  type: ChannelType
  name: string
  icon: string
  desc: string
  owner_id: string
  member_count: number
  online_count: number
  setting: number
  dismissed: boolean
  freezed: boolean
  joined: boolean
  blacked: boolean
}

export interface ChannelStruct {
  guild_id: string
  channel_id: string
  name: string
  topic?: string
  link?: string
  type: ChannelType
  // 媒体质量
  quality?: number
  user_limit?: number
  voice_control: MediaModerationMode
  parent_id?: '0' | '' | string | null
  active?: AudiovisualChannelStatus
  /**
   * 原始数据为 PermissionOverwrite[] 请求后转换为 Record<string, PermissionOverwrite>
   */
  overwrite: Record<string, PermissionOverwrite>
  slow_mode: number
  announcement_mode: boolean
  announcement_menu: Array<{
    name: string
    link: string
  }>
  /**
   * 这个字段的结构比较奇怪：
   *  [ { <bot-id>: <command-name> } ] 旧接口
   * 每个 obj 只会有一个 key 和 value，这会导致逻辑变得复杂
   *
   *  使用 pb 后修改成下面结构, pb 不支持上面结构
   * [{bot_setting_list : { <bot-id>: <command-name> }}] 因此为了避免改动过多, 请求完数据后预处理成上面的结构
   */
  bot_setting_list?: Record<string, string>[]
}

//   constructor(
//     { guild_id, channelId, parentId, name, type, userLimit, isMediaChannelActive, link }: ChannelItem,
//     public overwrite: PermissionOverwrite[] = [],
//     public slow_mode: number = 0
//   ) {
//     this.guild_id = guild_id
//     this.channelId = channelId
//     this.parentId = parentId
//     this.name = name
//     this.link = link
//     this.type = type
//     this.userLimit = userLimit
//     this.isMediaChannelActive = isMediaChannelActive
//   }
//
//   static fromJson(json: Record<string, any>): ChannelStruct {
//     const { guild_id, channel_id, parent_id, name, link, type, user_limit, overwrite, active, slow_mode } = json
//     return new ChannelStruct(
//       {
//         guild_id: guild_id,
//         channelId: channel_id,
//         parentId: parent_id,
//         userLimit: user_limit,
//         name,
//         link,
//         type,
//         isMediaChannelActive: active === AudiovisualChannelStatus.Active,
//       },
//       overwrite,
//       slow_mode
//     )
//   }
//
//   toJson(): Record<string, any> {
//     return {
//       guild_id: this.guild_id,
//       channel_id: this.channelId,
//       name: this.name,
//       link: this.link,
//       type: this.type,
//       parent_id: this.parentId,
//       user_limit: this.userLimit,
//       active: this.isMediaChannelActive ? AudiovisualChannelStatus.Active : AudiovisualChannelStatus.Inactive,
//       overwrite: this.overwrite,
//       slow_mode: this.slow_mode,
//     }
//   }
// }
