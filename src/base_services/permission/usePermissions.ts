import { useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import GuildUtils from '../../features/guild_list/GuildUtils'
import { ChannelContext, GuildContext } from '../../features/home/GuildWrapper'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import { Permission, PermissionService } from '../../services/PermissionService'
import PermissionValue from './permissionValue'

export function useGuild(guildId?: string) {
  const guild = useContext(GuildContext)
  const guildBackup = useMemo(() => (guildId ? GuildUtils.getGuildById(guildId) : null), [guildId])
  return guild ?? guildBackup
}

export function useChannel(guildId?: string, channelId?: string) {
  const channel = useContext(ChannelContext)
  const channelBackup = useMemo(() => (channelId && guildId ? GuildUtils.getAnyChannelById(guildId, channelId) : null), [guildId])
  return channel ?? channelBackup
}

export interface UsePermissionsProps {
  permission: Permission | number
  // 请不要把这个参数改成 ChannelStruct 类型，否则会导致 ChannelStruct 与全局引用不一致，导致数据错误
  channelId?: string
  guildId?: string
}

/**
 * 用于获取权限的 hook，在权限发生改变时会触发 render。通过返回的 `PermissionValue` 类型可以判断是否具有一个或者多个指定的权限。
 *
 * @example
 * // 获取单个权限
 * const permissionVal = usePermissions(GuildPermission.ManageBot);
 * if (permissionVal) {
 *     // 具有权限
 * } else {
 *     // 没有权限
 * }
 *
 * // 获取多个权限的情况下，提供了多种方式可以判断是拥有任意权限，或者是某个权限，或是全部权限
 * const permissionVal = usePermissions(GuildPermission.ManageBot | GuildPermission.ManageGuild | ...);
 * // 判断是否拥有任意你之前传入的权限，如果要判断任意一个你传入的权限，以下是一个快捷方法
 * if (permissionVal) {
 *     // 你拥有调用 `usePermissions` 时的权限中的任意一个
 * }
 *
 * 其他关于判断拥有任意权限，或者是某个权限，或是全部权限的方法，参见 `PermissionValue` 类型。
 * @see PermissionValue
 *
 * @param permission  单个或者多个权限值，例如 `ChannelPermission.ViewChannel`，或者多个权限值 `ChannelPermission.ViewChannel | ChannelPermission.SendMessage`。
 * @param channelId   在获取社区权限时可以不传，在获取频道权限时必需。
 * @param guildId
 * @returns           始终返回最新的权限值，根据这个值，可以判断用户是否有指定权限，参见 example。
 */
export default function usePermissions({ permission, channelId, guildId }: UsePermissionsProps): PermissionValue {
  const guild = useGuild(guildId)
  const channel = useChannel(guild?.guild_id, channelId)
  const [calculated, setCalculated] = useState<PermissionValue>(doCalc)

  useEffect(() => {
    setCalculated(doCalc())
  }, [permission, channelId, guildId])

  const subscribe = useCallback(
    (callback: () => void) =>
      PermissionService.listenPermissions(
        permission,
        p => {
          setCalculated(p)
          callback()
        },
        { guildId: guild?.guild_id, channelId: channel?.channel_id }
      ),
    [guildId, channelId, permission]
  )

  function getSnapshot() {
    return calculated
  }

  function doCalc() {
    return channel ?
        new PermissionValue(PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId).and(permission).valueOf())
      : new PermissionValue(PermissionService.computeGuildPermission(guild, LocalUserInfo.userId).and(permission).valueOf())
  }

  return useSyncExternalStore(subscribe, getSnapshot)
}
