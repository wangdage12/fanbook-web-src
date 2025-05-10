import axios from 'axios'
import UploadCos, { CosAuth } from 'fb-components/utils/upload_cos/UploadCos.ts'
import { ReactNode, StrictMode } from 'react'
import type { InspectorProps } from 'react-dev-inspector'
import ReactDOM from 'react-dom/client'
import App from './App'
import './antd.less'
import './base_services/env'
import { initHTTP } from './base_services/http'
import './form.less'
import { initServerSideConfigServiceWithNoAuth } from './services/ServeSideConfigService.ts'

const CosPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDF8yMzDqMl5MpMvfqfo30rnEqF
KtutVKswyURpJD3O94ECE8vC1xtcwYBtCGcppgAvnzjtKJTiZYnLT/KOYlg1yShb
nu0MAtVKASvSbDGgkUGcuBnDsDu2jo40CV9kEcbc5QID5uCXjrr+J1nGoaIMdix8
md+vUFTIZbt+NnxrnQIDAQAB
-----END PUBLIC KEY-----`

export async function init(root: ReactDOM.Root | null) {
  initHTTP()
  // 给 UploadCos 设置获取临时密钥的方法
  UploadCos.setFetchCosConfig(() => {
    return axios.post<undefined, CosAuth>('/api/file/cosTmpKey')
  })
  // 给 UploadCos 设置公钥
  UploadCos.setPublicKey(CosPublicKey)

  initServerSideConfigServiceWithNoAuth()

  // 开发环境增加组件定位插件
  let Inspector: ((props: InspectorProps) => ReactNode) | null = null
  if (import.meta.env.DEV) {
    const { Inspector: _Inspector } = await import('react-dev-inspector')
    Inspector = _Inspector
  }

  document.body.oncontextmenu = evt => {
    // <div data-ignore-content-menu /> 元素上会可以触发右键菜单
    if (!(evt.target as HTMLElement).closest('[data-ignore-content-menu]')) {
      evt.preventDefault()
    }
  }
  document.body.ondrop = e => e.preventDefault()
  document.body.ondragover = e => e.preventDefault()

  root?.render(
    <StrictMode>
      {Inspector ?
        <Inspector>
          <App />
        </Inspector>
      : <App />}
    </StrictMode>
  )
}
