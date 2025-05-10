import axios from 'axios'
import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type.ts'
import { isNil, last } from 'lodash-es'
import { UserStruct } from '../../components/realtime_components/realtime_nickname/UserAPI.ts'
import { PaginationResp, PaginationResp3 } from '../../types'
import LocalUserInfo from '../local_user/LocalUserInfo'

export interface RoleMemberItem {
  guild_id: string
  role_id: string
  user_id: string
  permissions: string
  timestamp: number
  avatar: boolean
  avatar_nft: string
  username: boolean
  nickname: boolean
}

// export type MemberStruct = Pick<UserStruct, 'avatar' | 'user_id' | 'nickname' | 'username' | 'role_ids' | 'bot'>

export const getVisitorRole = (roleId?: string): RoleStruct => {
  return {
    name: '访客',
    color: -6052179, // --fb-b40 #A3A6AD
    hoist: false,
    managed: false,
    t: RoleType.Visitor,
    position: -10000,
    permissions: 0,
    role_id: roleId ?? '0',
  }
}

export const getNewRole = (): Omit<RoleStruct, 'role_id' | 't'> => {
  return {
    name: '新身份组',
    color: -10196365, // #646A73 4284770931
    hoist: false,
    managed: false,
    position: 1,
    permissions: 0,
  }
}

export class RoleAPI {
  static async createOverwrite({
    guildId,
    channelId,
    allow,
    deny,
    actionType,
  }: {
    guildId?: string
    channelId: string
    allow: number
    deny: number
    actionType: string
  }) {
    const res = await axios.post('/api/channelPermiss/create', {
      guild_id: guildId,
      channel_id: channelId,
      allow,
      deny,
      action_type: actionType,
    })
    return res.data
  }

  static async updateOverwrite({
    guildId,
    channelId,
    id,
    allows,
    deny,
    actionType,
  }: {
    guildId?: string
    channelId?: string
    id?: string
    allows?: number
    deny?: number
    actionType?: string
  }) {
    await axios.post('/api/channelPermiss/permission', {
      guild_id: guildId,
      channel_id: channelId,
      user_id: LocalUserInfo.userId,
      id: id,
      allows: allows,
      deny: deny,
      action_type: actionType,
    })
  }

  static async updateOverwrites({
    guildId,
    channelId,
    permissionOverwrites,
  }: {
    guildId: string
    channelId: string
    permissionOverwrites: Omit<PermissionOverwrite, 'guild_id' | 'channel_id'>[]
  }) {
    const res = await axios.post('/api/channelPermiss/batch', {
      guild_id: guildId,
      channel_id: channelId,
      permission_overwrites: permissionOverwrites,
    })
    return res.data
  }

  static async deleteOverwrite({ guildId, channelId, userId, id }: { guildId?: string; channelId?: string; userId?: string; id?: string }) {
    const res = await axios.post('/api/channelPermiss/del', {
      guild_id: guildId,
      channel_id: channelId,
      user_id: userId,
      id,
    })
    return res.data
  }

  static async getRoleIdentityGroup({ guildId }: { guildId: string | undefined }) {
    const res = await axios.post('/api/role/group', {
      guild_id: guildId,
    })
    return res.data
  }

  static async batchAddMemberForRole({ guildId, roleId, memberIds }: { guildId?: string; roleId: string; memberIds: Array<string> }) {
    const res = await axios.post('/api/role/addMember', {
      guild_id: guildId,
      role_id: roleId,
      member_ids: memberIds,
    })
    return res.data
  }

  static async getRoles({ guildId, channelId }: { guildId: string; channelId?: string }) {
    const res = await axios.post<undefined, Array<RoleStruct & { member_count: number }>>('/api/role/lists', {
      guild_id: guildId,
      channel_id: channelId,
      size: 999,
    })
    return res
  }

  static async getRoleMembers({
    guildId,
    roleId,
    size = 20,
    lastId,
    order,
  }: {
    guildId: string
    roleId: string
    size?: number
    lastId?: string
    order?: string
  }) {
    const res = await axios.post<undefined, PaginationResp<RoleMemberItem, 'data'>>('/api/role/member', {
      guild_id: guildId,
      role_id: roleId,
      size,
      last_id: lastId,
      order,
    })
    return res
  }

  static async addRoleMember({ guildId, roleId, userIds }: { guildId: string; roleId: string; userIds: string[] }) {
    await axios.post('/api/role/addMember', {
      guild_id: guildId,
      role_id: roleId,
      member_ids: userIds,
    })
  }

  static async deleteRoleMember({ guildId, roleId, userIds }: { guildId: string; roleId: string; userIds: string[] }) {
    await axios.post('/api/role/delMember', {
      guild_id: guildId,
      role_id: roleId,
      user_ids: userIds,
    })
  }

  static async getMemberList({
    guildId,
    channelId,
    lastId,
    limit = 20,
  }: {
    guildId: string
    channelId?: string
    lastId?: string
    limit?: number
  }): Promise<PaginationResp3<UserStruct, 'records', 'last_id'>> {
    const res = await axios.post<void, UserStruct[]>('/api/role/memberLists', {
      'guild_id': guildId,
      'channel_id': channelId,
      'last_id': lastId,
      'limit': limit,
    })
    res.forEach(user => {
      const _user = user as unknown as { roles: string[]; name: string }
      user.role_ids = _user.roles
      user.nickname ??= _user.name
    })
    return {
      records: res,
      last_id: last(res)?.user_id,
      next: res.length < limit ? 0 : 1,
    }
  }

  static async updateMemberRole({ guildId, memberId, roleIds }: { guildId: string; memberId: string; roleIds: string[] }): Promise<void> {
    return axios.post('/api/role/memberRole', {
      'guild_id': guildId,
      'member_id': memberId,
      'roles': JSON.stringify(roleIds),
    })
  }

  static async saveRole({
    guildId,
    roleId,
    permissions,
    color,
    name,
    mentionable,
    hoist,
    icon,
  }: {
    guildId: string
    roleId?: string
    permissions?: number
    color?: number
    name?: string
    mentionable?: boolean
    hoist?: boolean
    icon?: string
  }) {
    const data = {
      guild_id: guildId,
      user_id: LocalUserInfo.userId,
      role_id: roleId,
      permissions: permissions,
      color: color,
      name: name,
      mentionable: mentionable,
      hoist: hoist,
      icon: icon,
    }
    ;(Object.keys(data) as (keyof typeof data)[]).forEach(key => {
      isNil(data[key]) && delete data[key]
    })
    const res = await axios.post<undefined, RoleStruct>('/api/role/save', data)
    return res
  }

  static async orderRole({ guildId, roles }: { guildId: string; roles: { id: string; position: number }[] }) {
    const res = await axios.post('/api/role/position', {
      guild_id: guildId,
      user_id: LocalUserInfo.userId,
      roles: JSON.stringify(roles),
    })
    return res
  }

  static async deleteRole({ guildId: guildId, roleId: roleId }: { guildId: string; roleId?: string }) {
    const res = await axios.post('/api/role/delRole', {
      guild_id: guildId,
      user_id: LocalUserInfo.userId,
      role_id: roleId,
    })
    return res
  }
}
