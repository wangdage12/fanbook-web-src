import clsx from 'clsx'
import { HTMLAttributes, useContext } from 'react'
import GuildUtils from '../../features/guild_list/GuildUtils'
import { ChannelContext, GuildContext } from '../../features/home/GuildWrapper'
import { PermissionService } from '../../services/PermissionService'
import ChannelIcon from '../ChannelIcon'

/**
 * 实时更新的频道名，通常情况下所有参数都可以不传
 *
 * @param guildId     通常你不用传递 guildId，它会从 `GuildContext` 自动获取
 * @param channelId   频道 id，如果没有会从 `ChannelContext` 自动获取当前频道
 * @param prefix      前缀，通常用来加 # 符号
 * @param className
 * @param prefixChannelIcon   是否在前缀处显示频道图标
 * @param iconSpacing
 * @param ellipsis
 * @param defaultChannelName  频道名不存在时显示的默认值
 * @param rest        其他 Dom 属性
 * @constructor
 */
export default function RealtimeChannelName({
  guildId,
  channelId,
  prefix,
  className,
  prefixChannelIcon = false,
  iconColor = 'currentColor',
  iconSpacing = 4,
  ellipsis = true,
  defaultChannelName,
  ...rest
}: {
  guildId?: string
  channelId?: string
  prefix?: string
  prefixChannelIcon?: boolean
  iconColor?: string
  ellipsis?: boolean
  iconSpacing?: number
  defaultChannelName?: string
} & HTMLAttributes<never>) {
  let guild = useContext(GuildContext)
  let channel = useContext(ChannelContext)
  if (!guild && guildId) {
    guild = GuildUtils.getGuildById(guildId)
  }
  if (channelId) {
    channel = guild?.channels[channelId] ?? channel
  }
  if (!channel)
    return defaultChannelName ?
        <span {...rest} className={className}>
          {defaultChannelName}
        </span>
      : null

  return (
    <span className={clsx([className, { truncate: ellipsis }])} {...rest}>
      {prefix}
      {prefixChannelIcon && (
        <span className={'align-middle leading-none'}>
          <ChannelIcon
            size={'1em'}
            color={iconColor}
            className="inline-block"
            style={{
              marginRight: iconSpacing,
              height: '1em',
            }}
            type={channel.type}
            isPrivate={PermissionService.isPrivateChannel(channel.guild_id, channel.channel_id)}
            isAnnouncement={channel.announcement_mode}
          />
        </span>
      )}
      <span>{channel.name}</span>
    </span>
  )
}
