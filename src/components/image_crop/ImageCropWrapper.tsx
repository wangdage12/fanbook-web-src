import { useSize } from 'ahooks'
import { Divider, Popover, Tooltip } from 'antd'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { isBoolean } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import ImageCropper from './ImageCropper'
import PreviewItem from './PreviewItem'
import { BaseCropInfo, ImageInfo } from './type'
import { getCroppedImgArr } from './utils'

enum AspectType {
  Original = 'Original',
  ThreeToFour = 'ThreeToFour',
  OneToOne = 'OneToOne',
  FourToThree = 'FourToThree',
}

const aspectItems = [
  { icon: 'Picture', text: '原图', key: AspectType.Original, value: 0 },
  { icon: 'TFTailor', text: '3 : 4', key: AspectType.ThreeToFour, value: 3 / 4 },
  { icon: 'OOTailor', text: '1 : 1', key: AspectType.OneToOne, value: 1 },
  { icon: 'FTTailor', text: '4 : 3', key: AspectType.FourToThree, value: 4 / 3 },
]

interface ImageCropWrapperProps {
  images: ImageInfo[]
  aspectControl?: boolean | number
  preview?: boolean
  onCropChange?: (image: ImageInfo[]) => void
  onIndexChange?: (index: number) => void
  index?: number
}

