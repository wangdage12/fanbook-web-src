import EventEmitter from 'eventemitter3'
import { isEmpty } from 'lodash-es'
import queryString from 'query-string'
import { v4 as uuidv4 } from 'uuid'
import LocalUserInfo from '../features/local_user/LocalUserInfo.ts'
import JsonBigint from '../utils/JsonBigint.ts'
import StateUtils from '../utils/StateUtils'
import ServerTime from './ServerTime.ts'
import { getSuperProperties } from './properties'

const address = import.meta.env.FANBOOK_WS_HOST
const pingInterval = 25_000

/**
 * 心跳的超时时间，会在 ping 发出后开始计时，所以真正超时的时间是 `pingInterval + heartbeatTimeout`
 */
const heartbeatTimeout = 25_000
const retryMaxInterval = 60_000

const tId = uuidv4()

function* generateSequence() {
  let seq = 0
  while (true) {
    yield seq++
  }
}

const idGenerator = generateSequence()

export enum WsEvent {
  DISCONNECT = 'ws_disconnect',
  CONNECTING = 'ws_connecting',
  CONNECT = 'ws_connect',
}

export enum WsAction {
  Init = 'init',
  Connect = 'connect',
  Ping = 'ping',
  Pong = 'pong',
  Push = 'push',
  // 临时消息（UI 上会在下方显示仅你可见，由 OpenAPI 触发）
  EphemeralPush = 'miniPush',
  PushNonEntity = 'push_non_entity',
  Pinned = 'pinned',
  Top = 'top', // 置顶消息
  UnTop = 'untop', // 置顶消息

  DmTop = 'dmStick', // 置顶私信
  DmDel = 'dmDel', //私信不显示

  ChannelStatus = 'channelStatus',

  /// 社区信息变更
  MemberList = 'memberList',
  ChannelPermissionUpdate = 'cpermissUp',
  /// 成员列表信息变更
  ChannelMemberList = 'channelMemberList',

  ///直播使用action
  LivePush = 'livePush',
  LiveJoin = 'liveJoin',
  LiveQuit = 'liveQuit',
  LiveDisband = 'liveDisband',
  // 好友关系
  Relation = 'relation',

  KickOutOfGuild = 'KickOutOfGuild',

  CircleCoverStatus = 'CircleCoverStatus',

  RoleDel = 'roleDel',
  RoleAdd = 'roleAdd',
  RoleUpdate = 'roleUp',
  RolesUpdate = 'role',
  UserRoleUpdate = 'userRole',
  GuildNotice = 'guildNotice',
  GuildStatus = 'GuildStatus',
  DmGuildNotice = 'userGuildNotice',
  Forbid = 'Forbid',
  UserSettings = 'userSetting',
  BlackAdd = 'blackAdd',
  BlackDel = 'blackDel',
  Friend = 'friend',
  VoiceStateUpdate = 'voiceStateUpdate',
  LiveStatusUpdate = 'liveOnline',
  UpLastRead = 'upLastRead',

  //音视频通话
  VoiceApplyState = 'voiceApplyState',

  /// - 新版音视频业务社区回调（zego音视频)
  MediaRoomSignalling = 'mediaRoomSignalling',
  MediaRoomMember = 'mediaRoomMember',

  UserNotice = 'userNotice',
  // 互动问答消息
  QaMessage = 'qa_message',
  CircleMessage = 'circle_message',
  // 圈子 ws
  CircleEnter = 'circleEnter',
  GuildRoleAssignmentExportData = 'exportData',
  // banner修改
  GuildBannerChange = 'guild_banner_change',
  // 快捷指令修改
  BotSettingList = 'botSetting_list',
}

// TODO 收集连接期间的事件, 连接后发送
export default class Ws extends EventEmitter {
  private static _instance: Ws

  static get instance() {
    if (!Ws._instance) {
      Ws._instance = new Ws()
      Ws._instance.addListener(WsAction.Pong, ({ data }: { data: { time: number } }) => {
        if (isEmpty(data)) {
          return
        }
        // TextChannelUtil.updatePullTime(data.time);
        ServerTime.updateServerTime(data.time ?? (Date.now() / 1000) | 0)
      })
    }
    return Ws._instance
  }

