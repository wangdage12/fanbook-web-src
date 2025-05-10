import './message-list.less'

import { BLOCKS } from '@contentful/rich-text-types'
import { Alert, Skeleton } from 'antd'
import clsx from 'clsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal.tsx'
import fb_toast from 'fb-components/base_ui/fb_toast'
import CircularLoading from 'fb-components/components/CircularLoading'
import EmojiIcon from 'fb-components/components/EmojiIcon'
import VoiceMessage from 'fb-components/components/messages/items/VoiceMessage.tsx'
import {
  MessageCurrentStatus,
  MessageExtraDataStrangerStruct,
  MessageStatus,
  MessageStruct,
  MessageType,
  TopMessageStruct,
} from 'fb-components/components/messages/types.ts'
import { MediaPreviewItem, useMediaPreviewer } from 'fb-components/components/previewer/MediaPreviewer.tsx'
import { EmbeddedAssetType } from 'fb-components/rich_text/types.ts'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils'
import FilePicker from 'fb-components/utils/FilePicker.ts'
import CosUtils from 'fb-components/utils/upload_cos/utils.ts'
import { delay, isEqual, last } from 'lodash-es'
import React, { CSSProperties, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { store } from '../../app/store'
import { GlobalEvent, globalEmitter } from '../../base_services/event.ts'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder'
import Ws, { WsAction } from '../../base_services/ws'
import { InfiniteScroll } from '../../components/InfiniteScroll'
import AppearDelayed, { DisappearDelayed } from '../../components/UpdateDelayed'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { selectUser } from '../../components/realtime_components/realtime_nickname/userSlice'
import { checkDMBan } from '../../components/realtime_components/realtime_nickname/userUtil'
import UserCard from '../../components/user_card'
import { ChannelPermission } from '../../services/PermissionService'
import { DmChannelStruct, dmActions, dmSelectors } from '../dm/dmSlice'
import ChannelAPI from '../guild_container/ChannelAPI'
import { GuildContext } from '../home/GuildWrapper'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { topMessageActions, topMessageSelectors } from '../top_message/TopMessageSlice'
import MessageInputField from './MessageInputField'
import MessageService, { MessageServiceEvent, getFileType } from './MessageService'
import MessageUtils from './MessageUtils'
import InChannelUnreadButton from './components/InChannelUnreadButton'
import MessageLoader from './components/MessageLoader'
import MessageMenu from './components/MessageMenu'
import MessageTopPresentation from './components/MessageTopPresentation'
import { ReactionPopOver } from './components/ReactionPopOver.tsx'
import { useKeepAlignBottomOnHeightChange } from './hooks/useKeepAlignBottomOnHeightChange.tsx'
import useMessage from './hooks/useMessage'
import { useMessages } from './hooks/useMessages'
import useReactions from './hooks/useReactions'
import useScrollManager, { jumpToMessage } from './hooks/useScrollManager'
import useViewportItems from './hooks/useViewportItems'
import CircleShareMessage, { CircleShareContentStruct } from './items/CircleShareMessage.tsx'
import DelMsgNoticeMessage from './items/DelMsgNoticeMessage.tsx'
import FileMessage, { getFileIcon } from './items/FileMessage.tsx'
import FriendMessage from './items/FriendMessage'
import ImageMessage, { ImageContentStruct } from './items/ImageMessage'
import MessageCardMessage from './items/MessageCardMessage.tsx'
import QuestionShareMessage, { QuestionShareContentStruct } from './items/QuestionShareMessage.tsx'
import RecalledMessage from './items/RecalledMessage'
import RedPacketMessage from './items/RedPacketMessage.tsx'
import RichTextMessage, { RichTextMessageContentStruct } from './items/RichTextMessage'
import StartMessage from './items/StartMessage'
import TextMessage, { PlainTextMessage } from './items/TextMessage'
import UnsupportedMessage from './items/UnsupportedMessage'
import VideoMessage, { VideoContentStruct } from './items/VideoMessage'
import WelcomeMessage from './items/WelcomeMessage'
import { MessageCommonProps } from './items/type.ts'
import { UnreadHelper, unreadActions, unreadSelectors } from './unreadSlice'

export const MESSAGE_ITEM_GAP = 20
export const TOP_UI_HEIGHT = 52

export default function MessageList({ channel }: { channel: ChannelStruct }) {
  const { guild_id, channel_id, type } = channel
  const dispatch = useAppDispatch()
  const mediaPreviewer = useMediaPreviewer()
  // states
  const [unreadMessageStart, setUnreadMessageStart] = useState(UnreadHelper.getLocalUnread(channel_id, guild_id).startId)
  const [inChannelUnreadNumber, setInChannelUnreadNumber] = useState(UnreadHelper.getLocalUnread(channel_id, guild_id).num)
  const [inChannelUnreadMentions, setInChannelUnreadMentions] = useState(UnreadHelper.getLocalUnread(channel_id, guild_id).mentions)
  const [reply, setReply] = useState<MessageStruct | undefined>(undefined)

  const [showDropZone, setShowDropZone] = useState(false)
  const [closeToBottom, setCloseToBottom] = useState(true)

  const channelUnread = useAppSelector(unreadSelectors.unread(guild_id, channel_id), isEqual)

  const messages = useMessages(channel_id)
  const temporaryListEnabled = MessageService.instance.hasMoreNextMessages(channel.channel_id)
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null)

  const shouldShowLoadingSkeleton = useMemo(() => messages.length === 0, [messages])
  const filesToSend = useRef<File[]>([])

  // 是否是私聊
  const isDm = channel && 'recipient_id' in channel
  const isShowRisk = useAppSelector(dmSelectors.isShowRisk)
  const recipient = useAppSelector(selectUser((channel as DmChannelStruct).recipient_id ?? ''), isEqual)
  const isOtherUser = recipient ? !recipient.bot && recipient.user_id !== LocalUserInfo.userId : false
  const isDmBan = isOtherUser && recipient ? checkDMBan(recipient) : false

  const { onScroll } = useScrollManager({
    listElement,
    messages,
    onScrollBy: delta => {
      listElement?.scrollBy({ top: delta })
    },
    onAtBottomStateChanged: setCloseToBottom,
  })
  useViewportItems({
    inChannelUnreadMentions,
    setInChannelUnreadMentions,
    clearInChannelUnreadNumber: () => setInChannelUnreadNumber(0),
    unreadMessageStart,
    root: listElement,
    messages,
  })

  useKeepAlignBottomOnHeightChange(listElement)

  // 退出频道时恢复临时列表数据（如果有）
  useEffect(() => {
    return () => {
      MessageService.instance.recoverTemporaryMessageList(channel_id)
    }
  }, [])

  useEffect(() => {
    async function callback() {
      // 要获取**此刻**是否在底部，从 DOM 计算，而不是从 `closeToBottom` 获取
      const { scrollTop, scrollHeight, offsetHeight } = listElement || {}
      const shouldKeepScroll = !!listElement && scrollHeight! - (scrollTop! + offsetHeight!) <= 1

      await MessageService.instance.loadBefore(channel_id, true)
      if (shouldKeepScroll) {
        delay(() => scrollToBottom('smooth'), 100)
      }
    }

    Ws.instance.on(WsAction.Connect, callback)
    return () => {
      Ws.instance.off(WsAction.Connect, callback)
    }
  }, [])

  useEffect(() => {
    MessageService.currentChannel.atBottom = closeToBottom
  }, [closeToBottom])

  // 加载置顶数据
  useEffect(() => {
    MessageService.currentChannel.channelId = channel_id

    ChannelAPI.topList(channel_id).then(result => {
      if (result) {
        dispatch(topMessageActions.setTop(result as TopMessageStruct))
      }
    })
  }, [])

  // 用来做首次加载，其他逻辑不要放这里
  useEffect(() => {
    async function asyncFunc() {
      if (messages.length === 0) {
        await doLoadBefore()
      }
      // 清空未读数
      store.dispatch(
        unreadActions.clearUnread({
          guildId: guild_id,
          channelId: channel_id,
        })
      )
    }

    asyncFunc().then()
  }, [])

  useEffect(() => {
    Ws.instance.on('pullFinished', () => {
      const storedUnread = UnreadHelper.getLocalUnread(channel_id, guild_id)
      // 在后面的清空未读数触发之前，先读取出首条新消息的位置
      setUnreadMessageStart(storedUnread.startId)
      setInChannelUnreadNumber(storedUnread.num)
      setInChannelUnreadMentions(storedUnread.mentions)
      // 清空未读数除了进入频道时还有一种情况是，进入频道后，未读数数据还在拉取中，那么等数据拉完，依然要进行清空
      store.dispatch(
        unreadActions.clearUnread({
          guildId: guild_id,
          channelId: channel_id,
        })
      )
    })
    return () => {
      Ws.instance.off('pullFinished')
    }
  }, [])

  useEffect(() => {
    function func(channelId: string, force = false, _delay = 100) {
      if ((force || closeToBottom) && channelId === channel_id) {
        delay(() => scrollToBottom(closeToBottom ? 'smooth' : 'instant'), _delay)
      }
    }

    MessageService.instance.on(MessageServiceEvent.RequestScrollToBottom, func)
    return () => {
      MessageService.instance.off(MessageServiceEvent.RequestScrollToBottom, func)
    }
  }, [listElement, closeToBottom])

  // 跳转到置顶消息
  function jumpToTopMessage(id: string) {
    scrollIntoMessage(id, 'start', TOP_UI_HEIGHT)
  }

  function scrollToBottom(behavior: ScrollBehavior = 'auto') {
    if (!listElement) return
    // 这里多余的 100 是为了保证能到底部，可能是因为边距差一段距离，加上这个数据作为保底措施。
    listElement.scroll({ top: listElement.scrollHeight + 100, behavior })

    MessageService.instance.tryTrimMessages(channel_id)
  }

  function doLoadBefore() {
    // 如果 ws 未连接，这种情况下请求可能会缺少数据，应确保 ws 连接后再请求
    if (!Ws.instance.connected) {
      return
    }
    return MessageService.instance.loadBefore(channel_id)
  }

  const cachedLoadBefore = useCallback(() => {
    doLoadBefore()
  }, [])

  const cachedLoadAfter = useCallback(() => {
    MessageService.instance.loadAfter(channel_id).catch(e => {
      console.error('[MessageList] Failed to load more messages', e)
    })
  }, [])

  function dropToSendFiles(e: React.DragEvent<HTMLDivElement>) {
    setShowDropZone(false)
    e.preventDefault()

    if (!e.dataTransfer) return
    if (checkContainsDirectory(e.dataTransfer.items)) {
      fb_toast.open({
        type: 'error',
        content: '不支持发送文件夹',
      })
      return
    }

    sendFiles([...e.dataTransfer.files])
  }

  function scrollIntoMessage(messageId: string, align: 'start' | 'end', offset = 0) {
    if (!listElement) return
    const element = listElement?.querySelector(`ul>[data-message-id='${messageId}']`) as HTMLLIElement | null

    if (element) {
      const rect = element.getBoundingClientRect()

      let behavior: ScrollBehavior
      if (rect.top >= 0 && rect.bottom <= listElement.offsetHeight) {
        behavior = 'smooth'
      } else {
        behavior = 'auto'
      }

      let y = element.offsetTop - offset
      if (align === 'end') {
        y += element.offsetHeight - listElement.offsetHeight
      }
      listElement.scrollTo({
        top: y,
        behavior,
      })
    } else {
      MessageService.instance.loadMiddleSection(channel_id, messageId).catch(e => {
        console.error('[MessageList] loadMiddleSection error', e)
      })
    }
  }

  function calculateFlattenedIndex(data: MediaPreviewItem[][], messageIndex: number, mediaIndex: number): number {
    if (messageIndex < 0 || messageIndex >= data.length) {
      throw new Error('Invalid message index')
    }

    const message = data[messageIndex]

    if (mediaIndex < 0 || mediaIndex >= message.length) {
      throw new Error('Invalid media index')
    }

    let flattenedIndex = 0

    for (let i = 0; i < messageIndex; i++) {
      flattenedIndex += data[i].length
    }

    flattenedIndex += mediaIndex

    return flattenedIndex
  }

  function handlePreview(messageIndex: number, mediaIndex = 0) {
    // [[],[image], [image, video, image], [video],[],[image]]
    const items: MediaPreviewItem[][] = []

    // 从所有消息中取出可预览的媒体
    for (let i = 0; i < messages.length; i++) {
      const { content, deleted, recall } = messages[i]
      // 已删除或已撤回忽略
      if (deleted || recall) {
        items.push([])
        continue
      }

      switch (content.type) {
        case MessageType.image:
        case MessageType.sticker: {
          const imgContent = content as ImageContentStruct
          items.push([
            {
              type: EmbeddedAssetType.Image,
              url: imgContent.localUrl ?? imgContent.url,
              width: imgContent.width,
              height: imgContent.height,
            },
          ])
          break
        }
        case MessageType.video: {
          const videoContent = content as VideoContentStruct
          items.push([
            {
              type: EmbeddedAssetType.Video,
              url: videoContent.localUrl ?? videoContent.url,
              width: videoContent.width,
              height: videoContent.height,
              preview: videoContent.localThumbUrl ?? videoContent.thumbUrl,
            },
          ])
          break
        }
        case MessageType.RichText:
          items.push([
            ...(content as RichTextMessageContentStruct).parsed
              .filter(item => item.nodeType === BLOCKS.EMBEDDED_ASSET && [EmbeddedAssetType.Video, EmbeddedAssetType.Image].includes(item.data.type))
              .map(item => {
                const { data } = item
                const { type, src, width, height, preview } = data
                return {
                  type: type,
                  url: src,
                  width: width,
                  height: height,
                  preview,
                }
              }),
          ])
          break
        case MessageType.RedPacket:
        case MessageType.Friend:
        case MessageType.start:
        case MessageType.Welcome:
        case MessageType.text:
        case MessageType.CircleShare:
        case MessageType.QuestionShare:
        case MessageType.AnswerShare:
        case MessageType.recall:
        case MessageType.reaction:
        case MessageType.pinned:
        case MessageType.top:
        case MessageType.GuildNotice:
        case MessageType.Unsupported:
        default:
          items.push([])
          break
      }
    }

    mediaPreviewer?.open({
      medias: items.flat(),
      initialIndex: calculateFlattenedIndex(items, messageIndex, mediaIndex),
    })
  }

  function handleClickUnreadButton() {
    const mentionId = channelUnread.mentions?.[0]?.messageId
    const ms = MessageService.instance
    if (ms.hasMoreNextMessages(channel_id)) {
      ms.recoverTemporaryMessageList(channel_id, true)
      jumpToMessage.id = mentionId ?? 'bottom'
      jumpToMessage.align = 'bottom'
    } else {
      if (mentionId) {
        scrollIntoMessage(channelUnread.mentions[0].messageId, 'end')
      } else {
        scrollToBottom()
      }
    }
  }

  function checkContainsDirectory(items: DataTransferItemList) {
    try {
      for (const item of items) {
        if (item.webkitGetAsEntry()?.isDirectory) {
          return true
        }
      }
    } catch (e) {
      return false
    }
  }

  async function chooseFiles() {
    const files = await FilePicker.pickMedias('*')
    sendFiles(files)
  }
  function onPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    if (filesToSend.current.length) return

    const items = event.clipboardData.items

    if (checkContainsDirectory(items)) {
      fb_toast.open({
        type: 'error',
        content: '不支持发送文件夹',
      })
      return false
    }

    const files = [...items].map(item => item.getAsFile()).filter(Boolean) as File[]
    if (!files.length) return

    sendFiles(files)
  }

  function sendFiles(files: File[]) {
    if (filesToSend.current.length) return
    filesToSend.current = files

    let _files = files
    showFbModal({
      title: `发送到${channel.name}`,
      okText: '发送',
      content: <FilesConfirmation files={_files} onChange={_ => (_files = _)} />,
      onOk: () => {
        for (const file of files) {
          if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            MessageService.instance
              .sendImageOrVideo(channel_id, [file], {
                guildId: guild_id,
                channelType: type,
              })
              .then()
          } else {
            MessageService.instance
              .sendFile(channel_id, file, {
                guildId: guild_id,
                channelType: type,
              })
              .then()
          }
        }
        filesToSend.current = []
      },
      onCancel: () => {
        filesToSend.current = []
      },
    })
  }

  if (!channel) return null
  return (
    <>
      <div
        onPaste={onPaste}
        className={'relative flex-grow overflow-hidden'}
        onDragOverCapture={e => {
          e.preventDefault()
          if (e.dataTransfer.types.includes('Files')) {
            setShowDropZone(true)
          }
        }}
        onDragLeaveCapture={() => setShowDropZone(false)}
        onDrop={dropToSendFiles}
      >
        {/*Loading 态，为了优化用户体验，Loading 态在加载完数据首次渲染列表后 100ms 才消失，否则首帧的 UI 还是不完整*/}
        {shouldShowLoadingSkeleton && (
          <DisappearDelayed start={messages.length > 0} delay={200}>
            <div className={'absolute bottom-0 left-0 right-0 top-0 z-10 box-border h-full flex-grow overflow-y-scroll bg-[var(--bg-bg-2)] p-4'}>
              {new Array(15).fill(0).map((_, i) => {
                return <Skeleton key={i} loading active avatar round title />
              })}
            </div>
          </DisappearDelayed>
        )}

        {/* 消息列表 */}
        {!!messages.length && (
          <div
            ref={setListElement}
            className={'relative flex h-full select-text overflow-y-scroll py-4'}
            onScroll={onScroll}
            style={{
              overflowAnchor: 'none',
            }}
          >
            <InfiniteScroll
              hasPreviousPage={MessageService.instance.hasMorePreviousMessages(channel_id)}
              hasNextPage={MessageService.instance.hasMoreNextMessages(channel_id)}
              reverse={true}
              scrollElement={listElement}
              loadNextPage={cachedLoadAfter}
              loadPreviousPage={cachedLoadBefore}
            >
              <ul className={'mt-auto w-full'}>
                {messages.map((message, index) => (
                  <li key={message.message_id.toString()} data-message-id={message.message_id.toString()}>
                    <MessageItem
                      channel={channel}
                      // reply 传入新对象，让输入框的焦点能够更新
                      onReply={() => setReply({ ...message })}
                      previewMedia={mediaIndex => handlePreview(index, mediaIndex)}
                      previewMessage={messages[index - 1]}
                      nextMessage={messages[index + 1]}
                      unreadStart={unreadMessageStart}
                      guildId={guild_id}
                      message={message}
                    />
                  </li>
                ))}
              </ul>
            </InfiniteScroll>
          </div>
        )}

        <div className={clsx(['drop-zone', !showDropZone && 'hidden'])}>
          <div className={'drop-zone-bg'}></div>
          <div className={'drop-zone-content flex h-full items-center justify-center'}>发送给 {channel.name}</div>
        </div>
        {/* 频道 # 列表 UI */}
        <div id="container-above-input" className="z-10 absolute bottom-0 left-0 right-0" />
        <div className={'absolute left-0 right-0 top-0 flex flex-col items-end'}>
          {/*/!* 私信防诈骗提醒 *!/*/}
          {isDm && isOtherUser && isDmBan && (
            <Alert
              className="w-full text-[var(--function-red-1)]"
              type="error"
              icon={<iconpark-icon name="ExclamationCircle" size={16}></iconpark-icon>}
              banner
              message={<span className="ml-[8px]">该用户近期涉嫌违规，建议你注意财产安全，避免损失。</span>}
            />
          )}
          {isDm && isShowRisk && isOtherUser && !isDmBan && (
            <Alert
              className="w-full text-[var(--function-red-1)]"
              type="error"
              icon={<iconpark-icon name="ExclamationCircle" size={16}></iconpark-icon>}
              banner
              closable
              closeIcon={<iconpark-icon class={'w-[18px] cursor-pointer'} size={14} color={'var(--fg-b40)'} name="Close"></iconpark-icon>}
              onClose={() => dispatch(dmActions.hideRisk())}
              message={
                <a
                  className="flex items-center !text-current"
                  href={`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/fraud_prevention_guidelines/fraud_prevention_guidelines.html`}
                  target={'_blank'}
                  rel={'noreferrer'}
                >
                  <span className="ml-[8px]">账号、兑换码、道具交易可能是诈骗，点击了解更多</span>
                  <iconpark-icon name="DoubleRight" size={14}></iconpark-icon>
                </a>
              }
            />
          )}
          <MessageTopPresentation onClick={jumpToTopMessage} />
          {/*右上角未读数量或者 @ 提醒按钮*/}
          {!!inChannelUnreadNumber && (
            <div className={'mt-6 w-fit'}>
              <InChannelUnreadButton
                num={inChannelUnreadNumber}
                mentions={inChannelUnreadMentions}
                gotoMessage={id => {
                  if (id) {
                    scrollIntoMessage(id.toString(), 'start')
                    setInChannelUnreadMentions(inChannelUnreadMentions.slice(0, -1))
                  } else if (unreadMessageStart) {
                    scrollIntoMessage(unreadMessageStart.toString(), 'start')
                    setInChannelUnreadNumber(0)
                  }
                }}
              />
            </div>
          )}
        </div>
        {/* 右下角新消息按钮 */}
        <div
          onClick={handleClickUnreadButton}
          className={clsx([
            'bottom-right-new-message-button',
            !temporaryListEnabled && closeToBottom ? ['scale-0 opacity-0 ease-in'] : ['scale-100 opacity-100 ease-out'],
          ])}
          style={{
            backgroundColor: channelUnread.num ? 'var(--fg-blue-1)' : 'var(--fg-white-1)',
            color: channelUnread.num ? 'var(--fg-white-1)' : 'var(--fg-blue-1)',
          }}
        >
          {channelUnread.num ?
            channelUnread.mentions?.length ?
              <>@</>
            : <>{channelUnread.num > 99 ? '99+' : channelUnread.num}</>
          : <iconpark-icon size={16} color={'var(--fg-blue-1)'} name="DoubleDown" />}
        </div>
      </div>
      <PermissionBuilder permission={ChannelPermission.SendMessage}>
        {allow => (
          <MessageInputField readonly={!allow} onCancelReply={() => setReply(undefined)} reply={reply} onPaste={onPaste} chooseFiles={chooseFiles} />
        )}
      </PermissionBuilder>
    </>
  )
}

