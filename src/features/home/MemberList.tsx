import { useDebounceFn } from 'ahooks'
import clsx from 'clsx'
import { useContext, useEffect, useRef, useState } from 'react'
import { ListRange, ScrollSeekPlaceholderProps, Virtuoso } from 'react-virtuoso'
import { GlobalEvent, globalEmitter } from '../../base_services/event.ts'
import EmptyData from '../../components/EmptyData'
import MemberItem from '../member_list/MemberItem'
import { MemberGroupStruct, MemberUserStruct } from '../member_list/MemberStruct'
import { ChannelContainerContext, ChannelContainerContextData, SidebarMenu } from './ChannelContainer'
import { ChannelContext } from './GuildWrapper'
import MemberListAPI, { MemberListState } from './MemberListAPI.ts'
import MemberListHeader from './MemberListHeader'

interface Range {
  start: number
  end: number
}

let currentRange: Range = {
  start: 0,
  end: 0,
}

let fetchingRange: Range | undefined = {
  start: 0,
  end: 0,
}

let top = 0
let time = Date.now()
export default function MemberList() {
  const [list, setList] = useState<MemberListState>({
    count: 100,
    start: 0,
    end: 0,
    list: [],
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const channel = useContext(ChannelContext)

  const contextValue = useContext<ChannelContainerContextData | undefined>(ChannelContainerContext)

  const fetchRange = (range: Range) => {
    fetchingRange = range
    return MemberListAPI.fetchMembers({
      guildId: channel?.guild_id ?? '',
      channelId: channel?.channel_id ?? '',
      ...range,
      not_sync: false,
    }).finally(() => (fetchingRange = undefined))
  }

  const mergeList = (remoteList: MemberListState) => {
    setList(remoteList)
  }
  const handleScroll = () => {
    const currentScrollTop = containerRef.current?.scrollTop || 0
    const currentTimestamp = Date.now()

    const distance = Math.abs(currentScrollTop - top)
    const timeDiff = currentTimestamp - time
    const speed = distance / timeDiff

    top = currentScrollTop
    time = currentTimestamp

    if (speed < 0.05) {
      // 滚动速度变慢时
      // console.log('scroll speed down')
      fetchPageIfNeed()
    }
  }

  const onUserRem = ({ userId, guildId }: { userId: string; guildId: string }) => {
    {
      if (guildId != channel?.guild_id) return
      const index = list.list.findIndex(e => e.type == 'user' && e.user_id == userId)
      if (index == -1) return
      list.list.splice(index, 1)
      const newList = [...list.list]

      setList({
        start: list.start,
        end: list.end,
        list: newList,
        count: list.count - 1,
      })
    }
  }
  useEffect(() => {
    fetchRange({ start: 0, end: 100 }).then(res => {
      mergeList(res)
    })
  }, [])
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    globalEmitter.on(GlobalEvent.UserRem, onUserRem)

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
        globalEmitter.off(GlobalEvent.UserRem, onUserRem)
      }
    }
  }, [list])

  const isOutOfFetchingRange = (range: Range): boolean => {
    if (!fetchingRange) return true
    return range.start < fetchingRange.start || range.end > fetchingRange.end
  }

  const fetchPageIfNeed = () => {
    const outOfViewport = currentRange.start < list.start || currentRange.end > list.end
    if (outOfViewport && isOutOfFetchingRange(currentRange)) {
      const fetchStart = Math.max(currentRange.start - 40, 0)
      const fetchEnd = Math.min(currentRange.end + 40, list.count)
      fetchRange({ start: fetchStart, end: fetchEnd }).then(function (res) {
        return mergeList(res)
      })
    }
  }
  const change = (range: ListRange) => {
    currentRange = {
      start: range.startIndex,
      end: range.endIndex,
    }
    if (range.startIndex == 0 || range.endIndex == list.count - 1) {
      // console.log('scroll to top or bottom', currentRange, fetchingRange)
      fetchPageIfNeed()
    }
    // 索引停止改变后需确认是否请求
    // 防止手动点击屏幕，监听不到速度变慢
    run()
  }

  const { run } = useDebounceFn(
    () => {
      fetchPageIfNeed()
    },
    {
      wait: 300,
    }
  )

  function GroupItem({ group }: { group: MemberGroupStruct }) {
    return (
      <div className={'mb-[2px] flex h-[32px] gap-1 p-[12px_8px_4px_8px] text-[12px] font-bold text-[var(--fg-b100)]'}>
        <span className="truncate">{group.name}</span>({group.count})
      </div>
    )
  }

  function item(index: number) {
    if (index < list.start || index > list.end) return <MemberListLoadingItem className={'px-2'} key={index} />
    const item: MemberUserStruct | MemberGroupStruct = list.list[index - list.start]
    if (item?.type == 'group') {
      return <GroupItem group={item as MemberGroupStruct} key={item.id} />
    } else if (item?.type == 'user') {
      return <MemberItem user={item as MemberUserStruct} key={item.user_id} />
    } else {
      return null
    }
  }

  return (
    <div className={'flex h-full flex-col'}>
      <MemberListHeader
        title={'成员列表'}
        onClose={() => {
          contextValue?.changeSidebarMenu(SidebarMenu.MemberList)
        }}
      />
      <div className={'flex-1 overflow-auto  px-[8px]'} ref={containerRef}>
        {list.count > 0 ?
          <Virtuoso
            fixedItemHeight={40}
            components={{
              ScrollSeekPlaceholder: scrollSeekPlaceholder,
            }}
            rangeChanged={change}
            totalCount={list.count}
            itemContent={item}
          ></Virtuoso>
        : <div className={'flex h-full w-full items-center justify-center'}>
            <EmptyData message={'暂无成员'}></EmptyData>
          </div>
        }
      </div>
    </div>
  )
}

const scrollSeekPlaceholder = ({ index }: ScrollSeekPlaceholderProps) => {
  return <MemberListLoadingItem className={'px-2'} key={index} />
}

export function MemberListLoadingItem({ className }: { className: string }) {
  return (
    <div className={clsx(['flex h-10 flex-shrink-0 items-center gap-2', className])}>
      <div className={'h-8 w-8 rounded-full bg-[var(--fg-b5)]'} />
      <div className={'h-[16px] w-[80%] rounded-[3px] bg-[var(--fg-b5)]'} />
    </div>
  )
}
