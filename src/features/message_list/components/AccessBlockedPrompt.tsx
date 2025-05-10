import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import ChannelIcon from '../../../components/ChannelIcon'

export default function AccessBlockedPrompt({
  type = ChannelType.guildText,
  message = '你没有权限访问此频道，请联系管理员',
}: {
  type?: ChannelType
  message?: string
}) {
  return (
    <div className={'flex h-full flex-col items-center justify-center'}>
      <div className={'flex h-20 w-20 items-center justify-center rounded-full bg-[var(--fg-white-1)]'}>
        <ChannelIcon type={type} isPrivate size={40} color={'var(--fg-b100)'} />
      </div>
      <div className={'mt-[17px] text-sm text-[var(--fg-b60)]'}>{message}</div>
    </div>
  )
}
