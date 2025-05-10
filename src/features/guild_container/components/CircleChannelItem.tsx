import { Badge, Divider } from 'antd'
import { CircleSortType } from 'fb-components/circle/types'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { isEqual } from 'lodash-es'
import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppRoutes from '../../../app/AppRoutes'
import { useAppSelector } from '../../../app/hooks'
import { unreadSelectors } from '../../message_list/unreadSlice'

function CircleChannelItem({ guild }: { guild?: GuildStruct }) {
  const circleUrl = `${AppRoutes.CHANNELS}/${guild?.guild_id}/${AppRoutes.CIRCLE}`
  const itemRef = useRef<HTMLAnchorElement>(null)
  const unread = useAppSelector(unreadSelectors.unread(guild?.guild_id, guild?.circle.channel_id), isEqual)
  const location = useLocation()
  const selected = location.pathname === circleUrl

  return (
    <Link ref={itemRef} to={`${circleUrl}${unread.num > 0 ? `?sort=${CircleSortType.Latest}` : ''}`}>
      <div
        className={`m-2 flex h-[36px] cursor-pointer items-center gap-2 rounded-[8px] ${
          selected ? 'bg-[var(--fg-b5)]' : ''
        } p-2 hover:bg-[var(--fg-b5)]`}
      >
        <iconpark-icon name="CameraBlink" color="var(--fg-blue-1)"></iconpark-icon>
        <span className={'flex-grow text-sm font-medium text-[var(--fg-b100)]'}>圈子</span>
        <span className={'rou flex-center text-[13px] leading-[18px] text-[var(--fg-b40)]'}>
          <Badge count={unread.num} dot offset={[0, -2]}>
            <span className="text-[var(--fg-b40)]">{unread.num > 0 ? '有新推荐' : '发现更多精彩'}</span>
          </Badge>
          <div className={'flex-center ml-1 mt-[1px] h-3 w-3'}>
            <iconpark-icon name="Right" color="var(--fg-b20)" size={13}></iconpark-icon>
          </div>
        </span>
      </div>
      <Divider className="mx-[8px] mb-[8px] mt-0 w-[calc(100%-16px)] min-w-[auto]" />
    </Link>
  )
}

export default CircleChannelItem
