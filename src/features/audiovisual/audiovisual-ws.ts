// - fanbook业务服务器WS推送监听
import Ws, { WsAction } from '../../base_services/ws'
import { MediaRoomMemberData, MediaRoomSignallingData } from './audiovisual-entity'

export interface WsHandlerParams {
  handleMediaRoomSignalling?: (data: MediaRoomSignallingData) => void
  handleMediaRoomMember?: (data: MediaRoomMemberData) => void
}

function shouldHandle(guildId: string, channelId: string, targetGuildId: string, targetChannelId: string) {
  return guildId === targetGuildId && channelId === targetChannelId
}

function wrapperHandler(fn: (data: any) => void, guildId?: string, channelId?: string) {
  return (data: { data: { guild_id: string; channel_id: string } }) => {
    const { guild_id: targetGuildId, channel_id: targetChannelId } = data.data
    if (guildId && channelId && shouldHandle(guildId, channelId, targetGuildId, targetChannelId)) {
      fn?.(data.data)
    }
  }
}

export function audiovisualWsHandler({ handleMediaRoomSignalling, handleMediaRoomMember }: WsHandlerParams, guildId?: string, channelId?: string) {
  const _handleMediaRoomSignalling = handleMediaRoomSignalling && wrapperHandler(handleMediaRoomSignalling, guildId, channelId)
  _handleMediaRoomSignalling && Ws.instance.on(WsAction.MediaRoomSignalling, _handleMediaRoomSignalling)
  const _handleMediaRoomMember = handleMediaRoomMember && wrapperHandler(handleMediaRoomMember, guildId, channelId)
  _handleMediaRoomMember && Ws.instance.on(WsAction.MediaRoomMember, _handleMediaRoomMember)
  return () => {
    _handleMediaRoomSignalling && Ws.instance.off(WsAction.MediaRoomSignalling, _handleMediaRoomSignalling)
    _handleMediaRoomMember && Ws.instance.off(WsAction.MediaRoomMember, _handleMediaRoomMember)
  }
}
