import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { useMemo, useState } from 'react'
import { store } from '../../../app/store.ts'
import { ChannelPermission, GuildPermission, SpecialPermission } from '../../../services/PermissionService.ts'
import ChannelAPI from '../../guild_container/ChannelAPI.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { guildListActions } from '../../guild_list/guildListSlice.ts'
import SettingsScaffold, { MenuItem } from '../SettingsScaffold.tsx'
import ChannelInfoSettings from './channel_sub_pages/ChannelInfoSettings.tsx'
import ChannelManagerSettings from './channel_sub_pages/ChannelManagerSettings.tsx'
import ChannelPermissionSettings from './channel_sub_pages/ChannelPermissionSettings.tsx'
import QuestionTagSettings from './channel_sub_pages/QuestionTagSettings.tsx'
import SpeakModeSettings from './channel_sub_pages/SpeakModeSettings.tsx'

interface ChannelSettingsProps {
  channelId: string
  closeWindow: () => void
}

export interface ChannelSettingsSubPageProps {
  value: ChannelStruct
  onChange: (value: ChannelStruct) => void
}

export function ChannelSettings({ channelId, closeWindow }: ChannelSettingsProps) {
  const [channel, setChannel] = useState(() => {
    const guild = GuildUtils.getCurrentGuild() as GuildStruct
    return guild.channels[channelId]
  })

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
            permissions: GuildPermission.ManageChannels,
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
        label: '其他设置',
        children: [
          ...(channel.type === ChannelType.guildText ?
            [
              {
                label: '发言模式',
                key: 'channel-speak-mode',
                icon: 'CommentSetting',
                component: <SpeakModeSettings value={channel} onChange={setChannel} />,
                permissions: GuildPermission.ManageChannels,
              },
            ]
          : []),
          ...(channel.type === ChannelType.GuildQuestion ?
            [
              {
                label: '标签管理',
                key: 'tag-manage',
                icon: 'Tag',
                component: <QuestionTagSettings value={channel} onChange={setChannel} />,
                permissions: GuildPermission.ManageChannels,
              },
            ]
          : []),
          {
            label: '删除频道',
            key: 'channel-delete',
            icon: 'Delete',
            dangerous: true,
            onClick: () => {
              FbModal.error({
                title: '删除频道',
                content: `确定将 ${channel.name} 删除？删除后不可撤销`,
                okText: '删除频道',
                onOk: async () => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const channelList = GuildUtils.getCurrentGuild()!.channel_lists.filter(e => e != channel.channel_id)
                  await ChannelAPI.deleteChannel(channel.guild_id, channelId, channelList)
                  store.dispatch(guildListActions.deleteChannel({ channel, channel_lists: channelList }))
                  closeWindow()
                },
              })
            },
            permissions: SpecialPermission.Administrator | GuildPermission.ManageChannels,
          },
        ],
      },
    ]
  }, [channel, setChannel])

  return <SettingsScaffold title="频道设置" channelId={channelId} menus={channelMenu} onClose={closeWindow} />
}
