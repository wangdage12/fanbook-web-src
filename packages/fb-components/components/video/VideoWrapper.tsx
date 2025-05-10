import { CSSProperties, ReactNode } from 'react'
import { safeDivision } from '../../utils/common'
import CircularLoading from '../CircularLoading'
import ExpandableBox from '../ExpandableBox'
import { LimitSize, Size } from '../type'
import { fullLimitSize } from '../utils'
import VideoBlockedMessage from './VideoBlockedMessage'
import { useCheckVideoStatus } from './utils'

// 最大图片宽高
const MAX_IMAGE_SIZE = { width: 708, height: 320 }
// 最小图片宽高
const MIN_IMAGE_SIZE = 64

const Wrapper = ({ width, height, children, mode }: { children: ReactNode; width?: number; height?: number; mode?: 'adaptive' | 'full' }) => {
  return mode === 'adaptive' ?
      <ExpandableBox width={width} height={height} className="flex justify-center items-center">
        {children}
      </ExpandableBox>
    : <div className="w-full h-full flex items-center justify-center">{children}</div>
}

export function VideoWrapper({
  originSize,
  url,
  limitSize,
  children,
  className = '',
  style,
  mode = 'adaptive',
}: {
  url?: string
  originSize: Size
  limitSize?: LimitSize
  /**
   * 显示模式根据内容自适应 (adaptive) 还是撑满父容器 (full)
   **/
  mode?: 'adaptive' | 'full'
  children?: ReactNode | ((size: Size) => ReactNode)
  className?: string
  style?: CSSProperties
}) {
  let {
    max: { width, height },
  } = fullLimitSize(limitSize ?? {}, MIN_IMAGE_SIZE, MAX_IMAGE_SIZE)

  const { isChecking, isPass } = useCheckVideoStatus(url)
  const ratio = safeDivision(originSize.width, originSize.height)
  if (originSize.width <= width && originSize.height <= height) {
    width = originSize.width
    height = originSize.height
  } else {
    // 以 contain 模式进行缩放，缩放到 width * height 的矩形内
    if (ratio > safeDivision(width, height)) {
      height = safeDivision(width, ratio)
    }
    if (ratio < safeDivision(width, height)) {
      width = height * ratio
    }
  }

  return (
    <div className={className} style={style}>
      {isChecking ?
        <Wrapper width={width} height={height} mode={mode}>
          <CircularLoading size={24} />
        </Wrapper>
      : isPass ?
        typeof children === 'function' ?
          children({ width, height })
        : children
      : <Wrapper width={width} height={height} mode={mode}>
          <VideoBlockedMessage className="h-full w-full" style={{ aspectRatio: ratio }} />
        </Wrapper>
      }
    </div>
  )
}