function MessageItem({
  channel,
  previewMessage,
  nextMessage,
  message,
  unreadStart,
  guildId,
  previewMedia,
  onReply,
}: {
  previewMessage?: MessageStruct
  nextMessage?: MessageStruct
  message: MessageStruct
  unreadStart?: bigint
  guildId?: string
  relationId?: string
  channel: ChannelStruct
  previewMedia: (mediaIndex?: number) => void
  onReply: () => void
}) {
  // 用于监听消息变更并刷新 UI
  useMessage(message)
  const isDm = channel && 'recipient_id' in channel
  const [showMenu, setShowMenu] = useState(false)
  // 频道的置顶消息数据
  const topMessage = useAppSelector(topMessageSelectors.topMessage(message.channel_id), isEqual)

  const unreadStartHere = message.message_id === unreadStart
  const unreadStartNext = nextMessage ? nextMessage.message_id === unreadStart : false
  const isCurrentMessageDisrupt = useMemo(() => {
    return previewMessage ? MessageUtils.shouldDisruptMessageFlow(message, previewMessage) : true
  }, [message, previewMessage])
  const isNextMessageDisrupt = useMemo(() => {
    return nextMessage ? MessageUtils.shouldDisruptMessageFlow(nextMessage, message) : true
  }, [message, nextMessage])

  // 优先处理删除和撤回，它们不带消息样式
  if (message.deleted) {
    return null
  } else if (message.recall) {
    return (
      <div
        style={{
          paddingTop: MESSAGE_ITEM_GAP,
        }}
      >
        <RecalledMessage message={message} />
      </div>
    )
  }

  // 刷屏被系统删除
  if (message.content.type === MessageType.DelMsgNotice) {
    return (
      <div
        style={{
          paddingTop: MESSAGE_ITEM_GAP,
        }}
      >
        <DelMsgNoticeMessage message={message as never} />
      </div>
    )
  }

  function createConcreteMessage() {
    switch (message.content.type) {
      case MessageType.start:
        return <StartMessage message={message as never} />
      case MessageType.Welcome:
        return <WelcomeMessage userId={message.user_id} guildId={guildId} message={message.content as never} />
      case MessageType.text:
        return <TextMessage message={message as never} guildId={guildId} />
      case MessageType.RichText:
        return <RichTextMessage message={message.content as never} onPreview={previewMedia} />
      case MessageType.image:
        return (
          <ImageMessage
            onPreview={previewMedia}
            isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
            isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
            message={message.content as never}
          />
        )
      case MessageType.sticker:
        return (
          <ImageMessage
            onPreview={previewMedia}
            isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
            isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
            message={message.content as never}
            limitSize={{ width: 100, height: 100 }}
            bordered={false}
          />
        )
      case MessageType.video:
        return (
          <VideoMessage
            onPreview={previewMedia}
            message={message.content as never}
            isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
            isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
          />
        )
      case MessageType.Voice:
        return (
          <VoiceMessage
            message={message.content as never}
            isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
            isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
          ></VoiceMessage>
        )
      case MessageType.Friend:
        return <FriendMessage />
      case MessageType.RedPacket:
        return <RedPacketMessage />
      case MessageType.CircleShare:
        return (
          <CircleShareMessage
            message={message.content as CircleShareContentStruct}
            isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
            isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
          />
        )
      case MessageType.QuestionShare:
      case MessageType.AnswerShare:
        return (
          <QuestionShareMessage
            message={message.content as QuestionShareContentStruct}
            isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
            isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
          />
        )
      case MessageType.MessageCard:
        return <MessageCardMessage message={message as never} />
      case MessageType.File:
        return <FileMessage message={message as never} />
      default:
        return undefined
    }
  }

  let child = createConcreteMessage()
  const supportedMessageType = !!child
  child ??= (
    <UnsupportedMessage
      isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
      isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
    />
  )
  child = (
    <div className={'flex flex-col'}>
      {child}
      {/* 消息下方的表态*/}
      <WrapReaction message={message} />
    </div>
  )

  // 包裹在气泡内
  if (supportedMessageType && MessageUtils.wrappedInBubble(message)) {
    if (message.quote_l1) {
      child = (
        <div className={'flex flex-col gap-2.5'}>
          <article
            className={clsx([
              'before:mr-2 before:inline-block before:h-4 before:w-0.5 before:rounded-[1px] before:bg-[var(--fg-b100)] before:align-middle before:opacity-[.15] before:content-[""]',
              'text-xs text-[var(--fg-b60)]',
              'truncate',
            ])}
          >
            <MessageLoader channelId={message.channel_id} messageId={message.quote_l2 ?? message.quote_l1} loading="此消息加载中...">
              {message => (
                <>
                  <RealtimeNickname userId={message.user_id} guildId={guildId} />
                  :&nbsp;
                  <PlainTextMessage colorful={false} message={message} />
                </>
              )}
            </MessageLoader>
          </article>

          {child}
        </div>
      )
    }
    child = (
      <WrapMessageBubble
        isAdjacentToPrev={!isCurrentMessageDisrupt && !unreadStartHere}
        isAdjacentToNext={!isNextMessageDisrupt && !unreadStartNext}
        py={message.content.type === MessageType.RichText ? 6 : 10}
        userId={message.user_id}
      >
        {child}
      </WrapMessageBubble>
    )
  }

  // 非系统消息无需包裹
  if (![MessageType.start, MessageType.Welcome, MessageType.Friend].includes(message.content.type)) {
    // 按钮菜单和发送状态
    child = (
      <div className={'flex'}>
        <div className="max-w-[calc(100%-100px)] flex-shrink">{child}</div>
        <div className={'ml-1.5 flex min-w-[80px] flex-shrink-0 flex-col'}>
          {MessageUtils.menuDisplayEnabled(message) && showMenu && <MessageMenu message={message} isDm={isDm} onReply={onReply} />}
          {/* 让上面两个元素分别位于两段，不要使用 justify-content，因为如果某种情况剩下一个 UI 会使 justify-content 失效 */}
          <div className={'flex-grow'} />
          <MessageSendingStatus messageStatus={message.messageStatus} status={message.status} />
        </div>
      </div>
    )
  }
  child = (
    <div className={'flex flex-col gap-1.5'}>
      {child}
      {/* pin 标识 */}
      {message.pin && message.pin != '0' && (
        <MessageCaption icon={'PIN'} labelPrefix={<RealtimeNickname userId={message.pin} guildId={guildId} />} label={'设置了精选'} />
      )}
      {/* 置顶标识 */}
      {topMessage && topMessage.message_id === message.message_id && (
        <MessageCaption icon={'Top'} labelPrefix={<RealtimeNickname userId={topMessage.top_user_id} guildId={guildId} />} label={'置顶了这条消息'} />
      )}
      {/* 仅你可见标识 */}
      {message.status === MessageStatus.Ephemeral && <MessageCaption icon={'Eye'} label={'仅你可见'} />}
    </div>
  )

  const marginStyle: CSSProperties = {}
  // 自由消息的上边距也是 16，不支持的消息必然不是 freeStyle
  if (supportedMessageType && MessageUtils.isFreeStyle(message)) {
    marginStyle.paddingTop = MESSAGE_ITEM_GAP
  }
  // 普通消息的上边距是 16
  else if (isCurrentMessageDisrupt || unreadStartHere) {
    marginStyle.paddingTop = MESSAGE_ITEM_GAP
    child = <WrapUserInfo message={message}>{child}</WrapUserInfo>
  }
  // 信息流的上边距是 6
  else {
    // 注意这里如果用 margin 会导致列表的各种滚动定位出错
    marginStyle.paddingLeft = 44
    marginStyle.paddingTop = 6
  }

  // 时间分割线的显示是在上一个 Item，所以用来判断的消息是当前消息和下一条消息
  // 这是因为，如果显示是在当前 Item，那么加载历史消息时，当前消息可能会突然出现时间分割线
  // 这会导致当前已经渲染的 Item 的高度发生变化，这又会导致列表发生抖动
  const showDateDivider =
    nextMessage &&
    !nextMessage.recall &&
    unreadStart !== nextMessage.message_id && // 新消息分割线出现时不需要显示时间
    message.content.type !== MessageType.start &&
    !nextMessage.time.isSame(message.time, 'day')

  return (
    <div className={'flex flex-col px-4'} onMouseOverCapture={() => setShowMenu(true)} onMouseOutCapture={() => setShowMenu(false)}>
      {/* 新消息分割线 */}
      {unreadStartHere && (
        <div className={'flex select-none flex-row items-center pt-5 text-[12px] text-[var(--fg-blue-1)]'}>
          <div className={'h-[1px] flex-1 bg-[var(--fg-blue-1)]'}></div>
          <span className={'px-2'}>新消息</span>
          <div className={'h-[1px] flex-1 bg-[var(--fg-blue-1)]'}></div>
        </div>
      )}

      <div style={marginStyle}>{child}</div>
      {/* extra_data 显示区 */}
      {!!message.extra_data &&
        (() => {
          let child: ReactNode | null = null
          switch (message.extra_data.type) {
            case 'stranger':
              child = messageExtraStrangerTips({
                messageStatus: message.status ?? MessageStatus.normal,
                extra: message.extra_data,
              })
              break
            case 'mention_everyone_limit': {
              child = '今日次数已达上限'
              break
            }
            case 'custom': {
              child = message.extra_data.data.tips
              break
            }
          }
          return child ? <p className={'mt-4 text-center text-xs text-[var(--fg-b40)]'}>{child}</p> : null
        })()}
      {/*两条消息间隔超过一天，需要在消息上方显示时间，需要在应用消息间距规则前添加*/}
      {showDateDivider && (
        <div className={'m-[auto] pt-5 text-[12px] text-[var(--fg-b40)]'}>
          <span className={'select-none'}>{DateTimeUtils.formatDate(nextMessage.time)}</span>
        </div>
      )}
    </div>
  )
}

