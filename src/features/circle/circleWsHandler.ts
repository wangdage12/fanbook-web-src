import { PostStruct } from 'fb-components/circle/types'
import { store } from '../../app/store'
import GuildUtils from '../guild_list/GuildUtils'
import { unreadActions } from '../message_list/unreadSlice'

interface CircleWsDataStruct {
  hot_record: PostStruct
  records: PostStruct
  message_id: string
  action: string
  guild_id: string
  method: string | 'post_add'
  new_post_total: number
}

export function handleCircleEnter({ data }: { data: CircleWsDataStruct }) {
  if (data == null) return
  try {
    const { method, guild_id, message_id } = data
    if (!guild_id) return
    const guild = GuildUtils.getGuildById(guild_id)
    if (!guild || !guild.circle_display) return
    if (!data.hot_record && data.records) return
    //产品暂定：只管新增动态，删除动态不减未读数
    if (method === 'post_add' && message_id) {
      store.dispatch(
        unreadActions.increaseUnreadNum({
          guildId: guild_id,
          channelId: guild.circle.channel_id,
          messageId: message_id,
          onlyShowDot: false,
        })
      )
    }
  } catch (err) {
    console.error(err)
  }
}
