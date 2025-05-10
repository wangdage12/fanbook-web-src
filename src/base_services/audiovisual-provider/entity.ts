// 频道类型
export enum RoomScenarioType {
  // 普通音视频房间
  CHATROOM = 'CHATROOM',
  // 直播
  BROADCAST = 'BROADCAST',
}

export enum RoomManagerState {
  Disconnected,
  Connecting,
  Connected,

  ///user in room's state change-----------
  Logined,
  LoginFailed,
  Reconnecting,
  Reconnected,
  ReconnectFailed,
  KickOut,
  Logout,
  LogoutFailed,

  ///-------------------------------------
  StreamAdd,
  StreamDelete,
  NoPublish,
  PublishRequesting,
  Publishing,
  NoPlay,
  PlayRequesting,
  Playing,
  RemoteDeviceOpen,
  RemoteDeviceInvalidID,
  RemoteDeviceNoAuthorization,
  RemoteDeviceDisable,
  RemoteDeviceMute,
  RoomAddUser,
  RoomDeleteUser,
  RemoteCameraOpen,
  RemoteCameraMute,
  RemoteCameraDisable,
  RemoteMicMute,
  RemoteMicOpen,
  RemoteMicDisable,
  PlayerRecvVideoFirstFrame,
  PlayerRecvAudioFirstFrame,
  LocalSoundLevelUpdate,
  RemoteSoundLevelUpdate,

  //流媒体播放过程中发生媒体事件
  AudioBreakOccur, //Audio stuck event when playing
  AudioBreakResume,
  VideoBreakOccur,
  VideoBreakResume, //Video stuck event when playing

  /// 网络质量
  Good,
  Normal,
  Bad,
  None,
  Hide,
}

export enum RoomVideoTypeState {
  T180P,

  /// Set the resolution to 480x270, the default is 15 fps, the code rate is 400 kbps
  T270P,

  /// Set the resolution to 640x360, the default is 15 fps, the code rate is 600 kbps
  T360P,

  /// Set the resolution to 960x540, the default is 15 fps, the code rate is 1200 kbps
  T540P,

  /// Set the resolution to 1280x720, the default is 15 fps, the code rate is 1500 kbps
  T720P,

  /// Set the resolution to 1920x1080, the default is 15 fps, the code rate is 3000 kbps
  T1080P,
  CUSTOM,
}

export enum ViewMode {
  /// 等比缩放，可能有黑边
  AspectFit,

  /// 等比缩放填充整个view,可能有部分被裁剪
  AspectFill,

  /// 填充整个view,图像可能被拉伸
  ScaleToFill,
}

export enum VideoMirrorMode {
  /// The mirror image only for previewing locally. This mode is used by default. When the mobile terminal uses a rear camera, this mode is still used by default, but it does not work. Local preview does not set mirroring.
  OnlyPreviewMirror,

  /// Both the video previewed locally and the far end playing the stream will see mirror image.
  BothMirror,

  /// Both the video previewed locally and the far end playing the stream will not see mirror image.
  NoMirror,

  /// The mirror image only for far end playing the stream.
  OnlyPublishMirror,
}

export enum AECMode {
  /// Aggressive echo cancellation may affect the sound quality slightly, but the echo will be very clean.
  Aggressive,

  /// Moderate echo cancellation, which may slightly affect a little bit of sound, but the residual echo will be less.
  Medium,

  /// Comfortable echo cancellation, that is, echo cancellation does not affect the sound quality of the sound, and sometimes there may be a little echo, but it will not affect the normal listening.
  Soft,
}

/// Active Noise Suppression mode.
export enum ANSMode {
  /// Soft ANS. In most instances, the sound quality will not be damaged, but some noise will remain.
  Soft,

  /// Medium ANS. It may damage some sound quality, but it has a good noise reduction effect.
  Medium,

  /// Aggressive ANS. It may significantly impair the sound quality, but it has a good noise reduction effect.
  Aggressive,

  /// AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use.
  AI,
}

export interface RoomParams {
  muted: boolean
  enableCamera: boolean
  enableTextRoom: boolean

  userId: string
  nickName: string
  deviceId: string

  maxParticipants?: number
  guildId?: string
  channelId: string
  roomId?: string

  isGroupRoom?: boolean
  publishers?: number
  platform?: string
  ban?: boolean
  videoBan?: boolean
  stick?: boolean
  fbServerMuted?: boolean
  selfMuted?: boolean

  isScreenUser?: boolean
  isPlayingScreenShare?: boolean
  isPlayingVideoStream?: boolean
}

export interface VideoCodec {
  /**
   * 是否支持H264编解码能力
   */
  H264: boolean
  /**
   * 是否支持H265编解码能力
   */
  H265: boolean
  /**
   * 是否支持VP8编解码能力
   */
  VP8: boolean
  /**
   * 是否支持VP9编解码能力
   */
  VP9: boolean
}

export interface CapabilityError {
  /**
   * 错误名称
   */
  name?: string
  /**
   * 错误描述信息
   */
  message?: string
}
/**
 * 检测结果相关错误信息。
 *
 */
export interface CapabilityErrorInfo {
  webRTC?: CapabilityError
  customCapture?: CapabilityError
  /**
   * 具体错误说明可以参考 [MediaDevices.getUserMedia](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia#%E5%BC%82%E5%B8%B8) 接口文档的异常说明。
   */
  camera?: CapabilityError
  /**
   * 具体错误说明可以参考 [MediaDevices.getUserMedia](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia#%E5%BC%82%E5%B8%B8) 接口文档的异常说明。
   */
  microphone?: CapabilityError
  extendedDate?: string
}
export interface CapabilityDetection {
  /**
   * 是否支持webRTC协议,true代表可以使用webRTC协议传输流
   */
  webRTC?: boolean
  /**
   * 是否支持自定义流(不通过摄像头或者屏幕捕捉采集到的其他流, 比如video标签播放的mp4等)
   */
  customCapture?: boolean
  /**
   * 摄像头是否有权限调用
   */
  camera?: boolean
  /**
   * 麦克风是否有权限调用
   */
  microphone?: boolean
  /**
   * 是否支持屏幕共享功能
   */
  screenSharing?: boolean
  /**
   * 浏览器支持的视频编码格式; 需要注意的是有些浏览器检测会支持某一种编码格式,但实际系统阉割了该功能, 所以如果某个编码格式返回false,则一定不支持, true 不一定100%支持
   */
  videoCodec?: VideoCodec
  /**
   * 检测失败相关错误信息，设备相关的错误说明可以参考 [MediaDevices.getUserMedia](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia#%E5%BC%82%E5%B8%B8) 接口文档的异常说明。
   */
  errInfo: CapabilityErrorInfo
  /**
   * 根据传入的类型判断是否支持
   */
  result?: boolean
}