// 给消息包装上用户信息
function WrapUserInfo({ children, message }: { message: MessageStruct; children: React.ReactNode }) {
  const guild = useContext(GuildContext)
  const inGuild = !!guild
  const handleClick = useCallback(() => {
    globalEmitter.emit(GlobalEvent.InsertMention, { userId: message.user_id, channelId: message.channel_id })
  }, [])
  return (
    <div className={'item-avatar-row'}>
      <UserCard userId={message.user_id} guildId={message.guild_id} channelId={message.channel_id} placement="rightBottom">
        <RealtimeAvatar className={'user-avatar flex-shrink-0'} userId={message.user_id} />
      </UserCard>
      <div className={'item-name-and-content-col'}>
        {/* 用户名称那一行 */}
        <div className={'item-name-row'}>
          <RealtimeNickname
            botTag
            displayRoleColor={inGuild}
            guildId={message.guild_id}
            userId={message.user_id}
            prefix={<span className="mr-[2px] hidden group-hover/item-name:inline">@</span>}
            className={clsx(['group/item-name cursor-pointer', { 'text-[var(--fg-blue-1)]': !inGuild }])}
            onClick={handleClick}
          />
          <div className={'flex-shrink-0 select-none break-keep'}>{DateTimeUtils.format(message.time)}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

function MessageSendingStatus({ messageStatus, status }: { messageStatus?: MessageCurrentStatus; status?: MessageStatus }) {
  return (
    <div className={'h-[16px] w-[16px]'}>
      {(() => {
        switch (messageStatus) {
          case MessageCurrentStatus.sending:
            return (
              <AppearDelayed condition={() => messageStatus == MessageCurrentStatus.sending} delay={1000}>
                <CircularLoading />
              </AppearDelayed>
            )
          case MessageCurrentStatus.failed:
            return <iconpark-icon name="ExclamationCircle" color={'var(--function-red-1)'} />
          case MessageCurrentStatus.normal:
          case undefined:
        }

        if (status != undefined && status !== MessageStatus.normal && status !== MessageStatus.Ephemeral) {
          return <iconpark-icon name="ExclamationCircle" color={'var(--function-red-1)'} />
        }
      })()}
    </div>
  )
}

interface WrapMessageBubbleProps extends MessageCommonProps {
  userId: string
  children: React.ReactNode
  py?: number
}

// 给消息包装上气泡
function WrapMessageBubble({ children, userId, py = 10, isAdjacentToNext = false, isAdjacentToPrev = false }: WrapMessageBubbleProps) {
  const outgoing = LocalUserInfo.userId == userId
  return (
    <div
      className={clsx([
        `item-bubble w-full rounded-r-[8px] ${isAdjacentToPrev ? 'rounded-tl-[2px]' : 'rounded-tl-[8px]'} ${
          isAdjacentToNext ? 'rounded-bl-[2px]' : 'rounded-bl-[8px]'
        } px-[12px]`,
        outgoing ? 'item-bubble-outgoing' : 'item-bubble-incoming',
      ])}
      style={{
        paddingTop: py,
        paddingBottom: py,
      }}
    >
      <div className={'message-bubble-content break-all'}>{children}</div>
    </div>
  )
}

const REACTION_WIDTH_STEPS = [10, 16, 24, 30, 38, 46, 54]

function WrapReaction({ message }: { message: MessageStruct }) {
  useReactions(message.message_id)

  if (!message.reactions?.length) return

  return (
    <div className={'reaction'}>
      {message.reactions.map(reaction => (
        <div
          key={reaction.name}
          className={clsx([
            'reaction-item hover:bg-[var(--fg-white-1)]/50 flex flex-row items-center hover:border-[var(--fg-blue-2)] active:border-[var(--fg-blue-2)] active:bg-[var(--fg-blue-3)]',
            reaction.me && 'reaction-item-me',
          ])}
          onClick={() => MessageService.instance.toggleReaction(message, reaction.name)}
        >
          <EmojiIcon name={reaction.name} size={16} />
          {reaction.count > 1 && (
            <span
              className="whitespace-nowrap"
              style={{
                width: REACTION_WIDTH_STEPS[Math.log10(reaction.count) | 0] ?? last(REACTION_WIDTH_STEPS),
              }}
            >
              {reaction.count}
            </span>
          )}
        </div>
      ))}

      <ReactionPopOver message={message}>
        <div className={'react-button flex items-center justify-center'}>
          <iconpark-icon size={16} color={'var(--fg-b60)'} name="EmojiAdd" />
        </div>
      </ReactionPopOver>
    </div>
  )
}

function messageExtraStrangerTips({
  extra: {
    data: { from_user_id, status, send_msg_count, max_msg_count },
  },
  messageStatus,
}: {
  extra: MessageExtraDataStrangerStruct
  messageStatus: MessageStatus
}) {
  // 我不清楚这行代码的含义，从 app 里面抄过来的
  if (status != 0 || send_msg_count == undefined) return null

  if (messageStatus != null && messageStatus !== MessageStatus.normal) {
    return <span>{`你已发送了${send_msg_count}条消息，请耐心等待回复`}</span>
  }

  // 发送/接受成功状态下，只提醒一次，大于1次的就不提醒了
  if (send_msg_count > 1) return null

  const isMe = from_user_id == LocalUserInfo.userId
  return <span>{isMe ? `在对方回复前，你最多可发${max_msg_count}条私信` : `在你回复前，对方最多可发${max_msg_count}条私信`}</span>
}

/**
 * 消息底部的说明文字，例如置顶提示、pin 提示、仅你可见提示
 * @param icon          提示图标
 * @param labelPrefix   文字的前缀
 * @param label         说明文字
 * @constructor
 */
function MessageCaption({ icon, labelPrefix, label }: { icon: string; labelPrefix?: ReactNode; label: ReactNode }) {
  return (
    <div className={clsx(['flex flex-row gap-1 break-keep text-[13px] text-[var(--fg-b40)]'])}>
      <iconpark-icon color={'var(--fg-b40)'} name={icon} />
      {labelPrefix}
      {label}
    </div>
  )
}

interface FilesConfirmationProps {
  files: File[]
  onChange: (value: File[]) => void
}

function FilesConfirmation({ files: _files, onChange }: FilesConfirmationProps) {
  const [files, setFiles] = useState(_files)

  const showDeleteIcon = files.length > 1

  return (
    <div className={'max-h-[64vh] overflow-y-auto'}>
      {files.map((e, i) => (
        <div key={i} className={'flex py-3 items-center'}>
          <img src={getFileIcon(e.name, getFileType(e))} className={'w-10 h-10'} />
          <div className={'flex-1 pl-0.5 overflow-hidden'}>
            <p className={'leading-[20px] font-medium truncate'}>{e.name}</p>
            <p className={'text-fgB60 pt-1 text-xs'}>{CosUtils.convertBytesToReadableSize(e.size)}</p>
          </div>
          {showDeleteIcon && (
            <iconpark-icon
              name={'Delete'}
              size={20}
              class={'!p-0.5 icon-bg-btn ml-1'}
              color={'var(--fg-b40)'}
              onClick={() => {
                const newFiles = files.filter(f => f !== e)
                setFiles(newFiles)
                onChange(newFiles)
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
