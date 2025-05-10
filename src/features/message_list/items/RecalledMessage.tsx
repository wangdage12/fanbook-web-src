import { MessageStruct } from 'fb-components/components/messages/types'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import StateUtils from '../../../utils/StateUtils'

enum RecalledMessageFormat {
  IRecallMyMessage,
  someoneRecallHisMessage,
  IRecallSomeonesMessage,
  someoneRecallMyMessage,
  someoneRecallAnotherOnesMessage,
}

function getRecalledMessageFormat(message: MessageStruct) {
  const myMessage = message.user_id == StateUtils.localUser?.user_id
  const messageRecalledBySender = message.user_id == message.recall
  const recalledByMyself = message.recall == StateUtils.localUser?.user_id

  if (myMessage && recalledByMyself) {
    return RecalledMessageFormat.IRecallMyMessage
  }

  if (!myMessage && messageRecalledBySender) {
    return RecalledMessageFormat.someoneRecallHisMessage
  }

  if (recalledByMyself && !messageRecalledBySender) {
    return RecalledMessageFormat.IRecallSomeonesMessage
  }

  if (myMessage && !messageRecalledBySender && !recalledByMyself) {
    return RecalledMessageFormat.someoneRecallMyMessage
  }

  if (!myMessage && !messageRecalledBySender && !recalledByMyself) {
    return RecalledMessageFormat.someoneRecallAnotherOnesMessage
  }

  return null
}

export default function RecalledMessage({ message }: { message: MessageStruct }) {
  return (
    <div className={'message-system'}>
      {(() => {
        switch (getRecalledMessageFormat(message)) {
          case RecalledMessageFormat.IRecallMyMessage:
            return <span>你撤回了一条消息</span> // 在这里显示重新编辑
          case RecalledMessageFormat.someoneRecallHisMessage:
            return (
              <span>
                <RealtimeNickname className={'message-system-name'} userId={message.user_id} />
                &nbsp;撤回了一条消息
              </span>
            )
          case RecalledMessageFormat.IRecallSomeonesMessage:
            return (
              <>
                <span>你撤回了&nbsp;</span>
                <RealtimeNickname className={'message-system-name'} userId={message.user_id} />
                <span>&nbsp;发的一条消息</span>
              </>
            )
          case RecalledMessageFormat.someoneRecallMyMessage:
            return (
              <>
                {message.recall && <RealtimeNickname className={'message-system-name'} userId={message.recall} />}
                <span>&nbsp;撤回了你发的一条消息</span>
              </>
            )
          case RecalledMessageFormat.someoneRecallAnotherOnesMessage:
            return (
              <>
                {message.recall && <RealtimeNickname className={'message-system-name'} userId={message.recall} />}
                <span>&nbsp;撤回了&nbsp;</span>
                {message.user_id && <RealtimeNickname className={'message-system-name'} userId={message.user_id} />}
                <span>&nbsp;发的一条消息</span>
              </>
            )
          default:
            return null
        }
      })()}
    </div>
  )
}
