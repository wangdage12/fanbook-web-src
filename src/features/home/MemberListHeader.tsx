import * as React from 'react'

export default function MemberListHeader({ title, onClose }: { title: React.ReactNode; onClose: () => void }) {
  return (
    <div className={'flex h-[36px] items-center p-[12px_16px_4px_16px]'}>
      <div className={'flex-1 text-sm font-medium  text-[var(--fg-b100)]'}>{title}</div>
      <div
        onClick={onClose}
        className={'flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-[4px] hover:bg-[var(--fg-b10)]'}
        style={{ transition: 'color 0.2s,background-color 0.2s' }}
      >
        <iconpark-icon name="Close" fill="var(--fg-b100)" size={14}></iconpark-icon>
      </div>
    </div>
  )
}
