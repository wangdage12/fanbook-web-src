import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { globalEmitter, GlobalEvent } from '../base_services/event.ts'
import { UserHelper } from '../components/realtime_components/realtime_nickname/userSlice.ts'
import { TickForm } from '../components/user_card/user_menu/TickForm.tsx'
import { removeAllChannelBot } from '../components/user_card/user_menu/util.ts'
import GuildAPI from '../features/guild_container/guildAPI.ts'
import GuildUtils from '../features/guild_list/GuildUtils'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import StateUtils from './StateUtils'

export function report({
  accusedUserId,
  accusedName,
  guildId = '',
  complaintType = 2,
  roomId,
}: {
  guildId?: string
  accusedUserId?: string
  accusedName?: string
  // 举报社区 complaint_type=1 带 guildId
  // 在直播间里面举报个人，complaint_type=2，不带 room_id
  // 在音视频里面举报个人，complaint_type=3，带上room_id
  // 直播间里面举报直播间，complaint_type=4，带上room_id
  complaintType?: number
  roomId?: string
}) {
  const _accusedNickName = accusedName // Uri.encodeQueryComponent(accusedName);
  const userName = StateUtils.localUser.username // Uri.encodeQueryComponent(Global.user.username);
  const nickName = StateUtils.localUser.nickname // Uri.encodeQueryComponent(Global.user.nickname);

  const params: Record<string, string> = {
    complaint_type: complaintType.toString(),
    accused_id: accusedUserId ?? '',
    accused_name: _accusedNickName ?? '',
    user_id: LocalUserInfo.userId,
    user_name: userName,
    nickname: nickName,
    apptoken: StateUtils.localUser.sign,
    udx: `93${Date.now()}3c`,
  }

  if (guildId) {
    const guild = GuildUtils.getGuildById(guildId)
    params['guild_id'] = guildId
    if (guild) {
      params['guid_name'] = guild.name ?? ' '
    }
  }

  if (roomId) {
    params['room_id'] = roomId
  }

  const uri = new URL(`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}${import.meta.env.FANBOOK_COMPLAINTS_URL}`)
  uri.search = new URLSearchParams(params).toString()
  window.open(uri, '_blank')
}

export function feedback() {
  const { sign, username, nickname, user_id } = StateUtils.localUser
  const appVersion = import.meta.env.FANBOOK_VERSION
  const params: Record<string, string> = {
    apptoken: sign,
    app_version: appVersion,
    user_id: user_id,
    user_name: username,
    nickname: nickname,
  }
  const uri = new URL(`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}${import.meta.env.FANBOOK_FEEDBACK_URL}`)
  uri.search = new URLSearchParams(params).toString()
  window.open(uri, '_blank')
}

export async function removeFromGuild(
  isBot: boolean,
  guildId: string | undefined,
  userId: string,
  nickname: string | undefined,
  onTickFormClose?: () => Promise<void>
) {
  if (isBot) {
    // 机器人直接移除
    // 处理机器人禁言
    // TODO 待优化点：移除频道指令和移除机器人两个异步操作，可合并成一个请求
    if (guildId) {
      await removeAllChannelBot(userId, guildId)
      await GuildAPI.removeUser({
        userId: LocalUserInfo.userId,
        memberId: userId,
        memberName: `${UserHelper.getAliasName(userId, guildId, nickname)}`,
        guildId,
      })
      FbToast.open({ content: '移除成功', key: 'user-menu-remove' })
      globalEmitter.emit(GlobalEvent.BotRemovedFromChannel, { botId: userId, guildId: guildId! })
    }
  } else {
    const { destroy: close } = showFbModal({
      title: `将 ${UserHelper.getAliasName(userId, guildId, nickname)} 移出社区`,
      width: 440,
      content: (
        <TickForm
          userId={userId}
          userName={UserHelper.getAliasName(userId, guildId, nickname)}
          guildId={guildId}
          onClose={async () => {
            await onTickFormClose?.()
            close()
          }}
        />
      ),
      showCancelButton: false,
      showOkButton: false,
    })
  }
}
