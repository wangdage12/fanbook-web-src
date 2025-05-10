import { last } from 'lodash-es'
import { RealtimeAvatar } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'

interface InChannelUnreadButtonProps {
  num: number
  mentions: { userId: string; messageId: bigint }[]
  gotoMessage: (messageId?: bigint) => void
}

export default function InChannelUnreadButton({ num, mentions, gotoMessage }: InChannelUnreadButtonProps) {
  let backgroundColor: string
  let color: string
  if (mentions?.length) {
    backgroundColor = 'var(--fg-blue-1)'
    color = 'var(--fg-white-1)'
  } else {
    backgroundColor = 'var(--fg-white-1)'
    color = 'var(--fg-blue-1)'
  }

  return (
    <div
      onClick={() => gotoMessage(last(mentions)?.messageId)}
      className={
        'flex h-[38px] cursor-pointer flex-row items-center justify-center gap-2 rounded-bl-full rounded-tl-full px-3 text-[14px] font-medium shadow-[0_4px_8px_0_rgba(26,32,51,0.08)]'
      }
      style={{
        backgroundColor,
        color,
      }}
    >
      <iconpark-icon size={16} color={color} name="DoubleUp" />
      {mentions?.length ?
        <>
          <RealtimeAvatar size={20} userId={last(mentions)?.userId ?? ''} />
          <span>有人@你</span>
        </>
      : <span>{num > 99 ? '99+' : num}条新消息</span>}
    </div>
  )
}
