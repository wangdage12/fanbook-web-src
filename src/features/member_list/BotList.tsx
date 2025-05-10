import { keyBy } from 'lodash-es'
import { useContext, useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { GlobalEvent, globalEmitter } from '../../base_services/event.ts'
import EmptyData from '../../components/EmptyData'
import BotAPI from '../bot/BotAPI.ts'
import GuildAPI from '../guild_container/guildAPI.ts'
import { ChannelContainerContext, ChannelContainerContextData, SidebarMenu } from '../home/ChannelContainer'
import { ChannelContext } from '../home/GuildWrapper'
import { MemberListLoadingItem } from '../home/MemberList.tsx'
import MemberListHeader from '../home/MemberListHeader'
import MemberItem from './MemberItem'
import { MemberUserStruct } from './MemberStruct'

export default function BotList() {
  const channel = useContext(ChannelContext)
  const [list, setList] = useState<MemberUserStruct[] | null>(null)
  const contextValue = useContext<ChannelContainerContextData | undefined>(ChannelContainerContext)

  const onBotRemoved = ({ botId, guildId, channelId }: { botId: string; guildId: string; channelId?: string }) => {
    {
      // 注意 `channelId === undefined` 时，表示所有频道都移除机器人
      if (guildId !== channel?.guild_id || (channelId && channelId !== channel?.channel_id) || !list) return
      const index = list.findIndex(e => e.user_id === botId)
      if (index === -1) return
      list.splice(index, 1)
      setList([...list])
    }
  }

  useEffect(() => {
    if (!channel) return
    if (!list) {
      Promise.all([GuildAPI.getGuildBots(channel.guild_id!), BotAPI.getChannelBotScope(channel.guild_id!, { channel_id: channel.channel_id })]).then(
        ([allBots, { bot_id }]) => {
          const allBotsInMap = keyBy(allBots, 'user_id')
          setList(bot_id.map(id => allBotsInMap[id]))
        }
      )
    }
    globalEmitter.on(GlobalEvent.BotRemovedFromChannel, onBotRemoved)

    return () => {
      globalEmitter.off(GlobalEvent.BotRemovedFromChannel, onBotRemoved)
    }
  }, [list])

  return (
    <div className={'flex h-full flex-col'}>
      <MemberListHeader
        title={'频道机器人'}
        onClose={() => {
          contextValue?.changeSidebarMenu(SidebarMenu.Bot)
        }}
      />
      {list ?
        <div className={'flex-1 overflow-auto px-[8px]'}>
          {list.length > 0 ?
            <Virtuoso data={list} itemContent={(index, user) => <MemberItem key={user.user_id} user={user} />} />
          : <div className={'flex h-full w-full items-center justify-center'}>
              <EmptyData message={'暂未添加机器人'}></EmptyData>
            </div>
          }
        </div>
      : <div className={'flex flex-col'}>
          {new Array(100).fill(0).map((_, index) => (
            <MemberListLoadingItem key={index} className={'px-4'} />
          ))}
        </div>
      }
    </div>
  )
}
