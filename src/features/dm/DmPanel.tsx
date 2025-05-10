import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { isEqual } from 'lodash-es'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import EmptyPage from '../../components/EmptyPage'
import ChannelContainer from '../home/ChannelContainer'
import { ChannelContext } from '../home/GuildWrapper'
import MessageList from '../message_list/MessageList'
import GuildNoticeList from './GuildNoticeList'
import InteractiveMsgList from './InteractiveMsg/InteractiveMsgList'
import DmPanelHeader from './components/DmPanelHeader'
import { DMChannelStatus, DmChannelStruct, dmActions, dmSelectors } from './dmSlice'

function DMChannelContent({ channel }: { channel: DmChannelStruct }) {
  switch (channel.type) {
    case ChannelType.DirectMessage:
    case ChannelType.GroupChannel:
      return <MessageList channel={channel} key={channel.channel_id} />
    case ChannelType.GuildNotice:
      return <GuildNoticeList channel={channel} key={channel.channel_id} />
    case ChannelType.CircleNews:
      return <InteractiveMsgList channel={channel} key={channel.channel_id} />
    default:
      return null
  }
}

export default function DmPanel() {
  const { dmChannelId } = useParams()
  const channel = useAppSelector(dmSelectors.channel(dmChannelId ?? ''), isEqual)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (channel && channel.status === DMChannelStatus.Active) {
      dispatch(dmActions.lastChannelId(channel.channel_id))
    }
  }, [channel])
  // 隐藏的频道不显示
  if (!channel || channel.status === DMChannelStatus.Inactive) return <EmptyPage />

  return (
    <ChannelContext.Provider value={channel}>
      <ChannelContainer header={<DmPanelHeader />}>
        <DMChannelContent channel={channel} key={channel.channel_id} />
      </ChannelContainer>
    </ChannelContext.Provider>
  )
}
