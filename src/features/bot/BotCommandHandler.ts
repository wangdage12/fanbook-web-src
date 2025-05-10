import fb_toast from 'fb-components/base_ui/fb_toast'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import LinkHandlerPresets from '../../services/link_handler/LinkHandlerPresets.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import MessageService from '../message_list/MessageService.ts'
import { TextContentMask } from '../message_list/items/TextMessage.tsx'
import { openMiniProgram } from '../mp-inner/util.ts'
import { BotCommand, BotStruct } from './BotAPI.ts'

export default class BotCommandHandler {
  static exec(
    command: BotCommand,
    {
      bot,
    }: {
      // 发送命令时需要，在社区频道内需要 @ bot
      bot?: BotStruct
    }
  ) {
    if (command.select_parameters && command.select_parameters.length > 0) {
      fb_toast.open({
        type: 'info',
        content: '暂不支持选择键盘',
      })
      return
    }
    if (command.form_parameters && command.form_parameters.length > 0) {
      fb_toast.open({
        type: 'info',
        content: '暂不支持表单键盘',
      })
      return
    }

    const guildId = GuildUtils.getCurrentGuildId()
    const channel = GuildUtils.getCurrentChannel()
    if (command.app_id) {
      openMiniProgram(
        command.app_id,
        {
          guildId,
          channelId: channel?.channel_id,
        },
        true
      )
    } else if (command.url) {
      LinkHandlerPresets.instance.bot.handleUrl(command.url, { botId: bot?.bot_id })
    } else {
      if (channel) {
        let mention: string = ''
        if (guildId) {
          if (channel.type === ChannelType.guildText && bot) {
            mention = `$\{@!${bot.bot_id}} `
          }
        }
        MessageService.instance.sendText(
          channel.channel_id,
          `${mention}$\{/${command.command}}`,
          TextContentMask.Command | (mention ? TextContentMask.Mention : 0),
          {
            guildId,
            channelType: channel.type,
          }
        )
      }
    }
  }
}
