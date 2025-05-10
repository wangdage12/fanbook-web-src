import { useFullscreen } from 'ahooks'
import { Dropdown, type MenuProps } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AudiovisualView, createMemberId } from '../../base_services/audiovisual-provider'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder'
import type PermissionValue from '../../base_services/permission/permissionValue'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../components/user_card'
import { AudiovisualPermission, ChannelPermission } from '../../services/PermissionService'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { AudiovisualContext } from './audiovisual-hook'
import { AudiovisualMemberInfo } from './audiovisual-manager'

import './audiovisual-item.less'

const ASPECT_RATIO = 4 / 3
const MIN_ICON_SIZE = 50
const SOUND_LEVEL = 2
interface AudiovisualItemProps extends AudiovisualMemberInfo {
  width: number
  stream?: MediaStream
  selected?: boolean
  volume?: number
  isTempAdmin?: boolean
  permission?: PermissionValue
  onClick?: () => void
}

const AudiovisualItem: React.FC<AudiovisualItemProps> = ({
  width,
  userId,
  deviceId,
  stick = false,
  ban = true,
  muted = true,
  videoBan = true,
  isTempAdmin = false,
  enableCamera = false,
  stream,
  isPlayingScreenShare = false,
  rotationAngle = 0,
  soundLevel = 0,
  volume = 0,
  permission,
  onClick,
}: AudiovisualItemProps) => {
  const manager = useContext(AudiovisualContext)
  const viewRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<AudiovisualView>()
  const targetRef = useRef<HTMLDivElement>(null)
  const targetAvatarRef = useRef<HTMLImageElement>(null)
  const moreRef = useRef<HTMLElement>(null)
  const timer = useRef<number>()
  const [talking, setTalking] = useState(false)
  const boxWidth = width
  const boxHeight = Math.floor(boxWidth / ASPECT_RATIO)
  const iconSize = Math.max(MIN_ICON_SIZE, Math.floor(width / 5))
  const videoMuted = videoBan || (!videoBan && !enableCamera)
  const audioMuted = ban || (!ban && muted)
  const isLocal = manager ? manager.memberId === createMemberId(userId, deviceId) : false
  const isSameUser = LocalUserInfo.userId === userId && manager?.deviceId === deviceId
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(targetRef)
  const getContainer = () => (isFullscreen && targetRef.current ? targetRef.current : document.body)
  const menu: MenuProps = useMemo(() => {
    const menu: MenuProps = {
      onClick: evt => {
        evt.domEvent.stopPropagation()
        const key = Number(evt.key)
        switch (key) {
          case ChannelPermission.ManageMessages:
            showFbModal({
              title: !stick ? '确定置顶该成员的画面吗？该设置将对所有人可见' : '确定取消置顶该成员吗？',
              closable: false,
              getContainer,
              onOk: async () => {
                await manager?.toggleStick({ targetDeviceId: deviceId, targetUserId: userId }, !stick)
              },
            })
            break
          case AudiovisualPermission.MuteMembers | AudiovisualPermission.Camera:
            showFbModal({
              closable: false,
              title: !videoBan ? '确定将该成员禁视频吗？' : '确定取消该成员禁视频吗？',
              type: !videoBan ? 'error' : undefined,
              okText: !videoBan ? '禁视频' : '确定',
              getContainer,
              okButtonProps: {
                danger: !ban,
              },
              onOk: async () => {
                await manager?.toggleBan({ targetDeviceId: deviceId, targetUserId: userId, banCamera: !videoBan })
              },
            })
            break
          case AudiovisualPermission.MuteMembers | AudiovisualPermission.Speak:
            showFbModal({
              title: !ban ? '确定将该成员禁麦吗？' : '确定取消该成员禁麦吗？',
              closable: false,
              type: !ban ? 'error' : undefined,
              okText: !ban ? '禁麦' : '确定',
              getContainer,
              okButtonProps: {
                danger: !ban,
              },
              onOk: async () => {
                await manager?.toggleBan({ targetDeviceId: deviceId, targetUserId: userId, banMic: !ban })
              },
            })
            break
          case AudiovisualPermission.MoveMembers:
            showFbModal({
              title: '确定将该成员移出频道吗？',
              closable: false,
              type: 'error',
              okText: '移出',
              getContainer,
              okButtonProps: {
                danger: true,
              },
              onOk: async () => {
                await manager?.kickOut({ targetDeviceId: deviceId, targetUserId: userId })
              },
            })
            break
          default:
            break
        }
      },
      items: [
        {
          key: ChannelPermission.ManageMessages,
          label: stick ? '取消置顶' : '置顶该成员画面',
        },
        //@ts-expect-error { type: 'divider' } 定义的问题
        ...((permission?.has(AudiovisualPermission.MuteMembers) || isTempAdmin) && !isSameUser ?
          [
            {
              key: AudiovisualPermission.MuteMembers | AudiovisualPermission.Camera,
              label: videoBan ? '启用视频和共享屏幕' : '关闭视频和共享屏幕',
            },
            {
              key: AudiovisualPermission.MuteMembers | AudiovisualPermission.Speak,
              label: ban ? '取消禁麦' : '禁麦',
            },
          ]
        : []),
        //@ts-expect-error { type: 'divider' } 定义的问题
        ...((permission?.has(AudiovisualPermission.MoveMembers) || isTempAdmin) && !isSameUser ?
          [
            { type: 'divider' },
            {
              key: AudiovisualPermission.MoveMembers,
              label: (
                <div className="flex w-full items-center justify-between text-[var(--function-red-1)]">
                  <span>移出频道</span>
                </div>
              ),
            },
          ]
        : []),
      ],
    }
    return menu
  }, [permission, stick, videoBan, ban, isTempAdmin, isFullscreen])

  useEffect(() => {
    if (stream && !audioMuted && soundLevel >= SOUND_LEVEL) {
      setTalking(true)
      timer.current && clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setTalking(false)
      }, 2000)
    }
  }, [soundLevel, stream, audioMuted])

  useEffect(() => {
    playerRef.current?.setVideoMuted(videoMuted && !isPlayingScreenShare)
  }, [videoMuted, isPlayingScreenShare])

  useEffect(() => {
    playerRef.current?.setVolume(volume)
  }, [volume])

  // useEffect(() => {
  //   playerRef.current?.setAudioMuted(isLocal || selected || audioMuted)
  // }, [isLocal, selected, audioMuted])

  useEffect(() => {
    if (!stream) {
      playerRef.current && manager?.destroyView(playerRef.current)
      playerRef.current = undefined
      return
    }
    if (viewRef.current && manager) {
      playerRef.current = manager.createView(new MediaStream(stream), viewRef.current, {
        isLocal,
      })
      playerRef.current?.setVideoMuted(videoMuted && !isPlayingScreenShare)
      playerRef.current?.setAudioMuted(true)
    }
    return () => {
      playerRef.current && manager?.destroyView(playerRef.current)
      playerRef.current = undefined
    }
  }, [stream, manager])

  const handleRotate = () => {
    const nextAngle = (rotationAngle + 90) % 360
    manager?.updateMemberExtraInfoByMemberId(createMemberId(userId, deviceId), { rotationAngle: nextAngle })
  }
  const handleClick: React.MouseEventHandler<HTMLDivElement> = evt => {
    if (targetAvatarRef.current?.contains(evt.target as Node) || moreRef.current?.contains(evt.target as Node)) {
      return
    }
    onClick?.()
  }

  useEffect(() => {
    const [width, height] = [90, 270].includes(rotationAngle) ? [boxHeight, boxWidth] : [boxWidth, boxHeight]
    playerRef.current?.rotation(rotationAngle, width, height)
  }, [rotationAngle, width])

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
      timer.current && clearTimeout(timer.current)
    }
  }, [])

  return (
    <div
      onClick={handleClick}
      className={'flex rounded-[8px]'}
      style={{
        width: boxWidth,
        height: boxHeight,
      }}
    >
      <div ref={targetRef} className="group/audiovisual-item relative flex h-full w-full items-center justify-center rounded-[8px]">
        <div
          ref={viewRef}
          className={`absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden rounded-[8px] ${
            !videoMuted || isPlayingScreenShare ? '' : 'hidden'
          }`}
        ></div>
        {videoMuted && !isPlayingScreenShare && (
          <div className="absolute left-0 top-0 flex h-full w-full items-center overflow-hidden rounded-[8px] after:absolute after:left-0 after:top-0 after:block after:h-full after:w-full after:bg-[var(--fg-widget)] after:content-['']">
            {<RealtimeAvatar draggable="false" userId={userId} size="100%" rounded={false} className="blur-[10px]" />}
          </div>
        )}
        <div className="absolute right-[16px] top-[8px] flex translate-y-[-5px] text-[14px] text-[var(--fg-white-1)] opacity-0 transition group-hover/audiovisual-item:translate-y-0 group-hover/audiovisual-item:opacity-100">
          <PermissionBuilder permission={AudiovisualPermission.MuteMembers | AudiovisualPermission.MoveMembers}>
            {allow =>
              (allow || isTempAdmin) && (
                <Dropdown overlayClassName="!min-w-[130px]" getPopupContainer={getContainer} menu={menu} placement="bottomRight" trigger={['click']}>
                  <iconpark-icon ref={moreRef} name="More" color="var(--fg-white-1)" size={16}></iconpark-icon>
                </Dropdown>
              )
            }
          </PermissionBuilder>
        </div>
        <div className="absolute bottom-0 left-0 flex h-[36px] w-full translate-y-[5px] justify-end rounded-e-[8px] bg-gradient-to-b from-[rgba(24,24,26,0.00)] to-[rgba(24,24,26,0.60)] opacity-0 transition group-hover/audiovisual-item:translate-y-0 group-hover/audiovisual-item:opacity-100 ">
          {(!videoMuted || isPlayingScreenShare || isFullscreen) && (
            <>
              <iconpark-icon name="RotateLeft" color="var(--fg-white-1)" size={16} class="mr-[16px]" onClick={handleRotate}></iconpark-icon>
              <iconpark-icon
                name={isFullscreen ? 'ExitFullScreen' : 'FullScreen'}
                color="var(--fg-white-1)"
                size={16}
                class="mr-[16px]"
                onClick={toggleFullscreen}
              ></iconpark-icon>
            </>
          )}
        </div>
        <div className="absolute bottom-[8px] left-[16px] flex items-center text-[12px] text-[var(--fg-white-1)]">
          {stick && <iconpark-icon name="ArrowUpCircle" color="var(--function-yellow-1)" size={16} class="mr-[4px]"></iconpark-icon>}
          <RealtimeNickname userId={userId}></RealtimeNickname>
          {ban ?
            <iconpark-icon name="AudioStop2" color="var(--function-red-1)" size={16} class="ml-[4px]"></iconpark-icon>
          : audioMuted && <iconpark-icon name="AudioMuted2" color="var(--fg-b60)" size={16} class="ml-[4px]"></iconpark-icon>}
        </div>
        {videoMuted && !isPlayingScreenShare && (
          <>
            <div
              className={`pointer-events-none absolute left-[50%] top-[50%] ${
                talking ? 'opacity-100' : 'opacity-0'
              } before: transition-opacity before:absolute before:inset-0 before:block before:h-full before:w-full before:animate-[soundLevelAnimation_1s_ease_0.2s_infinite] before:rounded-full before:border before:border-solid before:border-[#0CCD6D] before:bg-transparent before:opacity-50 after:absolute after:inset-0 after:block after:h-full after:w-full after:animate-[soundLevelAnimation_1s_ease_0s_infinite] after:rounded-full after:border after:border-solid after:border-[#0CCD6D] after:bg-transparent after:opacity-50`}
              style={{
                width: iconSize,
                height: iconSize,
                marginTop: -iconSize / 2,
                marginLeft: -iconSize / 2,
              }}
            >
              <em className=" absolute inset-0 h-full w-full animate-[soundLevelAnimation_1s_ease_0.4s_infinite] rounded-full border border-solid border-[#0CCD6D] bg-transparent opacity-50"></em>
            </div>
            <UserCard userId={userId} guildId={manager?.guildId}>
              <div
                className={' absolute left-[50%] top-[50%] z-20 overflow-hidden rounded-full'}
                ref={targetAvatarRef}
                style={{
                  width: iconSize,
                  height: iconSize,
                  marginTop: -iconSize / 2,
                  marginLeft: -iconSize / 2,
                }}
              >
                <RealtimeAvatar draggable="false" className="rounded-full" userId={userId} size={iconSize} />
              </div>
            </UserCard>
          </>
        )}
      </div>
    </div>
  )
}

export default AudiovisualItem
