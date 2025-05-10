import { ChannelInfoStruct, GuildInfoStruct } from 'fb-components/struct/type'
import { useEffect, useState } from 'react'
import { PermissionService } from '../../../services/PermissionService'
import GuildUtils from '../../guild_list/GuildUtils'

/**
 * 是否需要渲染成卡片
 *
 * 1. 非分享链接
 *
 * 2. 分享链接, 有内容权限(内容接口返回 1012), 本社区
 *
 * 3. 分享链接, 有内容权限(内容接口未返回 1012), 非本社区 同时满足下面条件渲染:
 *
 *  3.1. 公开社区, 非私密频道
 *
 *  3.2. 公开社区, 社区成员, 私密频道, 有权限
 *
 *  3.3. 私密社区, 社区成员, 非私密频道
 *
 *  3.4. 私密社区, 社区成员, 私密频道, 有权限
 */
export function useNeedRender(
  isShareUrl: boolean,
  hasPermission = true,
  currentGuildId?: string,
  guild?: GuildInfoStruct,
  channel?: ChannelInfoStruct
) {
  const [needRender, setNeedRender] = useState(!isShareUrl)

  useEffect(() => {
    if (!isShareUrl) {
      setNeedRender(true)
      return
    }

    if (!hasPermission) {
      setNeedRender(false)
      return
    }

    if (guild?.guild_id === currentGuildId) {
      setNeedRender(true)
      return
    }
    const channelPermission = channel?.channel_permission?.[0]
    const isInOriginGuild = guild?.guild_id ? GuildUtils.isInGuild(guild?.guild_id) : false
    const isOriginGuildPrivate = guild?.is_private
    const isOriginChannelPrivate = channelPermission && PermissionService.isPrivateChannel(channelPermission.guild_id, channelPermission.channel_id)

    if (!isOriginGuildPrivate && !isOriginChannelPrivate) {
      setNeedRender(true)
      return
    }

    if (isOriginGuildPrivate && isInOriginGuild && !isOriginChannelPrivate) {
      setNeedRender(true)
      return
    }

    setNeedRender(false)
  }, [isShareUrl, hasPermission, currentGuildId, guild, channel])

  return needRender
}
