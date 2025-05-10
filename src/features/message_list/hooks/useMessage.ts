import { useUpdate } from 'ahooks'
import { MessageStruct } from 'fb-components/components/messages/types'
import { useContext, useEffect } from 'react'
import { ChannelContext } from '../../home/GuildWrapper'
import MessageService, { MessageServiceEvent } from '../MessageService'

/**
 * 当消息发生改变时触发更新，例如修改消息内容，修改消息状态等
 * 这个构造函数不能仅传入 ID，虽然用到的只有 ID，但是 ID 在用户发送消息成功后会改变，如果只传 ID 会导致这种情况不会更新
 *
 * @param message
 */
export default function useMessage(message: MessageStruct): void {
  const channel = useContext(ChannelContext)
  const updater = useUpdate()

  console.assert(channel, '`useMessage` must be used in channel context')

  useEffect(() => {
    function innerCallback(newMessage: MessageStruct) {
      if (message.message_id === newMessage.message_id) {
        updater()
      }
    }

    MessageService.instance.on(MessageServiceEvent.UpdateMessage, innerCallback)
    return () => {
      MessageService.instance.off(MessageServiceEvent.UpdateMessage, innerCallback)
    }
  }, [message])
}
