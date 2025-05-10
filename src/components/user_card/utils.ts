import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import { GuildUserUtils } from '../../features/role/guildUserSlice'
import { UserStruct } from '../realtime_components/realtime_nickname/UserAPI'

export function canAddFriend(targetUid: string, guild?: GuildStruct): boolean {
  if (!guild) {
    return true
  }
  const setting = guild.guild_member_dm_friend_setting
  if (!setting) return true

  if (setting.friend_switch ?? true) return true

  if (!guild || guild.owner_id === LocalUserInfo.userId || guild.owner_id === targetUid) return true

  return checkRoles(targetUid, guild.guild_id, setting.friend_allow_roles)
}

/// 是否可以向对方发送私信
/// 在调用此函数之前，请确保用户的身份组已被缓存
export function canDm(targetUid: string, guild?: GuildStruct): boolean {
  if (!guild) {
    return true
  }
  const setting = guild.guild_member_dm_friend_setting
  if (!setting) return true

  if (setting.dm_switch ?? true) return true

  if (!guild || guild.owner_id === LocalUserInfo.userId || guild.owner_id === targetUid || LocalUserInfo.userId === targetUid) return true

  return checkRoles(targetUid, guild.guild_id, setting.dm_allow_roles)
}

function checkRoles(targetUid: string, guildId: string, allowRoles: string[] = []) {
  const targetRole = GuildUserUtils.getRoleIds(guildId, targetUid)
  const myRole = GuildUserUtils.getRoleIds(guildId, LocalUserInfo.userId)

  const guildAdminIds = GuildUserUtils.getGuildAdminRoleIds(guildId)

  // 双方之一是否为社区拥有者，或者超级管理员
  const targetHas = guildAdminIds.find(id => targetRole?.includes(id) ?? false)
  const has = guildAdminIds.find(id => myRole?.includes(id) ?? false)
  if (has || targetHas) return true

  // 双方身份组并集是否存在于豁免身份组列表中
  const union = Array.from(new Set([...targetRole, ...myRole]))
  if (allowRoles.find(id => union.includes(id))) {
    return true
  }
  return false
}

export enum CheckBanType {
  StrangerDm,
  FriendAdd,
  TextChannelChat,
  CircleChannelPost,
  CircleChannelComment,
  LiveOpen,
  LiveBullets,
  QaChannelAccess,
  MediaChannel,
}

export function checkUserBan(user: UserStruct, type: CheckBanType) {
  if (!user.sanction_ban_states) {
    return false
  }
  let exp: number | undefined
  const curTimestamp = user.sanction_ban_states.cur_timestamp
  switch (type) {
    case CheckBanType.StrangerDm:
      exp = user.sanction_ban_states.sanction_stranger_dm?.exp
      break
    case CheckBanType.FriendAdd:
      exp = user.sanction_ban_states.sanction_friend_add?.exp
      break
    case CheckBanType.TextChannelChat:
      exp = user.sanction_ban_states.sanction_text_channel_chat?.exp
      break
    case CheckBanType.CircleChannelPost:
      exp = user.sanction_ban_states.sanction_circle_channel_post?.exp
      break
    case CheckBanType.CircleChannelComment:
      exp = user.sanction_ban_states.sanction_circle_channel_comment?.exp
      break
    case CheckBanType.LiveOpen:
      exp = user.sanction_ban_states.sanction_live_open?.exp
      break
    case CheckBanType.LiveBullets:
      exp = user.sanction_ban_states.sanction_live_bullets?.exp
      break
    case CheckBanType.QaChannelAccess:
      exp = user.sanction_ban_states.sanction_qa_channel_access?.exp
      break
    case CheckBanType.MediaChannel:
      exp = user.sanction_ban_states.sanction_media_mic?.exp
      break
    default:
      return false
  }
  if (exp === undefined || curTimestamp === undefined) {
    return false
  }
  if (exp === 0 || curTimestamp === 0) {
    return false
  }
  return exp - curTimestamp > 0
}
