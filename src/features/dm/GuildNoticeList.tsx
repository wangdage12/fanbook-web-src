import { Avatar } from 'antd'
import dayjs from 'dayjs'
import { GuildNoticeMessageContentStruct, MessageStruct, MessageType } from 'fb-components/components/messages/types.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils.ts'
import { useEffect, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { store } from '../../app/store'
import GuildAPI from '../guild_container/guildAPI.ts'
import GuildUtils from '../guild_list/GuildUtils'
import MessageService from '../message_list/MessageService'
import { useMessages } from '../message_list/hooks/useMessages'
import { UnreadHelper, unreadActions } from '../message_list/unreadSlice'
import { DmChannelStruct } from './dmSlice'

interface GuildNoticeListProps {
  channel: DmChannelStruct
}

export default function GuildNoticeList({ channel }: GuildNoticeListProps) {
  const messages = useMessages(channel.channel_id) as never as MessageStruct<GuildNoticeMessageContentStruct>[]
  const unreadStartId = useMemo(() => {
    return UnreadHelper.getLocalUnread(channel.channel_id).startId
  }, [])

  useEffect(() => {
    async function asyncFunc() {
      if (messages.length === 0) {
        await MessageService.instance.loadBefore(channel.channel_id).then()
      }
      store.dispatch(
        unreadActions.clearUnread({
          channelId: channel.channel_id,
        })
      )
    }
    asyncFunc().then()
  }, [])

  function handleAtBottomStateChange() {
    MessageService.instance.loadBefore(channel.channel_id).then()
  }

  return (
    <Virtuoso
      style={{
        width: '100%',
        height: '100%',
      }}
      defaultItemHeight={64}
      totalCount={messages.length}
      overscan={200}
      increaseViewportBy={200}
      atBottomStateChange={handleAtBottomStateChange}
      itemContent={index => {
        index = messages.length - 1 - index
        const { content, time, message_id } = messages[index]
        if (content.type !== MessageType.GuildNotice)
          return (
            <div className={'flex h-[64px] items-center justify-center gap-[6px] text-xs text-[var(--fg-b30)]'}>
              <div className={'h-[1px] w-[6px] bg-[var(--fg-b10)]'} />
              暂无更多通知
              <div className={'h-[1px] w-[6px] bg-[var(--fg-b10)]'} />
            </div>
          )

        const child = <Item guildId={content.guild_id} text={content.msg} time={time} />

        /// 历史通知 UI，如果第一条就是已读的就没必要显示了
        if (unreadStartId === message_id && index !== messages.length - 1) {
          return (
            <div className={'flex flex-col'}>
              {child}
              <div className={'flex h-[30px] items-center justify-center bg-[var(--fg-b5)] bg-opacity-[0.03] text-xs text-[var(--fg-b40)]'}>
                以下是历史通知
              </div>
            </div>
          )
        }
        return child
      }}
    />
  )
}

function handleClick(guild: GuildStruct | undefined) {
  if (!guild) return

  GuildUtils.selectGuild(guild.guild_id)
}

function Item({ guildId, text, time }: { guildId: string; text: string; time: dayjs.Dayjs }) {
  const [guild, setGuild] = useState<GuildStruct | undefined>(() => GuildUtils.getGuildById(guildId))

  useEffect(() => {
    if (!guild) {
      GuildAPI.getGuildInfo(guildId)
        .then(res => {
          setGuild(res)
        })
        .catch(() => {
          /* ignore */
        })
    }
  }, [guild])

  return (
    <div className={'flex h-[64px] cursor-pointer items-center gap-[10px] pl-[16px]'} onClick={() => handleClick(guild)}>
      <Avatar src={guild?.icon} shape={'square'} rootClassName={'h-10 w-10 !rounded-[10px] border-none'} />
      <div className={'flex flex-grow flex-col border-b border-b-[var(--fg-b10)] py-[12px] pr-[16px]'}>
        <div className={'flex'}>
          <div className={'mb-1 flex-grow leading-[20px] text-[var(--fg-b100)]'}>{guild?.name}</div>
          <div className={'text-xs text-[var(--fg-b30)]'}>{DateTimeUtils.format(time, { showTimeBeyondOneDay: false })}</div>
        </div>
        <div className={'text-xs text-[var(--fg-b40)]'}>{text}</div>
      </div>
    </div>
  )
}
