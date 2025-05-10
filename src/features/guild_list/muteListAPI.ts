import axios from 'axios'
import { isNil } from 'lodash-es'
import { mergeRequests } from '../../base_services/http'
import { PaginationResp3 } from '../../types'

export async function addMuteList(userId: string, guildId: string, cycle: string, reason?: string) {
  return await axios.post('/api/Blacklist/AddNoSay', {
    forbid_user_id: userId,
    guild_id: guildId,
    cycle,
    reason,
  })
}

export async function removeMuteList(userId: string, guildId: string) {
  return await axios.post('/api/Blacklist/CancelNoSay', {
    forbid_user_id: userId,
    guild_id: guildId,
  })
}

export interface MuteStruct {
  forbid_user_id: string
  user_nickname: string
  forbid_user_avatar: string
  forbid_id: number
  create_user_id: string
  reason?: string
  created: number
  create_user_nickname: string
  forbid_roles: string[]
  endtime: number
}

export async function getMuteList(guildId: string, lastId = '0') {
  const res = await axios.post<undefined, PaginationResp3<MuteStruct, 'record', 'last_id', object>>('/api/Blacklist/GetNoSaylist', {
    guild_id: guildId,
    last_id: lastId,
    return_str: true, // id 返回字符串 兼容大数字
  })
  return isNil(res) ? ({ record: [] } as PaginationResp3<MuteStruct, 'record', 'last_id', object>) : res
}

export async function fetchMuteState(userId: string, guildId: string) {
  return mergeRequests(
    '/api/Blacklist/CheckNoSay',
    ({
      userId,
      guildId,
    }: {
      userId: string
      guildId?: string
    }): Promise<{
      endtime: number
    }> => {
      return axios.post<undefined, { endtime: number }>('/api/Blacklist/CheckNoSay', {
        forbid_user_id: userId,
        guild_id: guildId,
      })
    }
  )({ userId, guildId })
}
