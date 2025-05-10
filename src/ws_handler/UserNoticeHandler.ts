import { pick } from 'lodash-es'
import { store } from '../app/store.ts'
import { RemarkStruct } from '../components/realtime_components/realtime_nickname/UserAPI.ts'
import { userActions } from '../components/realtime_components/realtime_nickname/userSlice.ts'
import { guildListActions } from '../features/guild_list/guildListSlice.ts'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import { remarkActions } from '../features/remark/remarkSlice.ts'
import { guildUserActions } from '../features/role/guildUserSlice.ts'

interface UserNoticeStruct {
  guild_id?: string
  user_id: string
  user_pending?: boolean
  name?: string
  friend_user_id?: string
  nickname?: string
  avatar?: string
}

export default function handleUserNotice({ data }: { data: UserNoticeStruct }) {
  // 备注
  if (data.user_id && data.name && data.friend_user_id) {
    const remarkData: RemarkStruct = {
      user_remark_id: data.user_id,
      friend_user_id: data.friend_user_id,
      name: data.name,
    }
    store.dispatch(remarkActions.updateRemark(remarkData))
  }
  // 修改用户pending态
  if (data.user_pending != undefined && data.user_id == LocalUserInfo.userId && data.guild_id != undefined) {
    store.dispatch(guildListActions.mergeGuild({ guild_id: data.guild_id, user_pending: data.user_pending }))
  }
  // 修改社区昵称
  if (data.user_id && data.guild_id != undefined && data.nickname != undefined) {
    store.dispatch(guildUserActions.update({ guildId: data.guild_id, userId: data.user_id, user: { nickname: data.nickname } }))
  }

  if (data.nickname || data.avatar) {
    store.dispatch(userActions.update(pick(data, ['user_id', 'nickname', 'avatar'])))
  }
}
