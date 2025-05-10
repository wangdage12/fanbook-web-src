import { AxiosError, AxiosInstance } from 'axios'
import { message } from 'fb-components/base_component/entry'
import { handleAuthExpire } from '../../features/local_user/ExpireDialog'
import { FbHttpResponse } from '../../types'

const handleToast = (toast = false, desc: string) => {
  if (toast) {
    message.warning(desc).then()
  }
}

export default function registerResponseInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    response => {
      if (response.status === 204) return response

      const result = response.data as FbHttpResponse<any>
      const { toast = false, originResponse = false, json = false } = response.config ?? {}
      if (json) {
        return result
      }
      const { desc, code, data, status } = result ?? {}
      // 1042 token错误 1043 token过期
      if (code === 1042 || code === 1043) {
        handleAuthExpire()
        return Promise.reject(new BusinessError(code, desc))
      }
      if (!originResponse) {
        // 成员列表返回200，bot中返回了status：true
        if (code == 1000 || code == 200 || status) {
          return data
        } else {
          handleToast(toast, desc)
          return Promise.reject(new BusinessError(code, desc))
        }
      } else {
        if (response.status.toString().startsWith('4') || response.status.toString().startsWith('5')) {
          handleToast(toast, '网络异常，请稍后重试')
        } else {
          if (data && code != 1000 && code != 200) {
            handleToast(toast, desc)
          }
        }

        return response
      }
    },
    error => {
      if (error instanceof AxiosError && error.config?.toast) {
        handleToast(true, '网络异常，请稍后重试')
      }

      return Promise.reject(error)
    }
  )
}

export class BusinessError extends Error {
  code: number
  desc?: string

  constructor(code: number, desc?: string) {
    super(code + ' ' + desc)
    this.code = code
    this.desc = desc
    this.name = 'BusinessError'
  }
}
