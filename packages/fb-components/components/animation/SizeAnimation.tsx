import { useSize } from 'ahooks'
import clsx from 'clsx'
import React, { HTMLProps, useRef } from 'react'

/**
 * 容器尺寸变化尺寸
 * @param children
 * @param className
 * @param animateAxis 默认情况下，宽高变化都会有动画
 * @param props
 * @constructor
 */
function SizeAnimation({
  children,
  className,
  animateAxis = 'xy',
  ...props
}: HTMLProps<never> & {
  animateAxis?: 'x' | 'y' | 'xy'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useSize(ref)
  const animateX = animateAxis.includes('x')
  const animateY = animateAxis.includes('y')
  return (
    <div
      style={{
        maxWidth: animateX ? size?.width : 'unset',
        maxHeight: animateY ? size?.height : 'unset',
      }}
      className={clsx([
        'overflow-hidden',
        animateX && 'transition-[max-width]',
        animateY && 'transition-[max-height]',
        animateX && animateY && 'transition-[max-width,max-height]',
        className,
      ])}
      {...props}
    >
      <div className={'w-fit h-fit'} ref={ref}>
        {children}
      </div>
    </div>
  )
}

export default React.memo(SizeAnimation)
