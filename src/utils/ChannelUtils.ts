import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'

/**
 * 发言模式的字段设计到频道的 slow_mode 和 announcement_mode 字段，判断方式查看 `isSlowMode`、`isReadonly` 和 `isAnnouncementMode` 函数
 * 这个枚举用来将这两个字段的值映射到一个值，方便表单处理
 */
export enum LocalSpeakMode {
  Normal = 'Normal',
  Slow = 'Slow',
  Readonly = 'Readonly',
  Announcement = 'Announcement',
}

export default class ChannelUtils {
  static getSpeakMode(channel: ChannelStruct) {
    if (channel.slow_mode > 0) {
      return LocalSpeakMode.Slow
    } else if (channel.announcement_mode) {
      return LocalSpeakMode.Announcement
    } else if (channel.slow_mode === -1) {
      return LocalSpeakMode.Readonly
    } else {
      return LocalSpeakMode.Normal
    }
  }
}
