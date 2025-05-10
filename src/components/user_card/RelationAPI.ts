import axios from 'axios'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { cachedAxios, mergeRequests } from '../../base_services/http'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import { UserAPI, UserStruct } from '../realtime_components/realtime_nickname/UserAPI'
import { RelationType, RequestType } from './entity'

export interface UserRelationStruct {
  type: RelationType
  guilds: GuildStruct[]
  relations: UserStruct[]
  receive_friend_request: boolean
  black_list: boolean
}

export function getRelation(
  { guildId, relationId }: { relationId: string; guildId?: string },
  options?: {
    cache?: boolean
  }
) {
  return mergeRequests(
    '/api/user/getRelation/:guildId/:relationId',
    (
      { guildId, relationId }: { relationId: string; guildId?: string },
      options?: {
        cache?: boolean
      }
    ): Promise<UserRelationStruct> => {
      const data = {
        user_id: LocalUserInfo.userId,
        relation_id: relationId,
        guild_id: guildId,
      }
      return (options?.cache ? cachedAxios : axios).post<undefined, UserRelationStruct>('/api/user/getRelation', data, {
        id: `/api/user/getRelation?${guildId}&${relationId}`,
      })
    }
  )({ guildId, relationId }, options)
}

interface RelationApiParams {
  userId?: string
  relationId?: string
  size?: number
  validationInfo?: string
  guildId?: string
  channelId?: string
  channelType?: number
  onlyTitle?: boolean
  cardId?: string
  visible?: boolean
  timestamp?: number
  page?: number
  recordId?: string
}

export interface FriendInfo {
  user_id: string // 用户 id
  username?: string // 用户标识
  nickname?: string // 用户昵称
}

// 获取好友列表
export async function getFriendList(userId: string, relationId?: string, size: number = 1000): Promise<FriendInfo[]> {
  const data = await axios.post<undefined, FriendInfo[]>('/api/relation/list', {
    user_id: userId,
    relation_id: relationId,
    size,
    type: 1,
  })
  let users: UserStruct[] = []
  if (data.length > 100) {
    const groupedArr: Promise<UserStruct[]>[] = []
    for (let i = 0; i < data.length; i += 100) {
      groupedArr.push(UserAPI.getUserInfos(data.slice(i, i + 100).map(item => item.user_id)))
    }
    users = (await Promise.all(groupedArr)).flat()
  } else {
    users = await UserAPI.getUserInfos(data.map(item => item.user_id))
  }
  return users
}

// 发起好友申请
export async function apply(userId: string, relationId: string, validationInfo: string, guildId?: string): Promise<void> {
  return await axios.post('/api/relation/apply', {
    user_id: userId,
    relation_id: relationId,
    validation_info: validationInfo || '',
    ...(guildId && { guild_id: guildId }),
  })
}

// 同意好友申请
export async function agree(userId: string, relationId: string): Promise<void> {
  return await axios.post('/api/relation/agree', {
    user_id: userId,
    relation_id: relationId,
  })
}

// 拒绝好友申请
export async function refuse(userId: string, relationId: string): Promise<void> {
  return await axios.post('/api/relation/refuse', {
    user_id: userId,
    relation_id: relationId,
  })
}

// 取消好友申请
export async function cancel(userId: string, relationId: string): Promise<void> {
  return await axios.post('/api/relation/cancel', {
    user_id: userId,
    relation_id: relationId,
  })
}

// 删除好友
export async function remove(userId: string, relationId: string): Promise<void> {
  return await axios.post('/api/relation/remove', {
    user_id: userId,
    relation_id: relationId,
  })
}

// 获取积分信息
export async function getCredits(guildId: string, userCards: Array<Record<string, any>>, params: RelationApiParams = {}): Promise<any> {
  //${Config.memberListUri}
  const res = await axios.post('/api/user/credits', {
    user_cards: userCards,
    guild_id: guildId,
    ...params,
  })

  return res.data
}

// 设置积分卡片可见性
export async function setCreditsCardVisible(guildId: string, cardId: string, visible = true): Promise<any> {
  const res = await axios.post('/api/userRelatedGuild/setUserCard', {
    card_id: cardId,
    guild_id: guildId,
    visible,
  })

  return res.data
}

// 获取好友申请未读数
export async function applyUnreadCount(timestamp?: number): Promise<number> {
  const { count } = await axios.post<undefined, { count: number }>('/api/relation/totalUnread', {
    ...(timestamp && { timestamp }),
  })
  return count
}

// 上报好友申请已读时间
export async function updateUnreadTime(): Promise<void> {
  await axios.post('/api/relation/uploadReadTime', {})
}

export interface ApplyRecord {
  record_id: string
  //状态，-1=已撤回，0=未处理，1=已同意，2=已拒绝
  status: number
  timestamp: number
  //类型，1=我发起的，2=我接收
  type: RequestType
  user_id: string
  //旧版本用户关系类型，0=没有关系，1=好友，2=被拦截, 3=被对方申请加为好友，4=主动加对方为好友
  user_type: RelationType
  validation_info: string
}

// 获取申请记录
export async function applyRelationRecords(page = 1, size = 50): Promise<ApplyRecord[]> {
  const res = await axios.post<undefined, { list: ApplyRecord[] }>('/api/relation/records', {
    page,
    size,
  })
  return res.list
}

// 删除申请记录
export async function deleteApplyRecord(recordId: string): Promise<void> {
  return await axios.post('/api/relation/deleteRecord', {
    record_id: recordId,
  })
}
