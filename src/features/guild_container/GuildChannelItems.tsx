import { Tooltip } from 'antd'
import FbBadge from 'fb-components/base_ui/fb_badge/index'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { isEqual } from 'lodash-es'
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts'
import { createMemberId } from '../../base_services/audiovisual-provider'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder.tsx'
import usePermissions from '../../base_services/permission/usePermissions.ts'
import ChannelIcon from '../../components/ChannelIcon.tsx'
import RealtimeChannelName from '../../components/realtime_components/RealtimeChannel.tsx'
import { RealtimeAvatar } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { useLocationConsumer } from '../../components/with/WithLocation.tsx'
import useScrollIntoView from '../../hooks/useScrollIntoView.ts'
import { ChannelPermission, GuildPermission } from '../../services/PermissionService'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import { AudiovisualUserInfo, MediaRoomSignalOperation, MediaRoomSignallingData } from '../audiovisual/audiovisual-entity'
import { useManager, useWsService } from '../audiovisual/audiovisual-hook'
import { beforeConfirm, currentRoomInfo, isRoomConnecting } from '../audiovisual/audiovisual-slice'
import GuildUtils from '../guild_list/GuildUtils'
import { guildListActions, guildListSelectors } from '../guild_list/guildListSlice'
import { openCreateChannelModal } from '../guild_setting/sub_pages/CreateChannelModal.tsx'
import openChannelSettings from '../guild_setting/sub_pages/index.tsx'
import { GuildContext } from '../home/GuildWrapper.tsx'
import { UnreadHelper, unreadSelectors } from '../message_list/unreadSlice.ts'

export function GuildChannelCategoryItem({ channel }: { channel: ChannelStruct }) {
  const collapseCateIds = useAppSelector(guildListSelectors.collapseCateIds, isEqual)
  const collapsed = collapseCateIds[channel.channel_id]
  const dispatch = useDispatch()
  return (
    <div
      className={'channel-category-item cursor-pointer'}
      onClick={() => {
        dispatch(guildListActions.toggleCollapseCate(channel.channel_id))
      }}
    >
      <iconpark-icon
        class={`${collapsed ? '-rotate-90' : 'rotate-0'} text-[12px] text-[var(--fg-b40)] transition-transform`}
        name="TriangleDown"
        size={12}
      ></iconpark-icon>
      <span className={'channel-category-item-title flex-grow truncate'}>{channel.name}</span>
      <PermissionBuilder permission={ChannelPermission.ChannelManager} guildId={channel.guild_id} channelId={channel.channel_id}>
        {allow =>
          allow && (
            <Tooltip title={'创建频道'}>
              <HoverBox size={16} color={'var(--fg-b10)'}>
                <iconpark-icon
                  onClick={e => {
                    openCreateChannelModal({
                      guildId: channel.guild_id,
                      parentId: channel.channel_id,
                      parentName: channel.name,
                    })
                    e.stopPropagation()
                  }}
                  color="var(--fg-b40)"
                  name={'Plus'}
                  size={12}
                />
              </HoverBox>
            </Tooltip>
          )
        }
      </PermissionBuilder>
    </div>
  )
}

export function GuildChannelTextItem({ channel, isPrivate }: { channel: ChannelStruct; isPrivate: boolean }) {
  const { channelId } = useParams()
  const itemRef = useRef<HTMLDivElement>(null)
  const selected = channelId === channel.channel_id
  const collapseCateIds = useAppSelector(guildListSelectors.collapseCateIds, isEqual)
  const collapsed = channel.parent_id ? collapseCateIds[channel.parent_id] : false
  const unread = useAppSelector(unreadSelectors.unread(channel.guild_id, channel.channel_id), isEqual)
  const handleClick = () => {
    if (!selected) {
      GuildUtils.selectChannel(channel)
      UnreadHelper.clearUnread(channel)
    }
  }

  useScrollIntoView(itemRef, selected, { edgeDistance: 10, extraScroll: 60 })
  if (collapsed && !selected && unread.num === 0) return null

  return (
    <div ref={itemRef} className={'channel-common-item group'} onClick={handleClick}>
      <div className={`channel-common-item-interaction ${selected ? 'active' : ''}`}>
        <div className="flex items-center gap-[8px]">
          <ChannelIcon type={channel.type} isPrivate={isPrivate} isAnnouncement={channel.announcement_mode} />
          <span className={'channel-common-item-title flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap'}>{channel.name}</span>
          {/* 未读数 */}
          <SettingButton channel={channel}>
            <FbBadge
              showZero={false}
              size={'small'}
              fbColor={unread.mentions?.length ? 'red' : 'gray'}
              count={unread.mentions?.length || unread.num}
            />
          </SettingButton>
        </div>
      </div>
    </div>
  )
}

