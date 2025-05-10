import axios from 'axios'

const baseURL = import.meta.env.FANBOOK_AUTH_PREFIX

interface AuthApplication {
  client_id: string
  desc: {
    'user.info'?: string
    'user.link'?: string
  }
  description: string | null
  icon: string
  name: string
  scopes: string
}

interface AuthUser {
  avatar: string
  nickname: string
  user_id: string
  username: string
}

export interface AppInfo {
  app: AuthApplication
  redirect_uri?: string
  user: AuthUser
}

export default class AuthApi {
  static async getAppInfo(clientId: string) {
    return axios.get(`/open/oauth2/app?client_id=${clientId}`, { baseURL, originResponse: true })
  }

  static async authorize({ clientId, allow = true, state }: { clientId: string; allow?: boolean; state?: string }) {
    const searchParams = new URLSearchParams()
    searchParams.set('response_type', 'code')
    searchParams.set('client_id', clientId)
    searchParams.set('status_code', '200')
    state && searchParams.set('state', state)
    searchParams.set('allow', allow ? 'true' : 'false')
    return axios.post(
      `/open/oauth2/authorize?${searchParams.toString()}`,
      {
        response_type: 'code',
        client_id: clientId,
        status_code: 200,
        state,
        allow,
      },
      { baseURL, originResponse: true }
    )
  }
}
