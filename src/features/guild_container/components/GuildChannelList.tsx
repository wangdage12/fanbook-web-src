import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { useCallback, useEffect, useState } from 'react'
import { ChannelPermission, PermissionService } from '../../../services/PermissionService.ts'
import { GuildAudiovisualItem, GuildChannelCategoryItem, GuildChannelTextItem } from '../GuildChannelItems.tsx'

export default function GuildChannelList({ guild, hasManagePermission }: { guild: GuildStruct; hasManagePermission: boolean }) {
  // 频道可见性，这个可见性包括权限导致的频道和分类可见性，不包括折叠导致的可见性
  const [visibilities, setVisibilities] = useState<Record<string, boolean>>({})

  // 计算所有频道可见性
  const computeAllChannelsVisibility = () => {
    setVisibilities(PermissionService.computeAllChannelsVisibility(guild.guild_id))
  }

  // 计算频道可见性，这个可见性包括权限导致的频道和分类可见性，不包括折叠导致的可见性
  const computeChannelsVisibility = useCallback(
    (channelId: string, index: number, newVisibility: boolean) => {
      let categoryId: undefined | string
      let categoryVisibility = newVisibility
      // 频道权限变化时，可能需要更新它的分配可见性
      for (let i = index - 1; i >= 0; i--) {
        const channel = guild.channels[guild.channel_lists[i]]
        if (!channel) continue
        if (channel.type === ChannelType.Category) {
          categoryId = channel.channel_id
          break
        } else {
          /// 任意一个子频道可见，那么分类可见
          if (!categoryVisibility && visibilities[channel.channel_id]) {
            categoryVisibility = true
          }
        }
      }

      setVisibilities(prev => {
        const newValue = { ...prev }
        newValue[channelId] = newVisibility
        if (categoryId !== undefined) {
          newValue[categoryId] = categoryVisibility
        }
        return newValue
      })
    },
    [guild, guild.channel_lists, guild.channels, visibilities]
  )

  // 社区变更时重新计算所有频道可见性
  useEffect(() => {
    computeAllChannelsVisibility()
  }, [guild, guild.channel_lists, hasManagePermission])

  // 监听所有频道的权限变化
  useEffect(() => {
    const listeners: Array<() => void> = []
    for (let i = 0; i < guild.channel_lists.length; i++) {
      const cid = guild.channel_lists[i]
      const channel = guild.channels[cid]
      if (!channel || channel.type === ChannelType.Category) continue
      listeners.push(
        PermissionService.listenPermissions(
          ChannelPermission.ViewChannel,
          val => {
            computeChannelsVisibility(cid, i, val.any())
          },
          {
            guildId: guild.guild_id,
            channelId: cid,
          }
        )
      )
    }

    return () => {
      for (const unsubscribe of listeners) {
        unsubscribe()
      }
    }
  }, [guild, guild.channel_lists, hasManagePermission, computeChannelsVisibility])

  return guild.channel_lists.map(channelId => {
    const channel = guild.channels[channelId]
    if (!channel || !visibilities[channelId]) return null
    const isPrivate = PermissionService.isPrivateChannel(channel.guild_id, channel.channel_id)
    switch (channel.type) {
      case ChannelType.Category:
        return <GuildChannelCategoryItem key={channelId} channel={channel} />
      case ChannelType.guildVoice:
      case ChannelType.guildVideo:
        return <GuildAudiovisualItem key={channelId} channel={channel} isPrivate={isPrivate} />
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
      case ChannelType.CircleTopic:
        return <GuildChannelTextItem key={channelId} channel={channel} isPrivate={isPrivate} />
      // 隐藏不支持的频道
      case ChannelType.guildCircle:
      case ChannelType.GroupDm:
      case ChannelType.DirectMessage:
      case ChannelType.task:
      case ChannelType.unsupported:
      default:
        return null
    }
  })
}
