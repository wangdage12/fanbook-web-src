import { isNil } from 'lodash-es'
import { ReactNode } from 'react'

function ExpandableBox({
  width,
  height,
  className = '',
  wrapperClassName = '',
  children,
  style,
}: {
  width?: number
  height?: number
  className?: string
  wrapperClassName?: string
  children: ReactNode
  style?: React.CSSProperties
}) {
  return !isNil(width) && !isNil(height) ?
      <div
        className={`${wrapperClassName} relative w-full flex-shrink flex-grow overflow-hidden`}
        style={{ ...style, aspectRatio: height != 0 ? width / height : 1, maxWidth: width, maxHeight: height }}
      >
        <div style={{ width, height }}></div>
        <div className={`${className} absolute bottom-0 left-0 right-0 top-0`}>{children}</div>
      </div>
    : children
}

export default ExpandableBox
