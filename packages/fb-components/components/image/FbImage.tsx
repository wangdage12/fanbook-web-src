import { animated, useSpringValue } from '@react-spring/web'
import { useInViewport } from 'ahooks'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import ErrorImage from '../../assets/images/error-image.svg'
import ImageUtils from '../../utils/ImageUtils'

export interface FbImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onLoad' | 'onError'> {
  fallback?: React.ReactNode
  placeholder?: React.ReactNode
  // 如果为 true，图片加载完成后有个模糊渐入特效
  // 如果未来的效果超出一个，需要考虑封装为策略，不能增加输入参数
  blurFadeIn?: boolean
  onLoad?: () => void
  onError?: () => void
}

/**
 * 修改此组件时请注意不要复杂化此组件的能力，标准为：**不增加输入参数，不增加输出差异**。
 * `FbImage` 的加载过程会展示纯色背景图，不会有渐进式加载过程。
 */
export default function FbImage({
  src = '',
  width = '100%',
  height = '100%',
  className,
  style,
  fallback = <img src={ErrorImage} className={'h-[55%] w-[55%] !object-contain'} alt={'error'} />,
  draggable = false,
  placeholder,
  blurFadeIn = false,
  onClick,
  onLoad,
  onError,
}: FbImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const backdropBlur = useSpringValue<undefined | number>(undefined, {
    config: {
      duration: 400,
    },
  })

  const imageLoaderStarted = useRef(false)
  const [visible] = useInViewport(ref, { threshold: 0 })

  useEffect(() => {
    imageLoaderStarted.current = false
  }, [src])

  useEffect(() => {
    // 避免重复加载
    if (imageLoaderStarted.current) return
    // 如果图片位于不可见区域，不会加载
    if (!visible) return
    if (!ref.current) return

    imageLoaderStarted.current = true
    ImageUtils.fetchImage(src, 3)
      .then(({ src }) => {
        if (ref.current) {
          ref.current.style.backgroundImage = `url(${src})`
          if (blurFadeIn) {
            backdropBlur.set(42)
            backdropBlur.start(0).then(() => {})
          }
          onLoad?.()
        }
      })
      .catch(() => {
        setHasError(true)
        onError?.()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [src, ref.current, visible, imageLoaderStarted.current])

  if (hasError || !src) {
    return (
      <div style={{ width, height, ...style }} className={clsx([className, 'items-center justify-center !flex'])}>
        {fallback}
      </div>
    )
  }

  return (
    <span
      onClick={onClick}
      style={{ width, height, ...style }}
      ref={ref}
      draggable={draggable}
      className={clsx(['block overflow-hidden bg-cover bg-center bg-no-repeat', className])}
    >
      {/* 模糊效果在没有自定义 placeholder 时显示，这里只能有一个 child */}
      {!placeholder && (
        <animated.span
          style={{
            backdropFilter: blurFadeIn && !loading ? backdropBlur.to(v => `blur(${v}px)`) : undefined,
          }}
          className={clsx(['block h-full w-full', loading && 'animate-pulse bg-[var(--bg-bg-2)]'])}
        />
      )}
      {loading && <div className={'flex items-center justify-center h-full w-full'}>{placeholder}</div>}
    </span>
  )
}
