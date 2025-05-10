import ChatImage, { MAX_IMAGE_SIZE } from 'fb-components/components/image/ChatImage.tsx'
import { MessageContentStruct } from 'fb-components/components/messages/types'
import { MessageCommonProps } from './type'

export interface ImageContentStruct extends MessageContentStruct {
  url: string
  width: number
  height: number
  fileType: string
  size?: number
  /** web 获取不到本地地址 */
  localFilePath?: string
  localIdentify?: string
  thumb: boolean
  checkUrl?: string | null
  /** 本地上传才有此值 */
  localUrl?: string
}

export interface ImageMessageProps extends MessageCommonProps {
  message: ImageContentStruct
  bordered?: boolean
  limitSize?: { width: number; height: number }
  onPreview: (mediaIndex?: number) => void
}

export default function ImageMessage({
  message,
  limitSize = MAX_IMAGE_SIZE,
  bordered = true,
  onPreview,
  isAdjacentToNext = false,
  isAdjacentToPrev = false,
}: ImageMessageProps) {
  const { width, height } = message
  const src = message.localUrl ?? message.url
  return (
    <ChatImage
      key={src}
      style={{
        borderWidth: bordered ? 0.5 : 0,
        borderColor: 'var(--fg-b10)',
      }}
      originSize={{ width, height }}
      limitSize={limitSize}
      className={`message-image cursor-zoom-in rounded-r-[8px] ${isAdjacentToPrev ? 'rounded-tl-[2px]' : 'rounded-tl-[8px]'} ${
        isAdjacentToNext ? 'rounded-bl-[2px]' : 'rounded-bl-[8px]'
      }`}
      src={src}
      onClick={() => onPreview()}
    />
  )
}
