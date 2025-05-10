import axios from 'axios'

export default class MessageCardApi {
  static autoSetKey(channel_id: string, message_id: string, max: number) {
    return axios.post('/api/messageCard/auto', {
      channel_id,
      message_id,
      max,
    })
  }
  static setKey(channel_id: string, message_id: string, key: string) {
    return axios.post('/api/messageCard/click', {
      channel_id,
      message_id,
      key,
    })
  }

  static clearKey(channel_id: string, message_id: string, key: string) {
    // logger.info("假装 clear 请求成功了");
    // return;
    return axios.post('/api/messageCard/cancel', {
      channel_id,
      message_id,
      key,
    })
  }
}
