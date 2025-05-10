import FbSelect from 'fb-components/base_ui/fb_select'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { useMemo } from 'react'
import GuildUtils from '../features/guild_list/GuildUtils.tsx'
import { PermissionService } from '../services/PermissionService.ts'
import RealtimeChannelName from './realtime_components/RealtimeChannel.tsx'

export default function ChannelSelect({ guildId, value, onChange }: { guildId: string; value?: string; onChange?: (value: any) => void }) {
  const textChannelOptions = useMemo(
    () =>
      GuildUtils.getOrderChannels(guildId)
        .filter(e => e.type === ChannelType.guildText)
        .filter(e => !PermissionService.isPrivateChannel(e.guild_id, e.channel_id))
        .map(c => ({
          label: c.name,
          value: c.channel_id,
        })),
    []
  )

  return (
    <FbSelect
      value={value}
      options={textChannelOptions}
      optionRender={({ value }) => {
        return <RealtimeChannelName guildId={guildId} iconSpacing={10} channelId={value as string} prefixChannelIcon />
      }}
      placeholder={'请选择频道'}
      dropdownRender={menu => {
        return (
          <>
            <div className={'py-2.5 px-3 text-xs text-[var(--fg-b60)]'}>仅支持选择公开可见频道</div>
            {menu}
          </>
        )
      }}
      className={'w-[320px]'}
      size={'large'}
      onChange={onChange}
    />
  )
}
