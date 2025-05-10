import Ws, { WsAction } from '../base_services/ws'
import { handleBlackAdd, handleBlackDel } from '../features/blacklist/blacklistSlice'
import { handleCircleEnter } from '../features/circle/circleWsHandler.ts'
import { handleRelation } from '../features/contact_list/contact-list-ws'
import { handleInteractiveMessage } from '../features/dm/InteractiveMsg/interactiveMsgWsHander.ts'
import { handleDmDel, handleDmTop } from '../features/dm/dmSlice'
import { handleRoleUpdate, handleRolesUpdate, handleSilenceStateUpdate, handleVoiceStateUpdate } from '../features/guild_list/guildListSlice'
import { messageWsInit } from '../features/message_list/messageWsHandler.ts'
import { unreadEventInit } from '../features/message_list/unreadSlice.ts'
import { handleUserRoleUpdate } from '../features/role/guildUserSlice'
import { handleChannelPermissionUpdate } from '../services/PermissionService'
import handleBotSettingsList from './BotSettingsListHandler.ts'
import { handleChannelStatus } from './ChannelStatusHandler'
import { handleGuildBannerChange } from './GuildBannerChangeHandler.ts'
import { handleGuildNotice } from './GuildNoticeHandler'
import { handlerGuildStatus } from './GuildStatusHandler'
import handleUserNotice from './UserNoticeHandler.ts'
import { handlerUserSetting } from './UserSettingHandler'

export default class WsHandler {
  static init(): () => void {
    Ws.instance.on(WsAction.BlackAdd, handleBlackAdd)
    Ws.instance.on(WsAction.BlackDel, handleBlackDel)
    Ws.instance.on(WsAction.Relation, handleRelation)
    Ws.instance.on(WsAction.ChannelPermissionUpdate, handleChannelPermissionUpdate)
    Ws.instance.on(WsAction.RoleUpdate, handleRoleUpdate)
    Ws.instance.on(WsAction.RolesUpdate, handleRolesUpdate)
    Ws.instance.on(WsAction.VoiceStateUpdate, handleVoiceStateUpdate)
    Ws.instance.on(WsAction.Forbid, handleSilenceStateUpdate)
    Ws.instance.on(WsAction.UserRoleUpdate, handleUserRoleUpdate)
    Ws.instance.on(WsAction.DmDel, handleDmDel)
    Ws.instance.on(WsAction.DmTop, handleDmTop)
    Ws.instance.on(WsAction.GuildNotice, handleGuildNotice)
    Ws.instance.on(WsAction.GuildStatus, handlerGuildStatus)
    Ws.instance.on(WsAction.UserSettings, handlerUserSetting)
    Ws.instance.on(WsAction.ChannelStatus, handleChannelStatus)
    Ws.instance.on(WsAction.UserNotice, handleUserNotice)
    Ws.instance.on(WsAction.QaMessage, handleInteractiveMessage)
    Ws.instance.on(WsAction.CircleMessage, handleInteractiveMessage)
    Ws.instance.on(WsAction.CircleEnter, handleCircleEnter)
    Ws.instance.on(WsAction.GuildBannerChange, handleGuildBannerChange)
    Ws.instance.on(WsAction.BotSettingList, handleBotSettingsList)

    const unreadWsClear = unreadEventInit()
    const messageWsClear = messageWsInit()

    return () => {
      Ws.instance.off(WsAction.BlackAdd, handleBlackAdd)
      Ws.instance.off(WsAction.BlackDel, handleBlackDel)
      Ws.instance.off(WsAction.Relation, handleRelation)
      Ws.instance.off(WsAction.ChannelPermissionUpdate, handleChannelPermissionUpdate)
      Ws.instance.off(WsAction.RoleUpdate, handleRoleUpdate)
      Ws.instance.off(WsAction.RolesUpdate, handleRolesUpdate)
      Ws.instance.off(WsAction.VoiceStateUpdate, handleVoiceStateUpdate)
      Ws.instance.off(WsAction.Forbid, handleSilenceStateUpdate)
      Ws.instance.off(WsAction.UserRoleUpdate, handleUserRoleUpdate)
      Ws.instance.off(WsAction.DmDel, handleDmDel)
      Ws.instance.off(WsAction.DmTop, handleDmTop)
      Ws.instance.off(WsAction.GuildNotice, handleGuildNotice)
      Ws.instance.off(WsAction.GuildStatus, handlerGuildStatus)
      Ws.instance.off(WsAction.UserSettings, handlerUserSetting)
      Ws.instance.off(WsAction.ChannelStatus, handleChannelStatus)
      Ws.instance.off(WsAction.UserNotice, handleUserNotice)
      Ws.instance.off(WsAction.QaMessage, handleInteractiveMessage)
      Ws.instance.off(WsAction.CircleMessage, handleInteractiveMessage)
      Ws.instance.off(WsAction.CircleEnter, handleCircleEnter)
      Ws.instance.off(WsAction.GuildBannerChange, handleGuildBannerChange)
      Ws.instance.off(WsAction.BotSettingList, handleBotSettingsList)

      messageWsClear()
      unreadWsClear()
    }
  }
}
