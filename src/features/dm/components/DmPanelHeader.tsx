import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { ReactNode, useContext, useMemo } from 'react'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { ChannelContext } from '../../home/GuildWrapper'
import { DmChannelStruct } from '../dmSlice'
import InteractiveMsgHeader from './InteractiveMsgHeader'

export default function DmPanelHeader() {
  const channel = useContext(ChannelContext) as DmChannelStruct | undefined

  if (!channel || !channel.recipient_id) return

  const title: ReactNode = useMemo(() => {
    switch (channel.type) {
      case ChannelType.GuildNotice:
        return '社区通知'
      case ChannelType.CircleNews:
        return <InteractiveMsgHeader />
      default:
        return channel.recipient_id ? <RealtimeNickname userId={channel.recipient_id} /> : ''
    }
  }, [channel])

  return (
    <div
      className={'flex h-14 flex-shrink-0 items-center border-b-[0.5px] border-b-[var(--fg-b10)] px-4 text-base font-medium text-[var(--fg-b100)]'}
    >
      {title}
    </div>
  )
}
