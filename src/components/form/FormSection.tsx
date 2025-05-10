import clsx from 'clsx'
import { ReactNode } from 'react'

interface FormSectionProps {
  title?: string
  children?: ReactNode
  bottomDivider?: boolean
  tailSlot?: ReactNode
  className?: string
  formStyle?: 'border'
  // 与 Form.Item 的 hidden 属性作用一致
  hidden?: boolean
}

export default function FormSection({ title, children, bottomDivider, tailSlot, className, formStyle, hidden }: FormSectionProps) {
  return (
    <div
      className={clsx(['form-section', bottomDivider && 'border-b-[0.5px]', className])}
      style={{
        display: hidden ? 'none' : 'block',
      }}
    >
      <div className={clsx(['flex items-center gap-2'])}>
        {title && <div className={'flex-1 py-2 text-sm font-medium text-[var(--fg-b100)]'}>{title}</div>}
        {tailSlot}
      </div>
      <div className={clsx([formStyle === 'border' && 'rounded-xl border px-3'])}>{children}</div>
    </div>
  )
}
