/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useDebounceFn } from 'ahooks'
import { MessageStruct } from 'fb-components/components/messages/types.ts'
import { isEqual } from 'lodash-es'
import { useContext, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { ChannelContext, GuildContext } from '../../home/GuildWrapper'
import MessageService from '../MessageService.ts'
import { unreadActions, unreadSelectors } from '../unreadSlice'

interface Mention {
  userId: string
  messageId: bigint
}

interface ViewportItemsProps {
  root: HTMLElement | null
  unreadMessageStart?: bigint
  clearInChannelUnreadNumber: () => void
  inChannelUnreadMentions: Array<Mention>
  setInChannelUnreadMentions: (mentions: Array<Mention>) => void
  messages: Array<MessageStruct>
}

export default function useViewportItems({
  inChannelUnreadMentions,
  setInChannelUnreadMentions,
  root,
  unreadMessageStart,
  clearInChannelUnreadNumber,
  messages,
}: ViewportItemsProps) {
  const dispatch = useAppDispatch()
  const guild = useContext(GuildContext)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = useContext(ChannelContext)!
  const channelUnread = useAppSelector(unreadSelectors.unread(guild?.guild_id, channel.channel_id), isEqual)

  function handleScroll() {
    // 检查顶部滑动到 @ 的地方
    for (let i = inChannelUnreadMentions.length - 1; i >= 0; i--) {
      const mentionHistory = inChannelUnreadMentions[i]
      if (checkTopMessageVisible(mentionHistory.messageId.toString())) setInChannelUnreadMentions(inChannelUnreadMentions.slice(0, i))
    }

    // 检查滑到了未读消息的开始处，如果是，清除右上角未读消息数
    if (unreadMessageStart) {
      if (checkTopMessageVisible(unreadMessageStart.toString())) clearInChannelUnreadNumber()
    }

    const temporaryListEnabled = MessageService.instance.hasMoreNextMessages(channel.channel_id)
    // 递减右下角未读数，进入临时列表时，不能更新右下角未读数
    if (!temporaryListEnabled && channelUnread.startId) {
      let distance = 0
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const unreadStartIndex = messages.findLastIndex(e => e.message_id === BigInt(channelUnread.startId!))
      if (unreadStartIndex === -1) return
      for (let i = unreadStartIndex; i < messages.length; i++) {
        const messageId = messages[i].message_id
        if (checkBottomMessageVisible(messageId.toString())) {
          distance++
        } else {
          break
        }
      }
      if (distance > 0) {
        dispatch(
          unreadActions.decreaseUnreadNumWithoutCheck({
            guildId: channel.guild_id,
            channelId: channel.channel_id,
            distance,
            newStartId: messages[unreadStartIndex + 1]?.message_id,
          })
        )
      }
    }
  }

  const { run: debouncedHandleScroll } = useDebounceFn(handleScroll, {
    wait: 100,
    maxWait: 1000,
  })

  useEffect(() => {
    if (!root) return
    handleScroll()
    root.addEventListener('scroll', debouncedHandleScroll)
    return () => {
      root.removeEventListener('scroll', debouncedHandleScroll)
    }
  }, [root])

  /**
   * 检查消息是否在顶部可见区域下方，即用户可见区 + 底部不可见区域
   */
  function checkTopMessageVisible(messageId: string) {
    const element = root?.querySelector(`ul>[data-message-id="${messageId}"]`) as HTMLLIElement
    if (!element) return false

    return element.offsetTop >= root!.scrollTop
  }

  /**
   * 检查消息是否在底部可见区域上方，即用户可见区 + 顶部不可见区域
   */
  function checkBottomMessageVisible(messageId: string) {
    const element = root?.querySelector(`ul>[data-message-id="${messageId}"]`) as HTMLLIElement
    if (!element) return false

    const THRESHOLD = 1 // 1px 的误差，目前发现从临时列表跳转，会出现 0.5px 的误差
    return element.offsetTop + element.offsetHeight <= root!.scrollTop + root!.offsetHeight + THRESHOLD
  }
}
