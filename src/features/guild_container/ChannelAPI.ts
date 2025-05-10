import axios from 'axios'
import { MessageStruct } from 'fb-components/components/messages/types'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type.ts'
import parseMessage from '../message_list/transformer'

type CreateChannelRes = Partial<ChannelStruct> & { channel_id: string; permission_overwrites: [] }
export default class ChannelAPI {
  static topList(channel_id: string): Promise<MessageStruct | null> {
    return axios
      .post<undefined, { records: MessageStruct[] }>('/api/message/TopList', {
        channel_id,
      })
      .then(({ records }) => {
        if (records.length === 0) return null
        return parseMessage(records[0])
      })
  }

  static update(value: Partial<ChannelStruct> & { guild_id: string; channel_id: string }): Promise<void> {
    return axios.post('/api/channel/up', value)
  }

  static deleteChannel(guild_id: string, channel_id: string, channel_lists: string[]): Promise<void> {
    return axios.post('/api/channel/del', { guild_id, channel_id, channel_lists })
  }

  static create(value: Partial<ChannelStruct> & { guild_id: string }): Promise<CreateChannelRes> {
    return axios.post('/api/channel/create', value)
  }

  static async migrateCircleTopic(data: { guild_id: string; topic_id: string; permission_overwrites: PermissionOverwrite[]; link: string }) {
    const channel = await axios.post<never, ChannelStruct>('/api/channel/convertCreate', data, {
      toast: true,
    })
    // @ts-expect-error 不知道为什么这个接口返回的结构体名称不一样
    channel.overwrite = channel.permission_overwrites
    channel.guild_id = data.guild_id
    return channel
  }
}
