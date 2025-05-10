import axios from 'axios'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { FbHttpResponse } from '../../types'
import StateUtils from '../../utils/StateUtils'
import { MemberGroupStruct, MemberUserStruct } from '../member_list/MemberStruct'

const baseURL = import.meta.env.FANBOOK_MEMBER_HOST
export default class MemberListAPI {
  static async getGuildMemberCount(guild_id: string) {
    const { data } = await axios.post<FbHttpResponse<number>>(
      '/api/guild/memberCount',
      {
        guild_id,
      },
      {
        baseURL,
        originResponse: true,
      }
    )
    return data.data
  }

  static async fetchMembers({
    guildId,
    channelId = '0',
    start,
    end,
    not_sync = false,
    channel_type,
  }: {
    guildId: string
    channelId?: string
    start: number
    end: number
    // 表示不同步到实时成员列表，在只为了拉取指定频道成员列表数据时使用
    not_sync: boolean
    channel_type?: ChannelType
  }): Promise<MemberListState> {
    const data = {
      guild_id: guildId,
      channel_id: channelId,
      user_id: StateUtils.localUser.user_id,
      ranges: [{ start, end }],
      notsync: not_sync,
      channel_type,
    }

    const res = await axios.post<
      undefined,
      {
        item_count: number
        ops: {
          range: [number, number]
          items: { Group?: Omit<MemberGroupStruct, 'type'>; User?: Omit<MemberUserStruct, 'type'> }[]
        }[]
      }
    >('/api/channel/memberList', data, {
      baseURL,
    })
    if (!res.ops || res.ops.length == 0) return { count: 0, list: [], start: 0, end: 0 }
    const list: (MemberUserStruct | MemberGroupStruct)[] = []
    res.ops[0].items.forEach(e => {
      if (e.Group) {
        list.push({ ...e.Group, type: 'group' })
      } else if (e.User) {
        // 统一处理成 nickname
        if (e.User.nickname_v2) {
          e.User.nickname = e.User.nickname_v2
        }
        list.push({ ...e.User, type: 'user' })
      }
    })
    return { count: res.item_count, list: list, start: res.ops[0].range[0], end: res.ops[0].range[1] }
  }
}

export interface MemberListState {
  count: number
  start: number
  end: number
  list: (MemberUserStruct | MemberGroupStruct)[]
}
