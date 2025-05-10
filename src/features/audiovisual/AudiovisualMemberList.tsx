import { Skeleton } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createMemberId } from '../../base_services/audiovisual-provider'
import EmptyData from '../../components/EmptyData'
import AudiovisualMemberItem from './AudiovisualMemberItem'
import { AudiovisualUserInfo, MediaRoomMemberData, MediaRoomSignalOperation, MediaRoomSignallingData } from './audiovisual-entity'
import { useManager, useWsService } from './audiovisual-hook'
import { AudiovisualManager, AudiovisualManagerEvent } from './audiovisual-manager'

interface MemberListProps {
  className?: string
  guildId?: string
  channelId?: string
  needLoading?: boolean
  headerRender?: (manager?: AudiovisualManager) => React.ReactNode
  footerRender?: (manager?: AudiovisualManager) => React.ReactNode
  emptyContext?: React.ReactNode
}

export default function AudiovisualMemberList({
  guildId,
  channelId,
  className,
  needLoading = false,
  emptyContext,
  headerRender,
  footerRender,
}: MemberListProps) {
  const manager = useManager(guildId, channelId)
  const [memberList, setMemberList] = useState<AudiovisualUserInfo[]>([])
  const [loading, setLoading] = useState(false)
  const handleMediaRoomSignalling = useCallback(
    (data: MediaRoomSignallingData) => {
      const { operation, users } = data
      switch (operation) {
        case MediaRoomSignalOperation.Login:
          manager?.addDetailMember(users)
          break
        case MediaRoomSignalOperation.Logout:
          manager?.removeDetailMember(users)
          break
        default:
          console.log(`未处理 operation ${operation}`)
          break
      }
      if (manager?.detailMembers) {
        setMemberList(manager.detailMembers)
      }
    },
    [manager]
  )
  const handleMediaRoomMember = useCallback(
    (data: MediaRoomMemberData) => {
      const { member } = data
      manager?.updateDetailMember(member)
      if (manager?.detailMembers) {
        setMemberList(manager.detailMembers)
      }
    },
    [manager]
  )

  const { stickMember, otherMembers } = useMemo(() => {
    let stickMember: AudiovisualUserInfo | undefined = undefined
    const otherMembers = [...memberList]
    for (let index = 0; index < memberList.length; index++) {
      const member = memberList[index]
      if (member.stick) {
        stickMember = member
        otherMembers.splice(index, 1)
        break
      }
    }
    return { stickMember, otherMembers }
  }, [memberList])

  useWsService({ handleMediaRoomSignalling, handleMediaRoomMember }, { guildId: manager?.guildId, channelId: manager?.channelId }, [manager])

  const memberChangeHandler = useCallback(() => {
    manager?.detailMembers && setMemberList(() => manager.detailMembers)
  }, [manager])

  async function getMembers() {
    setLoading(true)
    const members = await manager?.getDetailMemberList()
    setLoading(false)
    if (members) {
      setMemberList(members)
    }
  }

  useEffect(() => {
    getMembers()
    manager?.on(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
    }
  }, [manager])

  const loadingRender = () =>
    new Array(5).fill(1).map((_, index) => (
      <div key={index} className={'mb-[2px] h-[40px] px-[8px]'}>
        <Skeleton avatar={{ size: 32 }} active paragraph={{ rows: 0 }} title={{ style: { width: '80%' } }} />
      </div>
    ))

  const contextRender = () => {
    return (
      needLoading && loading ? <div className={`flex h-full w-full flex-grow flex-col overflow-auto px-[8px] ${className}`}>{loadingRender()}</div>
      : memberList.length > 0 ?
        <div className={`flex h-full w-full flex-grow flex-col overflow-auto px-[8px] ${className}`}>
          {stickMember && (
            <>
              <div className="flex h-[32px] items-center px-[8px] text-[12px] font-bold text-[var(--fg-b40)]">正在置顶</div>
              <AudiovisualMemberItem key={createMemberId(stickMember.userId, stickMember.deviceId)} {...stickMember}></AudiovisualMemberItem>
              {otherMembers.length > 0 && (
                <div className="flex h-[32px] items-center px-[8px] text-[12px] font-bold text-[var(--fg-b40)]">其他成员</div>
              )}
            </>
          )}
          {otherMembers.map(member => {
            return (
              <AudiovisualMemberItem
                key={createMemberId(member.userId, member.deviceId)}
                guildId={manager?.guildId}
                {...member}
              ></AudiovisualMemberItem>
            )
          })}
        </div>
      : emptyContext ?? (
          <div className={'flex h-full w-full items-center justify-center'}>
            <EmptyData message="暂无成员"></EmptyData>
          </div>
        )
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--fg-white-1)]">
      {headerRender?.(manager)}
      {contextRender()}
      {footerRender?.(manager)}
    </div>
  )
}
