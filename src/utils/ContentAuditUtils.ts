import axios from 'axios'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'

export enum ContentAuditType {
  post = 'post',
  announce = 'announce',
  question = 'question',
}

export default class ContentAuditUtils {
  static checkStatus = reqAppealCheck
}

function reqAppealCheck(resource_type: string, guild_id: string, channel_id: string, audit_id?: string) {
  return axios.post<
    unknown,
    {
      appeal_result: 'no_appeal' | 'pending'
      audit_result: 'pass' | 'reject' | ''
      pending_list: []
    }
  >('/api/audit/appealCheck', {
    resource_type,
    guild_id,
    channel_id,
    user_id: LocalUserInfo.userId,
    audit_id,
  })
}
