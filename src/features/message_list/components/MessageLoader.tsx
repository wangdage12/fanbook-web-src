import { MessageStruct } from 'fb-components/components/messages/types'
import React, { useEffect } from 'react'
import MessageListAPI from '../MessageListAPI'
import MessageService from '../MessageService'

interface MessageLoaderProps {
  channelId: string
  messageId: string
  children: (message: MessageStruct) => React.ReactNode
  loading?: React.ReactNode
}

/**
 * 加载消息，如果本地有缓存则直接使用，否则从服务器获取
 */
export default function MessageLoader({ channelId, messageId, children, loading }: MessageLoaderProps) {
  const [message, setMessage] = React.useState<MessageStruct | undefined>(
    () => MessageService.instance.getMessages(channelId)?.find(BigInt(messageId))?.data
  )

  useEffect(() => {
    if (message) return
    async function asyncFunc() {
      const newMessage = await MessageListAPI.fetchMessage(channelId, messageId.toString())
      setMessage(newMessage)
    }

    asyncFunc().then()
  }, [messageId])

  return <>{message ? children(message) : loading}</>
}
