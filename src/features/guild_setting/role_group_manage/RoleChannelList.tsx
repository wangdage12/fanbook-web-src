import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { useEffect, useState } from 'react'
import ChannelIcon from '../../../components/ChannelIcon.tsx'
import FormInfoBlock from '../../../components/form/body/FormInfoBlock.tsx'
import { PermissionService } from '../../../services/PermissionService.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'

export function ChannelCategoryItem({
  channel,
  collapseCateIds,
  onClick,
}: {
  channel: ChannelStruct
  collapseCateIds: Record<string, boolean>
  onClick?: () => void
}) {
  const collapsed = collapseCateIds[channel.channel_id]
  return (
    <div className={'flex w-full cursor-pointer items-center gap-1 py-2 mt-4'} onClick={onClick}>
      <iconpark-icon
        class={`${collapsed ? '-rotate-90' : 'rotate-0'} text-xs text-[var(--fg-b40)] transition-transform`}
        name="TriangleDown"
        size={14}
      ></iconpark-icon>
      <span className={'flex-grow truncate text-xs font-bold text-[var(--fg-b40)]'}>{channel.name}</span>
    </div>
  )
}

export function ChannelItem({
  channel,
  isPrivate,
  collapseCateIds,
  onClick,
}: {
  channel: ChannelStruct
  collapseCateIds: Record<string, boolean>
  isPrivate: boolean
  onClick?: () => void
}) {
  const collapsed = channel.parent_id ? collapseCateIds[channel.parent_id] : false

  if (collapsed) return null

  return (
    <HoverBox radius={10} className="mx-[-8px] flex h-[40px] w-full cursor-pointer px-2" onClick={onClick}>
      <div className="flex w-full items-center gap-2 py-2.5">
        <ChannelIcon type={channel.type} isPrivate={isPrivate} isAnnouncement={channel.announcement_mode} />
        <span className="flex-1 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">{channel.name}</span>
      </div>
    </HoverBox>
  )
}

export function RoleChannelList({
  guildId,
  channels,
  onChange,
  collapseCateIds,
  onCollapseChange,
  message,
}: {
  message?: string
  guildId?: string
  channels: Record<string, ChannelStruct>
  collapseCateIds?: Record<string, boolean>
  onCollapseChange?: (collapseCateIds: Record<string, boolean>) => void
  onChange?: (channel: ChannelStruct) => void
}) {
  const guild = GuildUtils.getGuildById(guildId)
  // 频道可见性，这个可见性包括权限导致的频道和分类可见性，不包括折叠导致的可见性
  const [visibilities, setVisibilities] = useState<Record<string, boolean>>({})
  const [innerCollapseCateIds, setInnerCollapseCateIds] = useState<Record<string, boolean>>({})

  // 计算所有频道可见性
  const computeAllChannelsVisibility = () => {
    guild && setVisibilities(PermissionService.computeAllChannelsVisibility(guild.guild_id))
  }

  useEffect(() => {
    computeAllChannelsVisibility()
  }, [])

  useEffect(() => {
    setInnerCollapseCateIds(collapseCateIds ?? {})
    onCollapseChange?.(collapseCateIds ?? {})
  }, [collapseCateIds])

  if (!guild) {
    return null
  }
  return (
    <div className="flex h-[600px] flex-col pb-4">
      {message ?
        <FormInfoBlock content={message} />
      : null}
      <div className="flex flex-1 flex-col items-center overflow-auto px-2">
        {guild.channel_lists.map(channelId => {
          const channel = channels[channelId]
          if (!channel || !visibilities[channelId]) return null
          const isPrivate = PermissionService.isPrivateChannel(channel.guild_id, channel.channel_id)
          switch (channel.type) {
            case ChannelType.Category:
              return (
                <ChannelCategoryItem
                  key={channelId}
                  channel={channel}
                  collapseCateIds={innerCollapseCateIds}
                  onClick={() => {
                    setInnerCollapseCateIds(prev => {
                      const newValue = { ...prev }
                      newValue[channel.channel_id] = !newValue[channel.channel_id]
                      return newValue
                    })
                  }}
                />
              )
            case ChannelType.guildVoice:
            case ChannelType.guildVideo:
            case ChannelType.guildText:
            case ChannelType.Link:
            case ChannelType.circleNews:
            case ChannelType.circlePostNews:
            case ChannelType.officialOperation:
            case ChannelType.Metaverse:
            case ChannelType.GuildNotice:
            case ChannelType.CircleNews:
            case ChannelType.UserFollow:
            case ChannelType.ActivityCalendar:
            case ChannelType.GuildQuestion:
            case ChannelType.guildLive:
            case ChannelType.liveRoom:
              return (
                <ChannelItem
                  key={channelId}
                  channel={channel}
                  isPrivate={isPrivate}
                  collapseCateIds={innerCollapseCateIds}
                  onClick={() => onChange?.(channel)}
                />
              )
            // 隐藏不支持的频道
            case ChannelType.CircleTopic:
            case ChannelType.guildCircle:
            case ChannelType.GroupDm:
            case ChannelType.DirectMessage:
            case ChannelType.task:
            case ChannelType.unsupported:
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

export default function showRoleChannelListModal({
  guildId,
  channels,
  title,
  message,
}: {
  guildId: string
  channels: Record<string, ChannelStruct>
  title: string
  message?: string
}) {
  showFbModal({
    showCancelButton: false,
    showOkButton: false,
    title,
    width: 400,
    content: <RoleChannelList guildId={guildId} channels={channels} message={message} />,
  })
}
