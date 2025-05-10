import { HmacSHA256 } from 'crypto-js'
import { openPopupView } from 'fanbook-sdk/src/utils'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import AppRoutes from '../../app/AppRoutes'
import StateUtils from '../../utils/StateUtils'
import browser from '../../utils/browser'
import { setCookie } from '../../utils/cookie'
import { FbEventInstance } from './MP'

export const physicalWidth = 500
export const physicalHeight = 800

export interface OpenMiniProgramOptions {
  /**
   * 打开小程序的宿主页面时 guildId
   */
  guildId?: string
  /**
   * 打开小程序的宿主页面时 channelId (如果是私信, 则为私信的 channelId)
   */
  channelId?: string
  /**
   * 是否来自于私信
   */
  isFromDM?: boolean
}

export interface MPInstanceGlobal extends OpenMiniProgramOptions {
  uniqueId: string
  /**
   * 小程序页面地址
   */
  url: string
  /**
   * 小程序窗口
   */
  target: Window | null
}

export const MPInstances: Record<string, MPInstanceGlobal> = {}

function getTopDomain(hostname: string) {
  //check if it's IP address
  if (/^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
    return hostname
  }

  let domain = hostname
  const splitArr = domain.split('.')
  const arrLen = splitArr.length

  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1]
  }
  return domain
}

export async function openMiniProgram(url: string, options: OpenMiniProgramOptions, isFromPopup = false) {
  const { guildId, channelId, isFromDM = false } = options
  const mpInstance: Partial<MPInstanceGlobal> = {
    url,
    guildId,
    channelId,
    isFromDM,
  }
  const uniqueId = HmacSHA256(JSON.stringify(mpInstance), 'fanbook').toString()
  const instance = MPInstances[uniqueId]
  if (instance && !instance.target?.closed) {
    instance.target?.focus()
    return
  }
  mpInstance.uniqueId = uniqueId

  await FbEventInstance.init()

  FbEventInstance.addTabView(uniqueId, url)

  // 注入 token
  setCookie('token', StateUtils.localUser.sign, { path: '/', domain: `.${getTopDomain(location.hostname)}` })

  const pathname = `${browser.isDesktop() ? '#' : ''}/${AppRoutes.MP_INNER}/${FbEventInstance.uniqueId}/${uniqueId}`
  mpInstance.target = openPopupView(pathname, uniqueId, physicalWidth, physicalHeight)

  if (!mpInstance.target) {
    delete MPInstances[uniqueId]
    FbEventInstance.removeTabView(uniqueId)
    return isFromPopup ? null : (
        new Promise<void>(resolve => {
          showFbModal({
            title: '提示',
            content: '小程序被浏览器拦截，是否允许打开小程序？',
            okText: '允许',
            onOk: () => {
              openMiniProgram(url, options, true)
              resolve()
            },
          })
        })
      )
  }
  MPInstances[uniqueId] = mpInstance as MPInstanceGlobal
}
