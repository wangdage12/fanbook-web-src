import { useHover, useThrottleEffect } from 'ahooks'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import React, { useMemo, useRef, useState } from 'react'
import Cropper, { Area, MediaSize, Point, Size } from 'react-easy-crop'
import { BaseCropInfo } from './type'

interface ImageCropperProps {
  url: string
  cropInfo?: BaseCropInfo
  wrapSize?: Size
  maxZoom?: number
  minZoom?: number
  zoomWithScroll?: boolean
  onChange?: (crop: BaseCropInfo) => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({ cropInfo, url, wrapSize, maxZoom = 3, minZoom = 1, zoomWithScroll = true, onChange }) => {
  const [innerCropInfo, setInnerCropInfo] = useState(cropInfo)
  const cropRef = useRef<Cropper>(null)
  const { aspect = 0, x = 0, y = 0, zoom = 1, rotation = 0 } = cropInfo ?? {}
  useThrottleEffect(
    () => {
      onChange?.({ ...cropInfo, ...innerCropInfo })
    },
    [innerCropInfo],
    {
      wait: 50,
    }
  )
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const [originalArea, setOriginalArea] = useState<Area | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const isHover = useHover(boxRef)

  const handleChange = (crop: BaseCropInfo) => {
    setInnerCropInfo({ ...cropInfo, originalArea, ...crop })
  }

  const handleCropChange = (point: Point) => {
    handleChange({ ...point })
  }
  const handleZoomChange = (zoom: number) => {
    handleChange({ zoom })
  }

  const onMediaLoaded = (mediaSize: MediaSize) => {
    const { naturalWidth, naturalHeight } = mediaSize
    const width = Math.max(1, naturalWidth)
    const height = Math.max(1, naturalHeight)
    setImageWidth(width)
    setImageHeight(height)
    setOriginalArea({ x: 0, y: 0, width, height })
    setIsLoaded(true)
    setTimeout(() => {
      cropRef.current?.computeSizes?.()
    }, 300)
  }

  const onCropComplete = async (croppedArea: Area, croppedAreaPixels: Area) => {
    handleChange({ croppedArea: croppedAreaPixels })
  }

  const needToSwap = [90, 270].includes(rotation)

  const tempAspect = useMemo(() => {
    if (!isLoaded) {
      return aspect !== 0 ? aspect : undefined
    }
    return (
      aspect !== 0 ? aspect
      : needToSwap ? imageHeight / imageWidth
      : imageWidth / imageHeight
    )
  }, [aspect, isLoaded, imageWidth, imageHeight, rotation])

  const objectFit = useMemo(() => {
    if (!wrapSize || !isLoaded) {
      return 'contain'
    }
    if (imageWidth >= wrapSize.width || imageHeight >= wrapSize.height) {
      return 'contain'
    } else {
      return imageWidth >= imageHeight ? 'horizontal-cover' : 'vertical-cover'
    }
  }, [isLoaded, wrapSize])

  return (
    <div ref={boxRef} className="relative h-full w-full">
      {!wrapSize || !isLoaded ?
        <div className="flex h-full w-full items-center justify-center">
          <CircularLoading size={24} />
        </div>
      : null}
      <Cropper
        ref={cropRef}
        classes={{ containerClassName: !wrapSize || !isLoaded ? 'opacity-0 h-full w-full' : 'h-full w-full' }}
        image={url}
        objectFit={objectFit}
        crop={{ x, y }}
        zoom={zoom}
        maxZoom={maxZoom}
        minZoom={minZoom}
        zoomWithScroll={zoomWithScroll}
        rotation={rotation}
        aspect={tempAspect}
        showGrid={isHover}
        onCropChange={handleCropChange}
        onZoomChange={handleZoomChange}
        onCropComplete={onCropComplete}
        onMediaLoaded={onMediaLoaded}
      />
    </div>
  )
}

export default ImageCropper
