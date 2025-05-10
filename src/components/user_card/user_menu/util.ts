import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { store } from '../../../app/store.ts'
import BotAPI, { CommandOp } from '../../../features/bot/BotAPI'
import GuildUtils from '../../../features/guild_list/GuildUtils'
import { guildListActions } from '../../../features/guild_list/guildListSlice.ts'

/** 依次删除当前社区下所有频道中该机器人的快捷指令 */
export async function removeAllChannelBot(robotId: string, guildId: string): Promise<void> {
  const guild = guildId ? GuildUtils.getGuildById(guildId) : null
  const channels = guild?.channels ? Object.values(guild?.channels) : []
  const channelIds = new Set<string>()
  const commands = new Set<string>()
  for (const channel of channels) {
    for (const { key, value } of channel.bot_setting_list || []) {
      if (key === robotId) {
        channelIds.add(channel.channel_id)
        commands.add(value)
      }
    }
  }
  if (!guildId || channelIds.size === 0 || commands.size === 0) return

  await BotAPI.channelSetCommands(Array.from(channelIds), guildId, robotId, CommandOp.del, Array.from(commands))

  for (const channel of channels) {
    if (!channelIds.has(channel.channel_id)) continue
    removeBotFromChannel(channel, robotId)
  }
}
export function removeBotFromChannel(channel: ChannelStruct, robotId: string): void {
  store.dispatch(
    guildListActions.mergeChannel({
      guild_id: channel.guild_id,
      channel_id: channel.channel_id,
      bot_setting_list: channel.bot_setting_list?.filter(obj => {
        const firstEntry = Object.entries(obj)[0]
        const botId = firstEntry[0]
        return botId !== robotId
      }),
    })
  )
}
