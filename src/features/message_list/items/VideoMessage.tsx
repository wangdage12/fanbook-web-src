import { MAX_IMAGE_SIZE } from 'fb-components/components/image/ChatImage'
import VideoThumbnail from 'fb-components/components/image/VideoThumbnail'
import { MessageContentStruct } from 'fb-components/components/messages/types'
import { MessageCommonProps } from './type'

export const MAX_VIDEO_SIZE = { width: 708, height: 320 }
export interface VideoContentStruct extends MessageContentStruct {
  url: string
  width: number
  height: number
  thumbName?: string
  thumbUrl?: string
  thumbWidth?: number
  thumbHeight?: number
  duration?: number
  videoName?: string
  /** web 获取不到本地地址 */
  localPath?: string
  /** web 获取不到本地地址 */
  localThumbPath?: string
  localIdentify?: string
  filetype?: string
  /** 本地上传才有此值 */
  localUrl?: string
  /** 本地上传才有此值 */
  localThumbUrl?: string
}

export interface VideoMessageProps extends MessageCommonProps {
  message: VideoContentStruct
  limitSize?: { width: number; height: number }
  onPreview: (mediaIndex?: number) => void
}

export default function VideoMessage({
  message,
  onPreview,
  limitSize = MAX_IMAGE_SIZE,
  isAdjacentToPrev = false,
  isAdjacentToNext = false,
}: VideoMessageProps) {
  const { thumbUrl, localThumbUrl, thumbWidth, thumbHeight, duration, width, height, localUrl, url } = message
  const src = localUrl ?? url
  const preview = localThumbUrl ?? thumbUrl
  const _thumbWidth =
    !thumbWidth ?
      !width ? 320
      : width
    : thumbWidth
  const _thumbHeight =
    !thumbHeight ?
      !height ? 320
      : height
    : thumbHeight

  return (
    <VideoThumbnail
      style={{ maxWidth: _thumbWidth, maxHeight: _thumbWidth }}
      className={`relative flex h-full w-full overflow-hidden rounded-r-[8px] ${isAdjacentToPrev ? 'rounded-tl-[2px]' : 'rounded-tl-[8px]'} ${
        isAdjacentToNext ? 'rounded-bl-[2px]' : 'rounded-bl-[8px]'
      } border-[0.5px] border-[var(--fg-b10)]`}
      limitSize={limitSize}
      width={_thumbWidth}
      height={_thumbHeight}
      src={src}
      thumbSrc={preview}
      duration={duration}
      onClick={() => onPreview()}
    />
  )
}
