import './audiovisual-apply-list.less'

import { Button, Modal } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal'
import { useCallback, useEffect, useState } from 'react'
import { createMemberId } from '../../base_services/audiovisual-provider'
import EmptyData from '../../components/EmptyData'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../components/user_card'
import { ApplyMediaType } from './audiovisual-api'
import { AudiovisualUserInfo } from './audiovisual-entity'
import { useManager, useMutePermissions } from './audiovisual-hook'
import { AudiovisualApplyInfo, AudiovisualManagerEvent } from './audiovisual-manager'

interface ApplyItemProps extends AudiovisualUserInfo {
  onIgnoreApply?: (item: AudiovisualApplyInfo) => void
  onAgreeApply?: (item: AudiovisualApplyInfo) => void
  applyType: ApplyMediaType
  guildId?: string
  hasPermission: boolean
}

function AudiovisualApplyMember({ userId, guildId, deviceId, applyType, hasPermission, onIgnoreApply, onAgreeApply }: ApplyItemProps) {
  return (
    <UserCard userId={userId} guildId={guildId}>
      <div className={'mb-[2px] flex h-[64px] cursor-pointer flex-row items-center justify-between'}>
        <RealtimeUserInfo userId={userId} guildId={guildId}>
          <div className="mr-[4px] flex items-center">
            <RealtimeAvatar userId={userId} guildId={guildId} size={40} className="mr-[8px] rounded-full" />
            <div className="flex flex-col">
              <RealtimeNickname className="truncate" userId={userId} guildId={guildId} />
              <span className="mt-[4px] truncate text-[12px] text-[var(--fg-b60)]">
                {applyType === ApplyMediaType.audio ? '申请开启麦克风' : '申请开启摄像头'}
              </span>
            </div>
          </div>
        </RealtimeUserInfo>
        {hasPermission && (
          <div className="flex items-center">
            <Button
              className="mr-[12px]"
              onClick={evt => {
                evt.stopPropagation()
                onIgnoreApply?.({
                  type: applyType,
                  member: {
                    userId,
                    deviceId,
                  },
                })
              }}
            >
              忽略
            </Button>
            <Button
              type={'primary'}
              onClick={evt => {
                evt.stopPropagation()
                onAgreeApply?.({
                  type: applyType,
                  member: {
                    userId,
                    deviceId,
                  },
                })
              }}
            >
              同意
            </Button>
          </div>
        )}
      </div>
    </UserCard>
  )
}

interface MemberListProps {
  className?: string
  needLoading?: boolean
  emptyContext?: React.ReactNode
}

export default function AudiovisualApplyList({ className, emptyContext }: MemberListProps) {
  const manager = useManager()
  const [open, setOpen] = useState(false)
  const hasMutePermission = useMutePermissions(manager)
  const [applyList, setApplyList] = useState<AudiovisualApplyInfo[]>([])

  const hasMe = applyList.some(({ member }) => createMemberId(member.userId, member.deviceId) === manager?.memberId)

  const handleAgreeApply = useCallback(
    ({ type, member }: AudiovisualApplyInfo) => {
      manager?.agreeApply({
        targetDeviceId: member.deviceId,
        targetUserId: member.userId,
        ...(type === ApplyMediaType.audio ? { mic: true } : { camera: true }),
      })
    },
    [manager]
  )
  const handleIgnoreApply = useCallback(
    ({ type, member }: AudiovisualApplyInfo) => {
      manager?.ignoreApply({
        targetDeviceId: member.deviceId,
        targetUserId: member.userId,
        ...(type === ApplyMediaType.audio ? { mic: true } : { camera: true }),
      })
    },
    [manager]
  )

  const handleClick = useCallback(() => {
    if (!hasMutePermission) {
      manager?.cancelApply({ mic: true, camera: true })
    } else {
      FbModal.error({
        title: '确定忽略全部申请操作吗？',
        closable: false,
        okText: '全部忽略',
        okButtonProps: {
          danger: true,
        },
        onOk: async () => {
          await manager?.ignoreApply({ targetDeviceId: 'ALL', targetUserId: 'ALL', mic: true, camera: true })
        },
      })
    }
  }, [manager, hasMutePermission, applyList])

  const applyChangeHandler = useCallback(() => {
    manager?.detailMembers && setApplyList(() => manager.applyList)
  }, [manager])

  useEffect(() => {
    applyChangeHandler()
    manager?.on(AudiovisualManagerEvent.ApplyChange, applyChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.ApplyChange, applyChangeHandler)
    }
  }, [manager])

  return (
    <div className={`${className} pointer-events-none flex justify-center`}>
      {applyList.length > 0 && (hasMutePermission || manager?.hasApply()) ?
        <div
          className="pointer-events-auto flex cursor-pointer items-center justify-center rounded-full border border-[var(--fg-b60)] bg-[var(--fg-b95)] py-[12px] pl-[14px] pr-[8px]"
          onClick={() => setOpen(true)}
        >
          {applyList.slice(0, 3).map(({ member }) => (
            <RealtimeAvatar
              className="ml-[-6px] rounded-full border border-[var(--fg-white-1)]"
              size={20}
              key={createMemberId(member.userId, member.deviceId)}
              userId={member.userId}
              draggable={false}
            ></RealtimeAvatar>
          ))}
          <span className="mx-[4px] text-[14px] text-[var(--fg-white-1)]">
            {hasMutePermission ? `${applyList.length} 项申请操作` : '你已申请操作'}
          </span>
          <iconpark-icon name="Right" size={18} color="var(--fg-white-1)"></iconpark-icon>
        </div>
      : null}
      <Modal
        width={440}
        className="audiovisual-apply-list-dialog"
        styles={{
          body: { borderRadius: '8px' },
          mask: { background: 'transparent' },
        }}
        maskClosable
        centered
        closeIcon={<iconpark-icon name="Close"></iconpark-icon>}
        onCancel={() => setOpen(false)}
        title={`${applyList.length} 项申请操作`}
        footer={null}
        open={open}
      >
        {applyList.length > 0 ?
          <>
            <div className={'flex h-[400px] w-full flex-grow flex-col overflow-auto'}>
              {applyList.map(({ type, member }) => {
                return (
                  <AudiovisualApplyMember
                    key={`${createMemberId(member.userId, member.deviceId)}_${type}`}
                    hasPermission={hasMutePermission}
                    applyType={type}
                    guildId={manager?.guildId}
                    onAgreeApply={handleAgreeApply}
                    onIgnoreApply={handleIgnoreApply}
                    {...member}
                  ></AudiovisualApplyMember>
                )
              })}
            </div>
            <div className="flex w-full justify-end">
              {(hasMutePermission || (!hasMutePermission && hasMe)) && (
                <Button type={'link'} className="h-5 py-0" onClick={handleClick}>
                  {hasMutePermission ? '全部忽略' : '撤销申请操作'}
                </Button>
              )}
            </div>
          </>
        : emptyContext ?? (
            <div className={'flex h-[400px] w-full items-center justify-center'}>
              <EmptyData message="暂无申请操作"></EmptyData>
            </div>
          )
        }
      </Modal>
    </div>
  )
}
