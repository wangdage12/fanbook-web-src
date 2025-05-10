import { isEqual } from 'lodash-es'
import { pinyin } from 'pinyin-pro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../components/user_card'
import { FriendInfo } from '../../components/user_card/RelationAPI'
import { RelationAction, RelationData } from '../../components/user_card/entity'
import UserMenuDropdown from '../../components/user_card/user_menu/UserMenuDropdown'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { remarkSelectors } from '../remark/remarkSlice'
import LoadingItem from './LoadingItem'
import { useWsService } from './contact-list-hook'
import { friendList, friendListAsync } from './contact-list-slice'

interface FriendExtraInfo extends FriendInfo {
  code: string
  remark?: string
}

type FriendChunk = [string, FriendExtraInfo[]]

function sortFriendByName(friends: (FriendInfo & { remark?: string })[]): FriendChunk[] {
  const friendsMap: Record<string, FriendExtraInfo[]> = {}
  friends.forEach(item => {
    const str = pinyin(item.remark ?? item.nickname ?? '', {
      pattern: 'pinyin',
      toneType: 'none',
    }).toLowerCase()
    const flag = /[a-zA-Z]/.test(str[0]) ? str[0] : '#'

    if (!friendsMap[flag]) {
      friendsMap[flag] = []
    }
    friendsMap[flag].push({ ...item, code: str })
  })
  const chunk = Object.entries(friendsMap)
    .map(([flag, items]) => {
      items.sort((prev, next) => {
        if (prev.code > next.code) {
          return 1
        } else {
          return -1
        }
      })
      return [flag, items]
    })
    .sort((prev, next) => {
      if (prev[0] === '#') {
        return 1
      }
      if (next[0] === '#') {
        return -1
      }
      if (prev[0] > next[0]) {
        return 1
      } else {
        return -1
      }
    }) as FriendChunk[]
  return chunk
}

interface FriendItemProps extends FriendInfo {
  remark?: string
  afterHandler: () => void
}

const FriendItem = ({ user_id, username, nickname, afterHandler }: FriendItemProps) => {
  return (
    <UserCard userId={user_id}>
      <div className="w-full pl-[16px]">
        <UserMenuDropdown
          userId={user_id}
          nickname={nickname}
          username={username}
          deletable
          afterHandler={afterHandler}
          trigger={['contextMenu']}
          disabled={user_id === LocalUserInfo.userId}
        >
          <div className="flex h-[64px] items-center">
            <RealtimeUserInfo userId={user_id}>
              <RealtimeAvatar size={40} userId={user_id} className="mr-[12px] flex-shrink-0 rounded-full"></RealtimeAvatar>
              <div className="flex flex-grow flex-col border-b border-b-[var(--fg-b10)] py-[12px]">
                <RealtimeNickname userId={user_id} className="text-[14px] text-[var(--fg-b100)]"></RealtimeNickname>
                <span className="text-[12px] text-[var(--fg-b40)]">ID：{username}</span>
              </div>
            </RealtimeUserInfo>
          </div>
        </UserMenuDropdown>
      </div>
    </UserCard>
  )
}

const FriendList = () => {
  const baseFriends = useAppSelector(friendList, isEqual)
  const dispatch = useAppDispatch()
  const [friends, setFriends] = useState<FriendChunk[]>([])
  const remarkList = useAppSelector(remarkSelectors.remarkList, isEqual)

  const getList = useCallback(() => {
    dispatch(friendListAsync())
  }, [])

  const handleRelation = useCallback(({ data }: { data: RelationData }) => {
    const { type } = data
    switch (type) {
      case RelationAction.friend:
      case RelationAction.delete:
        getList()
        break
      case RelationAction.apply:
      case RelationAction.cancel:
      case RelationAction.refuse:
      default:
        break
    }
  }, [])
  useWsService({ handleRelation })
  useEffect(() => {
    setFriends(
      sortFriendByName(
        Object.values(baseFriends).map(item => ({
          ...item,
          remark: remarkList?.[item.user_id],
        }))
      )
    )
  }, [baseFriends, remarkList])

  const { groupTitle, groupCounts, list } = useMemo(() => {
    const groupTitle = []
    const groupCounts: number[] = []
    const list = []
    for (const [flag, items] of friends) {
      groupTitle.push(flag.toLocaleUpperCase())
      groupCounts.push(items.length)
      // undefined 用来占 标题的位置
      list.push(undefined, ...items)
    }
    return {
      groupTitle,
      groupCounts,
      list,
    }
  }, [friends])

  return (
    list.length > 0 && (
      <GroupedVirtuoso
        className={'h-full w-full overflow-auto'}
        data={list}
        components={{
          ScrollSeekPlaceholder: LoadingItem,
        }}
        scrollSeekConfiguration={{
          enter: velocity => Math.abs(velocity) > 500,
          exit: velocity => Math.abs(velocity) < 50,
        }}
        groupCounts={groupCounts}
        groupContent={index => (
          <div key={index} className="mt-[8px] bg-[var(--bg-bg-2)] pl-[16px] text-[12px] text-[var(--fg-b40)]">
            {groupTitle[index]}
          </div>
        )}
        itemContent={(index, groupIndex, item) => {
          if (!item) return null
          return <FriendItem afterHandler={getList} key={item.user_id} {...item}></FriendItem>
        }}
      />
    )
  )
}

export default FriendList
