import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { VideoWrapper } from '../video/VideoWrapper'
import ChatImage, { ChatImageProps } from './ChatImage'

dayjs.extend(duration)

export interface InnerVideoThumbnailProps extends Pick<ChatImageProps, 'limitSize'> {
  width: number
  height: number
  src?: string
  duration?: number
  className?: string
  mode?: 'adaptive' | 'full'
  style?: React.CSSProperties
  onClick?: () => void
}

function InnerVideoThumbnail({
  width,
  height,
  limitSize,
  src,
  duration = 0,
  className = '',
  mode = 'adaptive',
  style,
  onClick,
}: InnerVideoThumbnailProps) {
  const _width = width === 0 ? 64 : width
  const _height = height === 0 ? 64 : height
  return (
    <div className={`relative inline-block h-fit w-fit !flex-none ${className}`} style={style} onClick={onClick}>
      <ChatImage
        limitSize={limitSize}
        originSize={{ width: _width, height: _height }}
        hiddenLongImageTag
        fallback={<></>}
        className={`video-thumb cursor-pointer bg-[var(--fg-black)] ${mode === 'adaptive' ? 'object-contain' : 'object-cover !w-full !h-full'}`}
        src={src}
      />
      <div className={'pointer-events-none absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.15)]'}>
        <iconpark-icon class="[text-shadow:_0_2px_4px_rgba(0,0,0,0.08)]" name="Pause" size={24} color={'var(--fg-white-1)'} />
        <div className={'text-[var(--fg-white-1)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.08)] mt-0.5 text-xs leading-[20px] font-medium'}>
          {dayjs.duration(duration * 1000).format('mm:ss')}
        </div>
      </div>
    </div>
  )
}

export interface VideoThumbnailProps extends Omit<InnerVideoThumbnailProps, 'src'> {
  src: string
  thumbSrc?: string
  thumbClassName?: string
  thumbStyle?: React.CSSProperties
}

function VideoThumbnail({
  width,
  height,
  limitSize,
  src,
  thumbSrc,
  thumbClassName = '',
  thumbStyle,
  duration = 0,
  className = '',
  style,
  mode,
  onClick,
}: VideoThumbnailProps) {
  return (
    <VideoWrapper url={src} mode={mode} className={className} style={style} originSize={{ width, height }} limitSize={limitSize}>
      <InnerVideoThumbnail
        className={thumbClassName}
        style={thumbStyle}
        width={width}
        height={height}
        src={thumbSrc}
        duration={duration}
        onClick={onClick}
        limitSize={limitSize}
        mode={mode}
      />
    </VideoWrapper>
  )
}

export default VideoThumbnail
