import React, { useContext } from 'react'
import { useAppSelector } from '../../app/hooks.ts'
import { GuildContext } from '../../features/home/GuildWrapper.tsx'
import { remarkSelectors } from '../../features/remark/remarkSlice.ts'
import { guildUserSelectors } from '../../features/role/guildUserSlice.ts'

interface RealtimeAliasNameProps {
  userId: string
  guildId?: string
  children: (name?: string) => React.ReactNode
}

export function RealtimeAliasName({ userId, guildId, children }: RealtimeAliasNameProps) {
  guildId ??= useContext(GuildContext)?.guild_id
  const remark = useAppSelector(remarkSelectors.remark(userId))
  const guildNickname = useAppSelector(guildUserSelectors.nickname(guildId ?? '', userId))
  return children(remark ?? guildNickname)
}
