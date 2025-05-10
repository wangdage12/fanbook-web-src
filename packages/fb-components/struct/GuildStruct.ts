import { CircleChannelStruct } from '../circle/types'
import { ChannelStruct } from './ChannelStruct'
import { SwitchType } from './type'

// 社区海报
export enum GuildPostType {
  Unknown,
  Link,
  TextChannel,
  CircleChannel,
}

export interface GuildPosterStruct {
  id: number
  guild_id?: string
  channel_id?: string
  img: string
  start_at: number
  end_at: number
  url: string
  type: GuildPostType
  status: SwitchType
}

// 社区标签
export interface GuildTagItem {
  id: string
  name: string
  level: number
  item: GuildTagItem[]
  item_num: number
}

export enum RoleType {
  Other = 0,
  Bot = 1,
  Manager = 2,
  SeniorManager = 3,
  Owner = 4, // 频道主
  ChannelManager = 5, //频道管理员
  NormalMember = 6, //普通成员
  //访客不是身份组这里添加访客的标识仅客户端自己维护
  Visitor = 1000,
}

export interface RoleStruct {
  color: number
  /** 是否在身份组管理中显示 false 则显示 */
  hoist: boolean
  icon?: string
  /**
   * 为 true 表示是机器人身份组
   *
   * ws 返回的数据可能 managed 为 false, 但是 t 为 RoleType.Bot
   *
   * 接口返回的数据可能 managed 为 true, 但是 t 为 0
   *
   * 因此判断机器人时要同时判断 managed 和 t
   */
  managed?: boolean
  t: RoleType
  name: string
  permissions: number
  position: number
  role_id: string
  /** 需要重新拉取接口才行 */
  member_count?: number
}

// 服务器禁用情况
export enum GuildBanLevelType {
  Normal = 0,
  Dismiss = 1,
  Ban = 2,
}

export enum GuildVerificationLevel {
  None = 0,
  Questionnaire = 1,
  RoleAssignment = 2,
  // QuestionnaireAndSurvey = 3,
}

export enum AutoWelcomeNewcomerMessageType {
  Text = 0,
  Custom,
  Pic,
}

export interface GuildStruct {
  // 自动欢迎新人的自定义消息数据
  system_channel_message?: { title: string; v2: string }
  // 自动欢迎新人的图片消息数据
  system_channel_message_pic: { template: 0 | 1; useCustomPicture: boolean; customPicture?: string }
  // 自动欢迎新人消息推送频道
  system_channel_id: string
  // 自动欢迎新人消息类型
  system_channel_type: AutoWelcomeNewcomerMessageType
  // 包含自动欢迎新人启用开关的数字
  system_channel_flags: number
  guild_id: string
  // 控制社区是否启用了文件上传功能
  upload_files: SwitchType
  // 是否开启长文发布权限
  post_multi_para: SwitchType
  icon: string
  banner: string
  banner_config?: {
    banner_default: string
    banner_static: string
    banner_dynamic: string
    banner_use: number
  }
  banned_level: GuildBanLevelType
  icon_dynamic: {
    link_default: string
    used: number
  }
  description?: string
  guild_set_banner: SwitchType
  authenticate: number
  name: string
  channels: Record<string, ChannelStruct>
  member_count: number

  channel_lists: string[]
  // 频道分类
  collapseCateIds?: Set<string>
  owner_id: string
  roles: Record<string, RoleStruct>
  permissions: number
  no_say: number
  user_roles: string[]
  // 查看 GuildVerificationLevel 枚举，使用位运算取值
  verification_level: GuildVerificationLevel
  join?: boolean
  // 是否未做问卷
  user_pending: boolean
  /**
   * @deprecated
   * 社区海报，从单独接口获取
   */
  guildPoster?: GuildPosterStruct
  // 隐私设置 - 公开 0 |私密 1
  is_private: SwitchType
  guild_member_dm_friend_setting: {
    dm_switch: SwitchType
    dm_allow_roles?: string[]
    friend_switch: SwitchType
    friend_allow_roles?: string[]
  }
  // 圈子相关
  circle: CircleChannelStruct
  circle_display: boolean
  // 活动日历
  activity_calendar: SwitchType
  // 圈子相关
  guild_circle_comment: SwitchType
  guild_circle_view: SwitchType
  guild_circle_visible: SwitchType
  // 助力等级
  hierarchy: number
  // 服务器标签
  tags?: GuildTagItem[]
  // 是否显示助力等级
  assist_display: SwitchType
}

// fromJson 方法，用于将 JSON 对象转换为 GuildStruct 实例
// static fromJson(json: { [key: string]: any }): GuildStruct {
//   const {
//     guild_id,
//     icon,
//     banner,
//     guild_set_banner,
//     authenticate,
//     name,
//     channels,
//     memberCount,
//     channel_lists,
//     roles,
//     owner_id,
//     permissions,
//     userRoles,
//   } = json
//   const channelStructs = channels.map((channel: any) => ChannelStruct.fromJson(channel))
//   return new GuildStruct(
//     guild_id,
//     icon,
//     banner,
//     guild_set_banner,
//     authenticate,
//     name,
//     channelStructs,
//     memberCount,
//     channel_lists,
//     new Set<string>(),
//     owner_id,
//     roles,
//     permissions,
//     userRoles
//   )
// }

// clone(): GuildStruct {
//   return new GuildStruct(
//     this.guildId,
//     this.icon,
//     this.banner,
//     this.guildSetBanner,
//     this.authenticate,
//     this.name,
//     [...this.channels],
//     this.memberCount,
//     this.channelOrder,
//     new Set<string>(),
//     this.owner_id,
//     this.roles,
//     this.permissions,
//     this.userRoles
//   )
// }

// toJson 方法，用于将 GuildStruct 实例转换为 JSON 对象
// toJson(): { [key: string]: any } {
//   return {
//     guild_id: this.guildId,
//     icon: this.icon,
//     banner: this.banner,
//     guild_set_banner: this.guildSetBanner,
//     name: this.name,
//     authenticate: this.authenticate,
//     channels: this.channels.map((channel) => channel.toJson()),
//     memberCount: this.memberCount,
//     roles: this.roles,
//     permissions: this.permissions,
//     owner_id: this.owner_id,
//     userRoles: this.userRoles,
//   }
// }

// toggleExpand(category: ChannelStruct) {
//   const cateId = category.channelId
//   if (this.collapseCateIds.has(cateId)) {
//     this.collapseCateIds.delete(cateId)
//   } else {
//     this.collapseCateIds.add(cateId)
//   }
//   store.dispatch(guildListActions.updateGuild(this))
// }

// getChannel(channelId: string): ChannelStruct | undefined {
//   return this.channels.find((item) => item.channelId == channelId)
// }
//
// getFirstChannelByType(channelTypes: ChannelType[]) {
//   return this.channels.find((item) => channelTypes.includes(item.type))
// }

// getRole(roleId: string): RoleStruct | undefined {
//   return this.roles[roleId]
// }
// }
