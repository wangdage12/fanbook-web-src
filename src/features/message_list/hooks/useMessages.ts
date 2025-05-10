import { MessageStruct } from 'fb-components/components/messages/types'
import { useCallback, useRef, useSyncExternalStore } from 'react'
import MessageService, { MessageServiceEvent } from '../MessageService'

/**
 * 当消息列表改变时触发更新，例如加载更多消息，发送消息，接受消息等
 * 单条消息内容发生改变不会触发更新
 *
 * @param channelId
 */
export function useMessages(channelId: string): MessageStruct[] {
  const cached = useRef(MessageService.instance.getMessages(channelId).values())

  const getSnapshot = useCallback(() => {
    return cached.current
  }, [channelId])

  const subscribe = useCallback(
    (callback: () => void) => {
      function innerCallback(changedChannelId: string) {
        if (channelId === changedChannelId) {
          cached.current = MessageService.instance.getMessages(channelId).values()
          callback()
        }
      }
      MessageService.instance.on(MessageServiceEvent.UpdateList, innerCallback)
      return () => {
        MessageService.instance.off(MessageServiceEvent.UpdateList, innerCallback)
      }
    },
    [channelId]
  )

  return useSyncExternalStore(subscribe, getSnapshot) ?? []
}
