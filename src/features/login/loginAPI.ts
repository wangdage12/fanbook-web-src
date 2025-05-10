import axios from 'axios'
import ServerTime from '../../base_services/ServerTime'
import { FbHttpResponse } from '../../types.ts'
import { LocalUser, LogArgs } from '../local_user/localUserSlice'
import { fbEncrypt } from './fb_encrypt'

export enum LoginType {
  mobile = 'mobile',
  token = 'token',
}

export default class LoginAPI {
  static thirdPartyLogin(params: { app_id: string; code: string; nonce: string; timestamp: string; sign: string; auth: string }) {
    return axios
      .post<
        FbHttpResponse<{
          token: string
          account: string
          password: string
        }>
      >('/api/login/thirdPre', params, {
        originResponse: true,
      })
      .then(res => res.data)
  }
}

// 刷新 token
export async function refreshToken() {
  const response = await axios.post(
    '/api/common/ctk',
    {},
    {
      originResponse: true,
    }
  )
  const sign = response?.headers?.['authorization'] as string | undefined
  let expireTime = ServerTime.now() + 2592000
  if (response?.data?.data?.expire_time) {
    expireTime = response.data.data.expire_time
  }
  // 当前服务器时间后 30 天
  return sign ? { expire_time: expireTime, sign } : undefined
}

export async function sendCaptcha(mobile: string, areaCode: string, encrypt: boolean, captcha_ticket?: string, captcha_rand_str?: string) {
  return axios.post(
    '/api/common/verification',
    {
      mobile: encrypt ? fbEncrypt(mobile) : mobile,
      area_code: areaCode,
      encrypt_type: 'FBE',
      device: 'web',
      code_type: null,
      captcha_ticket,
      captcha_rand_str,
    },
    { toast: true }
  )
}

export async function login(params: LogArgs) {
  const data: Record<string, string> = {
    type: params.type,
  }
  switch (params.type) {
    case LoginType.mobile:
      data.code = fbEncrypt(params.captcha)
      data.area_code = params.areaCode ?? ''
      data.encrypt_type = 'FBE'
      data.mobile = fbEncrypt(params.mobile)
      break
    case LoginType.token:
      data.token = params.token
  }

  return axios.post<
    void,
    LocalUser & {
      // n 是 new 的意思，表示这个用户是新用户
      n?: boolean
    }
  >(
    '/api/user/login',
    {
      device: 'web',
      ...data,
    },
    { toast: true }
  )
}
