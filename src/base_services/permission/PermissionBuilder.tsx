import { ReactNode } from 'react'
import usePermissions, { UsePermissionsProps } from './usePermissions'

interface PermissionBuilderProps extends UsePermissionsProps {
  children: (allow: boolean) => ReactNode
}

/**
 * 依据权限显示子组件，此组件会在权限变化时自动更新。
 *
 * 当前组件只允许传入 `permission` 参数，社区和频道信息会同上下文自动获取，这是大多数场景，为了保持简单，暂不允许传入社区和频道信息
 *
 * @param children    子组件回调，如果有权限，`allow` 参数为 `true`
 * @param permission
 * @param channelId
 * @constructor
 * @example
 * <PermissionBuilder permission={GuildPermission.ManageGuild}>
 *   {(allow) => <button disabled={!allow}>Manage Guild</button>}
 * </PermissionBuilder>
 */
export default function PermissionBuilder({ children, permission, ..._props }: PermissionBuilderProps) {
  const permissionVal = usePermissions({ permission, ..._props })
  return children(permissionVal.any(permission))
}
