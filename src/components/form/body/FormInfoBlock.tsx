import clsx from 'clsx'
import { HTMLProps, ReactNode } from 'react'

export default function FormInfoBlock({ content, className, ...props }: { content: ReactNode } & Omit<HTMLProps<HTMLDivElement>, 'content'>) {
  return (
    <div {...props} className={clsx(['mb-4 flex items-start gap-2 rounded-[10px] bg-[var(--fg-b5)] p-3', className])}>
      <iconpark-icon name="ExclamationCircle" class={'py-[1px] text-[var(--fg-blue-1)] mt-[2px]'} size={14} />
      <div className={'text-[12px] leading-[20px] text-[var(--fg-b100)]'}>{content}</div>
    </div>
  )
}
