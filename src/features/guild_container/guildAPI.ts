import axios from 'axios'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { GuildPosterStruct, GuildStruct, GuildTagItem } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { cloneDeep } from 'lodash-es'
import { cachedAxios, mergeRequests } from '../../base_services/http.ts'
import { BusinessError } from '../../base_services/interceptors/response_interceptor.ts'
import { UserStruct } from '../../components/realtime_components/realtime_nickname/UserAPI'
import { FbHttpResponse, PaginationResp3 } from '../../types.ts'
import { QuestionStruct } from '../guild_setting/sub_pages/AssignRoleSettings.tsx'
import { MemberUserStruct } from '../member_list/MemberStruct'

export interface JoinGuildArgs {
  guild_id: string
  channel_id?: string
  post_id?: string
  c?: string
  toast?: boolean
}

export interface RemoveUserParams {
  guildId: string
  userId: string
  memberId: string
  memberName?: string
  ban?: boolean
  isDeleteRecord?: boolean
  reason?: string
}

export interface SetGuildNicknameParams {
  guildId: string
  nick: string
}

export enum LogClassify {
  GuildAdd = 1,
  GuildSetting = 2,
  ChannelAdd = 3,
  ChannelCategoryAdd = 4,
  ChannelSetting = 5,
  RoleAdd = 6,
  RoleSetting = 7,
  LinkUpdate = 8,
  UserSetting = 9,
  LinkSetting = 10,
  EmojiSetting = 11,
  CircleSubChannelSetting = 12,
  CircleSetting = 13,
  CircleDynamicSetting = 14,
}

export enum LogModule {
  Guild = 1,
  Channel = 2,
  Role = 3,
  User = 4,
  Other = 5,
  Circle = 6,
}

export interface ManagerLogStruct {
  log_id: string
  guild_id: string
  user_id: string
  index: number
  module: LogModule
  classify: LogClassify
  data: {
    title: {
      text: string
      params?: Record<string, string>
    }
    content: {
      text: string
      params?: Record<string, string>
    }[]
  }
  created_at: number
}

export interface GuildBlacklistStruct {
  id: number
  guild_id: string
  user_id: string
  black_reason: string
  create_time: number
  creater_id: string
  username: string
  nickname: string
}

export interface ImportResult {
  errorCnt: number
  error_members: string[]
  error_msg: string[]
  succCnt: number
}

// 服务器当前tag信息
export interface GuildCurrentTag {
  can_edit: SwitchType
  can_edit_time: number
  tags: GuildTagItem[]
}

export default class GuildAPI {
  private static searchAbortController = new AbortController()

  static config(guild_id: string): Promise<{
    mention_all_limit: number
    mention_all_left: number
  }> {
    return axios.post('/api/guild/config', { guild_id })
  }

  static async searchMember(
    guild_id: string,
    search: string,
    options?: {
      channel_id?: string
      withRoles?: boolean
    }
  ): Promise<UserStruct[]> {
    this.searchAbortController.abort()
    this.searchAbortController = new AbortController()

    const body: Record<string, string | number> = {
      q: search,
      guild_id,
    }
    if (options?.withRoles) {
      body['r'] = 1
    }
    if (options?.channel_id) {
      body['channel_id'] = options.channel_id
    }
    const res = await axios.post<void, UserStruct[]>('/api/search/guildQ', body, {
      signal: this.searchAbortController.signal,
    })
    res.forEach(e => {
      e.role_ids = (e as unknown as { roles: string[] }).roles
    })
    return res
  }

  static async getGuildBots(guild_id: string): Promise<MemberUserStruct[]> {
    const { lists } = await axios.post<undefined, never>('/api/guild/bots', {
      guild_id,
    })
    return lists as MemberUserStruct[]
    // return [
    //   {
    //     type: 'user',
    //     user_id: '256899212615090176',
    //     username: '491299',
    //     nickname: '欢迎机器人',
    //     bot: true,
    //     avatar: 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/9669b7eb1c24e4b637fbbc16c5d77356.jpg',
    //     gnick: undefined,
    //   },
    // ]
  }

  /**
   * 正在生效的banner轮播列表
   * @param guildId
   */
  static async getBannerList(guildId: string): Promise<GuildPosterStruct[]> {
    return await axios.post<undefined, GuildPosterStruct[]>('/api/guild/bannerList', {
      guild_id: guildId,
    })
  }

  /**
   * banner历史记录
   * @param args
   */
  static async getBannerExpList(args: { guild_id: string; page: number; page_size: number }): Promise<PaginationResp3<GuildPosterStruct, 'lists'>> {
    const { page_size } = args
    const res = await axios.post<void, PaginationResp3<GuildPosterStruct, 'lists'>>('/api/guild/bannerExpList', args)
    return {
      ...res,
      next: res.lists.length < page_size ? 0 : 1,
    }
  }

