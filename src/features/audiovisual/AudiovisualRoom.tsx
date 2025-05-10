import { useDebounceEffect, useSize } from 'ahooks'
import { Tooltip } from 'antd'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { isEqual } from 'lodash-es'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { createMemberId } from '../../base_services/audiovisual-provider'
import usePermissions from '../../base_services/permission/usePermissions'
import { AudiovisualPermission } from '../../services/PermissionService'
import Benefit from '../guild_level/Benefit.ts'
import GuildUtils from '../guild_list/GuildUtils'
import { ChannelContainerContext, ChannelContainerContextData } from '../home/ChannelContainer'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import AudiovisualApplyList from './AudiovisualApplyList'
import AudiovisualItem from './AudiovisualItem'
import {
  AudiovisualExtraInfo,
  AudiovisualLayout,
  AudiovisualUserInfo,
  JoinStatus,
  MediaRoomSignalOperation,
  MediaRoomSignallingData,
  MemberItemExternals,
} from './audiovisual-entity'
import { AudiovisualContext, useControl, useWsService } from './audiovisual-hook'
import { AudiovisualManagerEvent, AudiovisualUserExtraInfo, DefaultMemberExtraInfo } from './audiovisual-manager'
import { currentRoomInfo } from './audiovisual-slice'
import { getScrollbarWidth } from './audiovisual-util'

import './audiovisual-control.less'

const MIN_VIEW_WIDTH = 180
const LIST_WIDTH = 240
const ASPECT_RATIO = 4 / 3
const PADDING = 16

function getMaxColNum(num: number) {
  const max = [1, 4, 9]
  let index = 0
  while (index < max.length && num > max[index]) {
    index++
  }
  return index + 1
}

function getViewInfo(count: number, boxWidth: number, boxHeight: number) {
  let colNum = getMaxColNum(count)
  let viewWidth = MIN_VIEW_WIDTH
  while (colNum > 1) {
    viewWidth = Math.floor((boxWidth - PADDING * (colNum + 1)) / colNum)
    const viewHeight = Math.floor(viewWidth / ASPECT_RATIO)
    if (viewWidth >= MIN_VIEW_WIDTH && viewHeight < boxHeight) {
      break
    }
    colNum = colNum - 1
  }
  if (colNum === 1) {
    viewWidth = Math.max(Math.floor(boxWidth - PADDING * 2), MIN_VIEW_WIDTH)
    const viewHeight = Math.floor(viewWidth / ASPECT_RATIO)
    if (viewHeight > boxHeight) {
      viewWidth = Math.floor(boxHeight * ASPECT_RATIO)
    }
  }
  if (colNum === 2) {
    const viewHeight = Math.floor(viewWidth / ASPECT_RATIO)
    const rowNum = count >= 3 ? 2 : 1
    if (viewHeight * rowNum + rowNum * PADDING - PADDING > boxHeight) {
      viewWidth = Math.floor(((boxHeight - PADDING * 2 - rowNum * PADDING - PADDING) / rowNum) * ASPECT_RATIO)
    }
  }
  // 在某些显示器下太极限容易导致意外换行因此 -4 作为兼容处理
  return { viewWidth: viewWidth - 4, colNum }
}

