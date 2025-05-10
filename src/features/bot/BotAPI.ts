import axios from 'axios'
import { MessageStruct } from 'fb-components/components/messages/types'

export enum ChannelUpdateBotsAction {
  Remove,
  Add,
}
export interface BotStruct {
  bot_id: string
  owner_id: string
  username: string
  bot_name: string
  bot_description?: string
  bot_about?: string
  bot_avatar: string
  commands: BotCommand[]
  bot_permissions: number
  bot_class: number
  bot_token?: string
  enable_inline_mode: boolean
  enable_inline_geo: boolean
  join_group_allowed: boolean
  enable_group_privacy_mode: boolean
  market: boolean
  guilds?: unknown
  created_at: number
  updated_at: number
}

interface BotCommandFormParameter {}
interface BotCommandSelectParameter {}

export interface BotCommand {
  url?: string
  app_id?: string
  command_id: string
  command: string
  description?: string
  visible_level: number
  hide: boolean
  clickable: boolean
  form_parameters?: BotCommandFormParameter[]
  select_parameters?: BotCommandSelectParameter[]
}

export enum CommandOp {
  add = 'add',
  del = 'del',
}

export default class BotAPI {
  static async getArticles(params: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
    try {
      const res = await axios.post('/api/bot/sendInlineQuery', params)
      return res.data
    } catch (error) {
      console.error(error)
      return undefined
    }
  }

  static async invokeRemoteCallback({
    userId,
    channelId,
    botId,
    id,
    data,
    message,
  }: {
    userId: string
    channelId: string
    botId: string
    id: number
    data?: string
    message?: MessageStruct
  }): Promise<any> {
    try {
      const res = await axios.post('/api/bot/sendCallbackQuery_v2', {
        user_id: userId,
        data,
        channel_id: channelId,
        bot_id: botId,
        id: id.toString(),
        ...(message && {
          message: {
            ...message,
            time: message.time.valueOf(),
            message_id: message.message_id.toString(),
            content: JSON.stringify(message.content),
          },
        }),
      })
      return res
    } catch (error) {
      console.error(error)
      return undefined
    }
  }

  // static async getCommands(botId: string): Promise<BotCommandItem[] | undefined> {
  //   try {
  //     const res = await axios.post('/api/bot/getBot', { bot_id: botId })
  //     if (!res.data) return undefined
  //     return res.data.commands.map((command: any) => BotCommandItem.fromJson(command))
  //   } catch (error) {
  //     console.error(error)
  //     return undefined
  //   }
  // }

  static async getBots({ page, pageSize, guildId }: { page?: number; pageSize?: number; guildId?: string }): Promise<BotStruct[]> {
    try {
      const res = await axios.post<void, BotStruct[]>('/api/bot/discoveryBots', {
        guild_id: guildId,
        keyword: '',
        page_start: page,
        page_size: pageSize,
      })
      return res
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static async getBot(botId: string): Promise<BotStruct> {
    return await axios.post<void, BotStruct>('/api/bot/getBot', {
      bot_id: botId,
    })
  }

  static async joinGuild({
    guildId,
    botId,
    channelId,
    permissions,
    color,
    showDefaultErrorToast = true,
    allowChannels,
  }: {
    guildId: string | undefined
    botId: string
    channelId?: string
    permissions?: number
    color?: string
    showDefaultErrorToast?: boolean
    allowChannels: string[]
  }): Promise<any> {
    try {
      const res = await axios.post('/api/robot/joinGuild', {
        guild_id: guildId,
        bot_id: botId,
        allow_channels: allowChannels,
        ...(channelId && { channel_id: channelId }),
        ...(permissions && { permissions }),
        ...(color && { color }),
      })
      return res.data
    } catch (error) {
      if (showDefaultErrorToast) {
        console.error(error)
      }
      return undefined
    }
  }

  static async channelSetCommands(channelIds: string[], guildId: string, botId: string, op: CommandOp, command?: string[]): Promise<void> {
    try {
      await axios.post('/api/robot/channelSet', {
        channel_id: channelIds,
        guild_id: guildId,
        bot_id: botId,
        command: JSON.stringify(command),
        operation: op,
      })
    } catch (error) {
      console.error(error)
    }
  }

  // static async getChannelCommands(channelId: string): Promise<Map<string, string>[]> {
  //   try {
  //     const res = await axios.post('/api/robot/getChannelBot', { channel_id: channelId })
  //     return ChatChannel.parseBotSetting(res.data)
  //   } catch (error) {
  //     console.error(error)
  //     return []
  //   }
  // }

  static async getGuildChannelCommands(guildId: string): Promise<Record<string, unknown>> {
    try {
      const res = await axios.post('/api/robot/getGuildBot', { guild_id: guildId })
      return res.data
    } catch (error) {
      console.error(error)
      return {}
    }
  }
  static async getChannelBotScope(
    guild_id: string,
    options: { bot_id?: string; channel_id?: string }
  ): Promise<{
    bot_id: string[]
    channels: string[]
  }> {
    return axios.post('/api/channel/getBotReceive', {
      guild_id,
      ...options,
    })
  }

  static async updateBotScope(
    guild_id: string,
    channels: string[],
    bots: string[],
    action: ChannelUpdateBotsAction,
    operate_type: 'bot' | 'channel'
  ) {
    return axios.post(
      '/api/channel/botReceive',
      { guild_id, channels, bots, action, operate_type },
      {
        toast: true,
      }
    )
  }

  static async setBotGuildNickname(guildId: string | undefined, botId: string | undefined, nick: string): Promise<void> {
    try {
      const res = await axios.post('/api/robot/setGuildNick', { guild_id: guildId, bot_id: botId, nickname: nick })
      return res.data
    } catch (error) {
      console.error(error)
    }
  }

  // static async getAddedBots({ guildId, limit, after }: { guildId?: string; limit?: number; after?: string }): Promise<UserInfo[]> {
  //   try {
  //     const res = await axios.post('/api/search/qbot', { guild_id: guildId, limit, after })
  //     return res.data.lists.map((e: any) => UserInfo.fromJson(e, guildId!))
  //   } catch (error) {
  //     console.error(error)
  //     return []
  //   }
  // }

  static async multiChannelSetCommands(channelIds: Record<string, CommandOp>, guildId?: string, botId?: string, command?: string): Promise<any> {
    function getCommandOpStr(op: CommandOp): string {
      if (op === CommandOp.add) {
        return 'add'
      } else if (op === CommandOp.del) {
        return 'del'
      } else {
        return ''
      }
    }

    const channelIdsMap: Record<string, string> = {}
    for (const [key, value] of Object.entries(channelIds)) {
      channelIdsMap[key] = getCommandOpStr(value)
    }

    try {
      const res = await axios.post('/api/robot/multiChannelSet', {
        channel_id: channelIdsMap,
        guild_id: guildId,
        bot_id: botId,
        command: [command],
      })
      return res.data
    } catch (error) {
      console.error(error)
      return undefined
    }
  }
}
