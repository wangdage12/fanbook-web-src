import { useHover } from 'ahooks'
import clsx from 'clsx'
import { isNil } from 'lodash-es'
import { HTMLAttributes, forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { Size } from './type'
import { extractSize } from './utils'

export interface HoverBoxProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  size?: number | Size
  radius?: number
  selected?: boolean
  disabled?: boolean
  disabledClassName?: string
}

/**
 * 为子组件加点 hover 背景态
 * @param radius    hover 背景圆角，默认为 4
 * @param children  子组件
 * @param color     hover 背景颜色，默认是 var(--fg-b5)
 * @param size     组件的大小
 * @param className
 * @param disabledClassName
 * @param props
 * @constructor
 */
const HoverBox = forwardRef<HTMLDivElement | null, HoverBoxProps>(
  (
    { radius = 4, children, className, disabledClassName = 'opacity-60', size, color = 'var(--fg-b5)', disabled, selected, onClick, style, ...props },
    ref
  ) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const isHover = useHover(targetRef)
    const backgroundColor = isHover || selected ? color : 'transparent'

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => targetRef.current, [targetRef.current])

    const { width, height } = useMemo(() => (!isNil(size) ? extractSize(size) : ({} as Partial<Size>)), [size])

    return (
      <div
        ref={targetRef}
        style={{
          borderRadius: radius,
          backgroundColor,
          width,
          height,
          ...style,
        }}
        className={clsx([
          'flex aspect-square items-center justify-center p-[4px]',
          disabled ? `cursor-not-allowed ${disabledClassName}` : 'cursor-pointer',
          className,
        ])}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)

HoverBox.displayName = 'HoverBox'

export default HoverBox
