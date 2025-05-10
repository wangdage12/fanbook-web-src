import clsx, { ClassValue } from 'clsx'
import { isEqual } from 'lodash-es'
import { memo, useMemo } from 'react'
import CosImageUtils from '../../utils/CosImageUtils'
import { checkIsLocalURL, safeDivision } from '../../utils/common'
import ExpandableBox from '../ExpandableBox'
import { LimitSize, Size } from '../type'
import { fullLimitSize } from '../utils'
import FbImage, { FbImageProps } from './FbImage'

// 最大图片宽高
export const MAX_IMAGE_SIZE = { width: 708, height: 320 }
// 最小图片宽高
const MIN_IMAGE_SIZE = 64

// 长图最大宽度
const LONG_IMAGE_WIDTH = 170

export interface ChatImageProps extends FbImageProps {
  limitSize?: LimitSize
  originSize?: Size
  objectPosition?: 'top' | 'center' | 'bottom'
  hiddenLongImageTag?: boolean
}

/**
 * ChatImage 适用于聊天窗口的图片展示，支持本地和网络图片，以及长图的显示
 * 并且加载期间对图片空间进行占位，确保整个过程，DOM 的外观不变。
 * @param props
 * @constructor
 */
const ChatImage = memo(
  ({
    src,
    style,
    className = '',
    originSize,
    hiddenLongImageTag = false,
    limitSize = { max: MAX_IMAGE_SIZE, min: MIN_IMAGE_SIZE },
    ...props
  }: ChatImageProps) => {
    const isLocal = checkIsLocalURL(src)
    const { width, height, ratio, isLongImage } = useMemo(() => {
      let isLongImage = false

      const {
        max: { width: maxWidth, height: maxHeight },
        min: { width: minWidth, height: minHeight },
      } = fullLimitSize(limitSize, MIN_IMAGE_SIZE, MAX_IMAGE_SIZE)

      let width = maxWidth
      let height = maxHeight
      let ratio = 1

      // 原图尺寸存在
      if (originSize) {
        ratio = safeDivision(originSize.width, originSize.height)
        // 宽高比<1:2.5 && 高度>320
        isLongImage = ratio < 0.4 && originSize.height > 320
        // 是否长图
        if (isLongImage) {
          width = Math.min(LONG_IMAGE_WIDTH, originSize.width)
          ratio = safeDivision(LONG_IMAGE_WIDTH, maxHeight)
          height = safeDivision(width, ratio)
        } else {
          // 在最大尺寸限制范围内
          if (originSize.width <= maxWidth && originSize.height <= maxHeight) {
            width = originSize.width
            height = originSize.height
          } else {
            const originRatio = safeDivision(width, height)
            // 以 contain 模式进行缩放，把 originSize 缩放到 width * height 的矩形内
            if (ratio > originRatio) {
              height = safeDivision(width, ratio)
              ratio = safeDivision(width, height)
            }
            if (ratio < originRatio) {
              width = height * ratio
              ratio = safeDivision(width, height)
            }
          }
        }
      }

      // 假如宽度或高度过小
      if (width < minWidth) {
        width = minWidth
        height = safeDivision(minWidth, ratio)
      }

      if (height < minHeight) {
        height = minHeight
        width = minHeight * ratio
      }

      return { width, height, ratio, isLongImage }
    }, [limitSize, originSize])

    const baseClassName = ['object-cover'] as ClassValue[]
    style = { ...style, aspectRatio: ratio }
    let displaySrc = src
    if (!isLocal && src) {
      if (isLongImage && originSize) {
        displaySrc = CosImageUtils.cut(src, originSize.width, safeDivision(originSize.width, ratio), 0, 0)
      } else {
        displaySrc = CosImageUtils.thumbnailMin(src, width, height)
      }
    }

    // base64的长图没经过裁剪，需要设置向顶对齐
    baseClassName.push({ 'object-top': (isLongImage && isLocal) || props.objectPosition === 'top' })
    const img = (
      <FbImage
        blurFadeIn={true}
        src={displaySrc}
        className={`${clsx(baseClassName)} ${className}`}
        width={width}
        height={height}
        style={style}
        {...props}
      />
    )

    const LongImgWrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <ExpandableBox width={width} height={height} className={'flex items-center justify-center'}>
          {children}
          <span
            className={
              'pointer-events-none absolute bottom-0 right-0 rounded-br-[8px] bg-[rgba(15,17,20,.5)] px-[5px] py-[2px] text-[12px] text-xs text-[var(--fg-white-1)]'
            }
          >
            长图
          </span>
        </ExpandableBox>
      )
    }
    return isLongImage && !hiddenLongImageTag ? <LongImgWrapper>{img}</LongImgWrapper> : img
  },
  (prev, next) => prev.src == next.src && isEqual(prev.limitSize, next.limitSize) && isEqual(prev.originSize, next.originSize)
)
ChatImage.displayName = 'ChatImage'

export default ChatImage
