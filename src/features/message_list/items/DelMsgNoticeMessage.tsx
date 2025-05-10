import { MessageStruct, MessageType } from 'fb-components/components/messages/types'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../../components/user_card'

export default function DelMsgNoticeMessage({ message }: { message: MessageStruct<{ type: MessageType; content: string }> }) {
  const tips = message?.content?.content ?? '刷屏过于频繁，消息已被删除'
  return (
    <div className={'message-system'}>
      {
        <span>
          <UserCard userId={message.user_id}>
            <RealtimeNickname className={'message-system-name'} userId={message.user_id} />
          </UserCard>
          &nbsp;{tips}
        </span>
      }
    </div>
  )
}
