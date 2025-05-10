import axios, { AxiosError } from 'axios'
import ServeSideConfigService from '../services/ServeSideConfigService.ts'

/**
 * 检查链接是否经过审核
 * @param url
 */
export default async function checkLinkIsLegal(url: string): Promise<boolean> {
  try {
    const auditConfig = ServeSideConfigService.setting
    if (!auditConfig || !(auditConfig?.risk_switch ?? 0)) {
      return true
    }
    const instance = axios.create({
      baseURL: auditConfig.risk_domain,
    })
    await instance.post(riskUrlPath, { url })
    return true
  } catch (e) {
    if (e instanceof AxiosError) throw e
    return false
  }
}

// 链接检查path
export const riskUrlPath = '/api/risk/url'
