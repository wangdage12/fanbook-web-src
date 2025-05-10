import { MessageContentStruct, MessageStruct } from 'fb-components/components/messages/types.ts'
import { useMediaPreviewer } from 'fb-components/components/previewer/MediaPreviewer.tsx'
import { EmbeddedAssetType } from 'fb-components/rich_text/types.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse.ts'
import { MessageCardContext } from 'message-card/src/MessageCardContext.ts'
import WidgetFactory, { WidgetNodeType } from 'message-card/src/factory/WidgetFactory.ts'
import { useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BotLinkHandlerExtra } from '../../../services/link_handler/BotLinkHandler.ts'
import LinkHandlerPresets from '../../../services/link_handler/LinkHandlerPresets.ts'
import UnsupportedMessage from './UnsupportedMessage.tsx'

export interface MessageCardMessageContentStruct extends MessageContentStruct {
  data: WidgetNodeType
  template?: 'base' | 'team'
  // href 为自动操作 key 时，如果无空余 key，会弹出此 toast
  noSeatToast?: string
  notification?: string

  come_from_name?: string
  come_from_icon?: string
}

// 为了不让恶意卡片无限使用高度，默认情况下卡片被限制 5000 高度以内
const MAX_CARD_WIDTH = 360
const MAX_CARD_HEIGHT = 5000

export default function MessageCardMessage({ message }: { message: MessageStruct<MessageCardMessageContentStruct> }) {
  const mediaPreviewer = useMediaPreviewer()
  const { message_card: keys, channel_id, content } = message

  const contentData = useMemo(() => {
    return safeJSONParse(content.data, undefined)
  }, [message])

  const child = useMemo(() => {
    try {
      return contentData ? WidgetFactory.fromJson(contentData).toReactComponent() : undefined
    } catch (e) {
      console.warn(`[MessageCard] ${e}`)
      return undefined
    }
  }, [contentData])

  if (message.content.template === 'team') {
    return <UnsupportedMessage />
  }

  function handleHref(href?: string) {
    if (!href) return
    LinkHandlerPresets.instance.bot.handleUrl(href, { message, channelId: channel_id, botId: message.user_id } as BotLinkHandlerExtra)
    // LinkHandlerPresets.instance.bot.handleUrl('fanbook://external/open?url=fanbook%3A%2F%2Fsomething%3Fuser%3D%24user_id%26msg%3D%24message', {
    //   message,
    // })
  }

  function handlePreview(src: string) {
    mediaPreviewer?.open({ medias: [{ url: src, type: EmbeddedAssetType.Image, width: 0, height: 0 }] })
  }

  return (
    <ErrorBoundary
      fallback={<UnsupportedMessage />}
      onError={e => {
        console.info(`Wrong Message Card: ${JSON.stringify(content.data)}`, e)
      }}
    >
      <div
        className={'flex w-fit flex-col overflow-hidden rounded-lg bg-[var(--fg-white-1)] leading-[1.35]'}
        style={{
          maxWidth: content.template === 'base' ? undefined : MAX_CARD_WIDTH,
        }}
      >
        <div
          style={{
            maxHeight: content.template === 'base' ? undefined : MAX_CARD_HEIGHT,
            overflow: 'hidden',
          }}
        >
          <MessageCardContext.Provider
            value={{
              keys,
              onClickButton: handleHref,
              onPreview: handlePreview,
            }}
          >
            {child}
          </MessageCardContext.Provider>
        </div>
        {content.come_from_name && (
          <div className={'mx-2 flex gap-1 border-t border-t-[var(--fg-b10)] py-2'}>
            {content.come_from_icon && <img className={'h-4 w-4 rounded-[2px]'} src={content.come_from_icon} alt="icon" />}
            <div className={'text-xs'}>{content.come_from_name}</div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
