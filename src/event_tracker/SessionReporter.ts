import { Reporter } from 'fanbook-lib-reporter'
import { globalEmitter, GlobalEvent } from '../base_services/event.ts'
import createEventReporter from './index.ts'

/// 用户会话埋点，例如登录和登出

let loginReporter: Reporter<{ login_log_type: 'app_login' }>

requestAnimationFrame(() => {
  loginReporter = createEventReporter('dlog_app_login_fb')

  const logoutReporter = createEventReporter<{
    logout_log_type: 'app_logout'
    online_duration: number
  }>('dlog_app_logout_fb')

  globalEmitter.on(GlobalEvent.Logout, logout)

  function logout() {
    logoutReporter.pushMsg({
      logout_log_type: 'app_logout',
      online_duration: loginTime === -1 ? 0 : ((performance.now() - loginTime) / 1000) | 0,
    })
  }
  window.addEventListener('beforeunload', () => {
    logout()
    logoutReporter.report()
  })
})

let loginTime = -1

export const reportLogin = () => {
  loginTime = performance.now()
  loginReporter?.pushMsg({
    login_log_type: 'app_login',
  })
}
