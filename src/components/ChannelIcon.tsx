import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { CSSProperties } from 'react'

const DEFAULT_NAME = 'Channel-Normal'

const nameMap: Partial<Record<ChannelType, string>> = {
  [ChannelType.guildText]: 'Channel',
  [ChannelType.guildVideo]: 'Audio',
  [ChannelType.guildVoice]: 'Audio',
  // [ChannelType.activityCalendar]: 'Audio',
  [ChannelType.Link]: 'Link',
  [ChannelType.guildLive]: 'TV',
  [ChannelType.GuildQuestion]: 'Question',
  [ChannelType.GuildNotice]: 'Notice',
  [ChannelType.CircleTopic]: 'Link',
  [ChannelType.guildCircle]: 'CameraBlink',
}

export default function ChannelIcon({
  size = 14,
  color = 'var(--fg-b40)',
  type,
  className,
  style,
  isPrivate = false,
  isAnnouncement = false,
}: {
  size?: number | string
  color?: string
  type: ChannelType
  className?: string
  style?: CSSProperties
  isPrivate?: boolean
  isAnnouncement?: boolean
}) {
  let name: string | undefined
  switch (type) {
    case ChannelType.guildCircle:
      name = `${nameMap[type] ?? DEFAULT_NAME}`
      break
    case ChannelType.guildText:
      if (isAnnouncement) {
        name = `${nameMap[ChannelType.GuildNotice]}`
      } else if (type in nameMap) {
        name = `${nameMap[type] ?? DEFAULT_NAME}-${isPrivate ? 'Lock' : 'Normal'}`
      }
      break
    default:
      if (type in nameMap) {
        name = `${nameMap[type] ?? DEFAULT_NAME}-${isPrivate ? 'Lock' : 'Normal'}`
      }
      break
  }
  // 使用 CSS color 能保证图标初始颜色正常
  style ??= {}
  style.color = color
  return <iconpark-icon style={style} class={className} size={size} color={color} name={name ?? DEFAULT_NAME} />
}
