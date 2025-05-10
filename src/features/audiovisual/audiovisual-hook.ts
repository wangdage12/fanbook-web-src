import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { BusinessError } from '../../base_services/interceptors/response_interceptor'
import usePermissions from '../../base_services/permission/usePermissions'
import { AudiovisualPermission, ChannelPermission, GuildPermission } from '../../services/PermissionService'
import StateUtils from '../../utils/StateUtils'
import Benefit from '../guild_level/Benefit'
import useLevelBenefit from '../guild_level/useLevelBenefit'
import GuildUtils from '../guild_list/GuildUtils'
import { ApplyMediaType } from './audiovisual-api'
import { JoinStatus } from './audiovisual-entity'
import { AudiovisualManager, AudiovisualManagerEvent } from './audiovisual-manager'
import { leaveRoom } from './audiovisual-slice'
import { WsHandlerParams, audiovisualWsHandler } from './audiovisual-ws'

export const managerInstanceMap = new Map<string, AudiovisualManager>()

export let globalAudiovisualManager: AudiovisualManager | null = null

export function useManager(guildId?: string, channelId?: string, global = false) {
  const manager = useContext(AudiovisualContext)
  const instance = useMemo(() => {
    if (!guildId || !channelId) {
      return
    }
    return new AudiovisualManager(guildId, channelId)
  }, [guildId, channelId])

  useEffect(() => {
    return () => {
      instance?.destroy()
    }
  }, [guildId, channelId])

  useEffect(() => {
    if (global) {
      globalAudiovisualManager = (instance || manager) ?? null
    }
  }, [instance, manager, global])

  return instance || manager
}

export function useWsService(
  handlers: WsHandlerParams,
  { guildId, channelId }: { guildId?: string; channelId?: string },
  deps?: React.DependencyList
) {
  useEffect(() => {
    const clear = audiovisualWsHandler(handlers, guildId, channelId)
    return () => {
      clear()
    }
  }, deps)
}

