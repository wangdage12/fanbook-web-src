import { Button, Input, Tooltip } from 'antd'
import FbBadge from 'fb-components/base_ui/fb_badge/index'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { isNil } from 'lodash-es'
import React, { HTMLAttributes, MouseEventHandler, useCallback, useContext, useEffect, useState } from 'react'
import { useAppSelector } from '../../app/hooks.ts'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder'
import { showInviteModal } from '../../components/invite_modal/InviteModal'
import RealtimeChannelName from '../../components/realtime_components/RealtimeChannel'
import { ChannelPermission, GuildPermission, PostPermission } from '../../services/PermissionService'
import { AudiovisualExtraInfo, AudiovisualLayout } from '../audiovisual/audiovisual-entity'
import { useMutePermissions } from '../audiovisual/audiovisual-hook'
import { AudiovisualManager, AudiovisualManagerEvent } from '../audiovisual/audiovisual-manager'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import openChannelSettings from '../guild_setting/sub_pages/index.tsx'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import QuestionPublisher from '../question/QuestionPublisher.tsx'
import { QuestionExtraInfo } from '../question/questionEntity'
import { questionSelectors } from '../question/questionSlice.ts'
import { ChannelContainerContext, ChannelContainerContextData, SidebarMenu } from './ChannelContainer'

interface ChannelHeaderProps {
  className?: string
  name: React.ReactNode
  suffix?: React.ReactNode
}

export function ChannelHeader({ name, suffix, className }: ChannelHeaderProps & HTMLAttributes<never>) {
  return (
    <div className={`flex w-full flex-shrink-0 flex-row items-center justify-center px-[16px] ${className}`}>
      <div className={'flex-shrink flex-grow basis-[160px] truncate text-[16px]'}>{name}</div>
      {suffix}
    </div>
  )
}

