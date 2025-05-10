import axios from 'axios'

export interface UserSettingStruct {
  user_id: string
  default_guilds_restricted: boolean
  friend_source_flags: FriendSourceFlags
  restricted_guilds: null
  mute: Mute
  guild_notices: string
  guild_notices2: { [key: string]: number }
  channel_notices: string[]
  notification_count: boolean
  notification_mute: boolean
  guild_folders: GuildFolder[] | string
  guild_positions: string[]
  receive_stranger_message: boolean
  receive_friend_request: boolean
  dm_notices: string[]
  channel_notices_all: string[]
  new_notice: string
  personalized_recommendation: boolean
  allow_view_follow: boolean
}

export interface FriendSourceFlags {
  all: boolean
  mutual_friends: boolean
  mutual_guilds: boolean
}

export interface GuildFolder {
  guild_ids: string[]
}

export interface Mute {
  channel: string[]
}

export default class SettingAPI {
  static async getUserSetting() {
    return await axios.post<undefined, UserSettingStruct>('/api/userSetting/get')
  }
  static async setUserSetting(userId: string, setting: Partial<UserSettingStruct>) {
    return await axios.post<undefined, UserSettingStruct>('/api/userSetting/setting', { user_id: userId, ...setting })
  }
}
