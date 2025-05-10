import clsx from 'clsx'
import { ReactNode } from 'react'

interface FormBodyCommonProps {
  title: ReactNode
  desc?: string
  suffix?: React.ReactNode
  // 控制是否显示右侧箭头，如果传入了会被作为点击事件的回调
  arrowCallback?: () => void
  onClick?: () => void
  bottomBorder?: boolean
  // 与 Form.Item 的 hidden 属性作用一致
  hidden?: boolean
}

export default function FormBodyCommon({ title, desc, suffix, arrowCallback, onClick, bottomBorder, hidden }: FormBodyCommonProps) {
  return (
    <div
      className={clsx(['flex flex-col gap-1 py-2.5', onClick && 'cursor-pointer', bottomBorder && 'border-b-[0.5px]'])}
      onClick={onClick}
      style={{
        display: hidden ? 'none' : 'block',
      }}
    >
      <div className={'flex items-center gap-2'}>
        <div className={'flex-1 text-sm text-[var(--fg-b100)]'}>{title}</div>
        <div className={clsx(['inline-flex text-[var(--fg-b60)]', arrowCallback && 'cursor-pointer'])} onClick={arrowCallback}>
          {suffix}
          {arrowCallback && <iconpark-icon name="Right" color={'var(--fg-b40)'} class={'ml-1'} />}
        </div>
      </div>
      {desc && <div className={'text-xs pt-1 text-[var(--fg-b40)]'}>{desc}</div>}
    </div>
  )
}
