import { createSlice } from '@reduxjs/toolkit'
import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import ColorUtils from 'fb-components/utils/ColorUtils.ts'
import { maxBy } from 'lodash-es'
import { RootState, store } from '../../app/store'
import { GuildRoleAssignmentEvent, PermissionEvent, PermissionService } from '../../services/PermissionService.ts'
import GuildUtils from '../guild_list/GuildUtils'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'

interface GuildUserInfo {
  nickname?: string
  roles: Array<string>
}

/**
 * guildUserSlice 保存了用户在社区中的信息，例如角色，社区昵称
 *
 */
type GuildUserState = Record<string, Record<string, GuildUserInfo>>

const initialState: GuildUserState = {}

const guildUserSlice = createSlice({
  name: 'guildUsers',
  initialState,
  reducers: {
    update: (state, { payload }: { payload: { guildId: string; userId: string; user: Partial<GuildUserInfo> } }) => {
      const { guildId, userId, user } = payload
      state[guildId] ??= {}
      state[guildId][userId] = { ...state[guildId][userId], ...user }
      PermissionService.stream.emit(PermissionEvent.GuildRoleAssigned, { guildId, userId } as GuildRoleAssignmentEvent)
    },
    // updateGuildUserFromUserStruct: (state, { payload }: { payload: { guildId: string; user: UserStruct } }) => {
    //   const { guildId, user } = payload
    //   state[guildId] ??= {}
    //   state[guildId][user.user_id] = {
    //     ...state[guildId][user.user_id],
    //     ...pickBy(
    //       {
    //         nickname: user.gnick,
    //         roles: user.role_ids,
    //       },
    //       (e) => e !== null && e !== undefined
    //     ),
    //   }
    // },
    batchUpdate: (
      state,
      {
        payload,
      }: {
        payload: Array<{ guildId: string; userId: string; roles: string[]; nickname?: string }>
      }
    ) => {
      for (const user of payload) {
        const { guildId, userId, ..._user } = user
        state[guildId] ??= {}
        state[guildId][userId] = { ...state[guildId][userId], ..._user }
        PermissionService.stream.emit(PermissionEvent.GuildRoleAssigned, {
          guildId,
          userId,
        } as GuildRoleAssignmentEvent)
      }
    },
  },
})

export default guildUserSlice.reducer

export const guildUserActions = guildUserSlice.actions

export const guildUserSelectors = {
  nickname: (guildId?: string, userId?: string) => (state: RootState) =>
    guildId && userId ? state.guildUsers[guildId]?.[userId]?.nickname : undefined,
  userRoles: (guildId?: string, userId?: string) => (state: RootState) => {
    return guildId && userId ? state.guildUsers[guildId]?.[userId]?.roles ?? [] : []
  },
  /**
   * 获取用户拥有的最高角色的颜色
   */
  userRoleColor: (guildId: string, userId: string) => (state: RootState) => {
    const roleIds = guildUserSelectors.userRoles(guildId, userId)(state)
    return GuildUserUtils.getHighestRoleColor(guildId, roleIds)
  },
}

export class GuildUserHelper {
  static getNickname(guildId: string, userId: string): string | undefined {
    return store.getState().guildUsers[guildId]?.[userId]?.nickname
  }
}

export class GuildUserUtils {
  /**
   * 获取指定角色列表中最高的角色
   * @param guildId 社区 ID
   * @param roleIds 角色 ID 列表
   */
  static getHighestRole(guildId: string, roleIds: string[]): RoleStruct | undefined {
    const guild = store.getState().guild.list?.find(item => item.guild_id === guildId)
    const roles = roleIds.map(id => guild?.roles[id]).filter(item => !!item) as RoleStruct[]
    return maxBy(roles, item => item.position)
  }

  static getHighestRoleColor(guildId: string, roleIds: string[]): string | undefined {
    const highestRole = this.getHighestRole(guildId, roleIds)
    return highestRole ? ColorUtils.convertToCssColor(highestRole.color) : undefined
  }

  static getRoles(guildId: string, roleIds: string[]): RoleStruct[] {
    const guild = store.getState().guild.list?.find(item => item.guild_id === guildId)
    return (roleIds.map(id => guild?.roles[id]).filter(item => !!item) as RoleStruct[]).sort((a, b) => (a.position < b.position ? 1 : -1))
  }

  static getRoleIds(guildId: string, userId: string): string[] {
    return store.getState().guildUsers[guildId]?.[userId]?.roles ?? []
  }

  static getGuildAdminRoles(guildId: string) {
    const guild = store.getState().guild.list?.find(item => item.guild_id === guildId)
    return Object.values(guild?.roles || {}).filter(role => [RoleType.Owner, RoleType.SeniorManager].includes(role.t))
  }

  static getGuildAdminRoleIds(guildId: string) {
    return GuildUserUtils.getGuildAdminRoles(guildId).map(role => role.role_id)
  }

  static hasHigherRoleThan(guildId: string, anotherUserId: string): boolean {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return false
    const myRoles = GuildUserUtils.getRoleIds(guildId, LocalUserInfo.userId)
      .map(e => guild.roles[e])
      .filter(e => !!e)
    const anotherRoles = GuildUserUtils.getRoleIds(guildId, anotherUserId)
      .map(e => guild.roles[e])
      .filter(e => !!e)
    const myHighestRole = maxBy(myRoles, r => r.position)
    const anotherHighestRole = maxBy(anotherRoles, r => r.position)
    if (!myHighestRole || !anotherHighestRole) return false
    return myHighestRole.position > anotherHighestRole.position
  }

  static hasHigherRoleThanRole(guildId: string, roleId: string): boolean {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return false
    const myRoles = GuildUserUtils.getRoleIds(guildId, LocalUserInfo.userId)
      .map(e => guild.roles[e])
      .filter(e => !!e)
    const anotherRole = guild.roles[roleId]
    const myHighestRole = maxBy(myRoles, r => r.position)
    if (!myHighestRole || !anotherRole) return false
    return myHighestRole.position > anotherRole.position
  }

  static hasOwnerRole(guildId: string, userId: string): boolean {
    return GuildUserUtils.getHighestRole(guildId, GuildUserUtils.getRoleIds(guildId, userId))?.t == RoleType.Owner
  }
}

interface UserRoleUpdateStruct {
  guild_id: string
  roles: Array<{
    role_id: string
    permissions: number
  }>
  user_id: string
  user_pending: boolean
}

export const handleUserRoleUpdate = ({ data }: { data: UserRoleUpdateStruct }) => {
  store.dispatch(
    guildUserActions.update({
      guildId: data.guild_id,
      userId: data.user_id,
      user: { roles: data.roles.map(e => e.role_id) },
    })
  )
}