const AudiovisualRoom = () => {
  const contextValue = useContext<ChannelContainerContextData<AudiovisualExtraInfo> | undefined>(ChannelContainerContext)
  const manager = useContext(AudiovisualContext)
  if (!contextValue) throw Error('AudiovisualRoom 必须在 ChannelContainer 下使用')
  const { audiovisualLayout = AudiovisualLayout.List } = contextValue.extraInfo ?? {}
  const isProminentMode = audiovisualLayout !== AudiovisualLayout.List

  const { channelId, guildId } = useAppSelector(currentRoomInfo, isEqual)
  const [memberList, setMemberList] = useState<AudiovisualUserInfo[]>([])
  const [extraInfo, setExtraInfo] = useState<Record<string, AudiovisualUserExtraInfo>>({})
  const [selectedMember, setSelectedMember] = useState<AudiovisualUserInfo>(memberList[0])
  const count = memberList.length
  const [mediaStream, setMediaStream] = useState<Record<string, MediaStream>>({})
  const [volume, setVolume] = useState(0)
  const [viewWidth, setViewWidth] = useState(MIN_VIEW_WIDTH)
  const [needScroll, setNeedScroll] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const [isTempAdmin, setIsTempAdmin] = useState(false)
  const permission = usePermissions({
    channelId: manager?.channelId ?? '',
    permission: AudiovisualPermission.MuteMembers | AudiovisualPermission.MoveMembers,
  })

  let channel: ChannelStruct | undefined
  if (channelId && guildId) {
    channel = GuildUtils.getChannelById(guildId, channelId)
  }
  const { width: boxWidth, height: boxHeight } = useSize(parentRef) ?? { width: 0, height: 0 }

  useDebounceEffect(
    () => {
      const { viewWidth, colNum } = getViewInfo(
        isProminentMode ? 1 : count,
        isProminentMode ? boxWidth - LIST_WIDTH : boxWidth,
        boxHeight - 2 * PADDING
      )

      const needScroll = boxHeight - 2 * PADDING <= Math.ceil(count / colNum) * (Math.floor(viewWidth / ASPECT_RATIO) + PADDING) - PADDING
      setNeedScroll(needScroll)
      const scrollWitch = getScrollbarWidth()
      setViewWidth(needScroll || isProminentMode ? viewWidth - Math.ceil(scrollWitch / colNum) : viewWidth)
    },
    [boxWidth, boxHeight, memberList.length, isProminentMode],
    { wait: 10, leading: false, trailing: true }
  )

  const memberChangeHandler = useCallback(() => {
    manager?.detailMembers && setMemberList(() => manager.detailMembers)
  }, [manager])

  const memberExtraInfoChangeHandler = useCallback(() => {
    manager?.memberExtraInfos && setExtraInfo(() => manager.memberExtraInfos)
  }, [manager])

  const streamChangeHandler = useCallback(() => {
    manager?.memberStream && setMediaStream(() => Object.fromEntries(Array.from(manager.memberStream)))
  }, [manager])

  const volumeChangeHandler = useCallback(() => {
    manager && setVolume(manager.volume)
  }, [manager])

  const roomOwnerChangeHandler = useCallback(() => {
    manager && setIsTempAdmin(manager.tempAdminUserId === LocalUserInfo.userId)
  }, [manager])

  useEffect(() => {
    manager?.getDetailMemberList()
    volumeChangeHandler()
    memberExtraInfoChangeHandler()
    streamChangeHandler()
    roomOwnerChangeHandler()
    manager?.on(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
    manager?.on(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
    manager?.on(AudiovisualManagerEvent.MemberExtraChange, memberExtraInfoChangeHandler)
    manager?.on(AudiovisualManagerEvent.StreamChange, streamChangeHandler)
    manager?.on(AudiovisualManagerEvent.VolumeChange, volumeChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
      manager?.off(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
      manager?.off(AudiovisualManagerEvent.MemberExtraChange, memberExtraInfoChangeHandler)
      manager?.off(AudiovisualManagerEvent.StreamChange, streamChangeHandler)
      manager?.off(AudiovisualManagerEvent.VolumeChange, volumeChangeHandler)
    }
  }, [manager])

  useEffect(() => {
    if (isProminentMode && (!selectedMember || !memberList.some(member => isEqual(selectedMember, member)))) {
      setSelectedMember(memberList[0])
    }
  }, [audiovisualLayout, memberList])

  useEffect(() => {
    contextValue.changeExtraInfo({ count: memberList.length })
  }, [memberList])

  const { joinStatus, audioBan, videoBan, audioMuted, videoMuted, handleHandUp, handleAudio, handleVideo, levelLimit } = useControl(
    manager,
    guildId,
    channelId
  )

  const handleMediaRoomSignalling = useCallback(
    (data: MediaRoomSignallingData) => {
      const { operation, users } = data
      switch (operation) {
        case MediaRoomSignalOperation.StickMember: {
          const [currentUser] = users
          if (currentUser) {
            const { stick = false } = currentUser.externals ? safeJSONParse(currentUser.externals, {} as MemberItemExternals) : {}
            if (stick) {
              const currentUserMemberId = createMemberId(currentUser.user_id, currentUser.device_id)
              const member = memberList.find(member => createMemberId(member.userId, member.deviceId) === currentUserMemberId)
              member && setSelectedMember(member)
              !isProminentMode && contextValue.changeExtraInfo({ audiovisualLayout: AudiovisualLayout.Emphasis })
            }
          }
          break
        }
        default:
          console.log(`未处理 operation ${operation}`)
          break
      }
    },
    [manager]
  )
  useWsService({ handleMediaRoomSignalling }, { guildId: manager?.guildId, channelId: manager?.channelId }, [manager])

  if (!channel) return <div className="h-[calc(100%-44px)] w-full bg-[var(--fg-b100)]"></div>
  return (
    <div ref={parentRef} className={'group/audiovisual-room relative flex h-[calc(100%-44px)] w-full bg-[var(--fg-b100)] py-[16px] '}>
      <AudiovisualApplyList className="absolute left-0 top-[20px] z-10 w-full"></AudiovisualApplyList>
      <div
        className="hide-scroll-bar flex w-0 flex-grow flex-wrap justify-center gap-[16px] overflow-auto px-[16px]"
        style={{
          alignContent:
            isProminentMode ? 'center'
            : needScroll ? 'flex-start'
            : 'center',
          overflow:
            isProminentMode ? 'hidden'
            : needScroll ? 'auto'
            : 'hidden',
        }}
      >
        {isProminentMode && selectedMember ?
          <AudiovisualItem
            volume={volume}
            isTempAdmin={isTempAdmin}
            permission={permission}
            stream={
              mediaStream[createMemberId(selectedMember.userId, selectedMember.deviceId)] ||
              mediaStream[createMemberId(selectedMember.userId, selectedMember.deviceId, 'screen')]
            }
            key={createMemberId(selectedMember.userId, selectedMember.deviceId)}
            width={viewWidth}
            selected
            {...(extraInfo[createMemberId(selectedMember.userId, selectedMember.deviceId)] ?? DefaultMemberExtraInfo)}
            {...selectedMember}
          />
        : memberList.map(member => {
            return (
              <AudiovisualItem
                volume={volume}
                isTempAdmin={isTempAdmin}
                permission={permission}
                key={createMemberId(member.userId, member.deviceId)}
                stream={
                  mediaStream[createMemberId(member.userId, member.deviceId)] || mediaStream[createMemberId(member.userId, member.deviceId, 'screen')]
                }
                width={viewWidth}
                {...(extraInfo[createMemberId(member.userId, member.deviceId)] ?? DefaultMemberExtraInfo)}
                {...member}
              />
            )
          })
        }
      </div>
      <div
        className={`${
          isProminentMode ? `w-[${LIST_WIDTH}px] px-[16px]` : 'w-0'
        } hide-scroll-bar flex shrink-0 flex-col gap-[16px] overflow-auto transition-all`}
      >
        {isProminentMode &&
          memberList.map(member => (
            <div key={createMemberId(member.userId, member.deviceId)} className="relative">
              {selectedMember &&
                createMemberId(member.userId, member.deviceId) === createMemberId(selectedMember.userId, selectedMember.deviceId) && (
                  <em className="absolute left-[-16px] top-[50%] mt-[-16px] block h-[32px] w-[6px] rounded-r-[4px] bg-[var(--fg-blue-1)]"></em>
                )}
              <AudiovisualItem
                width={204}
                isTempAdmin={isTempAdmin}
                permission={permission}
                volume={volume}
                onClick={() => {
                  setSelectedMember(member)
                }}
                selected={createMemberId(member.userId, member.deviceId) === createMemberId(selectedMember?.userId, selectedMember?.deviceId)}
                stream={
                  mediaStream[createMemberId(member.userId, member.deviceId)] || mediaStream[createMemberId(member.userId, member.deviceId, 'screen')]
                }
                {...(extraInfo[createMemberId(member.userId, member.deviceId)] ?? DefaultMemberExtraInfo)}
                {...member}
              />
            </div>
          ))}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-[50] flex h-[88px] w-full translate-y-[44px] items-center justify-center bg-gradient-to-b from-[rgba(24,24,26,0.00)] to-[rgba(24,24,26,0.60)] opacity-0 transition group-hover/audiovisual-room:translate-y-0 group-hover/audiovisual-room:opacity-100">
        <Tooltip
          placement="top"
          color="var(--fg-white-1)"
          title={audioMuted ? '打开麦克风' : '关闭麦克风'}
          overlayInnerStyle={{ fontSize: 12, color: 'var(--fg-b100)' }}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div
            className={`pointer-events-auto mr-[16px] flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-[var(--fg-white-1)] ${
              joinStatus === JoinStatus.joining ? 'opacity-40' : ''
            }`}
            onClick={handleAudio}
          >
            {audioBan ?
              <iconpark-icon name="AudioStop2" color="var(--fg-b100)" size={22}></iconpark-icon>
            : audioMuted ?
              <iconpark-icon name="AudioMuted2" color="var(--function-red-1)" size={22}></iconpark-icon>
            : <iconpark-icon name="Audio2" color="var(--fg-b100)" size={22}></iconpark-icon>}
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          color="var(--fg-white-1)"
          destroyTooltipOnHide={false}
          title={
            levelLimit ? `解锁社区等级 LV.${Benefit.videoSupport.requiredLevel} 后可使用`
            : videoMuted ?
              '打开摄像头'
            : '关闭摄像头'
          }
          overlayInnerStyle={{ fontSize: 12, color: 'var(--fg-b100)', pointerEvents: 'none' }}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div
            className={`pointer-events-auto mr-[16px] flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-[var(--fg-white-1)] ${
              joinStatus === JoinStatus.joining ? 'opacity-40' : ''
            }`}
            onClick={handleVideo}
          >
            {levelLimit ?
              <iconpark-icon name="Video" color="var(--fg-b40)" size={22}></iconpark-icon>
            : videoBan ?
              <iconpark-icon name="VideoStop" color="var(--fg-b100)" size={22}></iconpark-icon>
            : videoMuted ?
              <iconpark-icon name="VideoMuted" color="var(--function-red-1)" size={22}></iconpark-icon>
            : <iconpark-icon name="Video" color="var(--fg-b100)" size={22}></iconpark-icon>}
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          title={'挂断'}
          color="var(--fg-white-1)"
          overlayInnerStyle={{ fontSize: 12, color: 'var(--fg-b100)' }}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <div
            className={`pointer-events-auto flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-[var(--function-red-1)] ${
              joinStatus === JoinStatus.joining ? 'opacity-40' : ''
            } `}
            onClick={handleHandUp}
          >
            <iconpark-icon name="Phone" color="var(--fg-white-1)" size={22}></iconpark-icon>
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
export default AudiovisualRoom
