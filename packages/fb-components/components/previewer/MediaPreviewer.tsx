import { useSize } from 'ahooks'
import { MouseEventHandler, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { EmbeddedAssetType } from '../../rich_text/types'
import { Portal } from '../Portal'
import { Size } from '../type'
import { ImageMediaItem } from './components/ImageMediaItem'
import { VideoMediaItem } from './components/VideoMediaItem'

export interface MediaPreviewItem {
  type: EmbeddedAssetType
  url: string
  width: number
  height: number
  /** EmbeddedAssetType.Video 时的显示的图片 */
  preview?: string
}

export interface MediaPreviewerOpenOption {
  medias: Array<MediaPreviewItem>
  initialIndex?: number
  reachedStart?: boolean
  reachedEnd?: boolean
  /** 到达边界触发 */
  onBoundary?: (currentIndex: number, reached: 'start' | 'end') => void
  onClose?: () => void
}

export interface MediaPreviewerContextProps {
  open: (options: MediaPreviewerOpenOption) => void
  update: (options: Partial<MediaPreviewerOpenOption>) => void
  close: () => void
}

const MediaPreviewerContext = createContext<MediaPreviewerContextProps | undefined>(undefined)

export function useMediaPreviewer(): MediaPreviewerContextProps | undefined {
  const context = useContext(MediaPreviewerContext)
  // 富文本组件内置了默认预览处理, 但富文本可以不预览
  // if (!context) {
  //   throw new Error('useMediaPreviewer must be used within a MediaPreviewer')
  // }
  return context
}

function MediaItem({ data, onClose }: { data: MediaPreviewItem; onClose: MouseEventHandler<HTMLDivElement> }) {
  const viewSize = useSize(document.body) ?? ({} as Size)
  const limitSize = useMemo(() => {
    return {
      width: (viewSize.width ?? 0) * 0.9,
      height: (viewSize.height ?? 0) * 0.9,
    }
  }, [viewSize])
  switch (data.type) {
    case EmbeddedAssetType.Image:
      return <ImageMediaItem data={data} onClose={onClose} />
    case EmbeddedAssetType.Video:
      return <VideoMediaItem data={data} limitSize={limitSize} />
  }
}

function Icon({ icon, hidden, className = '', onClick }: { icon: string; hidden?: boolean; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${
        hidden ? 'pointer-events-none invisible' : ''
      } z-20 h-12 w-12 cursor-pointer bg-[var(--fg-widget)] text-[var(--fg-white-1)] opacity-60 hover:opacity-100 ${className}`}
    >
      <iconpark-icon name={icon} size={24} />
    </button>
  )
}

export default function MediaPreviewer({ children }: { children: React.ReactNode }) {
  const [option, setOption] = useState<MediaPreviewerOpenOption | undefined>(undefined)
  const { medias = [], reachedStart, reachedEnd, onBoundary, onClose } = option || {}
  const [currentIndex, setCurrentIndex] = useState(0)
  const [innerReachedStart, setInnerReachedStart] = useState(false)
  const [innerReachedEnd, setInnerReachedEnd] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const currentFocusElementRef = useRef<HTMLElement | null>(null)

  function exitOnEsc(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      e.preventDefault()
      handleClose()
    }
  }

  function handleClose() {
    onClose?.()
    setOption(undefined)
    currentFocusElementRef.current?.focus({ preventScroll: true })
  }

  const handleWrapperClick: MouseEventHandler<HTMLDivElement> = evt => {
    if (evt.target !== wrapperRef.current) {
      return
    }
    handleClose()
  }
  // 阻止滚动穿透
  const handleTouchMove = (evt: TouchEvent) => {
    evt.stopPropagation()
    evt.preventDefault()
  }
  const handleWheel = (evt: WheelEvent) => {
    evt.stopPropagation()
    evt.preventDefault()
  }
  // 使用原生事件阻止滚动穿透
  useEffect(() => {
    const preview = previewRef.current
    currentFocusElementRef.current = document.activeElement as HTMLElement
    preview?.addEventListener('touchmove', handleTouchMove, { passive: false })
    preview?.addEventListener('wheel', handleWheel, { passive: false })
    preview?.focus()
    return () => {
      preview?.removeEventListener('touchmove', handleTouchMove)
      preview?.removeEventListener('wheel', handleWheel)
    }
  }, [medias])

  const prevSlide = () => {
    const index = (currentIndex - 1 + medias.length) % medias.length
    setCurrentIndex(index)
    if (index > 0) {
      return
    }
    // 到达边缘
    if (index === currentIndex) {
      if (onBoundary) {
        onBoundary?.(index, 'start')
      } else {
        setInnerReachedStart(true)
      }
    }
  }

  const nextSlide = () => {
    const index = (currentIndex + 1) % medias.length
    setCurrentIndex(index)
    if (index < medias.length - 1) {
      return
    }
    // 到达边缘
    if (index === currentIndex) {
      if (onBoundary) {
        onBoundary?.(index, 'end')
      } else {
        setInnerReachedEnd(true)
      }
    }
  }

  useEffect(() => {
    if (onBoundary) {
      setInnerReachedStart(reachedStart ?? false)
      setInnerReachedEnd(reachedEnd ?? false)
    } else {
      setInnerReachedStart(currentIndex === 0)
      setInnerReachedEnd(currentIndex === medias.length - 1)
    }
  }, [option, currentIndex])

  return (
    <MediaPreviewerContext.Provider
      value={{
        open: option => {
          setOption(option)
          setCurrentIndex(option.initialIndex ?? 0)
        },
        update: option => {
          setOption(_option => ({ ..._option, ...option }) as MediaPreviewerOpenOption)
          setCurrentIndex(option.initialIndex ?? 0)
        },
        close: () => {
          setOption(undefined)
          setCurrentIndex(0)
          setInnerReachedStart(false)
          setInnerReachedEnd(false)
        },
      }}
    >
      <>
        {children}
        {medias.length > 0 ?
          <Portal>
            <div
              ref={previewRef}
              className={'fixed bottom-0 left-0 right-0 top-0 z-[3000] overscroll-contain bg-[var(--fg-widget)]'}
              tabIndex={-1}
              onKeyDown={exitOnEsc}
              data-ignore-content-menu
            >
              <div
                ref={wrapperRef}
                className={'absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center'}
                onClick={handleWrapperClick}
              >
                <MediaItem key={currentIndex} data={medias[currentIndex]} onClose={handleClose} />
              </div>

              {/* <Icon icon="Close" className="absolute right-[24px] top-[24px] rounded-full" onClick={handleClose} /> */}
              <Icon icon="Left" className="absolute left-[24px] top-[50%] mt-[-24px] rounded-full" hidden={innerReachedStart} onClick={prevSlide} />
              <Icon icon="Right" className="absolute right-[24px] top-[50%] mt-[-24px] rounded-full" hidden={innerReachedEnd} onClick={nextSlide} />
            </div>
          </Portal>
        : null}
      </>
    </MediaPreviewerContext.Provider>
  )
}
