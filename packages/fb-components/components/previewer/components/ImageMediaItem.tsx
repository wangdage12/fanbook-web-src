import { useUpdate } from 'ahooks'
import { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import ErrorImage from '../../../assets/images/error-image.svg'
import { MediaPreviewItem } from '../MediaPreviewer'
import { useInteraction } from '../useInteraction'

export function ImageMediaItem({ data, onClose }: { data: MediaPreviewItem; onClose?: MouseEventHandler<HTMLDivElement> }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [url, setUrl] = useState(data.url)
  const [loading, setLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [visible, setVisible] = useState(false)
  const { transform, reset } = useInteraction(imageRef, {
    disablePan: loading || isError,
    disableZoom: loading || isError,
    maxScale: 20,
    onMaskClick: onClose,
  })
  const update = useUpdate()
  const handleOnLoad = useCallback(() => {
    setLoading(false)
    reset(true)
    update()
  }, [update, reset])

  const handleError = useCallback(() => {
    setIsError(true)
    setLoading(false)
    setUrl(ErrorImage)
  }, [update])

  const handleErrorClick = useCallback(() => {
    if (!isError) return
    setIsError(false)
    setLoading(true)
    setUrl(data.url)
    setVisible(false)
  }, [isError])

  useEffect(() => {
    if (visible) return
    setTimeout(() => {
      setVisible(true)
    }, 0)
  }, [visible])

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full w-full touch-none select-none overscroll-contain ${loading || isError ? 'flex items-center justify-center' : ''}`}
    >
      <img
        ref={imageRef}
        // 重新换掉新元素, 使得图片重新加载
        key={url}
        style={{ transform: loading || isError ? '' : transform, opacity: visible ? 1 : 0 }}
        className={`max-h-[90%] max-w-[90%] origin-top-left object-contain ${isError ? 'w-[180px] cursor-pointer' : 'h-auto w-auto'}`}
        src={url}
        onLoad={handleOnLoad}
        onError={handleError}
        onClick={handleErrorClick}
        draggable={false}
      />
    </div>
  )
}
