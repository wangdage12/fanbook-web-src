import clsx from 'clsx'
import FbBadge from 'fb-components/base_ui/fb_badge/index'
import EmojiIcon from 'fb-components/components/EmojiIcon.tsx'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import FbPlainText from 'fb-components/rich_text/FbPlainText.tsx'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils.ts'
import { isEmpty, isEqual, isNil } from 'lodash-es'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Virtuoso } from 'react-virtuoso'
import { useAppSelector } from '../../app/hooks'
import EmptyData from '../../components/EmptyData.tsx'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { selectUsers } from '../../components/realtime_components/realtime_nickname/userSlice'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import { latestMessageSelectors } from '../latest_message/latestMessageSlice'
import { settingSelectors } from '../local_user/localUserSlice'
import MessageService from '../message_list/MessageService.ts'
import MessageUtils from '../message_list/MessageUtils.ts'
import { unreadSelectors } from '../message_list/unreadSlice'
import { remarkSelectors } from '../remark/remarkSlice'
import { DMChannelStatus, DmChannelStruct, dmSelectors } from './dmSlice'
import { checkMatch } from './utils.ts'

function Item({ channel, selected }: { channel: DmChannelStruct; selected: string | undefined }) {
  const lastMessage = useAppSelector(latestMessageSelectors.byChannelId(channel.channel_id), isEqual)
  const { desc, reactions, timestamp } = { desc: '', reactions: {}, ...lastMessage }

  const navigate = useNavigate()

  function handleDmClick() {
    if (channel.type === ChannelType.ActivityCalendar) {
      showUnsupportedFeatureToast()
    } else {
      navigate(channel.channel_id)
    }
  }

  function defaultDesc() {
    const latestMsg = MessageService.instance.getLatestMessage(channel.channel_id)
    if (!latestMsg) return ''
    return MessageUtils.toText(latestMsg)
  }

  return (
    <div
      key={channel.channel_id}
      onClick={handleDmClick}
      className={clsx([
        'flex h-[60px] cursor-pointer gap-2.5 rounded-lg px-2 py-2.5 hover:bg-[var(--fg-b5)]',
        selected === channel.channel_id ? 'bg-[var(--fg-b5)]' : 'bg-transparent',
      ])}
    >
      <DmItemIcon key={channel.channel_id} channel={channel} />
      {/* 名称 + 描述 列*/}
      <div className={'flex flex-grow flex-col justify-between overflow-hidden'}>
        {/* 名称行 */}
        <div className={'flex items-center gap-2'}>
          <div className={'flex-grow truncate text-sm text-[var(--fg-b100)]'}>
            <DmItemTitle channel={channel} />
          </div>
          {timestamp && (
            <div className={'flex-shrink-0 text-xs text-[var(--fg-b30)]'}>{DateTimeUtils.format(timestamp, { showTimeBeyondOneDay: false })}</div>
          )}
        </div>
        {/* 消息描述行 */}
        <LastMessageDesc desc={desc || defaultDesc()} reactions={reactions} channelId={channel.channel_id} top={!!channel.stick_sort} />
      </div>
    </div>
  )
}

export interface DMListProps {
  keyword?: string
}

export default function DmList({ keyword }: DMListProps) {
  const channels = useAppSelector(dmSelectors.sortedChannels, isEqual)
  const isDMFetching = useAppSelector(dmSelectors.isDMFetching)
  const { dmChannelId } = useParams()
  const recipientIds = useMemo(() => {
    return [...channels].map(channels => channels.recipient_id).filter(id => !isNil(id)) as string[]
  }, [channels])
  const recipients = useAppSelector(selectUsers(recipientIds), isEqual)
  const recipientRemarks = useAppSelector(remarkSelectors.remarkList, isEqual)
  const notSearch = isEmpty(keyword?.trim())

  const filterChannels = useMemo(() => {
    return channels.filter(channel => {
      if (channel.status === DMChannelStatus.Inactive) {
        return false
      }
      if (notSearch) {
        return true
      }
      if ([ChannelType.CircleNews, ChannelType.GuildNotice, ChannelType.ActivityCalendar].includes(channel.type)) {
        return false
      }
      let name = ''
      if ([ChannelType.GroupDm, ChannelType.GroupChannel].includes(channel.type)) {
        name = channel.name ?? ''
      } else if (channel.recipient_id) {
        name = recipientRemarks[channel.recipient_id] || (recipients[channel.recipient_id]?.nickname ?? '')
      }
      return keyword ? checkMatch(name, keyword.trim()) : true
    })
  }, [channels, keyword, recipients, recipientRemarks])

  return (
    <div className={'flex flex-grow flex-col gap-0.5 overflow-y-auto px-2'}>
      <div className={'h-8 px-2 pt-3 text-[12px] text-[var(--fg-b40)]'}>消息</div>
      {filterChannels.length ?
        <Virtuoso
          className={'flex-grow'}
          fixedItemHeight={60}
          data={filterChannels}
          components={{
            ScrollSeekPlaceholder: LoadingItem,
          }}
          scrollSeekConfiguration={{
            enter: velocity => Math.abs(velocity) > 1000,
            exit: velocity => Math.abs(velocity) < 50,
          }}
          itemContent={(_, channel) => <Item key={channel.channel_id} channel={channel} selected={dmChannelId} />}
        />
      : !isDMFetching || !notSearch ?
        <div className="flex h-full w-full items-center justify-center">
          <EmptyData type={notSearch ? 'message' : 'search'} message={notSearch ? '暂无消息' : '暂无相关结果'} />
        </div>
      : isDMFetching && notSearch && <Loading />}
    </div>
  )
}

