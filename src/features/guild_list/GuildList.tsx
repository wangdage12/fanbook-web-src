import { createSelector } from '@reduxjs/toolkit'
import { useDebounceFn, useHover } from 'ahooks'
import { Tooltip } from 'antd'
import clsx from 'clsx'
import FbBadge from 'fb-components/base_ui/fb_badge/index'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { AudiovisualChannelStatus } from 'fb-components/struct/ChannelStruct.ts'
import { GuildBanLevelType, GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { isEqual } from 'lodash-es'
import { Key, MouseEventHandler, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { HomeContentType, getHomeContentType } from '../../app/util.ts'
import Ws, { WsAction } from '../../base_services/ws.ts'
import AuthenticationIcon from '../../components/AuthenticationIcon'
import { Sortable } from '../../components/Sortable.tsx'
import IgnorePointerScroll from '../../components/ingore_pointer_scroll'
import { RealtimeAvatar } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import useScrollIntoView from '../../hooks/useScrollIntoView.ts'
import { ChannelPermission, PermissionService } from '../../services/PermissionService'
import GlobalUnread from '../../utils/GlobalUnread.ts'
import browser from '../../utils/browser.ts'
import { applyUnreadAsync, unread } from '../contact_list/contact-list-slice'
import { downloadModal } from '../download/Download'
import SearchInviteCodeModal from '../invite/SearchInviteCodeModal'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { localUserInfo } from '../local_user/localUserSlice'
import { unreadSelectors } from '../message_list/unreadSlice'
import UserCenter from '../user_center'
import SettingAPI, { GuildFolder } from '../user_center/SettingAPI.ts'
import GuildUtils from './GuildUtils'
import { guildListSelectors } from './guildListSlice'

const GUILD_ICON_SIZE = 40
const GUILD_RADIUS = '8px'

function GuildItem({
  guildId,
  selected,
  icon,
  name,
  isMediaActive = false,
  className = '',
  disabledTooltip = false,
}: {
  guildId: string
  selected: boolean
  icon: ReactNode
  name: ReactNode
  isMediaActive: boolean
  className?: string
  disabledTooltip?: boolean
}) {
  const unread = useAppSelector(unreadSelectors.guildUnreadStatus(guildId), isEqual)
  const dotInsteadOfNumber = unread.mentions === 0
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    GlobalUnread.updateGuild(guildId, unread.mentions)
  }, [unread.mentions])

  useScrollIntoView(itemRef, selected, { edgeDistance: 10, extraScroll: 60, parentLevel: 4 })

  return (
    <div className={`relative ${className}`} ref={itemRef} data-list-item-id={guildId}>
      <TransitionBox
        disabledTooltip={disabledTooltip}
        customKey={guildId}
        name={name}
        onClick={() => GuildUtils.selectGuild(guildId)}
        selected={selected}
      >
        {typeof icon === 'string' ?
          <CosImage
            className={`rounded-[${GUILD_RADIUS}] bg-[var(--fg-white-1)] object-cover`}
            src={icon}
            size={GUILD_ICON_SIZE}
            placeholder={<iconpark-icon name="Server-Avatar" size={30} class={'text-[var(--fg-b5)]'}></iconpark-icon>}
            fallback={<iconpark-icon name="Server-Avatar" size={30} class={'text-[var(--fg-b5)]'}></iconpark-icon>}
          />
        : icon}
      </TransitionBox>
      <FbBadge
        className={'absolute right-[-4px] top-[-4px]'}
        dot={dotInsteadOfNumber}
        borderColor={'var(--bg-bg-1)'}
        showZero={false}
        size={'small'}
        count={unread.mentions || Number(unread.num)}
      />
      {isMediaActive && (
        <FbBadge
          className={'absolute bottom-[-4px] right-[-4px]'}
          count={
            <div className="!flex h-[20px] w-[20px] items-center justify-center rounded-full border-[2px] border-[var(--bg-bg-1)] bg-[var(--fg-b40)]">
              <iconpark-icon name="Audio2" size={10} color="var(--fg-white-1)"></iconpark-icon>
            </div>
          }
        />
      )}
    </div>
  )
}

type TransitionBoxBuilder = (selected: boolean, isHover: boolean) => ReactNode

