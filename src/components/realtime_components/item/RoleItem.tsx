import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import ColorUtils from 'fb-components/utils/ColorUtils'
import { ReactNode, useContext, useMemo } from 'react'
import GuildUtils from '../../../features/guild_list/GuildUtils'
import { GuildContext } from '../../../features/home/GuildWrapper'
import { PermissionService } from '../../../services/PermissionService'

export function RoleItem({
  value,
  guildId,
  channelId,
  prefix,
  suffix,
  className = '',
  bordered = true,
  onClick,
}: {
  // 使用 value 作为 userId 是为了兼容 Form.Item
  value?: string
  className?: string
  guildId?: string
  channelId?: string
  bordered?: boolean
  prefix?: ReactNode | ((role: RoleStruct) => ReactNode)
  suffix?: ReactNode | ((role: RoleStruct) => ReactNode)
  onClick?: (roleId: string) => void
}) {
  const guild = useContext(GuildContext)
  const currentGuildId = guildId ?? guild?.guild_id

  const role = currentGuildId && value ? GuildUtils.getGuildById(currentGuildId)?.roles[value] : undefined

  const memberCount = useMemo(() => {
    if (!role) return 0
    if (role.t != RoleType.ChannelManager) return role.member_count ?? 0
    return PermissionService.getChannelManagerCount({ guildId: currentGuildId, channelId })
  }, [role])

  if (!value || !role) {
    return null
  }

  return (
    <div
      className={`${className} h-[60px] flex flex-shrink-0 items-center hover:bg-[var(--bg-bg-1)] cursor-pointer rounded-lg px-2 -mx-2`}
      onClick={() => onClick?.(value)}
    >
      <div className={`flex w-full items-center justify-start gap-2 h-full ${bordered ? 'border-b-[0.5px] border-b-[var(--fg-b10)]' : ''}`}>
        {typeof prefix === 'function' ? prefix(role) : prefix}
        <div className="flex w-0 flex-1 items-center overflow-hidden">
          <iconpark-icon class="mr-[12px]" name="UserShield" size={24} style={{ color: ColorUtils.convertToCssColor(role.color) }} />
          <div className="flex w-0 flex-1 flex-col">
            <span className="block truncate text-[14px] text-[var(--fg-b100)]">{role.name}</span>
            <span className="text-[12px] text-[var(--fg-b40)] mt-1">{memberCount} 位成员</span>
          </div>
        </div>
        {typeof suffix === 'function' ? suffix(role) : suffix}
      </div>
    </div>
  )
}

export default RoleItem
