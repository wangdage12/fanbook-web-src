import CosImage from 'fb-components/components/image/CosImage'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import GuildUtils from '../../features/guild_list/GuildUtils'

interface MutualGuildsProps {
  guilds: GuildStruct[]
}

export default function MutualGuilds({ guilds }: MutualGuildsProps) {
  return (
    <div className={'flex max-h-[504px] min-h-[384px] flex-col gap-0.5 overflow-y-auto'}>
      {guilds.map(guild => (
        <div
          key={guild.guild_id}
          className={'flex h-12 flex-shrink-0 cursor-pointer items-center rounded-lg px-[12px] hover:bg-[var(--fg-b5)]'}
          onClick={() => GuildUtils.selectGuild(guild.guild_id)}
        >
          <CosImage src={guild.icon} size={32} className="rounded-lg" />
          <div className={'ml-3 text-sm text-[var(--fg-b100)]'}>{guild.name}</div>
        </div>
      ))}
    </div>
  )
}
