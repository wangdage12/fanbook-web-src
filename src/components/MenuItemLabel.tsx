import { Tooltip, TooltipProps } from 'antd'

function MenuItemLabel({
  label,
  icon,
  type = 'normal',
  oppositeLabel,
  oppositeIcon,
  trailing,
  opposite = false,
  tooltip,
}: {
  label: React.ReactNode
  icon?: React.ReactNode
  oppositeLabel?: React.ReactNode
  oppositeIcon?: React.ReactNode
  trailing?: React.ReactNode
  opposite?: boolean
  type?: 'normal' | 'danger' | 'primary'
  tooltip?: string | TooltipProps
}) {
  const _tooltip = typeof tooltip === 'string' ? { title: tooltip } : tooltip
  const content = (
    <div
      className={`inline-flex w-full items-center gap-[8px] ${type === 'danger' ? 'text-[var(--function-red-1)]' : ''} ${
        type === 'primary' ? 'text-[var(--fg-blue-1)]' : ''
      }`}
    >
      {opposite ? oppositeIcon ?? icon : icon}
      <span>{opposite ? oppositeLabel ?? label : label}</span>
      <div className={'flex-1'}></div>
      {trailing}
    </div>
  )
  return _tooltip ? <Tooltip {..._tooltip}>{content}</Tooltip> : content
}

export default MenuItemLabel
