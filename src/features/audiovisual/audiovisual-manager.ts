import EventEmitter from 'eventemitter3'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { differenceWith, isEqual, isNil, unionWith } from 'lodash-es'
import {
  AudiovisualOptions,
  AudiovisualView,
  RoomManagerState,
  createMemberId,
  type AudiovisualProvider,
} from '../../base_services/audiovisual-provider'
import { getSuperProperties } from '../../base_services/properties'
import { AudiovisualPermission, PermissionService } from '../../services/PermissionService'
import StateUtils from '../../utils/StateUtils'
import GuildUtils from '../guild_list/GuildUtils'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import {
  ApplyMediaType,
  addApply,
  agreeApply,
  applyAllBan,
  applyBan,
  applyEnableMedia,
  applyLists,
  briefMemberList,
  cancelApply,
  cancelEnableMedia,
  cancelUserTop,
  detailMemberList,
  getToken,
  ignoreApply,
  kickOut,
  makeUserTop,
  mediaRoomJoin,
  mediaRoomLeave,
  mediaStateUpdate,
} from './audiovisual-api'
import { AudiovisualUserInfo, AudiovisualVoiceControl, JoinStatus, MemberItem } from './audiovisual-entity'
import { handleMemberInfo } from './audiovisual-util'

/// - 最大推流数
const MAX_PUBLISHERS = 10

export enum AudiovisualManagerEvent {
  RoomOwnerChange = 'roomOwnerChange',
  VolumeChange = 'volumeChange',
  MemberChange = 'memberChange',
  ApplyChange = 'applyChange',
  MemberExtraChange = 'memberExtraChange',
  StreamChange = 'streamChange',
  MediaStateChange = 'mediaStateChange',
  JoinStatusChange = 'joinStatusChange',
}

export interface MediaState {
  audioBan?: boolean
  videoBan?: boolean
  audioMuted?: boolean
  videoMuted?: boolean
}

export interface AudiovisualStream extends MediaStream {
  remoteCameraState?: boolean
  remoteMicState?: boolean
}

export interface AudiovisualUserExtraInfo {
  rotationAngle?: number
  soundLevel?: number
}

export type AudiovisualMemberInfo = AudiovisualUserInfo & AudiovisualUserExtraInfo

export const DefaultMemberExtraInfo: AudiovisualUserExtraInfo = {
  rotationAngle: 0,
  soundLevel: 0,
}

export interface AudiovisualApplyInfo {
  type: ApplyMediaType
  member: AudiovisualUserInfo
}

export class AudiovisualManager extends EventEmitter {
  audiovisualProvider: AudiovisualProvider | null = null
  guildId: string
  channelId: string
  roomId: string
  memberId = ''
  userId = ''
  _deviceId = ''

  get deviceId() {
    return this._deviceId.slice(this.userId.length + 2 - 64)
  }

  tempAdminUserId = ''
  voiceControl = false

  camera = false
  microphone = false
  screenSharing = false

  localStream?: MediaStream | null = null

  videoCodec = 'H264'

  audioBan = true
  videoBan = true
  audioMuted = true
  videoMuted = true

  volume = 50

  briefMembers: AudiovisualUserInfo[] = []
  detailMembers: AudiovisualUserInfo[] = []
  applyList: AudiovisualApplyInfo[] = []
  memberExtraInfos: Record<string, AudiovisualUserExtraInfo> = {}
  memberStream = new Map<string, AudiovisualStream>()

  joinStatus: JoinStatus = JoinStatus.unJoined

  constructor(guildId: string, channelId: string) {
    super()
    this.guildId = guildId
    this.channelId = channelId
    this.roomId = channelId
    if (guildId && channelId) {
      const guild = GuildUtils.getGuildById(guildId)
      const channel = GuildUtils.getChannelById(guildId, channelId)
      const userId = StateUtils.localUser?.user_id
      if (guild && channel && userId) {
        const permission = PermissionService.computeChannelPermissions(guild, channel.channel_id, userId)
        this.audioBan = !permission.has(AudiovisualPermission.Speak)
        this.videoBan = !permission.has(AudiovisualPermission.Camera)
      }
    }
  }

