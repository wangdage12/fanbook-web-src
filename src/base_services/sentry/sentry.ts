import { BrowserTracing } from '@sentry/browser'
import { configureScope, init } from '@sentry/react'

const needless = !['production', 'prerelease', 'sandbox', 'test'].includes(import.meta.env.MODE) || !import.meta.env.PROD

export const initSentry = () => {
  if (needless) {
    return
  }
  init({
    dsn: import.meta.env.FANBOOK_SENTRY_DSN,
    release: import.meta.env.FANBOOK_WEB_RELEASE,
    integrations: [new BrowserTracing()],
    // 用来区分什么环境下的错误
    environment: import.meta.env.MODE,
    maxBreadcrumbs: 10,
    // 上报的百分比
    tracesSampleRate: 0.3,
    beforeSend: (err, hint) => {
      // 这里可以设置一些过滤规则，return null 将不会上报
      // 比如开发模式下不上报
      // if (!['production', 'prerelease', 'test'].includes(import.meta.env.MODE)) {
      //   return null
      // }
      console.log('%c [ 🚀 ~ hint ] -15-「sentry.ts」', 'font-size:14px; background:#befb29; color:#ffff6d;', hint)
      return err
    },
  })
}

export const setSentryScope = (user: { id: string; username: string } | null) => {
  if (needless) {
    return
  }
  // 设置全局用户信息
  configureScope(scope => {
    scope.setUser(user)
  })
}