export function BarSoundAnimation() {
  return (
    <div className="flex h-[12px] items-end justify-center">
      <div className="mr-[2px] h-[3px] w-[2px] animate-[soundAnimation_1s_ease_infinite] bg-[var(--fg-blue-1)]"></div>
      <div className="mr-[2px] h-[3px] w-[2px] animate-[soundAnimation_1s_ease_0.4s_infinite] bg-[var(--fg-blue-1)]"></div>
      <div className="h-[3px] w-[2px] animate-[soundAnimation_1s_ease_0.2s_infinite] bg-[var(--fg-blue-1)]"></div>
    </div>
  )
}

export function FanSoundAnimation() {
  return (
    <div className="relative h-[14px] w-[14px] overflow-hidden">
      <div className="absolute left-[-4px] top-[-1px] h-[16px] w-[16px] animate-[soundAnimation-three_2s_ease_infinite] rounded-[50%] border-[1.5px] border-[var(--fg-blue-1)] [clip-path:polygon(50%_50%,100%_0%,100%_100%)]"></div>
      <div className="absolute left-[-3.5px] top-[1px] h-[12px] w-[12px] animate-[soundAnimation-two_2s_ease_infinite] rounded-[50%] border-[1.5px] border-[var(--fg-blue-1)] [clip-path:polygon(50%_50%,100%_0%,100%_100%)]"></div>
      <div className="absolute left-[2px] top-[4px] w-0 animate-[soundAnimation-one_2s_ease_infinite] rounded-[50%] border-b-[3px] border-r-[3px] border-t-[3px] border-b-transparent border-r-[var(--fg-blue-1)] border-t-transparent"></div>
    </div>
  )
}

