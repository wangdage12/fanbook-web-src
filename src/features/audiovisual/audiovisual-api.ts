import axios from 'axios'
import { isEmpty, isNil } from 'lodash-es'
import { createMemberId } from '../../base_services/audiovisual-provider'
import { getSuperProperties } from '../../base_services/properties'
import { FbHttpResponse } from '../../types'
import { AudiovisualUserInfo, AudiovisualVoiceControl, MemberItem } from './audiovisual-entity'
import { handleMemberInfo } from './audiovisual-util'

interface getTokenResponse {
  app_id: string
  token: string
  expire: number
}

export async function getToken(deviceId: string) {
  return axios.post<undefined, getTokenResponse>('/api/zego/authorization', {
    device_id: deviceId,
  })
}

interface DetailMemberResponse {
  member_count: number // 当前房间成员数
  member_limit: number // 房间人数最大限制
  list: MemberItem[] // 用户列表
}

// 房间成员详细信息列表
export async function detailMemberList({ channelId, guildId }: { channelId: string; guildId: string }): Promise<AudiovisualUserInfo[]> {
  const result = await axios.post<undefined, DetailMemberResponse>('/api/ama-room/member/list', {
    channel_id: channelId,
    guild_id: guildId,
  })
  const list: AudiovisualUserInfo[] = result.list.map(item => handleMemberInfo(item))
  return list
}

interface BriefMemberResponse {
  member_count: number // 当前房间成员数
  member_limit: number // 房间人数最大限制
  list: (Pick<MemberItem, 'user_id' | 'device_id'> & { member_id: string })[] // 用户列表
}

// 房间成员简要信息列表
export async function briefMemberList({ channelId, guildId }: { channelId: string; guildId: string }): Promise<AudiovisualUserInfo[]> {
  const result = await axios.post<undefined, BriefMemberResponse>('/api/ama-room/member-id/list', {
    channel_id: channelId,
    guild_id: guildId,
  })

  const list: AudiovisualUserInfo[] = result.list.map(item => ({
    userId: item.user_id ?? '',
    deviceId: item.device_id ?? '',
  }))

  return list
}

// 申请发言（举手）
export async function addApply({
  deviceId,
  channelId,
  mic = false,
  camera = false,
}: {
  deviceId: string
  channelId: string
  mic?: boolean
  camera?: boolean
}): Promise<boolean> {
  const superProperties = getSuperProperties()
  const result = await axios.post<undefined, FbHttpResponse<unknown>>(
    '/api/ama-room/apply',
    {
      channel_id: channelId,
      device_id: deviceId,
      platform: superProperties.platform,
      ...(!mic ? {} : { mic: '1' }),
      ...(!camera ? {} : { camera: '1' }),
    },
    { originResponse: true }
  )
  return result.status
}

// 取消申请
export async function cancelApply({
  deviceId,
  channelId,
  mic = false,
  camera = false,
}: {
  deviceId: string
  channelId: string
  mic?: boolean
  camera?: boolean
}): Promise<boolean> {
  const superProperties = getSuperProperties()
  const result = await axios.post<undefined, FbHttpResponse<unknown>>('/api/ama-room/apply/cancel', {
    channel_id: channelId,
    device_id: deviceId,
    platform: superProperties.platform,
    ...(!mic ? {} : { mic: '1' }),
    ...(!camera ? {} : { camera: '1' }),
  })
  return result.status
}

// 忽略开麦申请
export async function ignoreApply({
  deviceId,
  channelId,
  targetDeviceId,
  targetUserId,
  mic = false,
  camera = false,
}: {
  deviceId: string
  channelId: string
  targetDeviceId: string
  targetUserId: string
  mic?: boolean
  camera?: boolean
}): Promise<boolean> {
  const superProperties = getSuperProperties()
  const result = await axios.post<undefined, FbHttpResponse<unknown>>('/api/ama-room/apply/ignore', {
    channel_id: channelId,
    target_user_id: targetUserId,
    target_device_id: targetDeviceId,
    device_id: deviceId,
    platform: superProperties.platform,
    ...(!mic ? {} : { mic: '1' }),
    ...(!camera ? {} : { camera: '1' }),
  })
  return result.status
}

export async function agreeApply({
  deviceId,
  channelId,
  targetDeviceId,
  targetUserId,
  mic = false,
  camera = false,
}: {
  deviceId: string
  channelId: string
  targetDeviceId: string
  targetUserId: string
  mic?: boolean
  camera?: boolean
}): Promise<boolean> {
  const superProperties = getSuperProperties()
  const result = await axios.post<undefined, FbHttpResponse<unknown>>('/api/ama-room/apply/allow', {
    channel_id: channelId,
    device_id: deviceId,
    target_user_id: targetUserId,
    target_device_id: targetDeviceId,
    platform: superProperties.platform,
    ...(!mic ? {} : { mic: '1' }),
    ...(!camera ? {} : { camera: '1' }),
  })
  return result.status
}

export interface ApplyMember {
  user_id: string
  nickname: string
  username: string
  avatar: string
  gender: string
  roles: string[]
  device_id: string
  client_id: string
  join_at?: number
  joined_at: number
  mute: boolean
  video_active: boolean
  ban: boolean
  ban_camera: boolean
  fbServerMuted: boolean
  updated_at: number
  platform?: string
}

export interface ApplyListsResponse {
  users: ApplyMember[]
}