// hover、select动画组件
function TransitionBox({
  customKey,
  name,
  onClick,
  selected = false,
  children,
  className = '',
  disabledTooltip = false,
}: {
  className?: string
  customKey: Key
  name: ReactNode
  onClick?: MouseEventHandler
  selected?: boolean
  children: ReactNode | TransitionBoxBuilder
  disabledTooltip?: boolean
}) {
  const targetRef = useRef<HTMLDivElement>(null)
  const isHover = useHover(targetRef)
  const [delayHover, setDelayHover] = useState(false)
  const { run } = useDebounceFn(
    data => {
      setDelayHover(data)
    },
    {
      wait: 50,
    }
  )

  useEffect(() => {
    run(isHover)
  }, [isHover])

  const [focused, setFocused] = useState(false)
  const selectedBorderPadding = -4
  return (
    <Tooltip
      transitionName="ant-zoom"
      open={!disabledTooltip && delayHover && !focused}
      key={customKey}
      placement="right"
      title={name}
      overlayInnerStyle={{ fontSize: 12 }}
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
    >
      <div
        ref={targetRef}
        onClick={e => {
          onClick?.(e)
          setFocused(true)
        }}
        onMouseLeave={() => setFocused(false)}
        className={`group relative cursor-pointer active:scale-95 ${className}`}
        style={{
          transitionProperty: 'border-color',
          width: 40,
          height: 40,
        }}
      >
        {
          <div
            className={clsx([
              'absolute rounded-xl border-2 border-solid',
              !selected && 'group-hover:border-[4px] group-hover:border-[var(--fg-b10)]',
              selected ? 'border-[var(--fg-blue-1)]' : 'border-transparent',
            ])}
            style={{
              left: selectedBorderPadding,
              right: selectedBorderPadding,
              top: selectedBorderPadding,
              bottom: selectedBorderPadding,
            }}
          />
        }
        {typeof children === 'function' ? children(selected, isHover) : children}
      </div>
    </Tooltip>
  )
}

function GuildItemWrapper({ customKey, name, onClick, icon }: { customKey: string; name: string; icon: string; onClick: () => void }) {
  return (
    <TransitionBox customKey={customKey} className="mb-[12px] mt-[6px]" name={name} onClick={onClick}>
      {(selected, isHover) => (
        <div
          style={{ width: GUILD_ICON_SIZE, height: GUILD_ICON_SIZE }}
          className={`${
            selected || isHover ? 'bg-[var(--fg-blue-1)]' : 'bg-[var(--fg-white-1)]'
          } flex items-center justify-center rounded-[${GUILD_RADIUS}]`}
        >
          <iconpark-icon name={icon} size={20} color={`${selected || isHover ? 'var(--fg-white-1)' : 'var(--fg-b100)'}`} />
        </div>
      )}
    </TransitionBox>
  )
}

