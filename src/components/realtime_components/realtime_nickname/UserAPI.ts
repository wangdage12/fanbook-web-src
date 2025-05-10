import axios from 'axios'
import { chunk, debounce, difference, size, union } from 'lodash-es'
import { Gender } from '../../../features/local_user/localUserSlice'

export interface UserStruct {
  avatar: string
  user_id: string
  nickname: string
  gender: Gender
  username: string
  bot: boolean
  is_ban: boolean
  dm_ban_expire: string | null
  dm_ban_free_time: string | boolean
  sanction_ban_states?: {
    cur_timestamp?: number
    sanction_stranger_dm?: {
      exp?: number
    }
    sanction_friend_add?: {
      exp?: number
    }
    sanction_text_channel_chat?: {
      exp?: number
    }
    sanction_circle_channel_post?: {
      exp?: number
    }
    sanction_circle_channel_comment?: {
      exp?: number
    }
    sanction_live_open?: {
      exp?: number
    }
    sanction_live_bullets?: {
      exp?: number
    }
    sanction_qa_channel_access?: {
      exp?: number
    }
    sanction_media_mic?: {
      exp?: number
    }
  }
  gnick?: string
  // "status": 0,
  // "dm_ban_expire": null,
  // "dm_ban_free_time": false

  // 这个字段只有在带 guild_id 请求用户信息时才有
  role_ids?: string[]
}

export interface RemarkStruct {
  friend_user_id: string
  name: string
  user_remark_id: string
}

export interface BlacklistStruct {
  black_id: string
  created_at: number
  user_id: string
  id: string
}

export class UserAPI {
  // 这个变量保存了所有正在请求的用户信息，它们会被自动组合成一个请求
  static fetchGuildUserBuffer: {
    [guildId: string]: {
      [userId: string]: {
        resolve: (value: UserStruct) => void
        reject: (reason?: never) => void
        promise: Promise<UserStruct> | null
        processed: boolean
      }
    }
  } = {}

  static async fetchRemarkList(user_id: string, size = 1000) {
    const result = await axios.post<undefined, { records: RemarkStruct[] }>('/api/user/remarkList', {
      user_id,
      size,
    })
    return result.records
  }

  static async remarkFriend(userId: string, friendId: string, name: string, description = ''): Promise<void> {
    await axios.post('/api/user/remark', {
      user_id: userId,
      friend_user_id: friendId,
      name: name,
      description: description,
    })
  }

  static async addToBlackList(userId: string, blackId: string | undefined): Promise<void> {
    await axios.post('/api/blacklist/addToBlacklist', {
      user_id: userId,
      black_id: blackId,
    })
  }

  static async removeFromBlackList(userId: string, blackId: string | undefined): Promise<void> {
    await axios.post('/api/blacklist/removeFromBlacklist', {
      user_id: userId,
      black_id: blackId,
    })
  }

  static async getBlackList(userId: string): Promise<BlacklistStruct[]> {
    return await axios.post<undefined, BlacklistStruct[]>('/api/blacklist/getBlacklist', {
      user_id: userId,
    })
  }

  // 开发者使用这个接口对单个用户进行请求，它会被自动组合成一个请求
  static throttledFetchGuildUser = debounce(UserAPI.chunkFetchUsers, 100, { maxWait: 2000, leading: false })

  static fetchGuildUser(userId: string, guild_id?: string): Promise<UserStruct> {
    guild_id ??= ''
    const guildBuffer = (UserAPI.fetchGuildUserBuffer[guild_id] ??= {})
    if (guildBuffer[userId]?.promise != null) {
      return guildBuffer[userId].promise
    }
    UserAPI.throttledFetchGuildUser()

    const promise = new Promise<UserStruct>((resolve, reject) => {
      guildBuffer[userId] = { resolve, reject, promise: null, processed: false }
    })
    guildBuffer[userId].promise = promise
    return promise
  }

  // 节流请求用户信息，每 16ms 执行一次
  private static chunkFetchUsers() {
    for (const guildId in UserAPI.fetchGuildUserBuffer) {
      const guildBuffer = UserAPI.fetchGuildUserBuffer[guildId]
      // 服务端一次能接受的 id 数量是 100 个
      const MAX_USER_PER_REQUEST = 100
      console.debug(`Combine ${size(guildBuffer)} getUser requests with ids`, Object.keys(guildBuffer))
      chunk(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(guildBuffer).filter(([_, item]) => !item.processed),
        MAX_USER_PER_REQUEST
      ).forEach(item => {
        UserAPI.doFetchGuildUsers(
          guildId,
          item.map(e => {
            e[1].processed = true
            return e[0]
          })
        ).catch(() => {
          console.info('Failed to fetch user info')
        })
      })
    }
  }

  // 真正发起请求
  private static async doFetchGuildUsers(guild_id: string, user_ids: string[]) {
    const guildBuffer = UserAPI.fetchGuildUserBuffer[guild_id]
    try {
      const users = await axios.post<undefined, UserStruct[]>('/api/user/getUser', {
        user_ids,
        guild_id: guild_id ? guild_id : null,
      })
      for (const user of users) {
        guildBuffer[user.user_id]?.resolve(user)
      }

      const returnedUserIds = users.map(u => u.user_id)
      for (const user_id of union(user_ids, returnedUserIds)) {
        delete guildBuffer[user_id]
      }

      for (const u of difference(user_ids, returnedUserIds)) {
        guildBuffer[u].reject('User id does not exist' as never)
      }
    } catch (e) {
      for (const user_id of user_ids) {
        delete guildBuffer[user_id]
      }
    }
  }

  static async getUserInfos(user_ids: string[], guild_id?: string) {
    const users = await axios.post<undefined, UserStruct[]>('/api/user/getUser', {
      user_ids,
      guild_id: guild_id ? guild_id : null,
    })
    return users
  }

  static async updateUserInfo(userId: string, avatar?: string, nickname?: string, gender?: Gender) {
    const data = {
      user_id: userId,
      avatar,
      nickname,
      gender,
    }
    const notNullData = Object.fromEntries(Object.entries(data).filter(([, value]) => value != undefined))
    return axios.post<undefined, undefined>('/api/user/updateInfo', notNullData, { toast: true })
  }
}
