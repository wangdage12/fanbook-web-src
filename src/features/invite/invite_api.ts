import axios from 'axios'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { omitBy, uniqBy } from 'lodash-es'
import { cachedAxios, mergeRequests } from '../../base_services/http'
import { UserStruct } from '../../components/realtime_components/realtime_nickname/UserAPI.ts'
import { FbHttpResponse, PaginationResp3 } from '../../types'
import { QuestionStructForJoinAndWelcome } from '../guild_setting/sub_pages/AssignRoleSettings.tsx'

export interface InviteCodeRequestArgs {
  channel_id?: string
  guild_id: string
  // user_id: string
  v: number
  type: 1 | 2
  number?: string
  time?: string
  remark?: string
  member_id?: string
}

export interface InviteLinkInfo {
  number_less: string
  expire: string
  time: string
  number: string
  remark?: string
  url: string
  code: string
  // 成员专属邀请码
  customize?: Customize
}

interface Customize {
  code: string
  status: 0 | 1
  url: string
}

export enum InviteCodeType {
  // 普通邀请码
  Common = '0',
  // 社区专属邀请码
  GuildExclusive = '1',
  // 成员专属邀请码
  MemberExclusive = '2',
}

export interface InviteCodeInfo {
  channel_id: string
  guild_id: string
  is_used: string
  number: string
  expire_time: string
  invite_permission: number
  inviter_id: string
  type: InviteCodeType
  status: '0' | '1'
  is_current_user: string
  channel_on_del: string
  banned_level: string
  is_new_permission: number
  is_joined: boolean
}

export interface VeryInfoStruct {
  guild: GuildStruct
  verify_info: VerifyInfo
}

export interface VerifyInfo {
  guild_id?: string
  questionnaire_verification?: Questionnaire
  test_questions_questionnaires?: Questionnaire
  questionnaire_channel?: string
  user_id?: string
  create_time?: Date
  update_time?: Date
  questionnaire_verification_hash?: string
  test_questions_questionnaires_hash?: string
}

export interface Questionnaire {
  title: string
  isOpen: 0 | 1
  passNumber: number
  questions: QuestionStructForJoinAndWelcome[]
}

export type QuestionnaireQuestionWithAnswer = QuestionStructForJoinAndWelcome & {
  userAnswer: string[]
}

export interface Option {
  content: string
  isAnswer: number
}

export interface VerifyTestArgs {
  guild_id: string
  test_questions_questionnaires: Questionnaire
  test_questions_questionnaires_hash: string
  toast?: boolean
}

export interface VerifyRoleArgs {
  guild_id: string
  questionnaire_verification: Questionnaire
  toast?: boolean
}

export interface InviteListArgs {
  guild_id: string
  size: number
  list_id?: string
  member_id?: string
  type: InviteCodeType
}

export interface InviteUserListArgs {
  code: string
  size: number
  list_id?: string
}

export type InviteCodeInfo2 = InviteCodeInfo &
  Omit<InviteLinkInfo, 'customize'> & {
    avatar: string
    list_id: string
    inviter_name: string
    has_invited: string
    channel_name?: string
    can_edit_time?: string
  }
export type UpdateExclusiveCodeArgs = {
  guildId: string
  code: string
  status?: '0' | '1'
  remark?: string
  newCode?: string
}

export const exclusiveCodePrefix = 'FB'

export default class InviteApi {
  // 生成/设置邀请码
  static async getInviteCode(arg: InviteCodeRequestArgs) {
    return axios.post<FbHttpResponse<InviteLinkInfo>>('/api/invite/code', arg, { originResponse: true, toast: true })
  }

  static async getInviteCodeInfo(c: string, options?: { cache?: boolean }) {
    return mergeRequests(
      '/api/invite/codeInfo',
      (
        c: string,
        options?: {
          cache?: boolean
        }
      ): Promise<InviteCodeInfo> => {
        const data = {
          c,
          type: 'join_check',
        }
        return (options?.cache ? cachedAxios : axios).post<undefined, InviteCodeInfo>('/api/invite/codeInfo', data)
      }
    )(c, options)
  }

  // 加入社区前的测试问卷
  static async getVerifyInfo(guildId: string) {
    return axios.post<void, VeryInfoStruct>('/api/verify/info', { guild_id: guildId })
  }

  // 提交测试题目
  static async verifyTest({ toast, ...args }: VerifyTestArgs) {
    return axios.post<void, { pass: number }>('/api/verify/test', args, { toast })
  }

  // 提交领取身份组题目
  static async verifyRole({ toast, ...args }: VerifyRoleArgs) {
    return axios.post<void, { pass: number }>('/api/verify/questionnaire', args, { toast })
  }

  static async getInviteList(args: InviteListArgs): Promise<PaginationResp3<InviteCodeInfo2>> {
    const res = await axios.post<void, PaginationResp3<InviteCodeInfo2>>('/api/invite/guildList', args)
    if (args.type !== InviteCodeType.GuildExclusive) return res
    return {
      ...res,
      records: uniqBy(res.records, 'code'),
    }
  }

  static async getInviteUserList(args: InviteUserListArgs) {
    return axios.post<void, PaginationResp3<Partial<UserStruct>>>('/api/invite/userList', args)
  }

  static async cancelInviteCode(code: string) {
    await axios.post<void, PaginationResp3<UserStruct>>('/api/invite/cancel', { code }, { toast: true })
  }

  static async validateMemberId({ guildId, memberId, code }: { guildId: string; memberId?: string; code?: string }) {
    await axios.post<void, PaginationResp3<UserStruct>>('/api/invite/check', {
      guild_id: guildId,
      member_sid: memberId,
      code,
    })
  }

  static async addMemberExclusiveCode({ guildId, memberId, code }: { guildId: string; memberId?: string; code?: string }) {
    const res = await axios.post<void, InviteCodeInfo2>(
      '/api/invite/customize',
      {
        guild_id: guildId,
        member_sid: memberId,
        code,
      },
      { toast: true }
    )
    res.inviter_id = (res as any).user_id
    return res
  }

  static async updateMemberExclusiveCode({ guildId, code, status, remark, newCode }: UpdateExclusiveCodeArgs) {
    const data = omitBy(
      {
        'guild_id': guildId,
        'code': code,
        'type': '2',
        'status': status,
        'remark': remark,
        'new_code': newCode,
      },
      v => v == null
    )
    await axios.post('/api/invite/manage', data, { toast: true })
  }

  static async updateGuildExclusiveCode({ guildId, code, status, remark }: UpdateExclusiveCodeArgs) {
    const data = omitBy(
      {
        'guild_id': guildId,
        'code': code,
        'type': '1',
        'status': status,
        'remark': remark,
      },
      v => v == null
    )
    return axios.post<void, InviteCodeInfo2>('/api/invite/guildCode', data, { toast: true })
  }
}