export function GuildList() {
  const guildList = useAppSelector<GuildStruct[] | undefined>(guildListSelectors.selectGuildList)
  const guildMap = useMemo(() => {
    return (
      guildList?.reduce(
        (acc, guild) => {
          acc[guild.guild_id] = guild
          return acc
        },
        {} as Record<string, GuildStruct | undefined>
      ) ?? {}
    )
  }, [guildList])
  const [sortedGuildList, setSortedGuildList] = useState<string[] | undefined>(guildList?.map(guild => guild.guild_id))
  const localUser = useAppSelector(localUserInfo)
  const selectedGuildId = useAppSelector<string | undefined>(guildListSelectors.currentGuildId)
  const navigate = useNavigate()
  const [userCenterOpen, setUserCenterOpen] = useState(false)
  const location = useLocation()
  const homeContentType = getHomeContentType(location.pathname)
  const dmUnreadSelector = createSelector(unread, unreadSelectors.dmUnreadNum, (contactUnread, dmUnreadNum) => contactUnread + dmUnreadNum)
  const dmUnreadCount = useAppSelector(dmUnreadSelector)
  const dispatch = useAppDispatch()
  const [isDragging, setIsDragging] = useState(false)

  const handleGuildSort = async (sortedArray: string[]) => {
    setSortedGuildList(sortedArray)
    const guildFolders: GuildFolder[] = sortedArray.map(guildId => ({ guild_ids: [guildId] }))
    Ws.instance.emit(WsAction.UserSettings, { data: { guild_folders: guildFolders } })
    await SettingAPI.setUserSetting(LocalUserInfo.userId, { guild_folders: guildFolders })
  }

  useEffect(() => {
    GlobalUnread.updateDm(dmUnreadCount)
  }, [dmUnreadCount])

  useEffect(() => {
    dispatch(applyUnreadAsync())
  }, [])

  useEffect(() => {
    // 其他端排序后，更新本地排序
    const _sortedGuildList = guildList?.map(guild => guild.guild_id)
    setSortedGuildList(sortedGuildList => (isEqual(_sortedGuildList, sortedGuildList) ? sortedGuildList : _sortedGuildList))
  }, [guildList])

  const onJoinClick = () => {
    const { destroy: close } = showFbModal({
      width: 540,
      title: '输入社区邀请码',
      showCancelButton: false,
      showOkButton: false,
      content: <SearchInviteCodeModal destroy={() => close()} />,
    })
  }

  return (
    <div className={'flex h-full flex-col items-center overflow-hidden'}>
      <div className={'p-[6px]'}>
        <Tooltip placement="left" title={'个人中心'} overlayInnerStyle={{ fontSize: 12 }} mouseEnterDelay={0} mouseLeaveDelay={0}>
          {localUser?.user_id && (
            <RealtimeAvatar
              userId={localUser.user_id}
              size={40}
              className={'flex-shrink-0 cursor-pointer !rounded-full'}
              onClick={() => setUserCenterOpen(true)}
            />
          )}
        </Tooltip>
        <UserCenter open={userCenterOpen} onCancel={() => setUserCenterOpen(false)} />
      </div>
      <div className={'p-[6px]'}>
        <TransitionBox
          customKey={AppRoutes.AT_ME}
          name={'消息'}
          onClick={() => {
            if (homeContentType != HomeContentType.Dm) {
              GuildUtils.selectGuild(AppRoutes.AT_ME)
            }
          }}
          selected={homeContentType == HomeContentType.Dm}
        >
          {(selected, isHover) => (
            <>
              <FbBadge
                count={dmUnreadCount}
                borderColor={'var(--bg-bg-1)'}
                showZero={false}
                size={'small'}
                className="absolute right-[-4px] top-[-4px] h-5"
              />
              <div
                style={{ width: GUILD_ICON_SIZE, height: GUILD_ICON_SIZE }}
                className={`${
                  selected || isHover ? 'bg-[var(--fg-blue-1)]' : 'bg-[var(--fg-white-1)]'
                } flex items-center justify-center rounded-[${GUILD_RADIUS}]`}
              >
                {selected || isHover ?
                  <iconpark-icon color={'var(--fg-white-1)'} name="Message" size={20}></iconpark-icon>
                : <iconpark-icon name="Message-Normal" color={'var(--fg-b100)'} size={20}></iconpark-icon>}
              </div>
            </>
          )}
        </TransitionBox>
      </div>
      <div className={'m-[6px] h-[0.5px] w-[24px] bg-[var(--fg-b10)]'}></div>
      <IgnorePointerScroll
        className={clsx(
          'hide-scroll-bar relative flex w-full flex-col items-center overflow-x-visible overflow-y-scroll py-[4px] [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-3'
        )}
      >
        {sortedGuildList && (
          <Sortable
            items={sortedGuildList}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            itemRenderer={({ item }) => {
              const guild = guildMap?.[item]
              if (!guild || guild.banned_level === GuildBanLevelType.Dismiss) {
                return null
              }
              const isMediaActive = Object.values(guild.channels).some(channel => {
                return (
                  PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId).has(ChannelPermission.ViewChannel) &&
                  channel.active == AudiovisualChannelStatus.Active
                )
              })
              return (
                <GuildItem
                  guildId={guild.guild_id}
                  disabledTooltip={isDragging}
                  icon={
                    guild.banned_level === GuildBanLevelType.Ban ?
                      <div
                        className="flex items-center justify-center rounded-[8px] bg-[var(--function-red-1)]"
                        style={{ width: GUILD_ICON_SIZE, height: GUILD_ICON_SIZE }}
                      >
                        <iconpark-icon size={20} class="text-[var(--fg-white-1)]" name="Exclamation"></iconpark-icon>
                      </div>
                    : guild.icon
                  }
                  name={
                    <div className={'my-[2px] flex items-start'}>
                      <div className={'text-xs'}>{guild.name}</div>
                      <AuthenticationIcon guild={guild} className={'ml-1'} />
                    </div>
                  }
                  isMediaActive={isMediaActive}
                  selected={selectedGuildId === guild.guild_id}
                ></GuildItem>
              )
            }}
            onChange={({ sortedArray }) => {
              handleGuildSort(sortedArray)
            }}
          />
        )}
        {guildList?.length == 0 && (
          <TransitionBox
            customKey={'discovery'}
            name={'社区'}
            onClick={() => navigate(AppRoutes.DISCOVERY, { replace: true })}
            selected={homeContentType == HomeContentType.Discovery}
          >
            {(selected, isHover) => (
              <div
                style={{ width: GUILD_ICON_SIZE, height: GUILD_ICON_SIZE }}
                className={`${
                  selected || isHover ? 'bg-[var(--fg-blue-1)]' : 'bg-[var(--fg-white-1)]'
                } flex items-center justify-center rounded-[${GUILD_RADIUS}]`}
              >
                <iconpark-icon
                  name="Channel-fill"
                  size={20}
                  color={`${selected || isHover ? 'var(--fg-white-1)' : 'var(--fg-blue-1)'}`}
                ></iconpark-icon>
              </div>
            )}
          </TransitionBox>
        )}
      </IgnorePointerScroll>
      <div className={'m-[6px] h-[0.5px] w-[24px] bg-[var(--fg-b10)]'}></div>
      {/* 创建/加入社区 */}
      <GuildItemWrapper onClick={onJoinClick} icon={'Plus'} name={'加入社区'} customKey={'add-guild'} />
      {!browser.isDesktop() && <GuildItemWrapper onClick={downloadModal} icon={'Download'} name={'下载客户端'} customKey={'download'} />}
    </div>
  )
}