  async destroy() {
    this.videoMuted = true
    this.audioMuted = true
    try {
      await this.changeLocalStream()
    } catch (e) {
      console.log('%c [ 🚀 ~ e ] -66-「audiovisual-manager.ts」', 'font-size:14px; background:#b55cc0; color:#f9a0ff;', e)
    }
    try {
      await this.leaveRoom()
    } catch (e) {
      console.log('%c [ 🚀 ~ e ] -66-「audiovisual-manager.ts」', 'font-size:14px; background:#b55cc0; color:#f9a0ff;', e)
    }
  }

  async getBriefMemberList() {
    this.briefMembers = await briefMemberList({ guildId: this.guildId, channelId: this.channelId })
    return this.briefMembers
  }

  addBriefMember(member: AudiovisualUserInfo) {
    this.briefMembers = unionWith(this.briefMembers, [member], isEqual)
  }

  removeBriefMember(member: AudiovisualUserInfo) {
    this.briefMembers = differenceWith(this.briefMembers, [member], isEqual)
  }

  _clearMemberExtraInfo() {
    const memberIds = this.detailMembers.map(item => createMemberId(item.userId, item.deviceId))
    const extraMemberIds = Object.keys(this.memberExtraInfos)
    for (const memberId of extraMemberIds) {
      if (!memberIds.includes(memberId)) {
        delete this.memberExtraInfos[memberId]
      }
    }
  }

  _updateMemberExtraInfoByMemberId(memberId: string, info: Partial<AudiovisualUserExtraInfo>) {
    const prevInfo = this.memberExtraInfos[memberId] || DefaultMemberExtraInfo
    this.memberExtraInfos = { ...this.memberExtraInfos, [memberId]: { ...prevInfo, ...info } }
  }

  updateMemberExtraInfoByMemberId(memberId: string, info: Partial<AudiovisualUserExtraInfo>) {
    this._updateMemberExtraInfoByMemberId(memberId, info)
    this.emit(AudiovisualManagerEvent.MemberExtraChange)
  }

  changeMediaState(state: MediaState, members?: MemberItem[]) {
    if (members && !members.find(member => this.memberId === createMemberId(member.user_id, member.device_id))) {
      return false
    }
    const { audioBan, videoBan, audioMuted, videoMuted } = state
    const prevAudioMuted = this.audioMuted
    const prevVideoMuted = this.videoMuted
    this.audioBan = audioBan ?? this.audioBan
    this.videoBan = videoBan ?? this.videoBan
    this.audioMuted = audioMuted ?? this.audioMuted
    this.videoMuted = videoMuted ?? this.videoMuted
    if (prevAudioMuted !== this.audioMuted || prevVideoMuted !== this.videoMuted) {
      if (!prevVideoMuted) {
        this.cancelEnableMedia(ApplyMediaType.video)
      }
      if (!prevVideoMuted) {
        this.cancelEnableMedia(ApplyMediaType.audio)
      }
      this.changeLocalStream()
    } else {
      this.emit(AudiovisualManagerEvent.MediaStateChange)
    }
    return true
  }

  _detailPromise?: Promise<AudiovisualMemberInfo[]> | null

  getDetailMemberList() {
    if (this._detailPromise) {
      return this._detailPromise
    }
    this._detailPromise = new Promise(resolve => {
      detailMemberList({ guildId: this.guildId, channelId: this.channelId }).then(result => {
        this.detailMembers = result
        this._clearMemberExtraInfo()
        sortMembers(this.detailMembers)
        this.emit(AudiovisualManagerEvent.MemberChange)
        resolve(this.detailMembers)
        this._detailPromise = null
      })
    })
    return this._detailPromise
  }

  addDetailMember(member: MemberItem[]) {
    this.detailMembers = unionWith(
      member.map(item => handleMemberInfo(item)),
      this.detailMembers,
      (prev, next) => prev.userId === next.userId && prev.deviceId === next.deviceId
    )
    this._clearMemberExtraInfo()
    sortMembers(this.detailMembers)
    this.emit(AudiovisualManagerEvent.MemberChange)
  }

  updateDetailMember(member: MemberItem) {
    const nextMember = handleMemberInfo(member)
    const prevMember = this.detailMembers.find(item => item.userId === nextMember.userId && item.deviceId === nextMember.deviceId)
    prevMember && Object.assign(prevMember, nextMember)
    this.detailMembers = [...this.detailMembers]
    sortMembers(this.detailMembers)
    this.emit(AudiovisualManagerEvent.MemberChange)
  }