  private retryCount = 0
  private retryTimer = 0
  pingTimer: number | undefined
  heartbeatTimer: number | undefined
  ws: WebSocket | undefined
  private connecting = false

  async connect() {
    if (this.connecting) return
    // 用户未登录，可能发生在重连时退出账户
    if (!LocalUserInfo.userId) return

    this.connecting = true

    const superProperties = getSuperProperties()

    const queryParameters = {
      id: StateUtils.localUser.sign,
      dId: superProperties.device_id,
      tId,
      v: superProperties.version,
      'x-super-properties': btoa(JSON.stringify(superProperties)),
    }
    const url = `wss://${address}?${queryString.stringify(queryParameters)}`
    this.ws = new WebSocket(url)
    this.emit(WsEvent.CONNECTING)

    this.ws.onopen = () => this.handleOpened()
    this.ws.onmessage = e => this.handleIncomingMessage(e)
    this.ws.onclose = (e: CloseEvent) => this.handleClosed(e.code, e.reason)

    console.time('Connect Websocket')
  }

  send(data: Record<string, unknown>) {
    if (!this.ws) return

    data['seq'] = idGenerator.next().value
    data['app_version'] = import.meta.env.FANBOOK_VERSION

    try {
      this.ws.send(JSON.stringify(data))
    } catch (e) {
      console.info(e)
    }
  }

  private _close() {
    this.ws?.close()
    this.ws = undefined
  }

  close(autoReconnect = true) {
    if (!this.ws || this.ws.readyState === this.ws.CLOSED) return
    if (!autoReconnect) {
      clearTimeout(this.retryTimer)
      clearTimeout(this.pingTimer)
      clearTimeout(this.heartbeatTimer)
      this.ws.onclose = null
      this._close()
      this.connecting = false
      this.emit(WsEvent.DISCONNECT)
    } else {
      this._close()
    }
  }

  reconnect() {
    this.close()
    const interval = Math.min(2 ** this.retryCount * 1000, retryMaxInterval)
    this.retryTimer = window.setTimeout(() => {
      this.retryCount++
      this.connect().then()
    }, interval)
  }

  public get connected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private ping() {
    this.ws?.send(JSON.stringify({ type: WsAction.Ping }))
    this.heartbeatTimer = window.setTimeout(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.warn('Close websocket because did not receive pong')
        this.close()
      }
    }, heartbeatTimeout)
  }

  private handleOpened() {
    console.timeEnd('Connect Websocket')
    this.emit(WsEvent.CONNECT)
    this.retryCount = 0
    this.connecting = false
    this.send({ action: WsAction.Init })
    this.once(WsAction.Init, this.startPing, this)

    clearTimeout(this.retryTimer)
  }

  private startPing() {
    window.clearInterval(this.pingTimer)
    this.ping()
    this.pingTimer = window.setInterval(() => this.ping(), pingInterval)
  }

  private async handleIncomingMessage({ data }: MessageEvent) {
    // 收到任意消息都视为服务端正常，去掉心跳超时检测
    clearTimeout(this.heartbeatTimer)
    const text = await (data as Blob).text()
    try {
      data = JsonBigint.parse(text)
    } catch (e) {
      throw new Error(`Failed to parse websocket message: ${e} from ${text}`)
    }
    this.emit(data.action, data)
  }

  private handleClosed(code: number, reason: string) {
    console.info(`Websocket disconnected with code: ${code}, reason: ${reason}`)
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
    }
    this.emit(WsEvent.DISCONNECT)
    this.ws = undefined
    this.connecting = false
    this.reconnect()
  }
}

// @ts-expect-error 用于测试目的，断开 ws 10 秒后连接
window.reconnectWsAfter10Secs = () => {
  Ws.instance.close(false)
  setTimeout(() => {
    Ws.instance.connect().then()
  }, 1e4)
}
