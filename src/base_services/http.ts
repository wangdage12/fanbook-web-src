import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import axiosRetry from 'axios-retry'
import registerHeaderInterceptor from './interceptors/header_interceptor'
import registerResponseInterceptor from './interceptors/response_interceptor'
import registerSignatureInterceptor from './interceptors/signature_interceptor'
import Ws, { WsAction } from './ws'

const commonInterceptors = [registerResponseInterceptor, registerHeaderInterceptor, registerSignatureInterceptor]

// 配置重试策略，全局默认不重试，在具体接口覆盖全局设置
axios.defaults.baseURL = import.meta.env.FANBOOK_API_HOST
commonInterceptors.forEach(interceptor => interceptor(axios))
// NOTE 重试拦截器必须放到后面，否则会重复触发前面的拦截器
axiosRetry(axios, { retries: 0, retryDelay: axiosRetry.exponentialDelay })

/**
 * 带内存缓存的 axios 实例，缓存时间 5m
 */
export const cachedAxios = axios.create({ baseURL: axios.defaults.baseURL })
setupCache(cachedAxios, { ttl: 5 * 60 * 1000, methods: ['post'], cacheTakeover: false })
commonInterceptors.forEach(interceptor => interceptor(cachedAxios))

// 存储待合并的请求
const pendingRequests: Map<string, any> = new Map()

/**
 * 创建合并请求的通用函数
 *
 * TODO 取消之前请求, 使用最新的请求
 */
export const mergeRequests =
  <T extends (...args: any[]) => any>(url: string, target: T) =>
  (...params: Parameters<T>): ReturnType<T> => {
    const key = `${url}-${JSON.stringify(params)}`
    // 检查是否有相同参数的请求正在进行中
    if (pendingRequests.has(key)) {
      const call = pendingRequests.get(key)
      if (call) {
        return call
      }
    }
    // 创建新的请求，并将其存储在待合并的请求中
    const request = target(...params)
    pendingRequests.set(key, request)
    // 当请求完成时，从待合并的请求中移除该请求
    request.finally(() => {
      pendingRequests.delete(key)
    })
    // 返回请求
    return request
  }

export function initHTTP() {
  Ws.instance.on(WsAction.Connect, ({ data: { client_id } }) => {
    axios.defaults.headers['client-id'] = client_id
    cachedAxios.defaults.headers['client-id'] = client_id
  })
}
