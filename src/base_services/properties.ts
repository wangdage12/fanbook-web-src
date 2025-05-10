import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

const { FANBOOK_VERSION: appVersion, FANBOOK_PLATFORM: appPlatform } = import.meta.env

export function getSuperProperties() {
  return {
    platform: appPlatform,
    version: appVersion,
    // 'channel': 'fanbook-web',
    // systemName: superProperties.systemName,
    device_id: getDeviceId(),
    build_number: import.meta.env.FANBOOK_BUILD_NUMBER,
  }
}

function getDeviceId(): string {
  let did = Cookies.get('did')
  if (!did) {
    did = uuidv4()
    const now = new Date()
    const expireDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate())
    Cookies.set('did', did, { expires: expireDate })
  }
  return did
}

export function encodeSuperProperties() {
  return btoa(JSON.stringify(getSuperProperties()))
}
