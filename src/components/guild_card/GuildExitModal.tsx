import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { store } from '../../app/store'
import GuildAPI from '../../features/guild_container/guildAPI'
import GuildUtils from '../../features/guild_list/GuildUtils'
import { guildListActions } from '../../features/guild_list/guildListSlice'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'

export function showGuildExitModal(guildId: string) {
  const { destroy: close } = FbModal.error({
    title: '退出社区',
    content: '退出社区后不会通知社区成员，且不会再接收社区消息',
    closable: false,
    okButtonProps: {
      danger: true,
    },
    onOk: async () => {
      const guild = GuildUtils.getGuildById(guildId)
      if (!guild) {
        close()
        return
      }
      try {
        await GuildAPI.quitGuild({ guildId, userId: LocalUserInfo.userId })
        FbToast.open({ content: `已退出社区 「${guild.name}」`, key: 'guild-exit' })
        store.dispatch(guildListActions.removeGuild(guildId))
        if (GuildUtils.getCurrentGuildId() == guildId) {
          GuildUtils.gotoFirstGuildOrDiscovery()
        }
        close()
      } catch (err) {
        FbToast.open({ content: '服务器繁忙，请稍候重试~', key: 'guild-exit' })
      }
    },
  })
  return close
}
