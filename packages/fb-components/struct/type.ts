export enum SwitchType {
  No = 0,
  Yes = 1,
}

// 业务的定义

export interface PermissionOverwrite {
  action_type: 'role' | 'user'
  allows: number
  channel_id?: string
  deny: number
  guild_id: string
  id: string
  /**
   * @deprecated 请使用 channel_id
   */
  topic_id?: string
}

export interface SimpleUserStruct {
  user_id: string
  username?: string
  nickname?: string
  avatar?: string
}

export interface ReactionStruct {
  count: number
  me: boolean
  name: string
}

export interface ChannelInfoStruct {
  channel_permission?: Array<{
    channel_id: string
    guild_id: string
    deny: number
    allows: number
  }>
}

export interface GuildInfoStruct {
  name: string
  icon: string
  guild_id?: string
  guild_circle_visible?: number
  guild_circle_view?: number
  guild_circle_comment?: number
  is_new_permission?: number
  is_private?: boolean
}

// Guild
