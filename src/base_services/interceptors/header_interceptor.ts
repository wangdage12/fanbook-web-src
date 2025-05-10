import { AxiosInstance } from 'axios'
import { encodeSuperProperties } from '../properties'

export default async function registerHeaderInterceptor(instance: AxiosInstance) {
  const superProperties = await encodeSuperProperties()
  instance.interceptors.request.use(
    async config => {
      config.headers.set('language', navigator.languages[0])
      config.headers.set('x-super-properties', superProperties)
      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  )
}
