import clsx from 'clsx'
import { ReactNode } from 'react'

interface FormItemProps {
  label?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  children?: ReactNode
  content?: ReactNode
  bottomDivider?: boolean
  onClick?: () => void
}
export default function FormItem({ prefix, label, content, bottomDivider, children, suffix, onClick }: FormItemProps) {
  const item = (
    <div className={clsx(['flex', bottomDivider && 'border-b-[0.5px]'])} onClick={onClick}>
      {prefix}
      <div className={'flex-1'}>{children ?? content}</div>
      {suffix}
    </div>
  )
  return label ?
      <div className={'last:0 mb-6 flex flex-col'}>
        <span className={'my-[8px] flex-1 text-sm font-bold text-[var(--fg-b100)]'}>{label}</span>
        {item}
      </div>
    : item
}
