import { CircleChannelStruct } from 'fb-components/circle/types.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { useEffect, useMemo, useState } from 'react'
import { ChannelPermission, GuildPermission } from '../../../services/PermissionService.ts'
import { useUpdateCircleInfo } from '../../circle/hooks/useUpdateCircleInfo.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import SettingsScaffold, { MenuItem } from '../SettingsScaffold.tsx'
import ChannelInfoSettings from './circle_sub_pages/ChannelInfoSettings.tsx'
import ChannelManagerSettings from './circle_sub_pages/ChannelManagerSettings.tsx'
import ChannelPermissionSettings from './circle_sub_pages/ChannelPermissionSettings.tsx'
import CircleTagSettings from './circle_sub_pages/CircleTagSettings.tsx'

interface ChannelSettingsProps {
  channelId: string
  closeWindow: () => void
}

export interface ChannelSettingsSubPageProps {
  value: CircleChannelStruct
  onChange?: (value: CircleChannelStruct) => void
}

export function CircleChannelSettings({ closeWindow }: ChannelSettingsProps) {
  const guild = GuildUtils.getCurrentGuild() as GuildStruct
  const circleChannelId = guild?.circle.channel_id
  const [channel, setChannel] = useState(() => {
    return guild.circle
  })
  const { loading, channel: circleChannel } = useUpdateCircleInfo({ guildId: guild?.guild_id, channelId: circleChannelId })
  useEffect(() => {
    if (!loading && circleChannel) {
      setChannel(circleChannel)
    }
  }, [loading])

  const channelMenu: MenuItem[] = useMemo(() => {
    return [
      {
        label: '基础设置',
        children: [
          {
            label: '频道信息',
            key: 'channel-info',
            icon: 'Edit',
            component: <ChannelInfoSettings value={channel} onChange={setChannel} />,
            permissions: GuildPermission.ManageCircle,
          },
        ],
      },
      {
        label: '成员权限',
        children: [
          {
            label: '频道管理员',
            key: 'channel-admin',
            icon: 'UserSetting',
            component: <ChannelManagerSettings value={channel} onChange={setChannel} />,
            permissions: ChannelPermission.ChannelManager,
          },
          {
            label: '频道权限设置',
            key: 'channel-permission',
            icon: 'ServerSetting',
            component: <ChannelPermissionSettings value={channel} onChange={setChannel} />,
            permissions: ChannelPermission.ChannelManager,
          },
        ],
      },
      {
        label: '话题管理',
        children: [
          {
            label: '推荐话题设置',
            key: 'tag-manage',
            icon: 'Channel-Setting',
            component: <CircleTagSettings value={channel} />,
            permissions: GuildPermission.ManageCircle,
          },
        ],
      },
    ]
  }, [channel, setChannel])

  return <SettingsScaffold title="圈子设置" channelId={circleChannelId} menus={channelMenu} onClose={closeWindow} loading={loading} />
}
