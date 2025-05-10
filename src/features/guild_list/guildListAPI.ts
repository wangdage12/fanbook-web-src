import axios from 'axios'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { Base64 } from 'js-base64'
import { keyBy } from 'lodash-es'
import Long from 'long'
import protobuf from 'protobufjs/minimal'
import { Protocols } from '../../proto/pb_boundle'

const MyGuild = Protocols.Protobuf.PBClass.MyGuild
protobuf.util.Long = Long
// 默认值也序列化
protobuf.util.toJSONOptions = { ...protobuf.util.toJSONOptions, defaults: true }
protobuf.configure()

export async function fetchGuildList() {
  return axios
    .post<undefined, string>(
      '/api/v3/guild/myGuild',
      // 可以直接看 json 数据
      null, // { 'encoding': 'json' },
      {
        'axios-retry': {
          retries: Infinity,
        },
      }
    )
    .then(res => {
      const myGuilds = MyGuild.MyGuilds.decode(Base64.toUint8Array(res))
      const { guilds } = myGuilds.toJSON() as { guilds: GuildStruct[] }
      for (const guild of guilds) {
        guild.system_channel_message_pic = safeJSONParse(guild.system_channel_message_pic, { template: 0, useCustomPicture: false })
        guild.system_channel_message = safeJSONParse(guild.system_channel_message, { title: '', v2: '' })

        /*
         *  [ { <bot-id>: <command-name> } ] 旧接口
         * 每个 obj 只会有一个 key 和 value，这会导致逻辑变得复杂
         *
         *  使用 pb 后修改成下面结构, pb 不支持上面结构
         * [{bot_setting_list : { <bot-id>: <command-name> }}] 因此为了避免改动过多, 请求完数据后预处理成上面的结构
         */
        const channels: Record<string, ChannelStruct> = {}
        ;(guild.channels as unknown as ChannelStruct[]).forEach(channel => {
          if (channel.bot_setting_list && channel.bot_setting_list.length > 0) {
            channel.bot_setting_list = (channel.bot_setting_list as unknown as { bot_setting_list: Record<string, string> }[]).map(item => {
              return item.bot_setting_list
            })
          }
          channels[channel.channel_id] = channel
        })
        guild.channels = channels
        for (const cid in guild.channels) {
          guild.channels[cid].overwrite = keyBy(guild.channels[cid].overwrite, 'id')
        }
        guild.roles = keyBy(guild.roles, 'role_id')
      }
      return guilds
    })
}
