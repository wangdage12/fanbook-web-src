import { Button, Dropdown, MenuProps } from 'antd'
import dayjs from 'dayjs'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { useAppDispatch } from '../../app/hooks'
import EmptyPage from '../../components/EmptyPage'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../components/user_card'
import { ApplyRecord, agree, applyRelationRecords, deleteApplyRecord } from '../../components/user_card/RelationAPI'
import { RelationAction, RelationData, RelationType, RequestType } from '../../components/user_card/entity'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import LoadingItem from './LoadingItem'
import { useWsService } from './contact-list-hook'
import { unreadReduced, updateUnreadTimeAsync } from './contact-list-slice'

const items: MenuProps['items'] = [
  {
    label: (
      <div className="flex w-full items-center justify-between text-[var(--function-red-1)]">
        <span>删除</span>
      </div>
    ),
    key: 'delete',
  },
]

interface ApplyItemProps extends ApplyRecord {
  refresh: () => void
}

const ApplyItem = ({ user_id, user_type, record_id, type, validation_info, refresh }: ApplyItemProps) => {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const message = useMemo(() => {
    let message = validation_info
    if (!message) {
      // 类型，1=我发起的，2=我接收的
      if (type === RequestType.From) {
        message = '我: 请求添加你为好友'
      } else if (type === RequestType.To) {
        message = '对方请求添加你为好友'
      }
    } else {
      if (type === RequestType.From) {
        message = `我: ${message}`
      }
    }
    return message
  }, [validation_info, type])

  const menu: MenuProps = {
    items,
    className: 'min-w-[120px]',
    onClick: ({ key }) => {
      switch (key) {
        case 'delete':
          FbModal.error({
            title: '删除',
            content: '确定删除记录吗？',
            okText: '删除',
            onOk: async () => {
              await deleteApplyRecord(record_id)
              refresh()
            },
          })
          break
        default:
          break
      }
    },
  }

  const handleClick: MouseEventHandler<HTMLElement> = async evt => {
    evt.stopPropagation()
    setLoading(true)
    await agree(LocalUserInfo.userId, user_id)
    dispatch(unreadReduced())
    setLoading(false)
    refresh()
  }

  return (
    <UserCard userId={user_id}>
      <div className="w-full pl-[16px]">
        <Dropdown menu={menu} trigger={['contextMenu']}>
          <div className="flex h-[64px] items-center">
            <RealtimeAvatar size={40} userId={user_id} className="mr-[12px] flex-shrink-0 rounded-full"></RealtimeAvatar>
            <div className="flex flex-grow items-center border-b border-b-[var(--fg-b10)] py-[12px] pr-[12px]">
              <div className="flex flex-grow flex-col">
                <RealtimeNickname userId={user_id} className="flex-shrink-0 text-[14px] text-[var(--fg-b100)]"></RealtimeNickname>
                <span className="flex-grow text-[12px] text-[var(--fg-b40)]">{message}</span>
              </div>
              {user_type == RelationType.friend && (
                <div className="flex-shrink-0 text-[14px] text-[var(--fg-b60)]">
                  {type === RequestType.From && (
                    <iconpark-icon name="ArrowHighRight" color="var(--fg-b60)" class="mr-[4px]" size={14}></iconpark-icon>
                  )}
                  已添加
                </div>
              )}
              {user_type == RelationType.pendingIncoming && (
                <Button shape={'round'} size={'small'} onClick={handleClick} loading={loading}>
                  同意
                </Button>
              )}
              {user_type == RelationType.pendingOutgoing && (
                <div className="flex flex-shrink-0 items-center text-[14px] text-[var(--fg-b60)]">
                  <iconpark-icon name="ArrowHighRight" color="var(--fg-b60)" class="mr-[4px]" size={14}></iconpark-icon>
                  待验证
                </div>
              )}
            </div>
          </div>
        </Dropdown>
      </div>
    </UserCard>
  )
}

const ApplyList = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [recentlyApplyList, setRecentlyApplyList] = useState<ApplyRecord[]>([])
  const [longAgoApplyList, setLongAgoApplyList] = useState<ApplyRecord[]>([])

  const getApplyList = async (page: number, init = false) => {
    setIsLoading(true)
    const result = await applyRelationRecords(page)
    const recentlyApplyList: ApplyRecord[] = []
    const longAgoApplyList: ApplyRecord[] = []
    result.forEach(item => {
      const isRecent: boolean = dayjs().diff(dayjs(item.timestamp), 'd') <= 3
      if ([RelationType.pendingOutgoing, RelationType.pendingIncoming, RelationType.friend, RelationType.blocked].includes(item.user_type)) {
        if (isRecent) {
          recentlyApplyList.push(item)
        } else {
          longAgoApplyList.push(item)
        }
      }
    })
    setHasMore(result.length === 50)
    setPage(page)
    setRecentlyApplyList(list => (init ? [...recentlyApplyList] : [...list, ...recentlyApplyList]))
    setLongAgoApplyList(list => (init ? [...longAgoApplyList] : [...list, ...longAgoApplyList]))
    setIsLoading(false)
  }

  const { groupTitle, groupCounts, list } = useMemo(() => {
    const groupTitle = []
    const groupCounts = []
    const list = [undefined, ...recentlyApplyList, undefined, ...longAgoApplyList]
    if (recentlyApplyList.length > 0) {
      groupTitle.push('近三天')
      groupCounts.push(recentlyApplyList.length)
    }
    if (longAgoApplyList.length > 0) {
      groupTitle.push('三天前')
      groupCounts.push(longAgoApplyList.length)
    }
    return {
      groupTitle,
      groupCounts,
      list,
    }
  }, [recentlyApplyList, longAgoApplyList])

  const handleScroll = () => {
    if (hasMore) {
      // 执行加载操作
      getApplyList(page + 1)
    }
  }

  const handleRefresh = () => {
    getApplyList(1, true)
  }

  useEffect(() => {
    dispatch(updateUnreadTimeAsync())
    getApplyList(1, true)
    return () => {
      dispatch(updateUnreadTimeAsync())
    }
  }, [])

  const handleRelation = useCallback(({ data }: { data: RelationData }) => {
    const { type } = data
    switch (type) {
      case RelationAction.apply:
      case RelationAction.friend:
      case RelationAction.cancel:
      case RelationAction.refuse:
        getApplyList(1, true)
        break
      case RelationAction.delete:
      default:
        break
    }
  }, [])

  useWsService({ handleRelation })

  return (
    <>
      {list.length > 0 && (
        <GroupedVirtuoso
          className={'h-full w-full overflow-auto'}
          data={list}
          endReached={handleScroll}
          components={{
            ScrollSeekPlaceholder: LoadingItem,
          }}
          scrollSeekConfiguration={{
            enter: velocity => Math.abs(velocity) > 500,
            exit: velocity => Math.abs(velocity) < 50,
          }}
          groupCounts={groupCounts}
          groupContent={index => (
            <div key={index} className="mb-[4px] bg-[var(--bg-bg-2)] pl-[16px] pt-[8px] text-[12px] text-[var(--fg-b40)]">
              {groupTitle[index]}
            </div>
          )}
          itemContent={(index, groupIndex, item) => item && <ApplyItem key={item.record_id} {...item} refresh={handleRefresh}></ApplyItem>}
        />
      )}
      {!isLoading && list.length === 0 && <EmptyPage message="暂无好友请求" context={'在社区中遇到有趣的朋友\n要主动 Say Hi 呀~'}></EmptyPage>}
    </>
  )
}

export default ApplyList