  static async addBanner(args: Omit<GuildPosterStruct, 'id'>): Promise<GuildPosterStruct> {
    return axios.post<void, GuildPosterStruct>('/api/guild/banner', args, { toast: true })
  }

  static async updateBanner(args: Partial<GuildPosterStruct> & { id: number }): Promise<GuildPosterStruct> {
    return await axios.post<void, GuildPosterStruct>('/api/guild/banner', args, { toast: true })
  }

  static async stopBanner(id: number): Promise<void> {
    await axios.post<void>('/api/guild/bannerStop', { id }, { toast: true })
  }

  static async cancelBanner(id: number): Promise<void> {
    await axios.post<void>('/api/guild/bannerDel', { id }, { toast: true })
  }

  static async orderBanner(args: { guild_id: string; order_map: Record<number, number> }): Promise<void> {
    await axios.post<void>('/api/guild/BannerOrder', args, { toast: true })
  }

  static async getFullGuildInfo(guildId: string): Promise<GuildStruct> {
    return axios.post<undefined, GuildStruct>('/api/guild/getGuild', {
      guild_id: guildId,
    })
  }

  static async getGuildInfo(guildId: string): Promise<GuildStruct> {
    return mergeRequests(
      '/api/guild/getInfo',
      (
        guildId: string,
        options?: {
          cache?: boolean
        }
      ): Promise<GuildStruct> => {
        const data = {
          guild_id: guildId,
        }
        return (options?.cache ? cachedAxios : axios).post<undefined, GuildStruct>('/api/guild/getInfo', data)
      }
    )(guildId)
  }

  static async joinGuild({ toast = false, ...args }: JoinGuildArgs) {
    return axios.post<FbHttpResponse<GuildStruct>>('/api/guild/join', args, {
      toast,
      originResponse: true,
    })
  }

  static async removeUser(params: RemoveUserParams): Promise<void> {
    const { guildId, userId, memberId, reason, ban = false, isDeleteRecord = false, memberName = '' } = params
    try {
      await axios.post('/api/guild/removeUser', {
        guild_id: guildId,
        user_id: userId,
        member_id: memberId,
        ban: ban ? 1 : 0,
        ...(ban && reason && { black_reason: reason }),
        ...(!ban && reason && { remove_reason: reason }),
        delete_record: isDeleteRecord ? 1 : 0,
      })
    } catch (err) {
      if (err instanceof BusinessError) {
        const errorCode = err.code
        if (errorCode === 1007) {
          const errorMsg = `${memberName}已不存在当前社区，请退出重试`
          FbToast.open({ content: errorMsg })
          throw err
        }
      }
      throw err
    }
  }

  static async setGuildNickname({ guildId, nick = '' }: SetGuildNicknameParams): Promise<void> {
    await axios.post('/api/guild/nick', {
      guild_id: guildId,
      nick: nick,
    })
  }

  static async quitGuild({ userId, guildId }: { guildId: string; userId: string }): Promise<void> {
    await axios.post(
      '/api/guild/quitGuild',
      {
        user_id: userId,
        guild_id: guildId,
      },
      { toast: true }
    )
  }

  // 服务器标签列表
  static async getGuildTags(): Promise<GuildTagItem[]> {
    return axios.post('/api/tag/list', {})
  }

  // 获取服务器标签
  static async getSelectedTag(guildId: string): Promise<GuildCurrentTag> {
    return axios.post<void, GuildCurrentTag>('/api/guild/getTag', {
      guild_id: guildId,
    })
  }

  // 更改服务器信息
  static async updateGuild(guildId: string, data: Partial<GuildStruct>): Promise<GuildTagItem[]> {
    data = cloneDeep(data)
    // 虽然服务端不区分 boolean 和 number，但是在线广播会直接将 boolean 广播给移动端，而移动端又无法处理 boolean，因此这里兼容一下
    if (data.guild_member_dm_friend_setting) {
      if ('friend_switch' in data.guild_member_dm_friend_setting)
        data.guild_member_dm_friend_setting.friend_switch = Number(data.guild_member_dm_friend_setting.friend_switch) as never
      if ('dm_switch' in data.guild_member_dm_friend_setting)
        data.guild_member_dm_friend_setting.dm_switch = Number(data.guild_member_dm_friend_setting.dm_switch) as never
    }
    if ('guild_circle_comment' in data) {
      data.guild_circle_comment = Number(data.guild_circle_comment)
    }
    if (data.system_channel_message_pic) {
      // @ts-expect-error 传给服务端的数据需要是 JSON 字符串
      data.system_channel_message_pic = JSON.stringify(data.system_channel_message_pic)
    }
    if (data.system_channel_message) {
      // @ts-expect-error 传给服务端的数据需要是 JSON 字符串
      data.system_channel_message = JSON.stringify(data.system_channel_message)
    }
    const res = await axios.post<undefined, { tags: GuildTagItem[] }>(
      '/api/guild/up',
      {
        guild_id: guildId,
        ...data,
      },
      { toast: true }
    )
    return res.tags
  }

