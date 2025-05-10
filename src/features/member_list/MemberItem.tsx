import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import CosImageUtils from 'fb-components/utils/CosImageUtils.ts'
import { useCallback, useContext } from 'react'
import { useAppDispatch } from '../../app/hooks.ts'
import { RealtimeAliasName } from '../../components/realtime_components/RealtimeAliasName.tsx'
import { userActions } from '../../components/realtime_components/realtime_nickname/userSlice.ts'
import UserCard from '../../components/user_card'
import { ChannelContext } from '../home/GuildWrapper'
import { GuildUserUtils, guildUserActions } from '../role/guildUserSlice'
import { MemberUserStruct } from './MemberStruct'

export default function MemberItem({ user }: { user: MemberUserStruct }) {
  const dispatch = useAppDispatch()
  const channel = useContext(ChannelContext)

  const handleClick = useCallback(() => {
    dispatch(
      userActions.update({
        user_id: user.user_id,
        avatar: user.avatar,
        username: user.username,
        bot: user.bot,
      })
    )
    channel &&
      dispatch(
        guildUserActions.update({
          userId: user.user_id,
          guildId: channel.guild_id,
          user: {
            // nickname: user.nickname_v2,
            roles: user.roles?.map(e => e.role_id),
          },
        })
      )
  }, [user])

  if (!channel) return null
  const roleIds = (user.roles ?? []).map(e => e.role_id)
  const roleColor = GuildUserUtils.getHighestRoleColor(channel.guild_id, roleIds) ?? 'var(--fg-b100)'
  return (
    <UserCard
      userId={user.user_id}
      guildId={channel.guild_id}
      channelId={channel.channel_id}
      key={user.user_id}
      align={{ points: ['tr'], offset: [-120, -22], _experimental: { dynamicInset: true } }}
    >
      <div
        className={'mb-[2px] flex h-[40px] cursor-pointer flex-row items-center px-[8px] hover:rounded-[8px] hover:bg-[var(--fg-b5)]'}
        onClick={handleClick}
      >
        <FbAvatar className="flex-shrink-0" fbSize={32} src={CosImageUtils.thumbnailMin(user.avatar, 24)} fbRadius={24}></FbAvatar>
        <div style={{ color: roleColor }} className={'ml-2 mr-1 truncate text-[12px] leading-[16px]'}>
          <RealtimeAliasName userId={user.user_id} guildId={channel.guild_id}>
            {name => name ?? user?.nickname_v2 ?? user?.nickname}
          </RealtimeAliasName>
        </div>
        {user.bot && <TenSizeTag text="机器人" />}
      </div>
    </UserCard>
  )
}
