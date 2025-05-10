export enum AudiovisualLayout {
  List = 'List',
  Emphasis = 'Emphasis',
}

export enum AudiovisualVoiceControl {
  None,
  Has,
}

export interface AudiovisualExtraInfo {
  audiovisualLayout?: AudiovisualLayout
  count?: number
}

export interface AudiovisualUserInfo {
  userId: string
  deviceId: string
  joined?: number
  muted?: boolean
  platform?: string
  ban?: boolean
  videoBan?: boolean
  fbServerMuted?: boolean
  enableCamera?: boolean
  isPlayingScreenShare?: boolean
  stick?: boolean
  isRoomTempAdmin?: boolean
}

export interface MemberItemExternals {
  platform: string // 平台，Mobile 等，客户端定义
  share_screen: boolean // 是否共享屏幕
  fbServerMuted: boolean // 是否被社区禁言
  stick: boolean // 是否置顶
  is_voice_owner: boolean // 是否主持人
}
export interface MemberItem {
  user_id: string // 用户 id
  device_id: string // 设备 id
  client_id: string // client_id
  joined_at: number // 加入时间（毫秒）
  nickname?: string
  username?: string
  roles?: string[]
  mute?: boolean // 是否闭麦
  platform?: string // 所属平台
  ban?: boolean // 是否禁麦
  ban_camera?: boolean // 是否禁用摄像头
  fbServerMuted?: boolean // 是否社区禁言
  video_active?: boolean // 摄像头开启状态
  audio_active?: boolean // 麦克风开启状态
  externals?: MemberItemExternals | string // 外部扩展信息
}

export enum MediaRoomSignalOperation {
  Login = 'login',
  Logout = 'logout',
  Ban = 'ban',
  UnBan = 'unban',
  StickMember = 'stickMember',
  BanCamera = 'ban-camera',
  UnBanCamera = 'unban-camera',
  KickOut = 'kickOut',
  BanAll = 'banAll',
  UnBanAll = 'unbanAll',
  BanAllCamera = 'banAll-camera',
  UnBanAllCamera = 'unbanAll-camera',
  Apply = 'apply', //申请开麦
  ApplyCamera = 'apply-camera', //申请开视频
  ApplyCancel = 'applyCancel', //取消申请开麦
  ApplyCancelCamera = 'applyCancel-camera', //取消申请开视
  AllowApply = 'allowApply', //同意开麦
  AllowApplyCamera = 'allowApply-camera', //同意申请开视频
  IgnoreApply = 'ignoreApply', //忽略开麦申请
  IgnoreApplyCamera = 'ignoreApply-camera', //忽略开麦视频
  IgnoreApplyAll = 'ignoreApplyAll', //忽略全部开麦申请
  IgnoreApplyAllCamera = 'ignoreApplyAll-camera', //忽略全部开麦视频
  OwnerChange = 'owner_change', // 成为房间临时控场管理员
}

export interface MediaRoomSignallingData {
  channel_id: string
  guild_id: string
  operation: MediaRoomSignalOperation
  operator: Pick<MemberItem, 'user_id' | 'device_id'>
  room_id: string
  users: MemberItem[]
}

export interface MediaRoomMemberData {
  channel_id: string
  guild_id: string
  member: MemberItem
}

/// - 视频频道-状态<p>
/// - unJoined: 未加入(默认)；joining：加入中；joined：已加入；joinFail：加入失败；reconnect：加入后断网重连
export enum JoinStatus {
  joining,
  joined,
  unJoined,
  joinFail,
  reconnect,
}

/// - 麦克风状态
/// - mute: 关闭  noMute：打开 muteBan：被禁麦
export enum MicrophoneType {
  mute,
  noMute,
  muteBan,
}

/// - 禁麦类型
/// - single:个人禁麦  group：全员禁麦
export enum MuteType {
  single,
  group,
}

/// - 屏幕共享状态
/// - normal:未开启（默认）  opened：已开启  ban：禁止
export enum ScreenShareType {
  normal,
  opened,
  ban,
}

/// - 屏幕共享界面View是否显示状态
/// - normal:初始状态（默认）  open：已显示  hide：已隐藏
export enum HideScreenShareViewType {
  normal,
  open,
  hide,
}

/// - 屏幕共享加载态
/// - normal:未加载（默认）  open：加载中  hide：加载结束
export enum ScreenShareLoadedType {
  normal,
  open,
  close,
}

/// - 管理员操作类型
export enum OperationType {
  agree, //管理员同意开麦
  ignore, //管理员忽略开麦
  open, //管理员解除用户禁麦
  ban, //管理员将用户禁麦
  /// -新增事件(zego音视频下）
  apply,
  applyCancel,
  allowApply, //管理员同意开麦
  ignoreApply, //管理员忽略开麦
  unban, //管理员解除用户禁麦
  banAll, //管理员全员禁麦
  unbanAll, //管理员解除全员禁麦
}

/// - 网络请求的状态
export enum NetRequestState {
  none,
  waiting,
  error,
  done,
}

/// - 网络质量
export enum VideoNetWork {
  hide,
  good,
  normal,
  bad,
  none,
}

/// - 音量等级
export enum AudioLevel {
  none,
  min,
  little,
  middle,
  big,
  max,
}

/// - 流类型
/// audio与camera是一路流，业务服务上也是一路流数(针对流数限制)
/// share是一路流， 业务服务上也与audio/camera区分开来
export enum StreamType {
  audio,
  camera,
  share,
}
