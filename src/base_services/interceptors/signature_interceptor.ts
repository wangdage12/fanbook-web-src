import { AxiosInstance } from 'axios'
import { sortBy } from 'lodash-es'
import md5 from 'md5'
import { v4 as uuidv4 } from 'uuid'
import StateUtils from '../../utils/StateUtils'

const { FANBOOK_SECRET: appSecret, FANBOOK_KEY: appKey, FANBOOK_PLATFORM: platform } = import.meta.env

interface CommonFields {
  Nonce: string
  Timestamp: number
  Authorization?: string
  AppKey: string
  RequestBody?: string
  Platform: 'web'
}

function fixedEncodeURIComponent(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

export function getSignature(signatureMap: CommonFields): string {
  let chain = sortBy(Object.entries(signatureMap), ([k]) => k)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  chain = chain + '&' + appSecret
  const signature = fixedEncodeURIComponent(chain)
  return md5(signature)
}

export default function registerSignatureInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(
    config => {
      // 如果是重试，data 会变成字符串，因此不做重新签名了
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (config['axios-retry']?.retryCount) {
        return config
      }
      const authorization = StateUtils.localUser?.sign ?? ''
      const common: CommonFields = {
        Nonce: uuidv4(),
        Timestamp: Date.now(),
        Authorization: authorization,
        AppKey: appKey,
        Platform: platform as never,
      }

      for (const k in common) {
        config.headers[k] = common[k as keyof CommonFields]
      }

      if (config.data) {
        config.data.transaction = uuidv4()
        common.RequestBody = JSON.stringify(config.data)
      } else {
        common.RequestBody = ''
      }
      config.headers.set('signature', getSignature(common))
      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  )
}
