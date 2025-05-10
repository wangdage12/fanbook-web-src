import { Dropdown, DropDownProps, Input, MenuProps } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { isEqual } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { globalEmitter, GlobalEvent } from '../../../base_services/event'
import usePermissions from '../../../base_services/permission/usePermissions'
import { addBlacklist, isBlacklist, removeBlacklist } from '../../../features/blacklist/blacklistSlice'
import BotUtils from '../../../features/bot/BotUtils.ts'
import GuildUtils from '../../../features/guild_list/GuildUtils.tsx'
import { fetchMuteState, removeMuteList } from '../../../features/guild_list/muteListAPI'
import LocalUserInfo from '../../../features/local_user/LocalUserInfo.ts'
import { remarkFriend, remarkSelectors } from '../../../features/remark/remarkSlice'
import { guildUserSelectors, GuildUserUtils } from '../../../features/role/guildUserSlice'
import { GuildPermission } from '../../../services/PermissionService'
import { removeFromGuild, report } from '../../../utils/jump.tsx'
import { UserHelper } from '../../realtime_components/realtime_nickname/userSlice.ts'
import { remove } from '../RelationAPI'
import { MuteForm } from './MuteForm'
import { removeBotFromChannel } from './util.ts'

interface UserMenuDropdownProps extends Omit<DropDownProps, 'menu'> {
  userId: string
  isBot?: boolean
  guildId?: string
  channelId?: string
  nickname?: string
  // guildNickname?: string
  username?: string
  // remark?: string
  beforeHandler?: () => void
  afterHandler?: () => void
  deletable?: boolean
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  userId,
  isBot = false,
  guildId,
  channelId,
  nickname,
  children,
  beforeHandler,
  afterHandler,
  deletable = false,
  ...props
}) => {
  const remark = useAppSelector(remarkSelectors.remark(userId))
  const roles = useAppSelector(guildUserSelectors.userRoles(guildId, userId), isEqual)
  const dispatch = useAppDispatch()
  const isBlack = useAppSelector(isBlacklist(userId))
  const [isMute, setIsMute] = useState(false)
  const permission = usePermissions({
    permission: GuildPermission.KickMembers | GuildPermission.BanMembers | GuildPermission.ManageBot,
    guildId,
    channelId,
  })

  const remarkName = useRef(remark ?? '')
  const isHighRole = useMemo(() => {
    return guildId ? GuildUserUtils.hasHigherRoleThan(guildId, userId) : false
  }, [guildId, userId, roles])

  const showMuteItem = useMemo(() => {
    return guildId && !isBot && permission.has(GuildPermission.BanMembers) && isHighRole
  }, [guildId, isBot, permission, isHighRole])

  const items: MenuProps['items'] = [
    {
      label: '设置备注名',
      key: 'remark',
    },
    ...(channelId ?
      [
        {
          label: '提及 @',
          key: 'mention',
        },
      ]
    : []),
    {
      type: 'divider',
    },
    {
      label: !isBlack ? '屏蔽' : '解除屏蔽',
      key: 'blacklist',
    },
    {
      label: '举报',
      key: 'report',
    },
    ...(showMuteItem ?
      [
        {
          label: !isMute ? '禁言' : '解除禁言',
          key: 'silence',
        },
      ]
    : []),
    ...(deletable ?
      [
        {
          label: (
            <div className="flex w-full items-center justify-between text-[var(--function-red-1)]">
              <span>删除好友</span>
            </div>
          ),
          key: 'delete',
        },
      ]
    : []),
    ...((
      guildId ?
        !isBot ? permission.has(GuildPermission.KickMembers) && isHighRole
        : permission.has(GuildPermission.ManageBot)
      : false
    ) ?
      [
        {
          label: (
            <div className="flex w-full items-center justify-between text-[var(--function-red-1)]">
              <span>{isBot ? '移除机器人' : '移出社区'}</span>
            </div>
          ),
          key: 'remove',
        },
      ]
    : []),
  ]

  const menu: MenuProps = {
    items,
    className: 'min-w-[120px]',
    onClick: async ({ key, domEvent }) => {
      domEvent.stopPropagation()
      beforeHandler?.()
      switch (key) {
        case 'remark':
          showFbModal({
            title: '修改备注名',
            content: (
              <div className="w-[368px]">
                <span className="mb-[4px] block text-[14px] font-bold">昵称</span>
                <Input
                  className="w-full"
                  defaultValue={remarkName.current}
                  onChange={evt => {
                    remarkName.current = evt.target.value
                  }}
                  placeholder={nickname}
                  showCount
                  maxLength={12}
                />
              </div>
            ),
            onCancel: () => {
              remarkName.current = remark ?? ''
            },
            onOk: async () => {
              remarkName.current = remarkName.current.trim()
              await dispatch(
                remarkFriend({
                  userId: LocalUserInfo.userId,
                  friendId: userId,
                  name: remarkName.current.trim(),
                })
              )
              afterHandler?.()
            },
          })
          break
        case 'mention':
          globalEmitter.emit(GlobalEvent.InsertMention, { userId, channelId })
          break
        case 'blacklist':
          if (!isBlack) {
            FbModal.error({
              title: '屏蔽',
              content: '屏蔽后，你将不再收到对方的私聊，确定屏蔽？',
              okButtonProps: {
                danger: true,
              },
              onOk: async () => {
                await dispatch(addBlacklist({ userId: LocalUserInfo.userId, friendId: userId }))
                afterHandler?.()
              },
            })
          } else {
            await dispatch(removeBlacklist({ userId: LocalUserInfo.userId, friendId: userId }))
            afterHandler?.()
          }
          break
        case 'report':
          report({ accusedUserId: userId, accusedName: nickname })
          break
        case 'delete':
          FbModal.error({
            title: '删除好友',
            content: '删除后，将从彼此的好友列表中移出，确定删除？',
            okButtonProps: {
              danger: true,
            },
            onOk: async () => {
              await remove(LocalUserInfo.userId, userId)
              afterHandler?.()
            },
          })
          break
        case 'silence':
          if (!isMute) {
            const { destroy: close } = showFbModal({
              title: `禁言 ${UserHelper.getAliasName(userId, guildId, nickname)}`,
              width: 440,
              content: (
                <MuteForm
                  userId={userId}
                  guildId={guildId}
                  onClose={async () => {
                    await fetchIsMuted()
                    close()
                  }}
                />
              ),
              footer: null,
            })
          } else {
            showFbModal({
              title: '解除禁言',
              content: '确定解除该用户的禁言？',
              onOk: async () => {
                if (guildId) {
                  await removeMuteList(userId, guildId)
                  await fetchIsMuted()
                  FbToast.open({ content: '已解除禁言', key: 'user-menu-silence' })
                }
              },
            })
            afterHandler?.()
          }
          break
        case 'remove': {
          if (isBot && channelId) {
            const channel = GuildUtils.getChannelById(guildId, channelId)
            if (channel) {
              removeBotFromChannel(channel, userId)
            }
            await BotUtils.removeBotFromChannel(guildId!, channelId, userId)
            FbToast.open({ content: '移除成功', key: 'user-menu-remove' })
            globalEmitter.emit(GlobalEvent.BotRemovedFromChannel, { botId: userId, guildId: guildId!, channelId })
          } else {
            await removeFromGuild(false, guildId, userId, nickname, fetchIsMuted)
          }
          break
        }
        default:
          break
      }
    },
  }

  useEffect(() => {
    remarkName.current = remark ?? ''
  }, [remark])

  async function fetchIsMuted() {
    if (guildId) {
      const { endtime } = await fetchMuteState(userId, guildId)
      setIsMute(endtime > 0)
    }
  }

  useEffect(() => {
    if (!showMuteItem) return
    fetchIsMuted()
    const timer = setInterval(() => {
      fetchIsMuted()
    }, 5000)
    return () => {
      clearTimeout(timer)
    }
  }, [showMuteItem])

  return (
    <Dropdown menu={menu} {...props}>
      {children}
    </Dropdown>
  )
}

export default UserMenuDropdown
