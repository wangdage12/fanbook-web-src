export enum TextContentMask {
  Mention = 1,
  Command = 2,
  // PureEmoji = 4,
  ChannelLink = 8,
  UrlLink = 16,
  Emoji = 32,

  /// 隐身消息，只对发送者和被@的用户可见
  // Hide = 64,

  /// 是否命令可点击
  // Clickable = 128,
}
