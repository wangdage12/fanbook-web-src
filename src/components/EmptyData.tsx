import { HTMLAttributes } from 'react'
import NoChannelDataImage from '../assets/images/no-channel-data.svg'
import NoMemberDataImage from '../assets/images/no-member-data.svg'
import NoMessageDataImage from '../assets/images/no-message-data.svg'
import NoSearchDataImage from '../assets/images/no-search-data.svg'

const icons = {
  member: NoMemberDataImage,
  message: NoMessageDataImage,
  search: NoSearchDataImage,
  channel: NoChannelDataImage,
}
interface EmptyDataProps {
  type?: 'member' | 'message' | 'search' | 'channel'
  message?: string
}

export default function EmptyData({ type = 'member', message = '暂无数据', className = '', ...restProps }: EmptyDataProps & HTMLAttributes<never>) {
  const imageSrc = icons[type] ?? NoMemberDataImage
  return (
    <div {...restProps} className={`flex h-full w-full flex-col items-center justify-center ${className}`}>
      <img src={imageSrc} className="h-[44px] w-[44px]" />
      <div className="mt-[8px] text-[12px] text-[var(--fg-b60)]">{message}</div>
    </div>
  )
}
