import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast'
import AuthModal from './AuthModal'
import AuthApi, { AppInfo } from './authApi'

export class AuthUtils {
  // 接受邀请弹窗
  static async showAuthModal({ clientId, scheme, host, state }: { clientId: string; scheme?: string; host?: string; state?: string }): Promise<void> {
    let appInfo: AppInfo
    try {
      const res = await AuthApi.getAppInfo(clientId)
      const { data } = res
      appInfo = data
    } catch (err) {
      FbToast.open({ content: '获取应用信息失败', type: 'error', key: 'getAppInfo' })
      return
    }
    return new Promise<void>(resolve => {
      const { destroy: close } = showFbModal({
        width: 352,
        showCancelButton: false,
        showOkButton: false,
        title: null,
        closable: false,
        maskClosable: false,
        className: 'auth-modal',
        content: (
          <AuthModal
            appInfo={appInfo}
            scheme={scheme}
            host={host}
            state={state}
            onClose={() => {
              close()
              resolve()
            }}
          ></AuthModal>
        ),
      })
    })
  }
}
