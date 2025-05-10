import { MouseEventHandler } from 'react'

export default function LoginReturnButton({ onClick }: { onClick: MouseEventHandler }) {
  return (
    <div className={'inline-flex cursor-pointer'} onClick={onClick}>
      <iconpark-icon name="Left" class={''} size={16}></iconpark-icon>
      返回
    </div>
  )
}
