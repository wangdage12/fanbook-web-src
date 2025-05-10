import FbToast from 'fb-components/base_ui/fb_toast/index'
import { GuildStruct, RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import ColorUtils from 'fb-components/utils/ColorUtils.ts'
import { isEqual, isString, orderBy, reverse, uniq } from 'lodash-es'
import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks.ts'
import { store } from '../../../app/store.ts'
import usePermissions from '../../../base_services/permission/usePermissions.ts'
import GuildAPI from '../../../features/guild_container/guildAPI.ts'
import GuildUtils from '../../../features/guild_list/GuildUtils.tsx'
import { ChannelContext } from '../../../features/home/GuildWrapper.tsx'
import MemberListAPI from '../../../features/home/MemberListAPI.ts'
import { MemberUserStruct } from '../../../features/member_list/MemberStruct.ts'
import MessageService from '../../../features/message_list/MessageService.ts'
import { SelectionList } from '../../../features/message_list/components/SelectionList.tsx'
import { possibleMentionsActions, possibleMentionsSelectors } from '../../../features/possibleMentionsSlice.ts'
import { RemarkHelper } from '../../../features/remark/remarkSlice.ts'
import { GuildUserHelper } from '../../../features/role/guildUserSlice.ts'
import { ChannelPermission } from '../../../services/PermissionService.ts'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { userActions } from '../../realtime_components/realtime_nickname/userSlice.ts'

interface MentionUserListProps {
  filter?: string
  onClose: () => void
  onUpdateResultCount: (count: number) => void
  onSelect: (data: RoleStruct | string) => void
  enabledMentionAll?: boolean
  enabledPossibleMention?: boolean
  enabledMentionRoles?: boolean
  // 可以跨社区打开 @ 列表，所以不可以使用 context 中的 id
  guildId: string
}

const EVERYONE = '全体成员'
export const globalMentionEveryLimit: Record<string, { remain: number; total: number }> = {}

function MentionUserList({
  filter,
  onUpdateResultCount,
  onClose,
  onSelect,
  enabledMentionAll,
  enabledPossibleMention,
  enabledMentionRoles,
  guildId,
}: MentionUserListProps) {
  // 可以跨社区打开 @ 列表，所以不可以使用 context 中的 id
  const guild = useMemo(() => GuildUtils.getGuildById(guildId), [guildId])
  const channel = useContext(ChannelContext)

  const dispatch = useAppDispatch()
  const [isStale, setIsStale] = useState(false)
  const mentionPermission = usePermissions({
    permission: ChannelPermission.MentionRoles,
    channelId: channel?.channel_id,
  })
  const possibleMentions = useAppSelector(possibleMentionsSelectors.getPossibleMentions(guild?.guild_id), isEqual)

  const mentionableRoles = useMemo(
    () =>
      guild?.roles && enabledMentionRoles && mentionPermission.any() ?
        orderBy(
          Object.values(guild.roles).filter(role => !role.managed && role.t != RoleType.ChannelManager),
          'position',
          'desc'
        )
      : [],
    [guild, mentionPermission, enabledMentionRoles]
  )
  // 是否显示 @ 全体成员
  const [everyone, setEveryone] = useState(mentionPermission.any())
  const [roles, setRoles] = useState<Array<RoleStruct>>(mentionableRoles)
  const [users, setUsers] = useState<string[]>(() => (channel ? getDefaultUsers(channel.channel_id) : []))
  const [mentionEveryoneLimit, setMentionEveryoneLimit] = useState<{ remain: number; total: number }>(
    globalMentionEveryLimit[guild?.guild_id ?? ''] ?? {
      remain: 0,
      total: 0,
    }
  )

  useEffect(() => {
    if (!guild) return

    if (!(guild.guild_id in globalMentionEveryLimit)) {
      GuildAPI.config(guild.guild_id).then(res => {
        globalMentionEveryLimit[guild.guild_id] = {
          remain: res.mention_all_left,
          total: res.mention_all_limit,
        }
        setMentionEveryoneLimit(globalMentionEveryLimit[guild.guild_id])
      })
    }
  }, [guild, guild?.guild_id])

  // 进行服务端搜索
  useEffect(() => {
    if (!guild || filter === undefined) return
    if (filter.trim() === '') {
      setIsStale(true)
      MemberListAPI.fetchMembers({
        guildId: guild.guild_id,
        channelId: channel && channel.guild_id === guild.guild_id ? channel.channel_id : '0',
        start: 0,
        end: 99,
        not_sync: true,
        channel_type: channel?.type,
      })
        .then(res => {
          const users = res.list.filter(e => e.type === 'user') as MemberUserStruct[]
          store.dispatch(
            userActions.updateUsers(
              users.map(user => {
                return {
                  ...user,
                  roles: user.roles?.map(role => role.role_id),
                }
              })
            )
          )
          setUsers(users.map(user => user.user_id))
        })
        .finally(() => {
          setEveryone(mentionPermission.any())
          setRoles(mentionableRoles)
          setIsStale(false)
        })
      return
    }
    setIsStale(true)
    GuildAPI.searchMember(guild.guild_id, filter)
      .then(res => {
        store.dispatch(userActions.updateUsers(res))
        setUsers(res.map(e => e.user_id))
      })
      .finally(() => {
        setEveryone(EVERYONE.includes(filter))
        setRoles(mentionableRoles.filter(e => e.name.includes(filter)))
        setIsStale(false)
      })
  }, [filter, guild, guild?.guild_id, mentionableRoles])

  if (filter === undefined) return null

  const items: Array<{ header?: { child: ReactNode; keyPrefix?: string }; items: Array<RoleStruct | string> }> = []

  if (enabledMentionAll && mentionPermission.any()) {
    items.push({
      items: everyone ? [{ name: EVERYONE, role_id: guild?.guild_id } as RoleStruct] : [],
    })
  }

  if (enabledPossibleMention && possibleMentions.length) {
    const subItems = possibleMentions.filter(userId => matchUser(userId, filter, guild))
    subItems.length > 0 &&
      items.push({
        header: { child: '可能@的人', keyPrefix: 'possible-mention-' },
        items: reverse(subItems),
      })
  }

  if (enabledMentionRoles && mentionPermission.any()) {
    items.push({
      header: { child: '全部身份组' },
      // 只显示非机器人角色
      items: roles,
    })
  }

  items.push({
    header: { child: '全部成员', keyPrefix: 'member-' },
    // 只显示非机器人角色
    // 通常 users 会有内容，即使是搜索内容为空，也会保留上一次的搜索结果，所以这里进入 else 分支的情况是：
    // 本次和上次都没有内容时，作为一个保底手段
    items:
      users.length ? users
      : channel && channel.guild_id === guild?.guild_id ? getDefaultUsers(channel.channel_id)
      : [],
  })

  function handleSelection(data: RoleStruct | string) {
    if (!isString(data) && data.role_id === guild?.guild_id) {
      if (mentionEveryoneLimit.remain <= 0) {
        FbToast.open({ type: 'error', content: '今日次数已达上限', key: 'out-limit-tip' })
        return
      }
    }

    onSelect(data)

    // 每次在频道 @ 用户，都把 TA 加入到可能 @ 的人里面
    if (enabledPossibleMention && isString(data) && guild?.guild_id) {
      dispatch(possibleMentionsActions.append({ guild: guild.guild_id, user: data as string }))
    }
  }

  if (!guild) return

  return (
    <SelectionList<RoleStruct | string>
      onUpdateResultCount={onUpdateResultCount}
      onSelect={handleSelection}
      onClose={onClose}
      className={'flex flex-col rounded-[8px] bg-[var(--fg-white-1)] p-2 px-2 text-sm text-[var(--fg-b100)]'}
      data={items}
      keyGen={item => (isString(item) ? item : item.role_id)}
      itemBuilder={item => (
        <div
          className={'flex h-10 items-center gap-2 text-[var(--fg-b95)]'}
          style={{
            opacity: isStale ? 0.5 : 1,
            transition: isStale ? 'opacity 0.2s 0.2s linear' : 'opacity 0s 0s linear',
          }}
        >
          {(() => {
            if (isString(item)) {
              return <RealtimeAvatar size={24} className={'rounded-full border border-[var(--fg-b5)]'} userId={item} />
            } else {
              if (item.role_id === guild.guild_id) {
                return <iconpark-icon size={24} name="At" color={'var(--fg-blue-1)'} />
              } else {
                return <iconpark-icon size={24} name="UserShield" color={ColorUtils.convertToCssColor(item.color)} />
              }
            }
          })()}
          {isString(item) ?
            <RealtimeUserInfo userId={item}>
              {user => {
                return (
                  <>
                    <RealtimeNickname botTag userId={item} />
                    <div className={'grow text-end text-sm text-[var(--fg-b60)]'}>ID：{user.username}</div>
                  </>
                )
              }}
            </RealtimeUserInfo>
          : item.name}
          {/* @所有人有次数 UI */}
          {!isString(item) && item.role_id === guild.guild_id && (
            <span className={'grow text-end text-sm text-[var(--fg-b60)]'}>{`${mentionEveryoneLimit.remain}/${mentionEveryoneLimit.total}次`}</span>
          )}
        </div>
      )}
    />
  )
}

function matchUser(userId: string, filter: string, guild?: GuildStruct) {
  const user = store.getState().users[userId]
  if (!user) return false
  if (user.username.includes(filter)) return true
  if (user.nickname.includes(filter)) return true
  const guildName = guild && GuildUserHelper.getNickname(guild.guild_id, userId)
  if (guildName && guildName.includes(filter)) return true
  const remark = RemarkHelper.getRemark(userId)
  return !!(remark && remark.includes(filter))
}

// 默认将当前频道的消息的发言人作为 @ 列表，如果当前场景不属于 IM 频道，那么为空
function getDefaultUsers(channelId: string) {
  return uniq(
    MessageService.instance
      .getMessages(channelId)
      .values()
      .map(m => m.user_id)
  )
}

export default React.memo(MentionUserList)