function ImageCropWrapper({ images, aspectControl = true, index, preview = false, onCropChange, onIndexChange }: ImageCropWrapperProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(index ?? 0)
  useEffect(() => {
    setCurrentImageIndex(index ?? 0)
  }, [index])

  const wrapRef = useRef<HTMLDivElement>(null)
  const wrapSize = useSize(wrapRef)
  const currentImage = useMemo(() => images[currentImageIndex], [images, currentImageIndex])

  const [previewImages, setPreviewImages] = useState<ImageInfo[]>([])

  const [previewLoading, setPreviewLoading] = useState(false)

  const nextSlide = () => {
    const index = (currentImageIndex + 1) % images.length
    setCurrentImageIndex(index)
    onIndexChange?.(index)
  }

  const prevSlide = () => {
    const index = (currentImageIndex - 1 + images.length) % images.length
    setCurrentImageIndex(index)
    onIndexChange?.(index)
  }

  const slideStyle = {
    transform: `translateX(-${(currentImageIndex * 100) / (images.length ?? 1)}%)`,
    width: `${images.length * 100}%`,
  }

  const handleCropChange = (cropInfo: BaseCropInfo, index: number) => {
    const tempImages = [...images]
    tempImages.splice(index, 1, { ...images[index], cropInfo: { ...images[index].cropInfo, ...cropInfo } })
    onCropChange?.(tempImages)
  }

  const handleZoomOutClick = () => {
    const { cropInfo } = currentImage
    if (!cropInfo) {
      return
    }
    const { zoom = 1 } = cropInfo
    if (zoom > 1) {
      handleCropChange({ zoom: Math.max(Math.round(zoom * 100 - 5) / 100, 1) }, currentImageIndex)
    }
  }

  const handleZoomInClick = () => {
    const { cropInfo } = currentImage
    if (!cropInfo) {
      return
    }
    const { zoom = 1 } = cropInfo
    if (zoom < 3) {
      handleCropChange({ zoom: Math.min(Math.round(zoom * 100 + 5) / 100, 3) }, currentImageIndex)
    }
  }

  const handleRotateClick = () => {
    const { cropInfo } = currentImage
    if (!cropInfo) {
      return
    }
    const { rotation = 0 } = cropInfo
    handleCropChange({ rotation: (rotation + 90) % 360 }, currentImageIndex)
  }

  const handleAspectClick = (aspect: number) => {
    const { cropInfo } = currentImage
    if (!cropInfo) {
      return
    }
    handleCropChange({ aspect }, currentImageIndex)
  }

  useEffect(() => {
    if (currentImageIndex > images.length) {
      setCurrentImageIndex(Math.max(images.length - 1, 0))
    }
  }, [images, currentImageIndex])

  useEffect(() => {
    if (preview) {
      setPreviewLoading(true)
      getCroppedImgArr(images)
        .then(res => {
          setPreviewImages(res)
        })
        .finally(() => {
          setPreviewLoading(false)
        })
    }
  }, [preview, images])

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      <div style={slideStyle} className="absolute left-0 top-0 flex h-full transition-transform ease-in-out">
        {preview ?
          previewLoading ?
            <div className="flex h-full w-full items-center justify-center">
              <CircularLoading size={24} />
            </div>
          : previewImages.map((image, index) => (
              <PreviewItem key={`${image.url}-${index}`} url={image.url} cropUrl={image.cropUrl} wrapSize={wrapSize} />
            ))

        : images.map((image, index) => {
            // 优化 仅处理一个图片 提高性能
            if (currentImageIndex !== index) {
              return <div key={index} className="h-full w-full"></div>
            }
            const { url, cropInfo } = image
            const _cropInfo = cropInfo ?? ({ aspect: 0, x: 0, y: 0, zoom: 1, rotation: 0 } as BaseCropInfo)
            // 传入的 boolean
            const isAspectControlBool = typeof aspectControl === 'boolean'
            const _aspect =
              (isAspectControlBool && !aspectControl) || (!isAspectControlBool && aspectControl >= 0) ?
                isAspectControlBool || aspectControl === 0 ?
                  0
                : aspectControl
              : _cropInfo.aspect
            _cropInfo.aspect = _aspect
            return (
              <ImageCropper
                key={`${url}-${index}`}
                url={url}
                wrapSize={wrapSize}
                cropInfo={_cropInfo}
                onChange={baseCropInfo => {
                  handleCropChange(baseCropInfo, index)
                }}
              />
            )
          })
        }
      </div>
      {currentImageIndex > 0 && (
        <div
          className="absolute left-[16px] top-[50%] mt-[-25px] flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full bg-[var(--fg-widget)]"
          onClick={prevSlide}
        >
          <iconpark-icon size={20} name="Left" class="text-[var(--fg-white-1)]"></iconpark-icon>
        </div>
      )}
      {currentImageIndex < images.length - 1 && (
        <div
          className="absolute right-[16px] top-[50%] mt-[-25px] flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full bg-[var(--fg-widget)]"
          onClick={nextSlide}
        >
          <iconpark-icon size={20} name="Right" class="text-[var(--fg-white-1)]"></iconpark-icon>
        </div>
      )}
      {currentImage && !preview && (
        <div className="pointer-events-none absolute bottom-[16px] left-0 right-0 flex justify-center">
          <div className="pointer-events-auto flex-center h-[36px] max-w-[194px] items-center gap-[8px] rounded-[10px] bg-[var(--fg-b95)] px-[8px] py-[8px] text-[var(--fg-white-1)]">
            <Tooltip placement={'top'} title="缩小图片" arrow={false}>
              <HoverBox
                color="var(--fg-b60)"
                disabledClassName="opacity-30"
                size={24}
                disabled={(currentImage?.cropInfo?.zoom ?? 1) === 1}
                onClick={handleZoomOutClick}
              >
                <iconpark-icon size={16} name="Zoomout"></iconpark-icon>
              </HoverBox>
            </Tooltip>
            <span className="flex w-[38px] cursor-default select-none">{Math.round((currentImage?.cropInfo?.zoom ?? 1) * 100)}%</span>
            <Tooltip placement={'top'} title="放大图片" arrow={false}>
              <HoverBox
                color="var(--fg-b60)"
                disabledClassName="opacity-30"
                size={24}
                disabled={(currentImage?.cropInfo?.zoom ?? 1) === 3}
                onClick={handleZoomInClick}
              >
                <iconpark-icon size={16} name="Zoomin"></iconpark-icon>
              </HoverBox>
            </Tooltip>
            <Divider type="vertical" className="m-0 !top-0 bg-fgWhite1/20"></Divider>
            <Tooltip placement={'top'} title="旋转图片" arrow={false}>
              <HoverBox size={24} color="var(--fg-b60)" onClick={handleRotateClick}>
                <iconpark-icon size={16} name="RotateLeft"></iconpark-icon>
              </HoverBox>
            </Tooltip>
            {isBoolean(aspectControl) && aspectControl && (
              <Popover
                arrow={false}
                align={{ offset: [8, -10] }}
                placement="topRight"
                overlayInnerStyle={{ background: 'var(--fg-b95)', color: 'var(--fg-white-1)', padding: 8 }}
                content={
                  <ul className="flex w-[106px] flex-col gap-[2px] text-[14px] text-[var(--fg-white-1)]">
                    {aspectItems.map(({ icon, text, key, value }) => (
                      <li
                        key={key}
                        className={`flex h-[36px] cursor-pointer items-center gap-[8px] rounded-[4px] px-[8px] hover:bg-[var(--fg-b60)] ${
                          value === (currentImage?.cropInfo?.aspect ?? 0) ? 'bg-[var(--fg-b60)]' : ''
                        }`}
                        onClick={() => handleAspectClick(value)}
                      >
                        <iconpark-icon size={20} name={icon}></iconpark-icon>
                        <span className="select-none">{text}</span>
                      </li>
                    ))}
                  </ul>
                }
              >
                <HoverBox size={24} color="var(--fg-b60)">
                  <iconpark-icon size={16} name="Tailor"></iconpark-icon>
                </HoverBox>
              </Popover>
            )}
          </div>
        </div>
      )}
      {preview && !previewLoading && (
        <nav className="pointer-events-none absolute bottom-[16px] left-0 right-0 flex justify-center">
          {Array.from({ length: previewImages.length }).map((_, index) => (
            <span
              key={index}
              className={`pointer-events-auto mx-[4px] h-[8px] w-[8px] cursor-pointer rounded-full ${
                index === currentImageIndex ? 'bg-[var(--fg-blue-1)]' : 'bg-[var(--fg-b30)]'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </nav>
      )}
    </div>
  )
}

export default ImageCropWrapper
