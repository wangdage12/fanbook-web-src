import clsx from 'clsx'
import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import ColorUtils from 'fb-components/utils/ColorUtils.ts'
import { GuildUserUtils } from '../features/role/guildUserSlice.ts'

interface UserRolesProps {
  userId: string
  guildId?: string
  roleIds?: string[]
  deletable?: boolean
  onDelete?: (roleId: string) => void
}

/**
 * 用户所有角色UI
 * @param guildId
 * @param userId
 * @param roleIds 用户角色id，获取角色列表优先从这里取，为空则从本地取
 * @param deletable 是否支持悬浮后显示删除icon
 * @param onDelete 某个角色删除回调
 */
export default function UserRoles({ guildId, userId, roleIds, deletable = false, onDelete }: UserRolesProps) {
  let userRoles: RoleStruct[] = []
  if (guildId) {
    // 优先使用传入的角色，没有则从数据库取
    userRoles = GuildUserUtils.getRoles(guildId, roleIds ?? GuildUserUtils.getRoleIds(guildId, userId)).filter(e => e.t != RoleType.ChannelManager)
  }
  return (
    <div className=" flex flex-wrap gap-[8px] border-[0px] border-b-[1px] border-solid border-gray-100 bg-[var(--fg-white-1)] p-3 first-of-type:rounded-t-lg last-of-type:rounded-b-lg last-of-type:border-b-[0px]">
      {userRoles.map(role => {
        return <UserRole key={role.role_id} guildId={guildId} role={role} deletable={deletable} onDelete={onDelete}></UserRole>
      })}
    </div>
  )
}

/**
 * 用户单个角色UI
 * @param role 角色信息
 * @param guildId
 * @param className
 * @param closable 是否支持悬浮后显示删除icon
 * @param onDelete 某个角色删除回调
 */
export function UserRole({
  role,
  guildId,
  className = '',
  deletable = false,
  onDelete,
}: {
  role: RoleStruct
  guildId?: string
  className?: string
  deletable?: boolean
  onDelete?: (roleId: string) => void
}) {
  const { role_id, color, name, t: roleType } = role
  // 是否有权限删除 若没有传入 guildId 则默认有权限 普通成员不可删除 应该通过切换身份组来删除
  const hasPermission = guildId ? roleType != RoleType.NormalMember && GuildUserUtils.hasHigherRoleThanRole(guildId, role_id) : true
  const canDelete = deletable && hasPermission
  return (
    // 最长展示 12 个汉字 186px
    <div
      key={role_id}
      className={`group/role relative flex h-[24px] max-w-[186px] items-center rounded-full bg-gray-100 pl-[24px] pr-[12px] text-xs text-[var(--fg-b100)] ${className} `}
    >
      <div
        onClick={() => {
          canDelete && onDelete?.(role_id)
        }}
        className={clsx([
          'flex-center absolute left-[8px] ml-[2px] h-2 w-2 flex-shrink-0 rounded-full',
          canDelete && 'cursor-pointer group-hover/role:ml-0 group-hover/role:h-3 group-hover/role:w-3',
        ])}
        style={{
          backgroundColor: color === 0 ? 'var(--fg-b40)' : ColorUtils.convertToCssColor(color),
        }}
      >
        {canDelete && <iconpark-icon name="Close" size={8} hidden class="group-hover/role:!flex" color={'var(--fg-white-1)'}></iconpark-icon>}
      </div>
      <span className="cursor-default truncate">{name}</span>
    </div>
  )
}
