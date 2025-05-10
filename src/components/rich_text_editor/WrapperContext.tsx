import { ReactNode } from 'react'
import GuildUtils from '../../features/guild_list/GuildUtils.tsx'
import { ChannelContext, GuildContext } from '../../features/home/GuildWrapper.tsx'

// 有些跨服务器场景会出错, 需要传入 guildId 和 channelId
export function WrapperContext({ children, guildId, channelId }: { children: ReactNode; guildId?: string; channelId?: string }) {
  return (
    <GuildContext.Provider value={guildId ? GuildUtils.getGuildById(guildId) : GuildUtils.getCurrentGuild()}>
      <ChannelContext.Provider value={guildId && channelId ? GuildUtils.getChannelById(guildId, channelId) : GuildUtils.getCurrentChannel()}>
        {children}
      </ChannelContext.Provider>
    </GuildContext.Provider>
  )
}
