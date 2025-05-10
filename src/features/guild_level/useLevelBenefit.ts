import { useMemo } from 'react'
import { useAppSelector } from '../../app/hooks.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import Benefit from './Benefit.ts'
import { guildLevelSelectors, VerificationStatus } from './guild-level-slice.ts'

export default function useLevelBenefit(benefit?: Benefit, guildId?: string) {
  const guildLevelInfo = useAppSelector(guildLevelSelectors.guildLevelInfoByGuildId(guildId))
  return useMemo(() => {
    if (!benefit) return true

    guildId ??= GuildUtils.getCurrentGuildId()
    if (!guildId) return false

    if (VerificationStatus.officialVerified(guildId)) return true

    const guild = GuildUtils.getGuildById(guildId)
    const { hierarchy } = guildLevelInfo ?? guild ?? { hierarchy: 0 }
    return hierarchy >= benefit.requiredLevel
  }, [guildId])
}
