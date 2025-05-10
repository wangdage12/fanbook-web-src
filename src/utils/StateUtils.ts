import { store } from '../app/store'
import { globalEmitter, GlobalEvent } from '../base_services/event.ts'
import Ws from '../base_services/ws'
import { globalAudiovisualManager } from '../features/audiovisual/audiovisual-hook'
import { leaveRoom } from '../features/audiovisual/audiovisual-slice'
import { guildListActions } from '../features/guild_list/guildListSlice'
import { LocalUser, localUserSlice } from '../features/local_user/localUserSlice'

export default class StateUtils {
  static get localUser(): LocalUser {
    return store.getState().localUser.userInfo!
  }

  static async logout() {
    globalEmitter.emit(GlobalEvent.Logout)

    await globalAudiovisualManager?.destroy()
    // 离开音视频房间
    store.dispatch(leaveRoom())
    store.dispatch(localUserSlice.actions.logout())
    store.dispatch(guildListActions.updateList([]))
    store.dispatch(guildListActions.updateListReady(false))

    Ws.instance.close(false)
  }
}
