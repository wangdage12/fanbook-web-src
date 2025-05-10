import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { store } from '../app/store.ts'
import { guildListActions } from '../features/guild_list/guildListSlice.ts'

export default function handleBotSettingsList({
  data: { bot_setting, channel_id, guild_id },
}: {
  data: { bot_setting: ChannelStruct['bot_setting_list']; channel_id: string; guild_id: string }
}) {
  store.dispatch(
    guildListActions.updateChannel({
      guild_id,
      channel_id,
      bot_setting_list: bot_setting,
    })
  )
}
