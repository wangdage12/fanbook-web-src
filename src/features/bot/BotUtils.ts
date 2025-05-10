import BotAPI, { ChannelUpdateBotsAction } from './BotAPI.ts'

export default class BotUtils {
  static removeBotFromChannel(guildId: string, channelId: string, botId: string) {
    return BotAPI.updateBotScope(guildId, [channelId], [botId], ChannelUpdateBotsAction.Remove, 'channel')
  }
}
