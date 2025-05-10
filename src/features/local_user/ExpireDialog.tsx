import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import AppRoutes from '../../app/AppRoutes'
import { router } from '../../app/router'
import StateUtils from '../../utils/StateUtils'

let modalVisible = false

export const handleAuthExpire = () => {
  if (modalVisible) return
  modalVisible = true
  showFbModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    closable: false,
    showCancelButton: false,
    maskClosable: false,
    onCancel() {
      modalVisible = false
    },
    onOk() {
      modalVisible = false
      StateUtils.logout()
      const searchParams = new URLSearchParams()
      searchParams.append('redirectUrl', window.location.pathname + window.location.search)
      const target = `${AppRoutes.LOGIN}?${searchParams.toString()}`
      router.navigate(target, { replace: true }).then()
    },
  })
}
