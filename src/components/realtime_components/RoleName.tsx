import ColorUtils from 'fb-components/utils/ColorUtils'
import { HTMLAttributes, ReactNode, useContext } from 'react'
import GuildUtils from '../../features/guild_list/GuildUtils'
import { GuildContext } from '../../features/home/GuildWrapper'

interface RoleNameProps {
  roleId: string
  guildId?: string
  placeholder?: ReactNode
  prefix?: string
  colorful?: boolean
}

export default function RoleName({
  roleId,
  guildId,
  colorful = true,
  prefix = '',
  placeholder = '该身份组已删除',
  style,
  ...rest
}: RoleNameProps & HTMLAttributes<never>) {
  const guild = useContext(GuildContext)
  const currentGuildId = guildId ?? guild?.guild_id
  let name: ReactNode | undefined
  let color: string | undefined
  if (currentGuildId === roleId) {
    name = `${prefix}全体成员`
    color = 'var(--fg-blue-1)'
  } else {
    const role = currentGuildId ? GuildUtils.getGuildById(currentGuildId)?.roles[roleId] : undefined

    if (role) {
      name = `${prefix}${role.name}`
      color = ColorUtils.convertToCssColor(role.color)
    } else {
      name = `${prefix}${placeholder}`
    }
  }

  style = { ...style }
  if (colorful) style.color = color

  return (
    <span {...rest} style={style}>
      {name}
    </span>
  )
}
