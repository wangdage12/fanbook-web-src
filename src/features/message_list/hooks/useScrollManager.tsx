/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MessageStruct } from 'fb-components/components/messages/types.ts'
import { last } from 'lodash-es'
import { useCallback, useContext, useLayoutEffect, useRef } from 'react'
import { useAppDispatch } from '../../../app/hooks'
import { ChannelContext } from '../../home/GuildWrapper'
import { TOP_UI_HEIGHT } from '../MessageList.tsx'
import { unreadActions } from '../unreadSlice'

export type ContainerMeasures = {
  offsetHeight: number
  scrollHeight: number
}

interface UseScrollManagerProps {
  messages: MessageStruct[]
  onScrollBy: (delta: number) => void
  listElement: HTMLDivElement | null
  scrolledUpThreshold?: number
  onAtBottomStateChanged: (atBottom: boolean) => void
}

// 如果消息列表在刷新时需要跳转到某条消息，可以通过修改该对象的 id 属性来实现
// 通常不会用到，如果有跳转需求，可以调用 MessageList 中的 jump 或者 scroll 相关接口
export const jumpToMessage: { id: string | 'bottom' | undefined; align: 'top' | 'bottom' } = {
  id: undefined,
  align: 'top',
}

export default function useScrollManager({
  listElement,
  scrolledUpThreshold = 1,
  messages: newMessages,
  onScrollBy,
  onAtBottomStateChanged,
}: UseScrollManagerProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = useContext(ChannelContext)!
  const closeToBottom = useRef(true)
  const closeToTop = useRef(false)

  const dispatch = useAppDispatch()

  const measures = useRef<ContainerMeasures>({
    offsetHeight: 0,
    scrollHeight: 0,
  })
  const messages = useRef<MessageStruct[]>([])

  function scrollContainerMeasures(): ContainerMeasures {
    return {
      offsetHeight: listElement?.offsetHeight || 0,
      scrollHeight: listElement?.scrollHeight || 0,
    }
  }

  function scrollToBottom() {
    listElement?.scrollTo({ top: listElement?.scrollHeight })
  }

  // 默认滚动到底部
  useLayoutEffect(() => {
    scrollToBottom()
  }, [listElement])

  function jumpToTarget() {
    if (jumpToMessage.id === 'bottom') {
      scrollToBottom()
    } else {
      const messageDom = listElement!.querySelector<HTMLLIElement>(`li[data-message-id="${jumpToMessage.id}"]`)
      if (messageDom) {
        if (jumpToMessage.align === 'bottom') {
          messageDom.scrollIntoView(false)
        } else {
          listElement!.scrollTo({ top: messageDom.offsetTop - TOP_UI_HEIGHT })
        }
      }
    }
    jumpToMessage.id = undefined
    jumpToMessage.align = 'top'
  }

  useLayoutEffect(() => {
    if (!listElement) return

    const newMeasures = scrollContainerMeasures()
    const { scrollHeight } = measures.current

    // const wasAtBottom = scrollHeight - offsetHeight - listElement.scrollTop < scrolledUpThreshold
    // console.log(wasAtBottom)

    if (messages.current.length) {
      const lastPrevMessage = messages.current[0]
      const lastNewMessage = newMessages[0]

      if (jumpToMessage.id !== undefined) {
        jumpToTarget()
      }
      // 表示新增了消息
      else if (messages.current.length < newMessages.length) {
        // 表示顶部新增了消息，即加载历史消息
        if (lastPrevMessage.message_id !== lastNewMessage.message_id) {
          // 加载历史消息后保持当前的滚动位置
          onScrollBy(newMeasures.scrollHeight - scrollHeight)
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const nextPrevMessage = last(messages.current)!
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const nextNewMessage = last(newMessages)!
          if (nextNewMessage.fromWs) {
            if (closeToBottom.current && nextPrevMessage.message_id !== nextNewMessage.message_id) {
              scrollToBottom()
              dispatch(
                unreadActions.clearUnread({
                  guildId: channel?.guild_id,
                  channelId: channel.channel_id as string,
                })
              )
            }
          } else {
            // 除了上一种情况，就是在临时列表中拉取新的消息页，此时需要保持当前的滚动位置
          }
        }
      }
    }

    measures.current = newMeasures
    messages.current = newMessages
  }, [measures, listElement, messages, newMessages])

  const onScroll = useCallback(() => {
    if (!listElement) return

    const { scrollTop, scrollHeight, offsetHeight } = listElement
    const newCloseToBottom = scrollHeight - (scrollTop + offsetHeight) <= scrolledUpThreshold
    if (newCloseToBottom !== closeToBottom.current) {
      closeToBottom.current = newCloseToBottom
      onAtBottomStateChanged(newCloseToBottom)
    }
    closeToTop.current = scrollTop < scrolledUpThreshold
  }, [listElement])

  return { onScroll }
}
