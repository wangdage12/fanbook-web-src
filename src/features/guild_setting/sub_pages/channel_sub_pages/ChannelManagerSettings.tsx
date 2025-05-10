import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { useMemo } from 'react'
import FormInfoBlock from '../../../../components/form/body/FormInfoBlock.tsx'
import { PermissionService, SpecialPermission } from '../../../../services/PermissionService.ts'
import GuildUtils from '../../../guild_list/GuildUtils.tsx'
import LocalUserInfo from '../../../local_user/LocalUserInfo.ts'
import IdentityList from '../../components/IdentityList.tsx'
import { ChannelSettingsSubPageProps } from '../ChannelSettings.tsx'

export default function ChannelManagerSettings({ value: channel }: ChannelSettingsSubPageProps) {
  const guild = useMemo(() => GuildUtils.getCurrentGuild() as GuildStruct, [])
  const channelAdminRole = useMemo(() => Object.values(guild.roles).find(r => r.t == RoleType.ChannelManager), [guild])

  const channelPermission = useMemo(
    () => PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId),
    [channel.channel_id]
  )
  const tip = useMemo(() => {
    switch (channel.type) {
      case ChannelType.Link:
        return '频道管理员支持变更当前频道的设置项：更改频道成员权限。'
      case ChannelType.guildVoice:
        return '频道管理员支持变更当前频道的设置项：更改频道成员权限、设置声音质量、设置用户限制。 '
      case ChannelType.GuildQuestion:
        return '频道管理员支持变更当前频道的设置项：更改频道成员权限、精选问题、置顶问题、设置可见性、设置推荐答案、删除回复。'
      default:
        return '频道管理员支持变更当前频道的设置项：更改频道成员权限、管理频道消息、设置发言模式、频道快捷指令。'
    }
  }, [channel])

  return (
    <div className={'flex h-full flex-col p-6'}>
      <FormInfoBlock content={tip} />
      <IdentityList
        editable={channelPermission.has(SpecialPermission.Administrator)}
        className="flex-1"
        role={channelAdminRole}
        channel={channel}
        title="当前成员"
      />
    </div>
  )
}