  removeDetailMember(member: MemberItem[]) {
    const handleMember = member.map(item => handleMemberInfo(item))
    this.detailMembers = differenceWith(
      this.detailMembers,
      handleMember,
      (prev, next) => prev.userId === next.userId && prev.deviceId === next.deviceId
    )
    this.removeApplyItem(
      handleMember
        .map(member => [
          { type: ApplyMediaType.audio, member },
          { type: ApplyMediaType.video, member },
        ])
        .flat()
    )
    sortMembers(this.detailMembers)
    this._clearMemberExtraInfo()
    this.emit(AudiovisualManagerEvent.MemberChange)
  }

  _applyPromise?: Promise<AudiovisualApplyInfo[]> | null

  getApplyList() {
    if (this._applyPromise) {
      return this._applyPromise
    }
    this._applyPromise = new Promise(resolve => {
      Promise.all([
        applyLists({ channelId: this.channelId, type: ApplyMediaType.audio }),
        applyLists({ channelId: this.channelId, type: ApplyMediaType.video }),
      ]).then(([audioApplyList, videoApplyList]) => {
        this.applyList = sortApplyList(
          [
            ...videoApplyList.map(member => ({
              type: ApplyMediaType.video,
              member,
            })),
            ...audioApplyList.map(member => ({
              type: ApplyMediaType.audio,
              member,
            })),
          ],
          this.deviceId
        )
        this.emit(AudiovisualManagerEvent.ApplyChange)
        resolve(this.applyList)
      })
    })
    return this._applyPromise
  }

  addApplyItemByType(member: MemberItem[], type: ApplyMediaType) {
    this.applyList = unionWith(
      member.map(item => ({
        type,
        member: handleMemberInfo(item),
      })),
      this.applyList,
      ({ type: prevType, member: prev }, { type: nextType, member: next }) =>
        prevType === nextType && prev.userId === next.userId && prev.deviceId === next.deviceId
    )
    this.emit(AudiovisualManagerEvent.ApplyChange)
  }

  removeApplyItem(member: AudiovisualApplyInfo[]) {
    this.applyList = differenceWith(
      this.applyList,
      member,
      ({ type: prevType, member: prev }, { type: nextType, member: next }) =>
        prevType === nextType && prev.userId === next.userId && prev.deviceId === next.deviceId
    )
    this.emit(AudiovisualManagerEvent.ApplyChange)
  }

  removeApplyItemByType(member: MemberItem[], type: ApplyMediaType) {
    this.removeApplyItem(
      member.map(item => ({
        type,
        member: handleMemberInfo(item),
      }))
    )
  }

  async _createStream(streamIds: string[]) {
    for (const streamId of streamIds) {
      const prevStream = this.memberStream.get(streamId)
      if (prevStream) {
        this.audiovisualProvider?.stopPullStream(streamId)
        this.memberStream.delete(streamId)
      }
      try {
        const stream = (await this.audiovisualProvider?.startPullStream(streamId)) as AudiovisualStream
        if (stream) {
          this.memberStream.set(streamId, stream)
        }
      } catch (e) {
        console.log(e)
      }
    }
    this.emit(AudiovisualManagerEvent.StreamChange)
    this.toggleSoundLevelMonitor()
  }

