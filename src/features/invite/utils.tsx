import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import GuildAPI from '../guild_container/guildAPI'
import AcceptModal from './AcceptModal'
import { RoleQuestionnaireModal } from './RoleQuestionnaireModal'
import InviteApi, { InviteCodeInfo } from './invite_api'

export const INVITE_LINK_PATTERN = /https?:\/\/([a-zA-Z0-9-]+\.){0,1}fanbook\.(cc|mobi|cn)\/(?!live\b)([a-zA-Z0-9_]{2,})(\?.*){0,1}$/
export const INVITE_CODE_PATTERN = /^[a-zA-Z0-9_]{2,}$/
export const INVITE_CODE_INVALID_TEXT = '邀请链接已失效'
export const INVITE_CODE_NO_PERMISSION_TEXT = '分享者暂无邀请权限'

export class InviteUtils {
  static parseCodeFromLink(val: string): string | undefined {
    let inviteCode: string | undefined
    if (INVITE_CODE_PATTERN.test(val)) {
      inviteCode = val
    } else if (INVITE_LINK_PATTERN.test(val)) {
      const match = val.match(INVITE_LINK_PATTERN)
      if (match) {
        inviteCode = match[3]
      }
    }
    return inviteCode
  }

  static isInvalid(inviteCode: InviteCodeInfo): boolean {
    return (
      Object.keys(inviteCode).length == 0 ||
      (inviteCode.number == '-1' && inviteCode.expire_time == '0') ||
      (inviteCode.number != '-1' && (inviteCode.expire_time == '0' || inviteCode.number == '0' || inviteCode.is_used == '1'))
    )
  }

  static async checkInviteCode({ inviteCode, needToast = false }: { inviteCode: string; needToast?: boolean }): Promise<boolean> {
    const codeInfo = await InviteApi.getInviteCodeInfo(inviteCode, { cache: true })
    if (InviteUtils.isInvalid(codeInfo)) {
      if (needToast) {
        FbToast.open({
          type: 'info',
          content: codeInfo.invite_permission == 0 ? INVITE_CODE_NO_PERMISSION_TEXT : INVITE_CODE_INVALID_TEXT,
          key: 'inviteCode',
        })
      }
      return false
    }
    return true
  }

  // 接受邀请弹窗
  static async showAcceptModal({ inviteCode }: { inviteCode: string }): Promise<void> {
    const codeInfo = await InviteApi.getInviteCodeInfo(inviteCode, { cache: true })
    const guildInfo = await GuildAPI.getGuildInfo(codeInfo.guild_id)
    return new Promise(resolve => {
      const { destroy: close } = showFbModal({
        width: 440,
        showCancelButton: false,
        showOkButton: false,
        title: (
          <div className={'flex items-center text-sm font-medium'}>
            <RealtimeUserInfo userId={codeInfo.inviter_id} guildId={codeInfo.guild_id}>
              <RealtimeAvatar userId={codeInfo.inviter_id} guildId={codeInfo.guild_id} size={24} className={'mr-[6px]'} />
              <RealtimeNickname userId={codeInfo.inviter_id} guildId={codeInfo.guild_id} className={'mr-[6px]'} />
              邀请你加入
            </RealtimeUserInfo>
          </div>
        ),
        className: 'accept-modal',
        onCancel: () => {
          close()
          resolve()
        },
        content: (
          <AcceptModal
            inviteCode={inviteCode}
            codeInfo={codeInfo}
            guildInfo={guildInfo}
            afterJoin={() => {
              resolve()
            }}
            destroy={joining => {
              close()
              if (!joining) {
                resolve()
              }
            }}
          ></AcceptModal>
        ),
      })
    })
  }

  static async showJoinModal({
    guildId,
    autoJumpToGuild,
    afterJoin,
  }: {
    guildId: string
    afterJoin?: (isCancel?: boolean) => void
    autoJumpToGuild?: boolean
  }): Promise<boolean> {
    const guildInfo = await GuildAPI.getGuildInfo(guildId)
    const { destroy: close } = showFbModal({
      width: 440,
      showCancelButton: false,
      showOkButton: false,
      title: '加入社区',
      className: 'accept-modal',
      content: <AcceptModal guildInfo={guildInfo} destroy={() => close()} afterJoin={afterJoin} autoJumpToGuild={autoJumpToGuild}></AcceptModal>,
    })
    return true
  }

  // 领取身份组
  static showRoleQuestionnaireModal({ guildId, afterObtain }: { guildId: string; afterObtain?: () => void }): void {
    const { destroy: close } = showFbModal({
      title: '领取身份组',
      showCancelButton: false,
      showOkButton: false,
      content: <RoleQuestionnaireModal guildId={guildId} destroy={onClose} />,
      onCancel: onClose,
    })

    function onClose() {
      close()
      afterObtain?.()
    }
  }

  /**
   * 邀请码有效期格式化
   * @param value 秒数
   */
  static formatSecond(value: number): string {
    if (value === 0) return '00:00'
    const _value = value
    let ret = ''

    if (_value >= 24 * 60 * 60) {
      const tmp = Math.floor(_value / (24 * 60 * 60))
      ret += `${tmp}天`
      return ret
    }

    if (_value >= 60 * 60) {
      const hour = Math.floor(_value / (60 * 60))
      ret += `${hour}小时`
      return ret
    }

    if (_value >= 60) {
      const min = Math.floor(_value / 60)
      ret += `${min}分钟`
      return ret
    }

    return '1分钟'
  }
}
