import { useCallback } from 'react'
import { InviteUtils } from '../../invite/utils'

export default function useJoinGuild(guildId?: string, option?: { afterJoin?: (isCancel?: boolean) => void; autoJumpToGuild?: boolean }) {
  const handleGuildClick = useCallback(async () => {
    if (guildId) {
      await InviteUtils.showJoinModal({ guildId, ...option })
    }
  }, [guildId])

  return handleGuildClick
}
