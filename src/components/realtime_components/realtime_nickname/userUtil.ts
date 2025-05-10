import ServerTime from '../../../base_services/ServerTime.ts'
import { UserStruct } from './UserAPI'

export function checkDMBan(targetUser: UserStruct) {
  const dmBan = isNaN(Number(targetUser.dm_ban_expire)) ? null : Number(targetUser.dm_ban_expire)
  return !!dmBan && (dmBan ?? 0) > ServerTime.now()
}