export function GuildAudiovisualItem({ channel, isPrivate }: { channel: ChannelStruct; isPrivate: boolean }) {
  const collapseCateIds = useAppSelector(guildListSelectors.collapseCateIds)
  const { channelId } = useParams()
  const locationTrans = useLocationConsumer()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selected = channelId === channel.channel_id
  const permission = usePermissions({ channelId: channel.channel_id, permission: ChannelPermission.ViewChannel })
  const itemRef = useRef<HTMLDivElement>(null)
  const guild = useContext(GuildContext)
  // 服务等级
  const userLimit = channel.user_limit ?? 0
  const collapsed = channel.parent_id ? collapseCateIds[channel.parent_id] : false
  const manager = useManager(channel.guild_id ?? '', channel.channel_id)
  const [userList, setUserList] = useState<AudiovisualUserInfo[]>([])
  const handleMediaRoomSignalling = useCallback(
    (data: MediaRoomSignallingData) => {
      const {
        operation,
        operator: { user_id: userId, device_id: deviceId },
      } = data
      switch (operation) {
        case MediaRoomSignalOperation.Login:
          manager?.addBriefMember({ userId, deviceId })
          break
        case MediaRoomSignalOperation.Logout:
          manager?.removeBriefMember({ userId, deviceId })
          break
        default:
          console.log(`未处理 operation ${operation}`)
          break
      }
      if (manager?.briefMembers) {
        setUserList(manager.briefMembers)
      }
    },
    [manager]
  )
  useWsService(
    { handleMediaRoomSignalling },
    {
      guildId: guild?.guild_id ?? '',
      channelId: channel.channel_id,
    },
    [manager]
  )
  const isConnecting = useAppSelector(isRoomConnecting)
  const roomInfoSelector = useAppSelector(currentRoomInfo, isEqual)

  const joinConfirm = () => {
    dispatch(
      beforeConfirm({
        guildId: guild?.guild_id ?? '',
        channelId: channel.channel_id ?? '',
        roomId: channel.channel_id ?? '',
      })
    )
  }

  const handleJoin = () => {
    if (permission.has(ChannelPermission.ViewChannel)) {
      joinConfirm()
      return true
    }
    return false
  }

  const handleClick = () => {
    if (roomInfoSelector.guildId === guild?.guild_id && roomInfoSelector.channelId === channel.channel_id) {
      !selected && GuildUtils.selectChannel(channel)
    } else {
      if (!handleJoin()) {
        FbToast.open({ content: '暂无进入音视频频道权限，请联系管理员' })
      }
    }
  }

  useEffect(() => {
    manager?.getBriefMemberList().then(list => {
      setUserList(list)
    })
  }, [manager])

  const checkJoin = () => {
    if (selected && !isConnecting) {
      if (handleJoin()) {
        return
      }
      const { from, to } = locationTrans?.locationTrans.current ?? {}
      // 无权限打开音视频频道，跳转到第一个可见的文本频道或回到上个页面
      if (from?.pathname && from?.pathname !== to?.pathname) {
        navigate(from)
        return
      }

      const currentGuild = guild && GuildUtils.getGuildById(guild.guild_id)
      if (currentGuild) {
        const firstChannel = GuildUtils.getFirstAccessibleTextChannel(guild.guild_id)
        firstChannel && GuildUtils.selectChannel(firstChannel)
      }
    }
  }

  useEffect(() => {
    checkJoin()
  }, [locationTrans])

  useScrollIntoView(itemRef, selected, { edgeDistance: 10, extraScroll: 60 })

  if (collapsed && !selected) return null
  return (
    <>
      <div ref={itemRef} className={'channel-common-item group'} onClick={handleClick}>
        <div className={`channel-common-item-interaction ${selected ? 'active' : ''} `}>
          <div className="flex items-center gap-[8px]">
            <ChannelIcon type={channel.type} isPrivate={isPrivate} isAnnouncement={channel.announcement_mode} />
            <RealtimeChannelName channelId={channel.channel_id} className={'channel-common-item-title flex-grow'} />
            <SettingButton channel={channel}>
              {userLimit > 0 && (
                <div className="rounded-full bg-[var(--fg-b5)] px-[4px] text-[12px] text-[var(--fg-b30)]">
                  {`${userList?.length ?? 0}/${channel.user_limit}`}
                </div>
              )}
            </SettingButton>
          </div>
          {userList.length > 0 ?
            <div className="ml-[26px] mt-[4px] flex items-center">
              {userList.slice(0, 3).map(user => (
                <RealtimeAvatar
                  className="ml-[-6px] rounded-full border border-[var(--fg-white-1)]"
                  size={16}
                  key={createMemberId(user.userId, user.deviceId)}
                  userId={user.userId}
                  draggable={false}
                ></RealtimeAvatar>
              ))}
              <span className="mx-[4px] text-[12px] text-[var(--fg-blue-1)]">
                {userList.length < 4 ? `${userList.length}人正在语音` : `等${userList.length}人正在语音`}
              </span>
              <FanSoundAnimation />
            </div>
          : null}
        </div>
      </div>
    </>
  )
}

function SettingButton({ channel, children }: { channel: ChannelStruct; children?: ReactNode }) {
  return (
    <PermissionBuilder
      permission={ChannelPermission.ChannelManager | GuildPermission.ManageChannels}
      guildId={channel.guild_id}
      channelId={channel.channel_id}
    >
      {allow =>
        allow ?
          <>
            <Tooltip title={'编辑频道'} autoAdjustOverflow={false}>
              <iconpark-icon
                onClick={e => {
                  e.stopPropagation()
                  if ([ChannelType.guildCircle, ChannelType.guildLive].includes(channel.type)) {
                    showUnsupportedFeatureToast()
                    return
                  }
                  openChannelSettings({ channelId: channel.channel_id })
                }}
                class="icon-color-btn hidden h-6 group-hover:block"
                name={'Setting'}
                size={16}
              />
            </Tooltip>
            <div className="block group-hover:hidden">{children}</div>
          </>
        : children
      }
    </PermissionBuilder>
  )
}
