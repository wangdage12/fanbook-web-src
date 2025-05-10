import dayjs from 'dayjs'
import { GraphicMixingContentStruct } from 'fb-components/components/messages/items/GraphicMixingMessage.tsx'
import { MessageContentStruct, MessageStatus, MessageStruct, MessageType } from 'fb-components/components/messages/types.ts'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import { EmbeddedAssetType } from 'fb-components/rich_text/types.ts'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import generateSnowFlakeId from '../../utils/snowflake_generator'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { MessageCardMessageContentStruct } from './items/MessageCardMessage.tsx'
import { AnswerShareContentStruct, QuestionShareContentStruct } from './items/QuestionShareMessage'
import { RichTextMessageContentStruct } from './items/RichTextMessage'
import { TextMessageContentStruct } from './items/TextMessage'
import { WelcomeMessageContentStruct, welcomeSentences } from './items/WelcomeMessage'

export default class MessageUtils {
  static shouldIncrementRedDotCount(type: MessageType): boolean {
    if (!MessageUtils.isDisplayableMessage(type)) {
      return false
    }
    return type !== MessageType.Friend
  }

  static isFreeStyle(message: MessageStruct): boolean {
    switch (message.content.type) {
      case MessageType.Welcome:
      case MessageType.start:
      case MessageType.Friend:
      case MessageType.GuildNotice:
      case MessageType.DelMsgNotice:
      case MessageType.MultiJoin:
      case MessageType.NewJoinNote:
        return true
      case MessageType.RichText:
      case MessageType.image:
      case MessageType.sticker:
      case MessageType.video:
      case MessageType.recall:
      case MessageType.reaction:
      case MessageType.pinned:
      case MessageType.text:
      case MessageType.Unsupported:
      case MessageType.top:
      case MessageType.RedPacket:
      case MessageType.CircleShare:
      case MessageType.QuestionShare:
      case MessageType.AnswerShare:
      case MessageType.MessageCard:
      case MessageType.Voice:
      case MessageType.ActivityShare:
      case MessageType.GraphicMixing:
      case MessageType.MessageCardOperate:
      case MessageType.File:
        return false
    }
  }

  /**
   * 在消息列表中使用，表示 `current` 这条消息是否应该打破消息流。在消息列表中，连续发
   * 的消息会形成消息流，返回 `true` 说明 `current` 这条消息应该打破消息流。
   *
   * @param prev    当前消息的上一条消息
   * @param current 当前消息
   */
  static shouldDisruptMessageFlow(current: MessageStruct, prev?: MessageStruct) {
    if (current.recall) return true
    if (prev == null) return true
    if (current.content.type === MessageType.MessageCard) return true
    if (current.recall || prev.recall) return true
    if (this.isFreeStyle(current) || this.isFreeStyle(prev)) return true
    if (current.user_id !== prev.user_id) return true
    return !(prev.time.isSame(current.time, 'day') && prev.time.add(dayjs.duration(5, 'minute')) > current.time)
  }

  static wrappedInBubble(message: MessageStruct) {
    if (message.quote_l1) return true

    switch (message.content.type) {
      case MessageType.recall:
      case MessageType.reaction:
      case MessageType.pinned:
      case MessageType.top:
      case MessageType.GuildNotice:
      case MessageType.NewJoinNote:
      case MessageType.MessageCardOperate:
      case MessageType.DelMsgNotice:
        throw new Error('This is impossible')
      case MessageType.start:
      case MessageType.Welcome:
      case MessageType.image:
      case MessageType.sticker:
      case MessageType.video:
      case MessageType.GraphicMixing:
      case MessageType.Unsupported:
      case MessageType.Friend:
      case MessageType.RedPacket:
      case MessageType.CircleShare:
      case MessageType.QuestionShare:
      case MessageType.AnswerShare:
      case MessageType.ActivityShare:
      case MessageType.MessageCard:
      case MessageType.MultiJoin:
        return false
      case MessageType.Voice:
      case MessageType.text:
      case MessageType.RichText:
      case MessageType.File:
    }
    return true
  }

  static createMessage<T extends MessageContentStruct>(
    channel_id: string,
    channel_type: ChannelType,
    content: T,
    guild_id?: string | null
  ): MessageStruct<T> {
    return {
      channel_id,
      channel_type,
      content,
      guild_id: guild_id ?? undefined,
      message_id: generateSnowFlakeId(),
      time: dayjs(),
      user_id: LocalUserInfo.userId,
      reactions: [],
    }
  }

  static menuDisplayEnabled(message: MessageStruct) {
    if (message.status === MessageStatus.Ephemeral) return false
    const messageType = message.content.type

    switch (messageType) {
      case MessageType.recall:
      case MessageType.reaction:
      case MessageType.pinned:
      case MessageType.start:
      case MessageType.Unsupported:
      case MessageType.top:
      case MessageType.Friend:
      case MessageType.GuildNotice:
      case MessageType.MultiJoin:
        return false
      default:
        return true
    }
  }