  async joinRoom() {
    if (this.joinStatus !== JoinStatus.unJoined) {
      return
    }
    // if (joined.value == JoinStatus.joining || joined.value == JoinStatus.joined)
    //   return;
    this.changeJoinStatus(JoinStatus.joining)

    this.userId = LocalUserInfo.userId
    const superProperties = getSuperProperties()
    this._deviceId = superProperties.device_id
    this.memberId = createMemberId(this.userId, this.deviceId)
    try {
      // 1、先调用后台加入房间接口
      const { room_id, voice_owner, voice_control } = await mediaRoomJoin(this.channelId, this.deviceId)

      this.roomId = room_id
      if (voice_owner) {
        this.tempAdminUserId = voice_owner
        if (this.tempAdminUserId === this.userId) {
          this.videoBan = false
          this.audioBan = false
          this.cancelApply({ mic: true, camera: true })
          this.emit(AudiovisualManagerEvent.RoomOwnerChange)
        }
      }
      if (!isNaN(voice_control)) {
        this.voiceControl = voice_control !== AudiovisualVoiceControl.None
      }
      const addMemberIfNotExists = () => {
        if (!this.detailMembers.some(member => createMemberId(member.userId, member.deviceId) === this.memberId)) {
          this.addDetailMember([
            {
              user_id: this.userId,
              device_id: this.deviceId,
              client_id: '',
              joined_at: Date.now(),
              platform: superProperties.platform,
            },
          ])
        }
      }
      if (this.detailMembers.length === 0) {
        this.getDetailMemberList().then(addMemberIfNotExists)
      } else {
        addMemberIfNotExists()
      }
    } catch (err) {
      console.log('joinVideoRoom api resultError', err)
      this.changeJoinStatus(JoinStatus.unJoined)
      FbToast.open({ type: 'error', content: '加入音视频频道失败', key: 'audiovisual-join-fail' })
      throw err
    }
    const { AudiovisualProvider: AudiovisualProviderAsync } = await import('../../base_services/audiovisual-provider/zego/audiovisual-provider')
    // TODO user_id加唯一值
    this.audiovisualProvider = AudiovisualProviderAsync.init(
      {
        userId: this.userId,
        nickName: StateUtils.localUser.nickname,
        channelId: this.channelId,
        deviceId: this.deviceId,
        muted: true,
        enableCamera: false,
        enableTextRoom: false,
        publishers: MAX_PUBLISHERS,
        guildId: this.guildId,
        roomId: this.roomId,
        // ban: !hasSpeakPermission(),
        // videoBan: hasPushVideoPermission(),
        // enableCamera: enableVideo.value,
        // muted: !(muted.value == MicrophoneType.noMute))
      },
      {
        getToken: async () => {
          const result = await getToken(`${this.deviceId}`)
          const { token } = result
          return token
        },
        callback: async (state, data) => {
          switch (state) {
            case RoomManagerState.StreamAdd: {
              const streamIds = (data as { streamID: string; user: { userID: string } }[]).map(({ streamID }) => streamID)
              this._createStream(streamIds)
              break
            }
            case RoomManagerState.StreamDelete: {
              for (const {
                streamID,
                user: { userID },
              } of data as { streamID: string; user: { userID: string } }[]) {
                try {
                  if (userID === this.memberId) {
                    continue
                  }
                  this.audiovisualProvider?.stopPullStream(streamID)
                  this.memberStream.delete(streamID)
                } catch (e) {
                  console.log(e)
                }
              }
              this.emit(AudiovisualManagerEvent.StreamChange)
              this.toggleSoundLevelMonitor()
              break
            }
            case RoomManagerState.RemoteSoundLevelUpdate: {
              for (const { soundLevel, streamID } of data as { soundLevel: number; streamID: string }[]) {
                this._updateMemberExtraInfoByMemberId(streamID, { soundLevel })
              }
              this.emit(AudiovisualManagerEvent.MemberExtraChange)
              break
            }
            case RoomManagerState.RemoteCameraOpen: {
              const { streamId } = data as { streamId: string }
              const currentStream = this.memberStream.get(streamId)
              if (!currentStream) {
                return
              }
              if (isNil(currentStream.remoteCameraState)) {
                currentStream.remoteCameraState = true
                return
              }
              this._createStream([streamId])
              break
            }
            case RoomManagerState.RemoteMicOpen: {
              const { streamId } = data as { streamId: string }
              const currentStream = this.memberStream.get(streamId)
              if (!currentStream) {
                return
              }
              if (isNil(currentStream.remoteMicState)) {
                currentStream.remoteMicState = true
                return
              }
              this._createStream([streamId])
              break
            }
            case RoomManagerState.RemoteCameraMute: {
              const { streamId } = data as { streamId: string }
              if (!streamId) {
                return
              }
              const currentStream = this.memberStream.get(streamId)
              if (!currentStream) {
                return
              }
              currentStream.remoteCameraState = false
              break
            }
            case RoomManagerState.RemoteMicMute: {
              const { streamId } = data as { streamId: string }
              if (!streamId) {
                return
              }
              const currentStream = this.memberStream.get(streamId)
              if (!currentStream) {
                return
              }
              currentStream.remoteMicState = false
              break
            }
            default:
              break
          }
        },
      }
    )
    try {
      await this.audiovisualProvider?.loginRoom()
      this.changeJoinStatus(JoinStatus.joined)
    } catch (err) {
      this.changeJoinStatus(JoinStatus.unJoined)
      FbToast.open({ type: 'error', content: '加入音视频频道失败', key: 'audiovisual-join-fail' })
      throw err
    }
    await this.checkSystemRequirements()
  }

