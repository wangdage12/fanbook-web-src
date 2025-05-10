import React from 'react'
import { Navigate } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import GuildUtils from '../guild_list/GuildUtils'

export const RootNavigate: React.FC = () => {
  const firstGuild = GuildUtils.getFirstGuild()
  if (!firstGuild) {
    // 没有社区，跳到发现
    return <Navigate to={AppRoutes.DISCOVERY} replace={true} state={{ fromRoot: true }} />
  }
  // 有社区跳到第一个
  const channel = GuildUtils.getFirstAccessibleTextChannel(firstGuild.guild_id)
  let url = `${AppRoutes.CHANNELS}/${firstGuild.guild_id}`
  if (channel) url += `/${channel.channel_id}`
  return <Navigate to={url} replace={true} state={{ fromRoot: true }} />
}
