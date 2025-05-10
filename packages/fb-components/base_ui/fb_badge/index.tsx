import { Badge, BadgeProps } from 'antd'
import clsx from 'clsx'
import styled, { css } from 'styled-components'
import './index.css'

export interface FbBadgeProps extends Omit<BadgeProps, 'size' | 'type'> {
  [x: string]: unknown
  fbSize?: 'small' | 'large'
  fbColor?: 'red' | 'blue' | 'gray' | 'transparent'
  borderColor?: string
  className?: string
}

const MyBadge = styled(Badge)<{ $borderColor?: string }>`
  .ant-badge-count-sm {
    line-height: 20px;
    font-size: 11px;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    padding: 0 4px;
    ${props =>
      props.$borderColor &&
      css`
        box-shadow: 0 0 0 2px ${props.$borderColor};
        line-height: 16px;
      `}
  }
  .ant-badge-dot {
    min-width: 8px;
    height: 8px;
  }
`
// antd 的 badge 有些动画 bug。如果还有修改，直接不使用 antd 的组件，直到彻底去掉 antd 的 badge
const FbBadge = ({ children, borderColor, fbSize = 'small', fbType = '', fbColor = 'red', count = ' ', showZero = true, ...props }: FbBadgeProps) => {
  if (props.dot) {
    return (
      <div
        className={clsx(['border-[bg-[var(--bg-1)] box-content h-2 w-2 rounded-full border-2 bg-[var(--auxiliary-red)]', props.className])}
        style={{
          transform: `scale(${count ? 1 : 0})`,
          transition: 'transform 0.3s',
        }}
      />
    )
  }
  return (
    <MyBadge $borderColor={borderColor} className={`fb-badge ${fbSize} ${fbType} ${fbColor}`} count={count} showZero={showZero} {...props}>
      {children}
    </MyBadge>
  )
}

export default FbBadge
