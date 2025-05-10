import { useSize } from 'ahooks'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

interface ExpandAnimationProps {
  children: React.ReactNode
  condition: boolean
  axis?: 'x' | 'y'
  transitionDuration?: number
  clip?: boolean
}

/**
 * 用于展开动画的组件，例如从 0 开始出现，或者从展示收缩到 0，设置可以将 `condition` 设置为 `true` 实现尺寸变化动画
 * @param children
 * @param condition           此条件用户控制是否展开，如果为 `true`，则会展开，否则会收缩，如果始终为 `true`，尺寸变化时也会有动画
 * @param axis                动画方向，`x` 为水平方向，`y` 为垂直方向
 * @param transitionDuration  动画时长，单位为毫秒
 * @param clip                是否裁剪超出部分
 * @constructor
 */
export default function ExpandAnimation({ children, condition, axis = 'y', transitionDuration = 150, clip = true }: ExpandAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { width, height } = useSize(ref) ?? { width: 0, height: 0 }
  const [unmount, setUnmount] = useState(!condition)

  useEffect(() => {
    let timer: number
    if (condition) {
      setUnmount(false)
    } else {
      timer = window.setTimeout(() => {
        setUnmount(true)
      }, transitionDuration)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [condition])

  return (
    <div
      className={clsx(['flex-shrink-0', clip && 'overflow-hidden'])}
      style={{
        transitionProperty: axis === 'y' ? 'height' : 'width',
        transitionDuration: transitionDuration / 1000 + 's',
        transitionTimingFunction: 'ease',
        height:
          axis === 'y' ?
            condition ? height
            : 0
          : 'auto',
        width:
          axis === 'x' ?
            condition ? width
            : 0
          : 'auto',
      }}
    >
      <div ref={ref}>{!unmount && children}</div>
    </div>
  )
}