export async function applyLists({
  channelId,
  type,
  pageNo = 1,
  pageSize = 200,
}: {
  channelId: string
  type: ApplyMediaType
  pageNo?: number
  pageSize?: number
}): Promise<AudiovisualUserInfo[]> {
  const typeMap: Partial<Record<ApplyMediaType, string>> = {
    [ApplyMediaType.video]: 'camera',
    [ApplyMediaType.audio]: 'mic',
  }
  const result = await axios.post<undefined, ApplyListsResponse>('/api/ama-room/apply/list', {
    channel_id: channelId,
    type: typeMap[type],
    page_no: pageNo,
    page_size: pageSize,
  })
  return result.users.map(item => {
    return {
      userId: item.user_id,
      deviceId: item.device_id ?? '',
      platform: isEmpty(item.platform) ? 'Mobile' : item.platform,
      joined: item.join_at ?? item.joined_at ?? 0,
    }
  })
}

export async function applyBan({
  deviceId,
  channelId,
  targetDeviceId,
  targetUserId,
  banMic,
  banCamera,
}: {
  deviceId: string
  channelId: string
  targetDeviceId: string
  targetUserId: string
  banMic?: boolean
  banCamera?: boolean
}): Promise<void> {
  const superProperties = getSuperProperties()
  if (isNil(banMic) && isNil(banCamera)) {
    throw new Error('banMic 和 banCamera 不能同时为空')
  }
  await axios.post('/api/ama-room/ban', {
    channel_id: channelId,
    device_id: deviceId,
    target_user_id: targetUserId,
    target_device_id: targetDeviceId,
    ...(isNil(banMic) ? {} : { ban_mic: banMic ? 1 : 0 }),
    ...(isNil(banCamera) ? {} : { ban_camera: banCamera ? 1 : 0 }),
    platform: superProperties.platform,
  })
}

export async function applyAllBan({
  deviceId,
  channelId,
  banMic,
  banCamera,
}: {
  deviceId: string
  channelId: string
  banMic: boolean
  banCamera: boolean
}): Promise<void> {
  const superProperties = getSuperProperties()
  await axios.post('/api/ama-room/banAll', {
    channel_id: channelId,
    device_id: deviceId,
    ban_mic: banMic ? 1 : 0,
    ban_camera: banCamera ? 1 : 0,
    platform: superProperties.platform,
  })
}

export interface mediaRoomJoinResult {
  member_id: string
  room_id: string
  voice_owner: string
  voice_control: AudiovisualVoiceControl
}

export async function mediaRoomJoin(channelId: string, deviceId: string): Promise<mediaRoomJoinResult> {
  const superProperties = getSuperProperties()
  const result = await axios.post<undefined, mediaRoomJoinResult>('/api/ama-room/join', {
    platform: superProperties.platform,
    channel_id: channelId,
    device_id: deviceId,
  })
  return result
}

export async function mediaRoomLeave(channelId: string, deviceId: string): Promise<void> {
  await axios.post('/api/ama-room/leave', {
    channel_id: channelId,
    device_id: deviceId,
  })
}

export async function mediaStateUpdate({
  deviceId,
  guildId,
  channelId,
  mic,
  camera,
  share,
  ban,
  cameraStreamId,
  screenStreamId,
}: {
  deviceId: string
  guildId: string
  channelId: string
  mic?: boolean
  camera?: boolean
  share?: boolean
  ban?: boolean
  cameraStreamId?: string
  screenStreamId?: string
}): Promise<void> {
  await axios.post('/api/ama-room/media-state-update', {
    guild_id: guildId,
    channel_id: channelId,
    device_id: deviceId,
    mic: mic ? '1' : '0',
    camera: camera ? '1' : '0',
    ban: ban ? '1' : '0',
    share_screen: share ? '1' : '0',
    stream_id: {
      camera: cameraStreamId,
      screen: screenStreamId,
    },
  })
}

export async function kickOut({
  deviceId,
  channelId,
  targetUserId,
  targetDeviceId,
}: {
  deviceId: string
  channelId: string
  targetUserId: string
  targetDeviceId: string
}): Promise<void> {
  const superProperties = getSuperProperties()
  await axios.post('/api/ama-room/kick-out', {
    channel_id: channelId,
    device_id: deviceId,
    target_device_id: targetDeviceId,
    target_user_id: targetUserId,
    platform: superProperties.platform,
  })
}

export async function makeUserTop({
  deviceId,
  channelId,
  targetUserId,
  targetDeviceId,
}: {
  deviceId: string
  channelId: string
  targetUserId: string
  targetDeviceId: string
}): Promise<void> {
  await axios.post('/api/ama-room/member/stick', {
    channel_id: channelId,
    member_id: createMemberId(targetUserId, targetDeviceId),
    device_id: deviceId,
  })
}

export async function cancelUserTop({
  deviceId,
  channelId,
  targetUserId,
  targetDeviceId,
}: {
  deviceId: string
  channelId: string
  targetUserId: string
  targetDeviceId: string
}): Promise<void> {
  await axios.post('/api/ama-room/member/stick/cancel', {
    channel_id: channelId,
    member_id: createMemberId(targetUserId, targetDeviceId),
    device_id: deviceId,
  })
}

export enum ApplyMediaType {
  audio = 'audio',
  video = 'video',
  share = 'share_screen',
}

// 打开前需要请求
export async function applyEnableMedia(channelId: string, deviceId: string, type: ApplyMediaType): Promise<void> {
  await axios.post('/api/ama-room/active/apply', {
    channel_id: channelId,
    device_id: deviceId,
    action: type,
  })
}

export async function cancelEnableMedia(channelId: string, deviceId: string, type: ApplyMediaType): Promise<void> {
  await axios.post('/api/ama-room/active/cancel', {
    channel_id: channelId,
    device_id: deviceId,
    action: type,
  })
}
