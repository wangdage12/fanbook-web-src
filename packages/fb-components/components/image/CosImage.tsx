import { clamp } from 'lodash-es'
import CosImageUtils from '../../utils/CosImageUtils'
import { safeDivision } from '../../utils/common'
import { extractSize } from '../utils'
import FbImage, { FbImageProps } from './FbImage'

/**
 * @param size        如果类型是 number，则表示宽高相等，如果是 { width, height }，则表示宽高不等。这个尺寸表示图片显示的的尺寸
 * @param imageSize   在传入 `imageSize` 的情况下，如果图片的尺寸小于 `size`，则不会进行缩放，否则会以 contain 模式进行缩放
 */
interface CosImageProps extends Omit<FbImageProps, 'width' | 'height'> {
  size?: number | { width: number; height: number }
  imageSize?: { width: number; height: number }
  clampRatio?: { max?: number; min?: number }
}

/**
 * CosImage 会加载 COS 上的图片，并且加载期间对图片空间进行占位，确保整个过程，DOM 的外观不变。
 * @param props
 * @constructor
 */
const CosImage = (props: CosImageProps) => {
  const { size = 24, clampRatio, imageSize, className, style, src, blurFadeIn = false, ..._props } = props

  let { width, height } = extractSize(size)
  let ratio = safeDivision(width, height)
  let isLong = false
  if (imageSize) {
    ratio = safeDivision(imageSize.width, imageSize.height)
    if (clampRatio) {
      isLong = ratio < 1 / 2.5 && !!clampRatio
      const { max = ratio, min = ratio } = clampRatio
      ratio = clamp(ratio, min, max)
    }
    if (imageSize.width <= width && imageSize.height <= height) {
      width = imageSize.width
      height = imageSize.height
    } else {
      // 以 contain 模式进行缩放，把 imageSize 缩放到 width * height 的矩形内
      if (ratio > safeDivision(width, height)) {
        height = safeDivision(width, ratio)
      }
      if (ratio < safeDivision(width, height)) {
        width = height * ratio
      }
    }
  }

  return (
    <FbImage
      width={width}
      height={height}
      blurFadeIn={blurFadeIn}
      className={`block ${className ?? ''}`}
      src={
        src ?
          isLong ?
            CosImageUtils.cut(src, imageSize?.width ?? width, (imageSize?.width ?? width) / ratio, 0, 0)
          : CosImageUtils.thumbnailMin(src, width, height)
        : undefined
      }
      style={{
        ...style,
        backgroundPosition: isLong ? 'top' : 'center',
      }}
      {..._props}
    />
  )
}

export default CosImage
