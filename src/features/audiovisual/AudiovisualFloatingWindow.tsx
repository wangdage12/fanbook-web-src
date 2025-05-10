import { useSize } from 'ahooks'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { Portal } from 'fb-components/components/Portal.tsx'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { isEqual } from 'lodash-es'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import Draggable, { type DraggableEventHandler } from 'react-draggable'
import { useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { AudiovisualAudio, createMemberId } from '../../base_services/audiovisual-provider'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import StateUtils from '../../utils/StateUtils'
import GuildUtils from '../guild_list/GuildUtils'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { ApplyMediaType } from './audiovisual-api'
import {
  AudiovisualUserInfo,
  MediaRoomMemberData,
  MediaRoomSignalOperation,
  MediaRoomSignallingData,
  MemberItemExternals,
} from './audiovisual-entity'
import { AudiovisualContext, useControl, useWsService } from './audiovisual-hook'
import { AudiovisualManagerEvent } from './audiovisual-manager'
import { currentRoomInfo } from './audiovisual-slice'
import { isMediaSupport } from './audiovisual-util'

const ASPECT_RATIO = 4 / 3
const PADDING = 16

const AudiovisualFloatingWindow = () => {
  const localUser = StateUtils.localUser
  const { guildId: currentGuildId, channelId: currentChannelId } = useParams()
  const manager = useContext(AudiovisualContext)
  const { channelId, guildId } = useAppSelector(currentRoomInfo, isEqual)
  const guild = guildId ? GuildUtils.getGuildById(guildId) : undefined
  let channel: ChannelStruct | undefined
  if (channelId && guildId) {
    channel = GuildUtils.getChannelById(guildId, channelId)
  }
  const [memberList, setMemberList] = useState<Record<string, AudiovisualUserInfo>>({})
  const targetRef = useRef<HTMLDivElement>(null)
  const audioWrapperRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<AudiovisualAudio>()
  const boxWidth = 290
  const [mediaStream, setMediaStream] = useState<Record<string, MediaStream>>({})
  const [volume, setVolume] = useState(0)
  const timer = useRef<number>()
  const isDragging = useRef(false)
  const boxHeight = Math.floor(boxWidth / ASPECT_RATIO)
  const { width: screenWidth, height: screenHeight } = useSize(document.body) ?? { width: 0, height: 0 }
  const [position, setPosition] = useState({
    y: PADDING,
    x: screenWidth - boxWidth - PADDING,
  })

  const [isAdjust, setIsAdjust] = useState(false)

  function adjustPos() {
    const { x, y } = position
    const centerX = Math.floor((screenWidth - boxWidth) / 2)
    const targetX = centerX > x ? PADDING : screenWidth - boxWidth - PADDING
    const targetY =
      y < PADDING ? PADDING
      : y + boxHeight > screenHeight - PADDING ? screenHeight - boxHeight - PADDING
      : y
    setIsAdjust(true)
    setPosition({
      x: targetX,
      y: targetY,
    })
    timer.current = window.setTimeout(() => {
      setIsAdjust(false)
    }, 110)
  }

  const onStart: DraggableEventHandler = () => {
    if (isAdjust) {
      return false
    }
  }
  const onStop: DraggableEventHandler = () => {
    adjustPos()
    setTimeout(() => {
      isDragging.current = false
    }, 0)
  }
  const onDrop: DraggableEventHandler = (evt, position) => {
    isDragging.current = true
    setPosition(() => {
      const { x, y } = position
      return { x, y }
    })
  }

  const handleTransition = () => {
    setIsAdjust(false)
    isDragging.current = false
    clearTimeout(timer.current)
  }

  const handleClick = () => {
    if (isDragging.current) {
      return
    }
    channel && GuildUtils.selectChannel(channel)
  }

  useEffect(() => {
    audioRef.current?.setVolume(volume)
    if (audioRef.current?.audioMuted && volume > 0) {
      audioRef.current?.setAudioMuted(false)
    } else if (!audioRef.current?.audioMuted && volume <= 0) {
      audioRef.current?.setAudioMuted(true)
    }
  }, [volume])

  useEffect(() => {
    const streams = Object.entries(mediaStream)
      .filter(([key]) => {
        const isLocal = key === manager?.memberId
        const member = memberList[key]
        if (!member) {
          return false
        }
        const audioMuted = member.ban || (!member.ban && member.muted)
        return !isLocal && !audioMuted
      })
      .map(([, stream]) => stream)
    audioRef.current?.setTracks(streams, true)
  }, [mediaStream, memberList])

  useEffect(() => {
    if (manager && isMediaSupport()) {
      manager.joinRoom()
      audioRef.current = new AudiovisualAudio()
      if (audioWrapperRef.current) {
        audioRef.current?.play(audioWrapperRef.current)
        audioRef.current?.setVolume(manager?.volume)
        if (!audioRef.current?.audioMuted && volume <= 0) {
          audioRef.current?.setAudioMuted(true)
        }
      }
    }
    return () => {
      audioRef.current?.stop()
    }
  }, [manager])

  useEffect(() => {
    adjustPos()
  }, [screenWidth, screenHeight])

  const { handleHandUp } = useControl(manager, currentGuildId, currentChannelId)

  const handleMediaRoomSignalling = useCallback(
    (data: MediaRoomSignallingData) => {
      console.log('%c [ 🚀 ~ data ] -56-「AudiovisualRoom.tsx」', 'font-size:14px; background:#cac6ad; color:#fffff1;', data)
      const { operation, users } = data
      switch (operation) {
        case MediaRoomSignalOperation.Login:
          manager?.addDetailMember(users)
          break
        case MediaRoomSignalOperation.Logout:
          manager?.removeDetailMember(users)
          break
        case MediaRoomSignalOperation.KickOut:
          if (users.find(user => createMemberId(user.user_id, user.device_id) === manager?.memberId)) {
            FbToast.open({ content: '你已被移出音视频频道', key: 'KickOut' })
            handleHandUp()
          }
          break
        case MediaRoomSignalOperation.Ban: {
          const isCurrentUser = manager?.changeMediaState({ audioBan: true, audioMuted: true }, users)
          if (isCurrentUser) {
            FbToast.open({ content: '已被禁麦', key: 'Ban' })
          }
          break
        }
        case MediaRoomSignalOperation.UnBan: {
          const isCurrentUser = manager?.changeMediaState({ audioBan: false }, users)
          if (isCurrentUser) {
            FbToast.open({ content: '禁麦已取消', key: 'UnBan' })
          }
          break
        }
        case MediaRoomSignalOperation.BanCamera: {
          const isCurrentUser = manager?.changeMediaState({ videoBan: true, videoMuted: true }, users)
          if (isCurrentUser) {
            FbToast.open({ content: '摄像头权限被关闭', key: 'BanCamera' })
          }
          break
        }
        case MediaRoomSignalOperation.UnBanCamera: {
          const isCurrentUser = manager?.changeMediaState({ videoBan: false }, users)
          if (isCurrentUser) {
            FbToast.open({ content: '摄像头权限被开启', key: 'UnBanCamera' })
          }
          break
        }
        case MediaRoomSignalOperation.StickMember: {
          const currentUser = users.find(user => createMemberId(user.user_id, user.device_id) === manager?.memberId)
          if (currentUser) {
            const { stick = false } = currentUser.externals ? safeJSONParse(currentUser.externals, {} as MemberItemExternals) : {}
            FbToast.open({ content: stick ? '你已被管理员置顶' : '你已被管理员取消置顶', key: 'StickMember' })
          }
          break
        }
        case MediaRoomSignalOperation.BanAll:
          FbToast.open({ content: '已被禁麦', key: 'BanAll' })
          manager?.changeMediaState({ audioBan: true, audioMuted: true })
          break
        case MediaRoomSignalOperation.UnBanAll:
          FbToast.open({ content: '禁麦已取消', key: 'UnBanAll' })
          manager?.changeMediaState({ audioBan: false })
          break
        case MediaRoomSignalOperation.BanAllCamera:
          FbToast.open({ content: '摄像头权限被关闭', key: 'BanAllCamera' })
          manager?.changeMediaState({ videoBan: true, videoMuted: true })
          break
        case MediaRoomSignalOperation.UnBanAllCamera:
          FbToast.open({ content: '摄像头权限被开启', key: 'UnBanAllCamera' })
          manager?.changeMediaState({ videoBan: false })
          break
        case MediaRoomSignalOperation.Apply:
          manager?.addApplyItemByType(users, ApplyMediaType.audio)
          break
        case MediaRoomSignalOperation.ApplyCamera:
          manager?.addApplyItemByType(users, ApplyMediaType.video)
          break
        case MediaRoomSignalOperation.ApplyCancel:
          manager?.removeApplyItemByType(users, ApplyMediaType.audio)
          break
        case MediaRoomSignalOperation.ApplyCancelCamera:
          manager?.removeApplyItemByType(users, ApplyMediaType.video)
          break
        case MediaRoomSignalOperation.AllowApply: {
          manager?.removeApplyItemByType(users, ApplyMediaType.audio)
          const currentUser = users.find(user => createMemberId(user.user_id, user.device_id) === manager?.memberId)
          if (currentUser) {
            manager?.changeMediaState({ audioBan: false })
          }
          break
        }
        case MediaRoomSignalOperation.AllowApplyCamera: {
          manager?.removeApplyItemByType(users, ApplyMediaType.video)
          const currentUser = users.find(user => createMemberId(user.user_id, user.device_id) === manager?.memberId)
          if (currentUser) {
            manager?.changeMediaState({ videoBan: false })
          }
          break
        }
        case MediaRoomSignalOperation.IgnoreApply:
          manager?.removeApplyItemByType(users, ApplyMediaType.audio)
          break
        case MediaRoomSignalOperation.IgnoreApplyCamera:
          manager?.removeApplyItemByType(users, ApplyMediaType.video)
          break
        case MediaRoomSignalOperation.IgnoreApplyAll:
          manager?.removeApplyItem(manager.applyList.filter(item => item.type === ApplyMediaType.audio))
          break
        case MediaRoomSignalOperation.IgnoreApplyAllCamera:
          manager?.removeApplyItem(manager.applyList.filter(item => item.type === ApplyMediaType.video))
          break
        case MediaRoomSignalOperation.OwnerChange:
          manager?.changeRoomOwner(users)
          break
        default:
          console.log('%c [ 🚀 ~ operation ]', 'font-size:14px; background:#f9b1bd; color:#fff5ff;', `未处理 operation ${operation}`)
          break
      }
    },
    [manager]
  )
  const handleMediaRoomMember = useCallback(
    (data: MediaRoomMemberData) => {
      const { member } = data
      manager?.updateDetailMember(member)
    },
    [manager]
  )
  useWsService(
    {
      handleMediaRoomSignalling,
      handleMediaRoomMember,
    },
    { guildId, channelId },
    [manager]
  )

  const memberChangeHandler = useCallback(() => {
    manager?.detailMembers &&
      setMemberList(() => Object.fromEntries(manager.detailMembers.map(member => [createMemberId(member.userId, member.deviceId), member])))
  }, [manager])

  const streamChangeHandler = useCallback(() => {
    manager?.memberStream && setMediaStream(() => Object.fromEntries(Array.from(manager.memberStream)))
  }, [manager])

  const volumeChangeHandler = useCallback(() => {
    manager && setVolume(manager.volume)
  }, [manager])

  const pageBeforeUnload = useCallback(
    (evt: BeforeUnloadEvent) => {
      // https://juejin.cn/post/7098978418783420424
      evt.preventDefault()
      // Chrome requires returnValue to be set
      evt.returnValue = '你正在音视频房间内，确定关闭页面或者刷新吗？'
    },
    [manager]
  )
  const pageUnload = useCallback(async () => {
    await manager?.destroy()
    const now = Date.now()
    // 加一段同步代码阻塞一下，不然刷新会发不出去异步请求
    // eslint-disable-next-line no-empty
    while (Date.now() - now < 100) {}
  }, [manager])

  const roomOwnerChangeHandler = useCallback(() => {
    if (manager && manager.tempAdminUserId === LocalUserInfo.userId) {
      FbToast.open({ content: '你已成为了房间主持人，可对房间进行管理', key: 'room-owner' })
    }
  }, [manager])

  useEffect(() => {
    manager?.getDetailMemberList()
    manager?.getApplyList()
    manager?.on(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
    manager?.on(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
    manager?.on(AudiovisualManagerEvent.StreamChange, streamChangeHandler)
    manager?.on(AudiovisualManagerEvent.VolumeChange, volumeChangeHandler)
    window.addEventListener('beforeunload', pageBeforeUnload)
    window.addEventListener('unload', pageUnload)
    return () => {
      manager?.off(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
      manager?.off(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
      manager?.off(AudiovisualManagerEvent.StreamChange, streamChangeHandler)
      manager?.off(AudiovisualManagerEvent.VolumeChange, volumeChangeHandler)
      window.removeEventListener('beforeunload', pageBeforeUnload)
      window.removeEventListener('unload', pageUnload)
    }
  }, [manager])

  useEffect(() => {
    return () => {
      manager?.destroy()
    }
  }, [manager])

  const runInBackground = !!(!guild || !channel || (guild.guild_id === currentGuildId && channel.channel_id === currentChannelId))

  return (
    <Portal key="AudiovisualFloatingWindow">
      <Draggable nodeRef={targetRef} bounds="parent" onStart={onStart} onDrag={onDrop} onStop={onStop} position={position}>
        <div
          ref={targetRef}
          className={`fixed left-0 top-0 z-[990] flex rounded-[8px] ${runInBackground ? 'hidden' : ''}`}
          style={{
            width: boxWidth,
            height: boxHeight,
            transition: isAdjust ? 'transform 100ms ease-in-out' : 'none',
          }}
          onTransitionEnd={handleTransition}
          onClick={handleClick}
        >
          <div className="group/audiovisual-floating-window relative flex h-full w-full items-center justify-center rounded-[8px]">
            <div className="absolute left-0 top-0 -z-10 flex h-full w-full items-center overflow-hidden rounded-[8px] after:absolute after:left-0 after:top-0 after:block after:h-full after:w-full after:bg-[var(--fg-widget)] after:content-['']">
              {localUser && <RealtimeAvatar draggable="false" userId={localUser.user_id} size={boxWidth} rounded={false} className="blur-[10px]" />}
            </div>
            <div className="absolute left-[8px] top-[8px] flex w-full translate-y-[-5px] flex-col text-[14px] text-[var(--fg-white-1)] opacity-0 transition group-hover/audiovisual-floating-window:translate-y-0 group-hover/audiovisual-floating-window:opacity-100">
              <div className="w-[calc(100%-16px)] truncate">{guild?.name}</div>
              <span className="flex w-full items-center text-[12px]">
                <iconpark-icon name="Sound" color="var(--fg-white-1)" size={16} class="mr-[4px]"></iconpark-icon>
                <div className="w-[calc(100%-40px)] truncate">{channel?.name}</div>
              </span>
            </div>
            {localUser && <RealtimeAvatar draggable="false" userId={localUser.user_id} size={50} className="rounded-full" />}
            <div className="absolute bottom-[8px] left-[8px] w-full translate-y-[5px] opacity-0 transition group-hover/audiovisual-floating-window:translate-y-0 group-hover/audiovisual-floating-window:opacity-100">
              <span className="flex w-full items-center text-[14px] text-[var(--fg-white-1)]">
                {localUser && <RealtimeNickname className="max-w-[calc(100%-64px)] truncate" userId={localUser.user_id}></RealtimeNickname>}
                {(manager?.audioBan || manager?.audioMuted) && (
                  <iconpark-icon name="Audio-Muted" color="var(--fg-b60)" size={16} class="ml-[4px]"></iconpark-icon>
                )}
              </span>
            </div>
          </div>
        </div>
      </Draggable>
      <div ref={audioWrapperRef}></div>
    </Portal>
  )
}
export default AudiovisualFloatingWindow
