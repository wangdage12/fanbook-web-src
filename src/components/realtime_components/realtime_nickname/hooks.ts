import { isEqual } from 'lodash-es'
import { useContext, useEffect } from 'react'
import { useAppSelector } from '../../../app/hooks'
import { GuildContext } from '../../../features/home/GuildWrapper'
import { remarkSelectors } from '../../../features/remark/remarkSlice'
import { guildUserSelectors } from '../../../features/role/guildUserSlice'
import { UserHelper, selectUser } from './userSlice'

export const useUserInfo = (userId?: string, guildId?: string) => {
  const user = useAppSelector(selectUser(userId), isEqual)
  const guild = useContext(GuildContext)
  guildId ??= guild?.guild_id
  const guildNickname = useAppSelector(guildUserSelectors.nickname(guildId ?? '', userId))
  const remark = useAppSelector(remarkSelectors.remark(userId))
  useEffect(() => {
    if (!user && userId) {
      // 如果本地没数据，用来发起请求
      UserHelper.getUser(userId, guildId).then()
    }
  }, [userId])
  return { user, guildNickname, remark }
}