  static isDisplayableMessage(messageType: MessageType) {
    switch (messageType) {
      case MessageType.start:
      case MessageType.Welcome:
      case MessageType.text:
      case MessageType.RichText:
      case MessageType.image:
      case MessageType.sticker:
      case MessageType.video:
      case MessageType.Unsupported:
      case MessageType.Friend:
      case MessageType.GuildNotice:
      case MessageType.RedPacket:
      case MessageType.CircleShare:
      case MessageType.QuestionShare:
      case MessageType.AnswerShare:
        return true
      case MessageType.recall:
      case MessageType.reaction:
      case MessageType.pinned:
      case MessageType.top:
      case MessageType.DelMsgNotice:
        return false
      // 未列出的可能是新的消息类型，需要默认为显示，这样才能出现不支持的消息类型
      // 否则在线接收此类消息会不见
      default:
        return true
    }
  }

  static toText(message: MessageStruct): string {
    if (message.deleted) return '引用消息已删除'
    if (message.recall) return '引用消息已撤回'

    // async function getMentionText(id: string, sign: TextMentionSign): Promise<string> {
    //   if (sign == TextMentionSign.User) {
    //     return UserHelper.getName(id, message.guild_id)
    //   } else {
    //     if (id == message.guild_id) {
    //       return '全体成员'
    //     } else {
    //       if (message.guild_id) {
    //         const role = GuildUtils.getGuildById(message.guild_id)?.roles[id]
    //         if (role) {
    //           return role.name
    //         } else {
    //           return '该身份组已删除'
    //         }
    //       } else {
    //         // 私信里 @ 角色
    //         return '该身份组已删除'
    //       }
    //     }
    //   }
    // }

    // function getChannelText(id: string): string {
    //   if (message.guild_id == null) return ' #该频道已删除 '
    //
    //   const channelName = GuildUtils.getChannelById(message.guild_id, id)?.name
    //   return channelName ? ` #${channelName} ` : ' #该频道已删除 '
    // }

    switch (message.content.type) {
      case MessageType.GuildNotice:
      case MessageType.Unsupported:
        return '不支持的消息类型，请打开 App 查看'
      case MessageType.Welcome: {
        const content = message.content as WelcomeMessageContentStruct
        // const name = await UserHelper.getName(message.user_id, message.guild_id)
        return welcomeSentences[content.index % welcomeSentences.length].replace('%%', `\${@!${message.user_id}}`)
      }
      case MessageType.text: {
        return (message.content as TextMessageContentStruct).text
        // const { contentType, text } = message.content as TextMessageContentStruct

        // let result = text
        // if (contentType & (TextContentMask.Mention as number)) {
        //   result = await replaceAsync(result, TEXT_MENTION_PATTERN, async (match) => {
        //     const sign = match[3] as TextMentionSign
        //     const id = match.slice(4, -1)
        //     const name = await getMentionText(id, sign)
        //     return ` @${name} `
        //   })
        // }
        //
        // if (contentType & (TextContentMask.Command as number)) {
        //   result = result.replaceAll(COMMAND_PATTERN, (match) => match.slice(3, -1))
        // }
        //
        // if (contentType & (TextContentMask.ChannelLink as number)) {
        //   result = result.replaceAll(CHANNEL_MENTION_PATTERN, (match) => {
        //     const id = match.slice(3, -1)
        //     return getChannelText(id)
        //   })
        // }
        // return result
      }
      case MessageType.RichText: {
        const content = message.content as RichTextMessageContentStruct
        return `${content.title ?? ''}${richText2PlainText(content.parsed)}`
      }
      case MessageType.Friend:
        return '你和对方已经成为好友，开始聊天吧~'
      case MessageType.image:
        return '[图片]'
      case MessageType.sticker:
        return '[社区表情]'
      case MessageType.video:
        return '[视频]'
      case MessageType.Voice:
        return '[语音]'
      case MessageType.start:
      case MessageType.recall:
      case MessageType.reaction:
      case MessageType.pinned:
      case MessageType.top:
        return ''
      case MessageType.RedPacket:
        return '[红包]'
      case MessageType.CircleShare:
        return '[动态分享]'
      case MessageType.QuestionShare: {
        const content = message.content as QuestionShareContentStruct
        return `[问题] ${content.title ?? ''}`
      }
      case MessageType.AnswerShare: {
        const content = message.content as AnswerShareContentStruct
        return `[回答] ${content.title ?? ''}`
      }
      case MessageType.ActivityShare: {
        return '[活动]'
      }
      case MessageType.GraphicMixing: {
        const content = message.content as GraphicMixingContentStruct
        const { media, text } = content
        if (text?.trim()) {
          return text
        }
        if (media.length > 0) {
          return media
            .map(item => {
              switch (item.type) {
                case EmbeddedAssetType.Video:
                  return '[视频]'
                case EmbeddedAssetType.Image:
                  return '[图片]'
              }
            })
            .join('')
        }
        return '[图文消息]'
      }
      case MessageType.MessageCard:
        return (message.content as MessageCardMessageContentStruct).notification ?? '[消息卡片]'
      default:
        return '[未知消息]'
    }
  }
}
