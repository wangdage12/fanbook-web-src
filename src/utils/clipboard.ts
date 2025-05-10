import { NoticeType } from 'antd/es/message/interface'
import FbToast from 'fb-components/base_ui/fb_toast'

export async function legacyCopyToClipboard(text: string) {
  const tempTextarea = document.createElement('textarea')
  tempTextarea.value = text
  tempTextarea.style.position = 'fixed' // 将元素定位为 fixed
  tempTextarea.style.left = '-9999px' // 将元素移出可视区域
  document.body.appendChild(tempTextarea)
  tempTextarea.select()
  document.execCommand('copy')
  document.body.removeChild(tempTextarea)
}

export async function checkPermission() {
  try {
    //@ts-expect-error navigator.permissions is not in the lib.dom.d.ts
    const permissionStatus = await navigator?.permissions?.query({ name: 'clipboard-write' })
    return ['granted', 'prompt'].includes(permissionStatus.state)
  } catch (err) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
    // Firefox doesn't support clipboard-write
    console.error(err)
    return true
  }
}

export async function copyToClipboard(text: string) {
  const hasPermission = await checkPermission()
  if (!hasPermission) {
    try {
      legacyCopyToClipboard(text)
      return true
    } catch (err) {
      console.error(err)
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error(err)
    try {
      legacyCopyToClipboard(text)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
}

export async function copyText(text: string, message = '复制成功', toastType: NoticeType = 'success') {
  const copySuccess = await copyToClipboard(text)
  message &&
    copySuccess &&
    FbToast.open({
      type: toastType,
      content: message,
      key: 'share-link-success',
    })
}
