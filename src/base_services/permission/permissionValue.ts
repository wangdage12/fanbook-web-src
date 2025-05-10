import Long from './long'

/**
 * @example
 * // 判断是否拥有你传入的权限中的部分权限，该值必须是你调用 `usePermissions` 时传入的权限的子集
 * if (permissionVal.any(GuildPermission.ManageBot | GuildPermission.ManageGuild)) {
 *    // 拥有 `GuildPermission.ManageBot` 或 `GuildPermission.ManageGuild` 权限
 * }
 * // 判断是否有某个权限，该值必须是你调用 `usePermissions` 时传入的权限的子集
 * if (permissionVal.has(GuildPermission.ManageBot)) {
 *    // 有管理机器人权限
 * }
 * // 判断同时拥有你传入的权限中的所有权限，该值必须是你调用 `usePermissions` 时传入的权限的子集
 * if (permissionVal.has(GuildPermission.ManageBot | GuildPermission.ManageGuild)) {
 *    // 同时拥有 `GuildPermission.ManageBot` 以及 `GuildPermission.ManageGuild` 权限
 * }
 *
 * 32 | 2147483648 = 2147483680
 * 但在浏览器中 32 | 2147483648 = -2147483616
 * 因此需要使用 Long 处理
 */

export default class PermissionValue extends Number {
  has(permission: number): boolean {
    return Long.fromNumber(this.valueOf()).and(Long.fromNumber(permission)).toNumber() === permission
  }

  any(permission?: number): boolean {
    if (permission) {
      return Long.fromNumber(this.valueOf()).and(Long.fromNumber(permission)).toNumber() !== 0
    } else {
      return this.valueOf() !== 0
    }
  }

  none(): boolean {
    return this.valueOf() === 0
  }
  /**
   *  a | b
   **/
  add(permission: number): PermissionValue {
    return new PermissionValue(Long.fromNumber(this.valueOf()).or(Long.fromNumber(permission)).toNumber())
  }
  /**
   *  a & ~b
   **/
  remove(permission: number): PermissionValue {
    return new PermissionValue(Long.fromNumber(this.valueOf()).and(Long.fromNumber(permission).not()).toNumber())
  }
  /**
   *  a & b
   **/
  and(permission: number): PermissionValue {
    return new PermissionValue(Long.fromNumber(this.valueOf()).and(Long.fromNumber(permission)).toNumber())
  }
}