  static async fetchSettingsForRoleAssignment(guildId: string): Promise<{
    guild: GuildStruct
    verify_info: {
      questionnaire_verification: {
        isOpen: boolean
        questions: QuestionStruct[]
      }
    }
  }> {
    return axios.post('/api/verify/info', {
      guild_id: guildId,
    })
  }

  static async saveAssignRolesSettings(
    guild_id: string,
    settings: {
      questions: QuestionStruct[]
    }
  ): Promise<never> {
    return axios.post('/api/verify/manageQuestionnaire', {
      guild_id,
      questionnaire_verification: JSON.stringify(settings),
    })
  }

  static async saveJoinAndWelcomeSettings(
    guild_id: string,
    settings: { questions: QuestionStruct[] | undefined; passNumber: number | undefined }
  ): Promise<never> {
    return axios.post('api/verify/manageQuestion', {
      guild_id,
      test_questions_questionnaires: JSON.stringify(settings),
    })
  }

  static async exportAssignRolesSettings(
    guild_id: string,
    start_time: string,
    end_time: string
  ): Promise<{
    url: string
  }> {
    return axios.post('/api/verify/export', {
      guild_id,
      start_time,
      end_time,
    })
  }

  static async orderChannels(guildId: string, positions: string[], cateGroup: Record<string, string>): Promise<void> {
    return axios.post('/api/guild/channels', {
      'guild_id': guildId,
      'categroup': cateGroup,
      'positions': positions,
    })
  }

  static async searchBacklist({
    guildId,
    page,
    pageSize,
    keyword,
  }: {
    guildId: string
    pageSize?: number
    page: number
    keyword: string
  }): Promise<{ list: GuildBlacklistStruct[]; total: number }> {
    const res = await axios.post<undefined, { list: GuildBlacklistStruct[]; total: number }>('/api/search/guildBlack', {
      guild_id: guildId,
      page: page,
      pageSize: pageSize,
      searchContent: keyword,
    })
    return res
  }

  static async getBacklist({
    guildId,
    page,
    pageSize,
  }: {
    guildId: string
    pageSize?: number
    page: number
  }): Promise<{ list: GuildBlacklistStruct[]; total: number }> {
    const res = await axios.post<undefined, { list: GuildBlacklistStruct[]; total: number }>('/api/guild/blackList', {
      guild_id: guildId,
      page: page,
      pageSize: pageSize,
    })
    return res
  }

  static async blackRelieve({ guildId, userId, isRelieve = 0 }: { guildId: string; userId: string; isRelieve?: number }): Promise<void> {
    await axios.post(
      '/api/guild/blackRelieve',
      {
        guild_id: guildId,
        relieve_user_id: userId,
        is_relieve: isRelieve, //0为解禁
      },
      {
        toast: true,
      }
    )
  }

  static async importBlacklist({ guildId, memberIds }: { guildId: string; memberIds: string[] }): Promise<ImportResult> {
    return axios.post<undefined, ImportResult>(
      '/api/guild/importBlackUsers',
      {
        guild_id: guildId,
        member_ids: memberIds,
        black_reason: '批量导入',
      },
      {
        toast: true,
      }
    )
  }

  // guild_id: 524165240108093440, start_at: 2024-01-08 00:00:00.000, end_at: 2024-01-08 23:59:59.000
  static async exportBacklist({
    guildId,
    start,
    end,
    listId = '0',
  }: {
    guildId: string
    start: string
    end: string
    listId?: string
  }): Promise<PaginationResp3<GuildBlacklistStruct>> {
    const data = {
      guild_id: guildId,
      start_at: start,
      end_at: end,
      ...(listId != '0' ? { list_id: listId } : {}),
    }
    const res = await axios.post<undefined, PaginationResp3<GuildBlacklistStruct>>('/api/guild/ExportBlackUsers', data)
    return res
  }

  static async managerLogList({
    guildId,
    userId,
    classify,
    lastId,
    size,
  }: {
    guildId: string
    userId?: string
    classify?: LogClassify
    lastId?: string
    size?: number
  }): Promise<{ lists: ManagerLogStruct[]; total: number; size: number }> {
    const data: { [key: string]: string | LogClassify } = {
      'page_size': size || 20,
      'guild_id': guildId,
    }
    if (lastId) {
      data['last_id'] = lastId
    }
    if (userId) {
      data['member_id'] = userId
    }
    if (classify) {
      data['classify'] = classify
    }

    const res = await axios.post<
      undefined,
      {
        lists: ManagerLogStruct[]
        total: number
        size: number
      }
    >('/api/operationLog/list', data, {
      toast: true,
    })

    return res
  }
}
