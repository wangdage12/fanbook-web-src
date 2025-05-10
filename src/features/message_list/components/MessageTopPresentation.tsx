import { useContext } from 'react'
import { useAppSelector } from '../../../app/hooks'
import { store } from '../../../app/store'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { ChannelContext } from '../../home/GuildWrapper'
import { topMessageActions, topMessageSelectors } from '../../top_message/TopMessageSlice'
import { PlainTextMessage } from '../items/TextMessage'

export default function MessageTopPresentation({ onClick }: { onClick: (id: string) => void }) {
  const channelId = useContext(ChannelContext)?.channel_id
  const topMessage = useAppSelector(topMessageSelectors.topMessage(channelId ?? ''))
  function handleClose() {
    channelId && store.dispatch(topMessageActions.hideTopMessage(channelId))
  }

  if (!channelId || !topMessage || topMessage.hide) return
  return (
    <div
      className={'flex h-[52px] w-full cursor-pointer gap-2 px-[12px] py-2.5'}
      onClick={() => onClick(topMessage.message_id.toString())}
      style={{
        backgroundColor: 'rgba(242, 170, 25, 0.1)',
        backgroundImage: 'linear-gradient(#FFFFFF, #FFFFFF)',
        backgroundBlendMode: 'multiply',
      }}
    >
      <div className={'h-[30px] w-0.5 bg-[#CF9735]'} />
      <div className={'flex flex-1 flex-col overflow-hidden text-xs'}>
        <span className={'font-medium text-[#CF9735]'}>
          <RealtimeNickname userId={topMessage.top_user_id} />
          <span>&nbsp;置顶了</span>
        </span>
        <PlainTextMessage
          key={topMessage.message_id.toString()}
          colorful={false}
          message={topMessage}
          className={'truncate text-ellipsis text-[#603F14]'}
        />
      </div>
      {/* 关闭按钮 */}
      <iconpark-icon class={'w-[18px] cursor-pointer'} size={14} color={'var(--fg-b40)'} name="Close" onClick={handleClose}></iconpark-icon>
    </div>
  )
}