interface LastMessageDescProps {
  channelId: string
  desc: string
  reactions: Record<string, number>
  top: boolean
}

function LastMessageDesc({ reactions, channelId, desc, top }: LastMessageDescProps) {
  const showEllipsis = Object.keys(reactions).length > 3
  const displayReactions = Object.entries(reactions).slice(0, 3)

  const unread = useAppSelector(unreadSelectors.unreadNum(undefined, channelId))
  const muted = useAppSelector(settingSelectors.channelMute(channelId))

  return (
    <div className={'flex'}>
      {!!displayReactions.length && (
        <div className={'mr-1 flex flex-shrink-0 items-center gap-0.5'}>
          {displayReactions.map(([emoji, count]) => (
            <div key={emoji} className="flex h-5 items-center gap-0.5 rounded-md bg-[var(--fg-b5)] px-[5px]">
              <EmojiIcon size={12} name={emoji} />
              {count > 1 && <span className={'text-xs leading-4 text-[var(--fg-b60)]'}> {count}</span>}
            </div>
          ))}
          {showEllipsis && <span className={'leading-[20px] text-[var(--fg-b40)]'}>...</span>}
          <div className={'h-4 w-[1px] bg-[var(--fg-b10)]'} />
        </div>
      )}

      {/* 文字描述 */}
      <FbPlainText key={channelId} colorful={false} data={desc} className={'flex-grow truncate text-[12px] leading-[20px] text-[var(--fg-b60)]'} />

      <div className={'ml-2 flex items-center gap-1 text-[var(--fg-b20)]'}>
        {/* 免打扰图标 */}
        {muted && <iconpark-icon size={10} color={'currentColor'} name="BellMuted" />}

        {/* 置顶图标 */}
        {top && <iconpark-icon name="Top1" size={10} />}

        {/* 未读数 */}
        {muted ?
          <div className={'h-1.5 w-1.5 rounded bg-[var(--function-red-1)]'} />
        : <FbBadge showZero={false} size={'small'} fbColor={'red'} count={unread} />}
      </div>
    </div>
  )
}

function DmItemIcon({ channel }: { channel: DmChannelStruct }) {
  switch (channel.type) {
    case ChannelType.CircleNews:
      return <iconpark-icon class={'h-10 w-10 flex-shrink-0 rounded-full bg-[var(--fg-blue-1)] text-[white]'} name="Message2" size={20} />
    case ChannelType.GuildNotice:
      return (
        <iconpark-icon
          class={'h-10 w-10 flex-shrink-0 rounded-full bg-[var(--function-yellow-1)] text-[white]'}
          color={'white'}
          name="Notice"
          size={20}
        />
      )
    case ChannelType.ActivityCalendar:
      return <iconpark-icon class={'h-10 w-10 flex-shrink-0 rounded-full bg-[var(--auxiliary-green)] text-[white]'} name="Calendar" size={20} />
    case ChannelType.GroupChannel:
      return <CosImage className={'flex-shrink-0 rounded-full border border-[--fg-b5]'} src={channel.icon} size={40} />
    default:
      if (channel.recipient_id) {
        return <RealtimeAvatar className={'flex-shrink-0 rounded-full border border-[--fg-b5]'} userId={channel.recipient_id} size={40} />
      } else {
        return <div className={'h-10 w-10'} />
      }
  }
}

function DmItemTitle({ channel }: { channel: DmChannelStruct }) {
  switch (channel.type) {
    case ChannelType.CircleNews:
      return '互动消息'
    case ChannelType.GuildNotice:
      return '社区通知'
    case ChannelType.ActivityCalendar:
      return '活动通知'
    case ChannelType.GroupDm:
    case ChannelType.GroupChannel:
      return channel.name
    default:
      if (channel.recipient_id) {
        return <RealtimeNickname userId={channel.recipient_id} className="!inline" botTag />
      } else {
        return ''
      }
  }
}

function Loading() {
  return new Array(6).fill(0).map((_, i) => <LoadingItem key={i} />)
}

function LoadingItem() {
  return (
    <div className={'flex h-[60px] flex-shrink-0 items-center gap-2.5'}>
      <div className={'h-10 w-10 rounded-full bg-[var(--fg-b5)]'} />
      <div className={'flex h-10 flex-grow flex-col justify-between pb-[3px] pr-2 pt-0.5'}>
        <div className={'h-[14px] w-[100px] rounded-[3px] bg-[var(--fg-b5)]'} />
        <div className={'h-[14px] w-full rounded-[3px] bg-[var(--fg-b5)]'} />
      </div>
    </div>
  )
}
