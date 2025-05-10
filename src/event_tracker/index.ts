import { Reporter } from 'fanbook-lib-reporter'
import { v4 as uuidv4 } from 'uuid'
import { globalEmitter, GlobalEvent } from '../base_services/event.ts'

import ServerTime from '../base_services/ServerTime.ts'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import './SessionReporter.ts'

let session_id = sessionStorage.getItem('session_id')
if (!session_id) {
  session_id = uuidv4()
  sessionStorage.setItem('session_id', session_id)
}

let seq_id = 0

globalEmitter.on(GlobalEvent.Logout, () => {
  seq_id = 0
})

/**
 * 通过这个方法创建一个事件上报器，`uniqueLogType` 就是数据组给的 log_type
 * 同时它需要是一个唯一的字符串，用于区分不同的事件上报器。请确保全局只有唯一的相同类型
 * @param uniqueLogType 数据组给的 log_type，全局唯一
 */
export default function createEventReporter<T extends Record<string, unknown>>(uniqueLogType: string) {
  return new Reporter<T>(uniqueLogType, {
    reportUrl: import.meta.env.FANBOOK_DLOG_URL,
    commonMsgFields: {
      log_type: uniqueLogType,
    },
    transformMsg: msg => {
      msg.user_id = LocalUserInfo.userId
      msg.app_version = import.meta.env.FANBOOK_VERSION
      msg.platform = msg.channel = 2
      msg.device_id = 'tmp'
      msg.app_session_id = session_id
      msg.screen_width = window.screen.width
      msg.screen_height = window.screen.height
      msg.sys_lang = navigator.language
      msg.fb_server_time = ServerTime.now()
      msg.build_number = import.meta.env.FANBOOK_BUILD_NUMBER
      msg.seq_id = seq_id++
      return msg
    },
  })
}
