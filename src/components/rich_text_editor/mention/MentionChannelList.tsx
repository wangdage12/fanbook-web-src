import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { useMemo } from 'react'
import GuildUtils from '../../../features/guild_list/GuildUtils.tsx'
import { SelectionList } from '../../../features/message_list/components/SelectionList.tsx'
import { PermissionService } from '../../../services/PermissionService.ts'
import ChannelIcon from '../../ChannelIcon.tsx'

interface MentionGuildListProps {
  onSelect: (channel: ChannelStruct) => void
  onClose: () => void
  onUpdateResultCount: (count: number) => void
  filter?: string
  // 可以跨社区打开 @ 列表，所以不可以使用 context 中的 id
  guildId: string
}

export default function MentionChannelList({ guildId, onSelect, onUpdateResultCount, onClose, filter }: MentionGuildListProps) {
  const guild = useMemo(() => GuildUtils.getGuildById(guildId), [guildId])

  if (!guild) return
  if (filter === undefined) return null

  let channels = Object.values(guild.channels).filter(c => c.type !== ChannelType.Category)

  const visibilities = PermissionService.computeAllChannelsVisibility(guildId)
  channels = channels.filter(c => visibilities[c.channel_id])

  if (filter) {
    channels = channels.filter(c => c.name.includes(filter))
  }

  if (!channels.length) {
    // 不能在 render 期间调用 setState
    requestAnimationFrame(onClose)
    return null
  }

  return (
    <SelectionList
      onSelect={data => onSelect(data)}
      onUpdateResultCount={onUpdateResultCount}
      onClose={onClose}
      className={'flex flex-col bg-[var(--fg-white-1)] p-2 px-2 text-sm font-medium text-[var(--fg-b100)]'}
      data={[{ items: channels }]}
      keyGen={channel => channel.channel_id}
      itemBuilder={channel => (
        <div key={channel.channel_id} className={'flex h-10 items-center gap-2'}>
          <ChannelIcon
            size={14}
            type={channel.type}
            isPrivate={PermissionService.isPrivateChannel(channel.guild_id, channel.channel_id)}
            isAnnouncement={channel.announcement_mode}
          />
          {channel.name}
        </div>
      )}
    />
  )
}
