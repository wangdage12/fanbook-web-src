import { useUpdate } from 'ahooks'
import { MessageStruct } from 'fb-components/components/messages/types'
import { useContext, useEffect } from 'react'
import { ChannelContext } from '../../home/GuildWrapper'
import MessageService, { MessageServiceEvent } from '../MessageService'

/**
 * 当消息表态改变时触发更新
 *
 * @param messageId
 */
export default function useReactions(messageId: bigint): void {
  const channel = useContext(ChannelContext)
  const updater = useUpdate()

  console.assert(channel, '`useReaction` must be used in channel context')

  useEffect(() => {
    function innerCallback(newMessage: MessageStruct) {
      if (messageId === newMessage.message_id) {
        updater()
      }
    }

    MessageService.instance.on(MessageServiceEvent.UpdateReaction, innerCallback)
    return () => {
      MessageService.instance.off(MessageServiceEvent.UpdateReaction, innerCallback)
    }
  }, [])
}
