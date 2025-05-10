import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { isEmpty, isNil } from 'lodash-es'
import { validBrowser } from '../../utils/browserSupport'
import { AudiovisualUserInfo, MemberItem, MemberItemExternals } from './audiovisual-entity'

export function handleMemberInfo(item: MemberItem): AudiovisualUserInfo {
  let { externals = {} as MemberItemExternals } = item
  if (typeof externals === 'string') {
    externals = safeJSONParse(externals, {} as MemberItemExternals)
  }
  return {
    userId: item.user_id ?? '',
    deviceId: item.device_id ?? '',
    joined: item.joined_at ?? 0,
    muted: item.mute ?? true,
    platform: isEmpty(item.platform) ? 'Mobile' : item.platform,
    ban: item.ban ?? false,
    videoBan: item.ban_camera ?? false,
    fbServerMuted: item.fbServerMuted ?? false,
    enableCamera: item.video_active ?? false,
    isPlayingScreenShare: externals.share_screen ?? false,
    stick: externals.stick ?? false,
    isRoomTempAdmin: externals.is_voice_owner ?? false,
  }
}

let scrollbarWidth: null | number = null

export function getScrollbarWidth() {
  if (!isNil(scrollbarWidth)) {
    return scrollbarWidth
  }
  // 创建一个用于计算滚动条宽度的元素
  const scrollDiv = document.createElement('div')
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  // 将计算元素添加到文档中
  document.body.appendChild(scrollDiv)
  // 计算滚动条宽度
  scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  // 删除计算元素
  document.body.removeChild(scrollDiv)
  // 返回滚动条宽度
  return scrollbarWidth
}

// https://idreamsky.feishu.cn/docx/X3Ufdyk9SopzG2xLL5tcRXSDnqe?contentTheme=DARK&feed_id=7272677873880956929&last_doc_message_id=7273416794744127491&sourceType=feed&theme=light&useNewLarklet=1#part-HH9jd6nypoORZ0xkmuecBgm7nib
export function isMediaSupport() {
  return validBrowser({
    safari: '>=15.1',
    chrome: '>=90',
    edge: '>=90',
    firefox: '>=85',
    chromium: '>=90',
    'QQ Browser': '>=11.9',
  })
}
