// organize-imports-ignore
import './base.css'
// organize-imports-ignore
import './index.css'
// organize-imports-ignore
import '../public/css/emoji.css'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import React from 'react'
import ReactDOM from 'react-dom/client'
import NotSupport from './NotSupport'
import { initSentry } from './base_services/sentry/sentry'
import Loading from './components/loading/Loading.tsx'
import browser from './utils/browser'
import { validBrowser } from './utils/browserSupport.ts'
// 需要引用 dayjs 的 locale, 仅设置 dayjs.locale('zh-cn') 无法引用到 locale
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(duration)
dayjs.extend(isBetween)

async function init() {
  try {
    // 初始化 sentry
    initSentry()
  } catch (err) {
    console.error(err)
  }

  const isValidBrowser = validBrowser({
    safari: '>=14.1',
    chrome: '>=86',
    edge: '>=86',
    firefox: '>=79',
    chromium: '>=86',
    'QQ Browser': '>=11.9',
  })
  const rootEle = document.getElementById('root')
  const root = rootEle && ReactDOM.createRoot(rootEle)
  if (!browser.isMobile() && !isValidBrowser) {
    root?.render(
      <React.StrictMode>
        <NotSupport />
      </React.StrictMode>
    )
    return
  }
  import('./Index.tsx').then(({ init }) => {
    init(root)
  })

  root?.render(
    <React.StrictMode>
      <Loading></Loading>
    </React.StrictMode>
  )
}

init()