  async leaveRoom() {
    if (this.joinStatus === JoinStatus.unJoined) {
      return
    }
    await this.cancelApply({ mic: true, camera: true })
    await this.cancelEnableMedia(ApplyMediaType.video)
    await this.cancelEnableMedia(ApplyMediaType.audio)
    try {
      this.audiovisualProvider?.logoutRoom()
    } catch (e) {
      console.log('logoutRoom api resultError', e)
      this.changeJoinStatus(JoinStatus.unJoined)
    }
    try {
      await mediaRoomLeave(this.channelId, this.deviceId)
    } catch (e) {
      console.log('leaveVideoRoom api resultError', e)
      this.changeJoinStatus(JoinStatus.unJoined)
    }
    const { AudiovisualProvider: AudiovisualProviderAsync } = await import('../../base_services/audiovisual-provider/zego/audiovisual-provider')
    AudiovisualProviderAsync.destroy()
    this.changeJoinStatus(JoinStatus.unJoined)
  }

  createView(mediaStream: MediaStream, content: HTMLElement, options: AudiovisualOptions) {
    const player = this.audiovisualProvider?.createCanvasView(mediaStream, options)
    player?.play(content)
    return player
  }

  destroyView(player: AudiovisualView) {
    this.audiovisualProvider?.destroyCanvasView(player)
  }

  setVolume(volume: number) {
    this.volume = volume
    this.emit(AudiovisualManagerEvent.VolumeChange)
  }

  async changeLocalStream() {
    const notification = async () => {
      this.emit(AudiovisualManagerEvent.StreamChange)
      this.emit(AudiovisualManagerEvent.MediaStateChange)
      this.toggleSoundLevelMonitor()
      await mediaStateUpdate({
        guildId: this.guildId,
        channelId: this.channelId,
        mic: !this.audioMuted,
        camera: !this.videoMuted,
        cameraStreamId: this.memberId,
        deviceId: this.deviceId,
      })
    }
    if (this.videoMuted && this.audioMuted) {
      if (this.localStream) {
        this.audiovisualProvider?.stopPushStream(this.memberId)
        this.audiovisualProvider?.stopPreview(this.localStream)
        this.localStream = null
        this.memberStream.delete(this.memberId)
        await notification()
      }
      return
    }
    const prevStream = this.localStream
    this.localStream = await this.audiovisualProvider?.startPreview({
      audio: !this.audioMuted,
      video: !this.videoMuted,
    })
    if (prevStream) {
      this.audiovisualProvider?.stopPushStream(this.memberId)
      this.audiovisualProvider?.stopPreview(prevStream)
    }
    if (this.localStream) {
      this.audiovisualProvider?.startPushStream(this.memberId, this.localStream, this.videoCodec)
      // const superProperties = getSuperProperties()
      await this.audiovisualProvider?.setStreamExtraInfo(
        this.memberId,
        JSON.stringify({
          muted: this.audioMuted,
          enableCamera: !this.videoMuted,
          // FIXME 兼容客户端未处理 Web 标识 需要处理
          platform: 'PC', // superProperties.platform,
        })
      )
      this.memberStream.set(this.memberId, this.localStream as AudiovisualStream)
      await notification()
    }
  }

  changeJoinStatus(status: JoinStatus) {
    this.joinStatus = status
    this.emit(AudiovisualManagerEvent.JoinStatusChange)
  }

  toggleCamera() {
    if (!this.videoMuted) {
      this.cancelEnableMedia(ApplyMediaType.video)
    }
    this.videoMuted = !this.videoMuted

    this.changeLocalStream()
  }

  toggleMicrophone() {
    if (!this.audioMuted) {
      this.cancelEnableMedia(ApplyMediaType.audio)
    }
    this.audioMuted = !this.audioMuted
    this.changeLocalStream()
  }

  async checkSystemRequirements() {
    const systemRequirements = await this.audiovisualProvider?.checkSystemRequirements()
    if (systemRequirements) {
      this.camera = systemRequirements.camera ?? false
      this.microphone = systemRequirements.microphone ?? false
      this.screenSharing = systemRequirements.screenSharing ?? false
      this.videoCodec =
        !systemRequirements.videoCodec ? 'H264'
        : systemRequirements.videoCodec.H264 ? 'H264'
        : 'VP8'
    }
  }

  async checkMicrophone() {
    const systemRequirements = await this.audiovisualProvider?.checkSystemRequirements('microphone')
    const prev = this.microphone
    if (systemRequirements) {
      this.microphone = systemRequirements.result ?? this.microphone
      if (prev !== this.microphone && !this.microphone) {
        this.emit(AudiovisualManagerEvent.MediaStateChange)
      }
    }
  }

