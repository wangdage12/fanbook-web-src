import clsx from 'clsx'
import { CSSProperties, useState } from 'react'
import Slider, { CustomArrowProps, Settings } from 'react-slick'
import FbImage from '../components/image/FbImage'
import { MediaPreviewItem, useMediaPreviewer } from '../components/previewer/MediaPreviewer'
import { EmbeddedAssetType } from '../rich_text/types'

interface CircleImageSliderProps {
  rootClassName?: string
  images: string[]
  imageStyle?: CSSProperties
  width?: number
  height?: number
}

export default function CircleImageSlider({ rootClassName = '', images, imageStyle, width, height }: CircleImageSliderProps) {
  const mediaPreviewer = useMediaPreviewer()
  const [dragging, setDragging] = useState(false)
  const settings: Settings = {
    dots: true,
    infinite: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: () => setDragging(true),
    afterChange: () => setDragging(false),
  }

  return (
    <Slider className={clsx([rootClassName, 'group'])} {...settings}>
      {images.map((e, i) => (
        <div key={i} className={'!block'}>
          <FbImage
            src={e}
            style={imageStyle}
            className={'cursor-zoom-in'}
            width={width}
            height={height}
            onClick={() => {
              if (dragging) return
              mediaPreviewer?.open({
                initialIndex: i,
                medias: (images ?? []).map(
                  e =>
                    ({
                      type: EmbeddedAssetType.Image,
                      url: e,
                    }) as MediaPreviewItem
                ),
              })
            }}
          />
        </div>
      ))}
    </Slider>
  )
}

const baseBtnClass =
  'flex-center absolute top-1/2 z-10 h-[48px] w-[48px] -translate-y-1/2 cursor-pointer rounded-full bg-[var(--fg-widget)] opacity-0 group-hover:opacity-100 transition-all duration-300'

function PrevArrow({ onClick, currentSlide }: CustomArrowProps) {
  if (currentSlide === 0) return null
  return (
    <div className={clsx([baseBtnClass, 'left-0 group-hover:left-[24px]'])} onClick={onClick}>
      <iconpark-icon name="Left" color={'var(--fg-white-1)'} size={24}></iconpark-icon>
    </div>
  )
}

function NextArrow({ onClick, currentSlide, slideCount }: CustomArrowProps) {
  if (!slideCount || currentSlide === slideCount - 1) return null
  return (
    <div className={clsx([baseBtnClass, 'right-0 group-hover:right-[24px]'])} onClick={onClick}>
      <iconpark-icon name="Right" color={'var(--fg-white-1)'} size={24}></iconpark-icon>
    </div>
  )
}