export function useControl(manager?: AudiovisualManager, currentGuildId?: string, currentChannelId?: string) {
  const dispatch = useAppDispatch()
  const [audioBan, setAudioBan] = useState(true)
  const [joinStatus, setJoinStatus] = useState(JoinStatus.unJoined)
  const [audioMuted, setAudioMuted] = useState(true)
  const [videoBan, setVideoBan] = useState(true)
  const [videoMuted, setVideoMuted] = useState(true)

  const levelLimit = !useLevelBenefit(Benefit.videoSupport, manager?.guildId ?? '')

  const hasMutePermission = useMutePermissions(manager)

  const permission = usePermissions({
    guildId: currentGuildId,
    channelId: currentChannelId,
    permission: AudiovisualPermission.Speak | AudiovisualPermission.Camera,
  })

  const handleAudio = useCallback(async () => {
    if (manager?.joinStatus === JoinStatus.joining) {
      return
    }
    await manager?.checkMicrophone()
    if (!manager?.microphone) {
      FbToast.open({ content: '请检麦克风和权限是否可用', key: 'microphone' })
      return
    }
    if (manager.audioBan && !hasMutePermission) {
      if (!permission.has(AudiovisualPermission.Speak)) {
        FbToast.open({ content: '暂无语音权限，请联系管理员开启权限', key: 'microphone' })
        return
      }
      // 判断是否已经申请
      if (manager.hasApply(ApplyMediaType.audio)) {
        FbToast.open({ content: '你已向管理员申请开麦，请耐心等待', key: 'microphone' })
        return
      }
      showFbModal({
        title: '你正在禁麦状态，是否向频道中的管理员申请发言？',
        closable: false,
        onOk: async () => {
          await manager?.addApply({ mic: true })
        },
      })

      return
    }

    try {
      await manager.applyEnableMedia(ApplyMediaType.audio)
    } catch (err) {
      if (err instanceof BusinessError) {
        err.desc && FbToast.open({ content: err.desc || '开麦请求失败', key: 'microphone' })
        return
      }
      FbToast.open({ content: '开麦请求失败', key: 'microphone' })
      return
    }

    if (manager.audioBan && hasMutePermission) {
      manager?.changeMediaState({ audioBan: false })
    }
    manager.toggleMicrophone()
  }, [manager, permission])

  const handleVideo = useCallback(async () => {
    if (manager?.joinStatus === JoinStatus.joining) {
      return
    }
    if (levelLimit) {
      return
    }
    await manager?.checkCamera()
    if (!manager?.camera) {
      FbToast.open({ content: '请检查摄像头和权限是否可用', key: 'camera' })
      return
    }
    if (manager.videoBan && !hasMutePermission) {
      if (!permission.has(AudiovisualPermission.Camera)) {
        FbToast.open({ content: '暂无视频权限，请联系管理员开启权限', key: 'camera' })
        return
      }

      // 判断是否已经申请
      if (manager.hasApply(ApplyMediaType.video)) {
        FbToast.open({ content: '你已向管理员申请开启视频，请耐心等待', key: 'camera' })
        return
      }
      showFbModal({
        title: '你正在禁视频状态，是否向频道中的管理员申请开启？',
        closable: false,
        onOk: async () => {
          await manager?.addApply({ camera: true })
        },
      })

      return
    }

    try {
      await manager.applyEnableMedia(ApplyMediaType.video)
    } catch (err) {
      if (err instanceof BusinessError) {
        err.desc && FbToast.open({ content: err.desc || '开启视频请求失败', key: 'camera' })
        return
      }
      FbToast.open({ content: '开启视频请求失败', key: 'camera' })
      return
    }

    if (manager.audioBan && hasMutePermission) {
      manager?.changeMediaState({ videoBan: false })
    }
    manager?.toggleCamera()
  }, [manager, permission])

  const handleHandUp = useCallback(async () => {
    if (manager?.joinStatus === JoinStatus.joining) {
      return
    }
    await manager?.destroy()
    dispatch(leaveRoom())
    if (currentGuildId === manager?.guildId && currentChannelId === manager?.channelId) {
      const currentGuild = currentGuildId && GuildUtils.getGuildById(currentGuildId)
      if (currentGuild) {
        const firstChannel = GuildUtils.getFirstAccessibleTextChannel(currentGuild.guild_id)
        firstChannel && GuildUtils.selectChannel(firstChannel)
      }
    }
  }, [currentGuildId, currentChannelId, manager])

  const mediaStateChangeHandler = useCallback(() => {
    if (manager) {
      setAudioMuted(manager.audioMuted)
      setVideoMuted(manager.videoMuted)
      setAudioBan(manager.audioBan)
      setVideoBan(manager.videoBan)
    }
  }, [manager])

  const joinStatusChangeHandler = useCallback(() => {
    if (manager) {
      setJoinStatus(manager.joinStatus)
    }
  }, [manager])

  useEffect(() => {
    mediaStateChangeHandler()
    manager?.on(AudiovisualManagerEvent.MediaStateChange, mediaStateChangeHandler)
    manager?.on(AudiovisualManagerEvent.JoinStatusChange, joinStatusChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.MediaStateChange, mediaStateChangeHandler)
      manager?.off(AudiovisualManagerEvent.JoinStatusChange, joinStatusChangeHandler)
    }
  }, [manager])
  return { handleAudio, handleHandUp, handleVideo, joinStatus, audioBan, videoBan, audioMuted, videoMuted, levelLimit }
}

/**
 * 控场权限
 */
export function useMutePermissions(manager?: AudiovisualManager) {
  const [tempAdminUserId, setTempAdminUserId] = useState('')
  const permission = usePermissions({
    guildId: manager?.guildId,
    channelId: manager?.channelId,
    permission: GuildPermission.ManageChannels | ChannelPermission.ChannelManager | AudiovisualPermission.MuteMembers,
  })
  const hasPermission = useMemo(() => {
    if (permission.any(GuildPermission.ManageChannels | ChannelPermission.ChannelManager)) {
      return true
    }
    if (!manager?.voiceControl) {
      return permission.has(AudiovisualPermission.MuteMembers)
    }
    return tempAdminUserId === StateUtils.localUser?.user_id
  }, [manager, tempAdminUserId, permission])

  const roomOwnerChangeHandler = useCallback(() => {
    manager && setTempAdminUserId(manager.tempAdminUserId)
  }, [])

  useEffect(() => {
    roomOwnerChangeHandler()
    manager?.on(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.MemberChange, roomOwnerChangeHandler)
    }
  }, [manager])
  return hasPermission
}

export const AudiovisualContext = createContext<AudiovisualManager | undefined>(undefined)
