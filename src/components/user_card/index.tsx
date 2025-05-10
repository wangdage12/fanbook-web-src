import { Button, Popover, PopoverProps } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import SizeAnimation from 'fb-components/components/animation/SizeAnimation.tsx'
import { GuildStruct, RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { ReactElement, ReactNode, cloneElement, useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useChannel, useGuild } from '../../base_services/permission/usePermissions'
import BotInfo from '../../features/bot/BotInfo'
import LocalUserInfo from '../../features/local_user/LocalUserInfo'
import { GuildUserUtils, guildUserActions, guildUserSelectors } from '../../features/role/guildUserSlice'
import { RoleAPI } from '../../features/role/roleAPI'
import { GuildPermission, PermissionService } from '../../services/PermissionService'
import StateUtils from '../../utils/StateUtils'
import RoleSelectionPopover from '../RoleSelectionList'
import { UserRole } from '../UserRoles'
import { RealtimeUserInfo } from '../realtime_components/realtime_nickname/RealtimeUserInfo'
import OurAssociates from './OurAssociates'
import UserProfile from './UserProfile'
import { useUserCardHandle } from './hooks'
import UserMenuDropdown from './user_menu/UserMenuDropdown'

interface UserCardProps {
  userId: string
  guildId?: string
  channelId?: string
  placement?: TooltipPlacement
  align?: PopoverProps['align']
  children: ReactElement
  disabled?: boolean
}

const getItem = (content: ReactNode) => (
  <li
    className="
     flex flex-wrap gap-[8px] border-[0px]
    border-b-[1px] border-solid border-gray-100 bg-[var(--fg-white-1)]
    p-3
    first-of-type:rounded-t-lg
    last-of-type:rounded-b-lg last-of-type:border-b-[0px]
  "
  >
    {content}
  </li>
)

function RoleBlock({
  roles,
  guild,
  userId,
  bot,
  onChange,
}: {
  bot: boolean
  roles: RoleStruct[]
  guild: GuildStruct
  userId: string
  onChange?: (roleIds: string[]) => void
}) {
  // 有管理角色权限的可以修改本人或者比自己低的角色的非机器人成员
  const hasPermission =
    (GuildUserUtils.hasHigherRoleThan(guild.guild_id, userId) || LocalUserInfo.userId === userId) &&
    PermissionService.computeGuildPermission(guild, LocalUserInfo.userId).has(GuildPermission.ManageRoles) &&
    !bot
  const normalMemberRole = useMemo(() => Object.values(guild.roles).find(role => role.t == RoleType.NormalMember), [])
  const orderedRoles = useMemo(() => {
    return Object.values(guild.roles)
      .filter(
        role =>
          !role.managed &&
          (role.t == RoleType.Owner || role.t == RoleType.Other || role.t == RoleType.SeniorManager || role.t == RoleType.NormalMember)
      )
      .sort((a, b) => b.position - a.position)
  }, [])

  const selected = useMemo(() => {
    return roles.map(role => role.role_id)
  }, [roles])

  const handleDelete = (roleId: string) => {
    const filtered = selected.filter(id => id !== roleId)
    // 如果角色组为空，则添加普通成员角色
    if (filtered.length === 0 && normalMemberRole) {
      filtered.push(normalMemberRole.role_id)
    }
    onChange?.(filtered)
  }

  return (
    <>
      {roles.map(role => {
        return <UserRole guildId={guild.guild_id} key={role.role_id} role={role} deletable={hasPermission} onDelete={handleDelete}></UserRole>
      })}
      {hasPermission && (
        <RoleSelectionPopover
          value={selected}
          onConfirm={onChange}
          roles={orderedRoles}
          userId={userId}
          guildId={guild.guild_id}
          defaultToCommonRole
        />
      )}
    </>
  )
}

const UserCard = ({ userId, guildId, channelId, placement = 'rightTop', children, align, disabled }: UserCardProps) => {
  const [open, handleOpenChange] = useState(false)
  const guild = useGuild(guildId)
  const channel = useChannel(guild?.guild_id, channelId)
  const dispatch = useAppDispatch()
  const userRoleIds = useAppSelector(guildUserSelectors.userRoles(guild?.guild_id, userId))
  const afterHandler = useCallback(() => {
    handleOpenChange(false)
  }, [])

  const { isCanDm, isCanAddFriend, isFriend, handleDMClick, handleAddFriendClick /*, handleClick */ } = useUserCardHandle(
    userId,
    guild?.guild_id,
    afterHandler,
    open
  )

  const userRoles: RoleStruct[] = useMemo(() => {
    if (!guild?.guild_id) {
      return []
    }
    // 此处不显示频道管理员
    return GuildUserUtils.getRoles(guild.guild_id, userRoleIds).filter(role => role.t != RoleType.ChannelManager)
  }, [guild?.guild_id, userRoleIds])

  const updateRole = useCallback(
    async (roleIds: string[]) => {
      if (!guild || roleIds.length === 0) return
      await RoleAPI.updateMemberRole({ guildId: guild.guild_id, memberId: userId, roleIds })
      dispatch(guildUserActions.update({ guildId: guild.guild_id, userId, user: { roles: roleIds } }))
    },
    [guild, userId]
  )

  const isCurrentUser = userId === StateUtils.localUser?.user_id
  return (
    <Popover
      align={align}
      overlayInnerStyle={{ borderRadius: 8, padding: 0 }}
      arrow={false}
      trigger={disabled ? [] : 'click'}
      open={open}
      destroyTooltipOnHide
      onOpenChange={handleOpenChange}
      placement={placement}
      content={
        <SizeAnimation animateAxis={'y'}>
          <RealtimeUserInfo
            userId={userId}
            loading={
              <div className="flex h-[120px] w-[120px] items-center justify-center">
                <CircularLoading />
              </div>
            }
          >
            {user => {
              return (
                <div className="w-[320px] px-[16px]">
                  <div className="flex h-[48px] w-full items-center justify-end">
                    {!isCurrentUser && (
                      <UserMenuDropdown
                        userId={user.user_id}
                        isBot={user.bot}
                        guildId={guild?.guild_id}
                        channelId={channel?.channel_id}
                        nickname={user.nickname}
                        username={user.username}
                        deletable={isFriend}
                        beforeHandler={() => handleOpenChange(false)}
                      >
                        <HoverBox>
                          <iconpark-icon name="More" class="cursor-pointer" size={18}></iconpark-icon>
                        </HoverBox>
                      </UserMenuDropdown>
                    )}
                  </div>
                  <UserProfile
                    avatar={user.avatar}
                    nickname={user.nickname}
                    guildNickname={user.guildNickname}
                    gender={user.gender}
                    username={user.username}
                    bot={user.bot}
                    remark={user.remark}
                  />
                  {user.bot && (
                    <BotInfo botId={userId}>
                      {bot => <div className={'mt-[16px] break-words text-sm text-[var(--fg-b60)]'}>简介：{bot.bot_description}</div>}
                    </BotInfo>
                  )}
                  <div className="mt-[16px] flex items-center justify-between gap-[16px] pb-[16px]">
                    <Button
                      icon={<iconpark-icon class="anticon" size={14} name="PrivateChat"></iconpark-icon>}
                      className="w-full"
                      disabled={!isCanDm}
                      onClick={handleDMClick}
                    >
                      私信
                    </Button>
                    {!isFriend && !user.bot && !isCurrentUser && (
                      <Button
                        icon={<iconpark-icon class="anticon" size={14} name="UserAdd"></iconpark-icon>}
                        className="w-full"
                        disabled={!isCanAddFriend}
                        onClick={handleAddFriendClick}
                      >
                        好友
                      </Button>
                    )}
                  </div>
                  {/* <div className="mt-[16px] flex h-[48px] items-center justify-between px-[16px]">
                  <HoverBox tooltip={{ title: '私信', arrow: false }} onClick={handleDMClick}>
                    <iconpark-icon
                      class="cursor-pointer"
                      size={18}
                      name="Message2"
                      color={!isCanDm ? 'var(--fg-b20)' : 'currentColor'}></iconpark-icon>
                  </HoverBox>
                  <HoverBox tooltip={{ title: '语音', arrow: false }} onClick={handleClick}>
                    <iconpark-icon class="cursor-pointer" size={18} name="Audio-Normal" color="var(--fg-b20)"></iconpark-icon>
                  </HoverBox>
                  <HoverBox tooltip={{ title: '视频', arrow: false }} onClick={handleClick}>
                    <iconpark-icon class="cursor-pointer" size={18} name="Video-Normal" color="var(--fg-b20)"></iconpark-icon>
                  </HoverBox>
                  {!isCurrentUser && !isFriend && (
                    <HoverBox tooltip={{ title: '添加好友', arrow: false }} onClick={handleAddFriendClick}>
                      <iconpark-icon
                        class="cursor-pointer"
                        size={18}
                        name="UserAdd"
                        color={!isCanAddFriend ? 'var(--fg-b20)' : 'currentColor'}></iconpark-icon>
                    </HoverBox>
                  )}
                </div> */}
                  {!user.bot && (
                    <div className="mx-[-16px] max-h-[400px] overflow-auto rounded-b-lg bg-gray-100 px-[16px] pb-[16px] pt-[8px] empty:p-0">
                      {/* 发布的动态 */}
                      {/* <div className="">
                    <div className="my-[8px] text-[12px] font-[var(--fg-b60)]">圈子动态</div>
                    <ul>
                      {getItem(
                        <div>
                          <RightOutlined className="text-gray-500" />
                        </div>
                      )}
                    </ul>
                  </div> */}
                      {guild && userRoles.length > 0 && (
                        <div>
                          <div className="my-[8px] text-[12px] font-[var(--fg-b60)]">在本社区的角色</div>
                          <ul>{getItem(<RoleBlock roles={userRoles} bot={user.bot} guild={guild} userId={user.user_id} onChange={updateRole} />)}</ul>
                        </div>
                      )}
                      {!isCurrentUser && (
                        <OurAssociates guildId={guild?.guild_id} user={user} onClose={() => handleOpenChange(false)}></OurAssociates>
                      )}
                    </div>
                  )}
                </div>
              )
            }}
          </RealtimeUserInfo>
        </SizeAnimation>
      }
    >
      {/* 请勿在此处添加 DOM 节点，否则会导致树结构变化，某些样式可能会失效 */}
      {cloneElement(children, {
        style: {
          ...children.props.style,
          cursor: 'pointer',
        },
      })}
    </Popover>
  )
}

export default UserCard