  async checkCamera() {
    const systemRequirements = await this.audiovisualProvider?.checkSystemRequirements('camera')
    const prev = this.camera
    if (systemRequirements) {
      this.camera = systemRequirements.result ?? this.camera
      if (prev !== this.camera && !this.camera) {
        this.emit(AudiovisualManagerEvent.MediaStateChange)
      }
    }
  }

  hasApply(type?: ApplyMediaType) {
    return this.applyList.some(
      item => (type ? item.type === type : true) && createMemberId(item.member.userId, item.member.deviceId) === this.memberId
    )
  }

  toggleSoundLevelMonitor() {
    if (this.memberStream.size > 0) {
      this.audiovisualProvider?.startSoundLevelMonitor()
    } else {
      this.audiovisualProvider?.stopSoundLevelMonitor()
    }
  }

  changeRoomOwner(users: MemberItem[]) {
    const localUser = StateUtils.localUser
    if (users.length === 0) {
      this.tempAdminUserId = ''
      this.voiceControl = false
    } else {
      const [member] = users
      this.tempAdminUserId = member.user_id
      this.voiceControl = true
      if (this.tempAdminUserId === localUser?.user_id) {
        this.changeMediaState({ audioBan: false, videoBan: false })
        this.cancelApply({ mic: true, camera: true })
      }
    }
    this.emit(AudiovisualManagerEvent.RoomOwnerChange)
  }

  async toggleStick(options: { targetDeviceId: string; targetUserId: string }, stick: boolean) {
    stick ?
      await makeUserTop({ ...options, deviceId: this.deviceId, channelId: this.channelId })
    : await cancelUserTop({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }

  async toggleBan(options: { targetDeviceId: string; targetUserId: string; banMic?: boolean; banCamera?: boolean }) {
    await applyBan({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }

  async toggleBanAll(ban: boolean) {
    await applyAllBan({ banMic: ban, banCamera: ban, deviceId: this.deviceId, channelId: this.channelId })
  }

  async kickOut(options: { targetDeviceId: string; targetUserId: string }) {
    await kickOut({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }

  async applyEnableMedia(type: ApplyMediaType) {
    await applyEnableMedia(this.channelId, this.deviceId, type)
  }

  async cancelEnableMedia(type: ApplyMediaType) {
    await cancelEnableMedia(this.channelId, this.deviceId, type)
  }

  async addApply(options: { mic?: boolean; camera?: boolean }) {
    await addApply({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }

  async cancelApply(options: { mic?: boolean; camera?: boolean }) {
    await cancelApply({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }

  async agreeApply(options: { targetDeviceId: string; targetUserId: string; mic?: boolean; camera?: boolean }) {
    await agreeApply({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }

  async ignoreApply(options: { targetDeviceId: string; targetUserId: string; mic?: boolean; camera?: boolean }) {
    await ignoreApply({ ...options, deviceId: this.deviceId, channelId: this.channelId })
  }
}

function sortMembers(members: AudiovisualMemberInfo[]) {
  members.sort((prev, next) => getStateLevel(next) - getStateLevel(prev))
}

function getStateLevel(member: AudiovisualMemberInfo) {
  let level = 0
  const { stick, isPlayingScreenShare, enableCamera, muted } = member
  if (stick) level |= 1 << 4
  if (isPlayingScreenShare) level |= 1 << 3
  if (enableCamera) level |= 1 << 2
  if (!muted) level |= 1 << 1
  return level
}

function sortApplyList(list: AudiovisualApplyInfo[], deviceId: string) {
  if (list.length === 0) {
    return []
  }
  const curMember: AudiovisualApplyInfo[] = []
  let isSendApply = false
  const tempUsers: AudiovisualApplyInfo[] = []
  for (const item of list) {
    const user = item.member
    if (user.userId === StateUtils.localUser?.user_id && user.deviceId === deviceId) {
      isSendApply = true
      curMember.push(item)
    } else {
      tempUsers.push(item)
    }
  }
  // 按申请时间排序
  tempUsers.sort((a, b) => {
    const aIdentifier = a.member.joined ?? 0
    const bIdentifier = b.member.joined ?? 0
    return bIdentifier - aIdentifier
  })

  if (isSendApply) {
    // 将自己排在最前面
    return [...curMember, ...tempUsers]
  } else {
    return tempUsers
  }
}
