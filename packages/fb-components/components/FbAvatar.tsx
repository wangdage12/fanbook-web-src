import { HTMLAttributes } from 'react'

interface Props {
  [x: string]: unknown

  fbSize?: number
  fbRadius?: number
  fbImageBorderWidth?: number
  fbShowBorder?: boolean
}

const FbAvatar = ({ fbSize = 48, fbRadius = 6, fbImageBorderWidth, fbShowBorder, src, className = '', ...props }: Props & HTMLAttributes<never>) => {
  return (
    <div
      className={`overflow-hidden border-[0.5px] border-[var(--fg-b10)] border-opacity-[0.1] ${className}`}
      {...props}
      style={{
        width: `${fbSize}px`,
        height: `${fbSize}px`,
        borderRadius: `${fbRadius}px`,
      }}
    >
      <div
        style={{
          width: `${fbSize}px`,
          height: `${fbSize}px`,
          background: `url(${src}) no-repeat center center / cover,var(--bg-bg-3) no-repeat center center / cover`,
        }}
      ></div>
    </div>
  )
}

export default FbAvatar
