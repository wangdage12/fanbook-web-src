import axios, { AxiosError } from 'axios'
import { enc, HmacSHA256 } from 'crypto-js'
import FbToast from 'fb-components/base_ui/fb_toast'
import { v4 as uuidv4 } from 'uuid'

export default class CaiHongStatApi {
  private static readonly CHAppKey = '203799420'
  private static readonly CHAppSecret = 'mctb5e6nhijfg2y2l8kgvb2fje08r9u4'
  private static readonly HTTPMethod = 'POST'
  private static readonly Accept = 'application/json'
  private static readonly ContentType = 'application/x-www-form-urlencoded'
  private static readonly ContentMD5 = ''
  private static readonly BaseUrl = 'https://alidata-iplay.uu.cc'
  private static readonly Path = '/fb/circle/creator'

  private static toReqParameterString(reqParameters: Record<string, any>): string {
    const reqKeys = Object.keys(reqParameters).sort()
    let parameters = ''
    for (const key of reqKeys) {
      if (Array.isArray(reqParameters[key])) {
        const l = reqParameters[key] as any[]
        parameters += `${key}=${l[0]}`
      } else {
        parameters += `${key}=${reqParameters[key]}`
      }
      if (reqKeys.indexOf(key) < reqKeys.length - 1) parameters += '&'
    }
    return parameters
  }

  private static stringToSignForSha256(stringToSign: string): string {
    const shaSecretKey = HmacSHA256(stringToSign, CaiHongStatApi.CHAppSecret)
    return enc.Base64.stringify(shaSecretKey)
  }

  private static toSignHeader(): [Record<string, any>, string, string] {
    const date = new Date()
    const header: Record<string, any> = {
      'X-Ca-Key': CaiHongStatApi.CHAppKey,
      'X-Ca-Nonce': uuidv4(),
      'X-Ca-Signature-Method': 'HmacSHA256',
      'X-Ca-Timestamp': date.getTime(),
    }
    const headKeys = Object.keys(header).sort()
    let headerSB = ''
    for (const key of headKeys) {
      headerSB += `${key}:${header[key]}\n`
    }
    return [header, headerSB, headKeys.join(',')]
  }

  private static toSignString(headerString: string, pathAndParameters: string): string {
    let stringToSign = ''
    stringToSign += `${CaiHongStatApi.HTTPMethod}\n`
    stringToSign += `${CaiHongStatApi.Accept}\n`
    stringToSign += `${CaiHongStatApi.ContentMD5}\n`
    stringToSign += `${CaiHongStatApi.ContentType}\n`
    stringToSign += '\n'
    stringToSign += `${headerString}`
    stringToSign += `${pathAndParameters}`
    return stringToSign
  }

  public static async fetchCircleStat(postId: string): Promise<CircleStatStruct | undefined> {
    try {
      const url = `${CaiHongStatApi.BaseUrl}${CaiHongStatApi.Path}`
      const reqParameters = { 'post_id': postId }
      const [header, headerString, signHeaderString] = CaiHongStatApi.toSignHeader()
      const parameters = CaiHongStatApi.toReqParameterString(reqParameters)
      const pathAndParameters = `${CaiHongStatApi.Path}?${parameters}`
      const stringToSign = CaiHongStatApi.toSignString(headerString, pathAndParameters)
      const signature = CaiHongStatApi.stringToSignForSha256(stringToSign)
      header['Accept'] = CaiHongStatApi.Accept
      header['Content-Type'] = CaiHongStatApi.ContentType
      header['Content-MD5'] = ''
      header['X-Ca-Signature-Headers'] = signHeaderString
      header['X-Ca-Signature'] = signature
      const instance = axios.create({
        baseURL: CaiHongStatApi.BaseUrl,
        headers: header,
      })
      const res = await instance.post<CircleStatResp>(url, reqParameters, { headers: header })
      if (res.status == 200 && res.data && res.data.errCode == 0 && res.data.data.length > 0) return res.data.data[0]
      return undefined
    } catch (e) {
      if (e instanceof AxiosError) {
        FbToast.open({ type: 'error', content: '网络异常，请稍后重试' })
      }
      throw e
    }
  }
}

export interface CircleStatStruct {
  // 浏览量
  view_cnt?: number
  // 曝光量
  exposure_cnt?: number
  // 曝光-浏览比
  exposure_view_rate?: number
  // 平均浏览时长
  avg_view_duration?: number
  // 5s完播量
  valid_visit_duration_cnt?: number
  // 完播量
  play_finish_cnt?: number
  // 完播率
  play_finish_rate?: number
  // 5s完播率
  valid_visit_duration_rate?: number
}

export interface CircleStatResp {
  errCode?: number
  errMsg?: string
  data: CircleStatStruct[]
}
