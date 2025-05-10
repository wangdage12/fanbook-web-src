export default class Benefit<T = never> {
  /**
   * @param name 权益名称
   * @param desc 次要描述
   * @param icon 权益icon
   * @param requiredLevel 权益最低要求 等级
   * @param value
   */
  constructor(
    public name: string,
    public desc: string,
    public icon: string,
    public requiredLevel: number,
    public value?: T
  ) {}

  static emoji50 = new Benefit('表情包数量', '50个', '', 0)
  static emoji100 = new Benefit('表情包数量', '100个', '', 1)
  static emoji150 = new Benefit('表情包数量', '150个', '', 2)
  static emoji250 = new Benefit('表情包数量', '250个', '', 3)
  static mediaQualities = [
    new Benefit('语音频道质量', '16kbps', '', 0, 16),

    new Benefit('语音频道质量', '32kbps', '', 1, 32),
    new Benefit('语音频道质量', '64kbps', '', 2, 64),
    new Benefit('语音频道质量', '128kbps', '', 3, 128),
  ]

  static mediaMaxMembers = [
    new Benefit('语音频道人数', '50人', '', 0, 50),
    new Benefit('语音频道人数', '150人', '', 2, 150),
    new Benefit('语音频道人数', '300人', '', 3, 300),
  ]

  static uploadMaxSizes = [
    new Benefit('文件大小限制', '25M', '', 0, 25),
    new Benefit('文件大小限制', '50M', '', 2, 50),
    new Benefit('文件大小限制', '300M', '', 3, 300),
  ]

  static videoSupport = new Benefit('视频/屏幕共享', '支持', '', 1)
  static guildBackground = new Benefit('服务器背景图', '支持自定义', '', 1)
  static guildBackgroundGif = new Benefit('服务器背景图', '支持动画', '', 3)
  static messageAuditBot = new Benefit('消息审核BOT', '支持', '', 2)
  static roleBadge = new Benefit('身份组徽章', '支持', '', 1)
  static exclusiveCode = new Benefit('专属邀请码', '支持', '', 3)

  static getMediaMaxMembers(level: number) {
    return this.getBenefit(this.mediaMaxMembers, level)
  }

  static getUploadMaxSize(level: number) {
    return this.getBenefit(this.uploadMaxSizes, level)
  }

  private static getBenefit<T>(benefits: Benefit<T>[], level: number) {
    return benefits.find((b, i) => b.requiredLevel <= level && (!benefits[i + 1] || benefits[i + 1].requiredLevel > level))
  }
}
