import dayjs from 'dayjs'
import { MessageContentStruct, MessageStruct, MessageType } from 'fb-components/components/messages/types.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse.ts'
import { isString, keyBy } from 'lodash-es'
import { convertSnowflakeToDate } from '../../../utils/snowflake_generator.ts'
import { RichTextMessageContentStruct } from '../items/RichTextMessage'
import { WelcomeMessageContentStruct } from '../items/WelcomeMessage.tsx'

export default function parseMessage(message: MessageStruct) {
  // 如果已经格式化过了，不用重复
  if (!isString(message.content)) return message

  message.message_id = BigInt(message.message_id)
  message.content = safeJSONParse(message.content as string, { type: MessageType.Unsupported } as MessageContentStruct)
  // 曾经出现过机器人发的消息卡片没有 time 字段
  message.time = dayjs(Number(message.time ?? convertSnowflakeToDate(message.message_id)))
  message.reactions =
    message.reactions?.map(e => ({
      ...e,
      name: decodeURIComponent(e.name),
    })) ?? []
  message.message_card = keyBy(message.message_card, 'key')

  // @ts-expect-error 把奇奇怪怪的红包类型转换成统一的
  if (message.content.type === 'sendRedBag1' || message.content.type === 'sendRedBag2') {
    message.content.type = MessageType.RedPacket
  }

  if (message.content.type == MessageType.RichText) {
    try {
      const content = message.content as RichTextMessageContentStruct
      // @ts-expect-error document 字段是旧版本字段，不做过多兼容，能看到即可
      content.parsed = transformRichText(content.v2 ?? content.document)
    } catch (e) {
      console.warn('Failed to parse rich text message', e, 'data: ', message)
      message.content.type = MessageType.Unsupported
    }
  } else if (message.content.type === MessageType.Welcome) {
    try {
      const content = message.content as WelcomeMessageContentStruct
      if (content.content) {
        content.content = safeJSONParse(content.content, undefined)
        // content.content.v2 兼容 content.content.type 丢失的情况
        if (content.content && (content.content.type === MessageType.RichText || content.content.v2)) {
          content.content.parsed = transformRichText(content.content.v2)
        }
      }
    } catch (e) {
      console.warn('Failed to parse welcome message', e, 'data: ', message)
      message.content.type = MessageType.Unsupported
    }
  }

  return message
}
