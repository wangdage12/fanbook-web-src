import clsx from 'clsx'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { CSSProperties, useContext, useMemo } from 'react'
import { store } from '../../../app/store.ts'
import ChannelIcon from '../../../components/ChannelIcon.tsx'
import { PermissionService } from '../../../services/PermissionService.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { GuildContext } from '../../home/GuildWrapper.tsx'

export default function ImChannelLink({
  id,
  withIcon = true,
  colorful = true,
  style,
}: {
  id: string
  withIcon?: boolean
  colorful?: boolean
  style?: CSSProperties
}) {
  const currentGuild = useContext(GuildContext)

  const { guild, channel } = useMemo(() => {
    for (const g of store.getState().guild.list) {
      if (g.channels[id]) {
        return { guild: g, channel: g.channels[id] }
      }
    }
    return { guild: null, channel: null }
  }, [id])

  function handleJumpToChannel(channel: ChannelStruct) {
    if (!channel) return
    GuildUtils.selectChannel(channel)
  }

  if (!channel) {
    return (
      <span className={'text-[var(--fg-b40)]'} style={style}>
        {withIcon && <ChannelIcon size={14} type={ChannelType.guildText} className={'mr-1 translate-y-[2px]'} />}
        <span>频道不见了</span>
      </span>
    )
  }

  return (
    <span
      onClick={() => handleJumpToChannel(channel)}
      className={clsx(['message-inline-embed', colorful && 'cursor-pointer'])}
      style={{
        color: colorful ? 'var(--fg-blue-1)' : 'inherit',
        ...style,
      }}
    >
      {guild &&
        currentGuild?.guild_id !== guild?.guild_id &&
        (colorful ?
          <>
            <CosImage src={guild.icon} size={18} className={'mr-1 inline translate-y-[-1px] rounded'} placeholder={<></>} />
            <span className="font-bold">{guild.name}</span>
            <iconpark-icon name="Right" size={14} class={'translate-y-[2px] px-1'} style={{ height: '1em' }} />
          </>
        : `${guild.name}>`)}

      {withIcon && (
        <span className={'align-middle leading-none'}>
          <ChannelIcon
            size={'1em'}
            color={'currentColor'}
            style={{
              marginRight: 4,
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
