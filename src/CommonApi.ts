import axios from 'axios'

export default class CommonApi {
  static async validateUrl(url: string) {
    return axios.post('/api/common/urlValidCheck', {
      link: url,
    })
  }
}
