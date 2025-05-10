import { KeyRecord, MessageStruct, MessageType } from 'fb-components/components/messages/types.ts'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import MessageService from '../features/message_list/MessageService.ts'

export default function handleMessageCardKey({
  content,
  channel_id,
  user_id,
}: MessageStruct<
  Omit<KeyRecord, 'me'> & {
    action: 'add' | 'del'
    id: string
    type: MessageType
    key: string
  }
>) {
  MessageService.instance.modifyMessage(channel_id, BigInt(content.id), message => {
    switch (content.action) {
      case 'add': {
        message.message_card ??= {}
        const old = message.message_card[content.key]
        message.message_card[content.key] = {
          count: content.count,
          // 曾经设置过 me，那么 me 就会一直是 true，知道被 clear
          me: old?.me || user_id === LocalUserInfo.userId,
          // 优先使用第一次设置的 userId
          user_ids: old?.user_ids ?? user_id,
        }
        break
      }
      case 'del': {
        if (message.message_card) {
          const old = message.message_card[content.key]
          message.message_card[content.key] = {
            count: content.count,
            // 如果是自己删除的，那么就不再是 me，否则就用旧的 me
            me: user_id === LocalUserInfo.userId ? false : old?.me ?? false,
            // 如果是自己删除的，那么就不再有 userId，否则就用旧的 userId
            user_ids: user_id === old?.user_ids ? undefined : old?.user_ids,
          }
        }
        break
      }
    }
  })
}
