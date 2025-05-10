import { GuildStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { useMemo } from 'react'
import FormInfoBlock from '../../../../components/form/body/FormInfoBlock.tsx'
import { PermissionService, SpecialPermission } from '../../../../services/PermissionService.ts'
import GuildUtils from '../../../guild_list/GuildUtils.tsx'
import LocalUserInfo from '../../../local_user/LocalUserInfo.ts'
import IdentityList from '../../components/IdentityList.tsx'
import { ChannelSettingsSubPageProps } from '../CircleChannelSettings.tsx'

export default function ChannelManagerSettings({ value: channel }: ChannelSettingsSubPageProps) {
  const guild = useMemo(() => GuildUtils.getCurrentGuild() as GuildStruct, [])
  const channelAdminRole = useMemo(() => Object.values(guild.roles).find(r => r.t == RoleType.ChannelManager), [guild])

  const channelPermission = useMemo(
    () => PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId),
    [channel.channel_id]
  )
  const tip = '圈子管理员支持更改成员在圈子的权限、管理圈子动态等。'

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