export const HeaderItem = ({
  name,
  icon,
  size = 28,
  count,
  dark,
  disabled,
  onClick,
  className,
}: {
  name: string
  icon: string
  size?: number
  className?: string
  count?: number
  disabled?: boolean
  dark?: boolean
  onClick?: MouseEventHandler | undefined
}): React.ReactNode => {
  const handleClick: React.MouseEventHandler<HTMLDivElement> = evt => {
    if (disabled) {
      return
    }
    onClick?.(evt)
  }
  return (
    <Tooltip key={name} placement="bottom" title={name} overlayInnerStyle={{ fontSize: 12 }} mouseEnterDelay={0.2}>
      <div
        onClick={handleClick}
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded hover:bg-[var(--fg-b5)] ${
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
        } ${className ?? ''}`}
      >
        {isNil(count) ?
          <iconpark-icon name={icon} size={18} color={`${dark ? 'var(--fg-white-1)' : 'var(--fg-b100)'}`}></iconpark-icon>
        : <FbBadge count={count} size={'small'} fbColor={'gray'}>
            <iconpark-icon name={icon} size={18} color={`${dark ? 'var(--fg-white-1)' : 'var(--fg-b100)'}`}></iconpark-icon>
          </FbBadge>
        }
      </div>
    </Tooltip>
  )
}

export function ChatHeader({ channel }: { channel: ChannelStruct }) {
  const contextValue = useContext<ChannelContainerContextData | undefined>(ChannelContainerContext)
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')
  const { changeSidebarMenu } = contextValue

  const actions = (
    <>
      <HeaderItem
        name={'机器人'}
        icon={'Bot'}
        className="ml-[12px]"
        onClick={() => {
          changeSidebarMenu(SidebarMenu.Bot)
        }}
      />
      <PermissionBuilder permission={ChannelPermission.CreateInstantInvite}>
        {allow =>
          allow &&
          channel && (
            <HeaderItem
              name={'邀请'}
              className="ml-[12px]"
              icon={'UserAdd'}
              onClick={() => {
                showInviteModal(channel.guild_id, channel.channel_id)
              }}
            />
          )
        }
      </PermissionBuilder>

      <HeaderItem
        name={'成员'}
        className="ml-[12px]"
        icon={'UserList'}
        onClick={() => {
          changeSidebarMenu(SidebarMenu.MemberList)
        }}
      ></HeaderItem>
    </>
  )

  return (
    <ChannelHeader
      className="h-[56px] border-b-[0.5px] border-solid border-b-[var(--fg-b10)]"
      suffix={actions}
      name={
        <RealtimeChannelName
          className={'font-medium'}
          guildId={channel.guild_id}
          channelId={channel.channel_id}
          prefixChannelIcon={true}
          iconColor="var(--fg-b40)"
        />
      }
    ></ChannelHeader>
  )
}

export function AudiovisualHeader({ channel }: { channel: ChannelStruct }) {
  const contextValue = useContext<ChannelContainerContextData<AudiovisualExtraInfo> | undefined>(ChannelContainerContext)
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')
  const { changeSidebarMenu, changeExtraInfo, extraInfo = { audiovisualLayout: AudiovisualLayout.List, count: 0 } } = contextValue
  const actions = (
    <>
      <HeaderItem
        name={'调整布局'}
        className="ml-[12px]"
        dark
        icon={extraInfo.audiovisualLayout === AudiovisualLayout.List ? '4Squares' : '1Rectangle2Squares'}
        onClick={() => {
          changeExtraInfo({
            audiovisualLayout: extraInfo.audiovisualLayout === AudiovisualLayout.List ? AudiovisualLayout.Emphasis : AudiovisualLayout.List,
          })
        }}
      />

      <PermissionBuilder permission={ChannelPermission.CreateInstantInvite}>
        {allow =>
          allow &&
          channel && (
            <HeaderItem
              dark
              className="ml-[12px]"
              name={'邀请'}
              icon={'UserAdd'}
              onClick={() => {
                showInviteModal(channel.guild_id, channel.channel_id)
              }}
            />
          )
        }
      </PermissionBuilder>

      <HeaderItem
        className="ml-[12px]"
        dark
        name={'成员'}
        icon={'UserList'}
        count={extraInfo.count}
        onClick={() => changeSidebarMenu(SidebarMenu.MemberList)}
      ></HeaderItem>
    </>
  )

  useEffect(() => {
    contextValue.changeExtraInfo({ audiovisualLayout: AudiovisualLayout.List })
  }, [])

  return (
    <ChannelHeader
      className="h-[44px] bg-[var(--fg-b95)] text-[var(--fg-white-1)] "
      suffix={actions}
      name={<RealtimeChannelName className={'font-medium'} guildId={channel.guild_id} channelId={channel.channel_id} prefixChannelIcon={true} />}
    ></ChannelHeader>
  )
}

interface AudiovisualMemberHeaderProps {
  count: number
}

export function AudiovisualMemberHeader({ count }: AudiovisualMemberHeaderProps) {
  const contextValue = useContext<ChannelContainerContextData | undefined>(ChannelContainerContext)
  const { changeSidebarMenu } = contextValue || {}
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')
  return (
    <div className={'mb-[2px] flex h-[52px] flex-shrink-0 flex-row items-center justify-between px-[16px]'}>
      <span className="font-bold">在线列表（{count}）</span>
      <iconpark-icon
        class="cursor-pointer"
        name="Close"
        color="var(--fg-b60)"
        size={16}
        onClick={() => changeSidebarMenu?.(SidebarMenu.None)}
      ></iconpark-icon>
    </div>
  )
}

interface AudiovisualMemberFooterProps {
  manager?: AudiovisualManager
}

export function AudiovisualMemberFooter({ manager }: AudiovisualMemberFooterProps) {
  const hasMutePermission = useMutePermissions(manager)
  const [isTempAdmin, setIsTempAdmin] = useState(false)
  const handleBanAll = () => {
    FbModal.error({
      title: '所有在线成员将被禁音',
      closable: false,
      okText: '全员禁言',
      onOk: async () => {
        await manager?.toggleBanAll(true)
      },
    })
  }
  const handleUnBanAll = async () => {
    await manager?.toggleBanAll(false)
    FbToast.open({ content: '已解除全员禁言', key: 'handleBanAll' })
  }

  const roomOwnerChangeHandler = useCallback(() => {
    manager && setIsTempAdmin(manager.tempAdminUserId === LocalUserInfo.userId)
  }, [manager])

  useEffect(() => {
    roomOwnerChangeHandler()
    manager?.on(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.RoomOwnerChange, roomOwnerChangeHandler)
    }
  }, [manager])

  return (
    (hasMutePermission || isTempAdmin) && (
      <div className={'flex h-[64px] flex-shrink-0 flex-row items-center justify-center px-[16px]'}>
        <Button className="mr-[8px] w-[104px]" onClick={handleBanAll}>
          全员禁言
        </Button>
        <Button className="w-[104px] p-0" onClick={handleUnBanAll}>
          解除全员禁言
        </Button>
      </div>
    )
  )
}

export function QuestionHeader({ channel }: { channel: ChannelStruct }) {
  const contextValue = useContext<ChannelContainerContextData<QuestionExtraInfo> | undefined>(ChannelContainerContext)
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')
  const { changeExtraInfo, extraInfo = { keyword: '' } } = contextValue
  const [publisher, setPublisher] = useState(false)
  const publishing = useAppSelector(questionSelectors.publishing)

  function handlePublish() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (GuildUtils.isMuted(GuildUtils.getCurrentGuild()!)) {
      FbToast.open({ content: '你已被禁言，无法操作', type: 'warning' })
      return
    }
    setPublisher(true)
  }

  const suffix = (
    <div className={'flex gap-4'}>
      <Input
        className=" w-[240px]"
        placeholder="搜索问题"
        value={extraInfo.keyword}
        onChange={evt => changeExtraInfo({ keyword: evt.target.value })}
        allowClear
        prefix={<iconpark-icon name="Search" size={16} color="var(--fg-b40)"></iconpark-icon>}
      ></Input>
      <PermissionBuilder permission={PostPermission.CreatePost} channelId={channel.channel_id}>
        {allow =>
          allow && (
            <Button type={'primary'} onClick={handlePublish} loading={publishing} disabled={publishing}>
              {publishing ? '发布中' : '发起提问'}
            </Button>
          )
        }
      </PermissionBuilder>
      <PermissionBuilder
        permission={ChannelPermission.ChannelManager | GuildPermission.ManageChannels}
        guildId={channel.guild_id}
        channelId={channel.channel_id}
      >
        {allow =>
          allow && (
            <HeaderItem
              name={'设置'}
              icon={'Setting'}
              onClick={evt => {
                evt.stopPropagation()
                openChannelSettings({ channelId: channel.channel_id })
              }}
            />
          )
        }
      </PermissionBuilder>
    </div>
  )

  return (
    <>
      <ChannelHeader
        className="h-[56px] border-b-[0.5px] border-solid border-b-[var(--fg-b10)]"
        suffix={suffix}
        name={
          <RealtimeChannelName
            className={'font-medium'}
            guildId={channel.guild_id}
            channelId={channel.channel_id}
            prefixChannelIcon={true}
            iconColor="var(--fg-b40)"
          />
        }
      ></ChannelHeader>
      {extraInfo.keyword?.trim() && (
        <p className="px-[16px] py-[6px]">
          <span className="mr-[8px] text-[20px] font-bold">“{extraInfo.keyword.trim()}”</span>
          <span className="text-[14px] text-[var(--fg-b60)]">的搜索结果</span>
        </p>
      )}
      {publisher && <QuestionPublisher onClose={() => setPublisher(false)} />}
    </>
  )
}
