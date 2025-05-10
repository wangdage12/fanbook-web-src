import { Button, Divider, Form, Input, Popover } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import React, { HTMLAttributes, lazy, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder'
import GuildAPI from '../../features/guild_container/guildAPI.ts'
import PrivacySetting from '../../features/guild_setting/PrivacySetting.tsx'
import SettingsScaffold, { MenuItem } from '../../features/guild_setting/SettingsScaffold.tsx'
import { openChannelCategorySettings } from '../../features/guild_setting/sub_pages/ChannelCategorySettings.tsx'
import { openCreateChannelModal } from '../../features/guild_setting/sub_pages/CreateChannelModal.tsx'
import JoinAndWelcomeSettings from '../../features/guild_setting/sub_pages/JoinAndWelcomeSettings.tsx'
import openChannelSettings, { ChannelSettingType } from '../../features/guild_setting/sub_pages/index.tsx'
import { GuildContext } from '../../features/home/GuildWrapper.tsx'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import { guildUserActions, guildUserSelectors } from '../../features/role/guildUserSlice.ts'
import { ChannelPermission, GuildPermission, SpecialPermission } from '../../services/PermissionService'
import StateUtils from '../../utils/StateUtils'
import { report } from '../../utils/jump.tsx'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import AuthenticationIcon from '../AuthenticationIcon'
import { showInviteModal } from '../invite_modal/InviteModal'
import { RealtimeNickname } from '../realtime_components/realtime_nickname/RealtimeUserInfo'
import { showGuildExitModal } from './GuildExitModal.tsx'

const AssignRoleSettings = React.lazy(() =>
  import('../../features/guild_setting/sub_pages/AssignRoleSettings.tsx').then(module => ({ default: module.AssignRoleSettings }))
)
const RoleGroupManage = lazy(() => import('../../features/guild_setting/role_group_manage/RoleGroupManage.tsx'))
const GuildInfo = lazy(() => import('../../features/guild_setting/GuildInfo.tsx'))
const MemberManage = lazy(() => import('../../features/guild_setting/member_manage/MemberManage.tsx'))
const ChannelManage = lazy(() => import('../../features/guild_setting/channel_manage/ChannelManage.tsx'))
const ManagementLog = lazy(() => import('../../features/guild_setting/management_log/ManagementLog.tsx'))
const InviteManage = lazy(() => import('../../features/guild_setting/invite_manage/InviteManage.tsx'))
const BannerManage = lazy(() => import('../../features/guild_setting/banner_manage/BannerManage.tsx'))

const BlacklistManage = lazy(() => import('../../features/guild_setting/blacklist_manage/BlacklistManage.tsx'))
const MuteManage = lazy(() => import('../../features/guild_setting/mute_manage/MuteManage.tsx'))

interface GuildCardProps {
  [x: string]: unknown

  guild: GuildStruct
  memberCount?: number
  children?: React.ReactNode
}

const enableColor = 'var(--fg-b100)'
const disableColor = 'var(--fg-b30)'

const GuildCard = ({ ...props }: GuildCardProps) => {
  const { guild, memberCount } = props
  const { guild_id } = guild
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [modalChangeNameOpen, setModalChangeNameOpen] = useState(false)
  const [modalMessageSettingsOpen, setModalMessageSettingsOpen] = useState(false)
  const currentGuildNickname = useAppSelector(guildUserSelectors.nickname(guild_id, LocalUserInfo.userId))
  const [guildNickname, setGuildNickname] = useState(currentGuildNickname ?? StateUtils.localUser.nickname)
  const isOwner = guild.owner_id === LocalUserInfo.userId
  useEffect(() => {
    modalChangeNameOpen && setGuildNickname(currentGuildNickname || StateUtils.localUser.nickname)
  }, [currentGuildNickname, modalChangeNameOpen])

  const guildMenu: MenuItem[] = [
    {
      label: '社区概况',
      children: [
        {
          label: '社区资料',
          key: 'guildInfo',
          icon: 'ServerSetting',
          component: <GuildInfo />,
          permissions: GuildPermission.ManageGuild,
        },
        {
          label: '隐私设置',
          key: 'privacySetting',
          icon: 'LockShield',
          component: <PrivacySetting />,
          permissions: GuildPermission.ManageGuild,
        },
        {
          label: '管理日志',
          key: 'managementLog',
          icon: 'ClockCircle',
          component: <ManagementLog />,
          permissions: GuildPermission.ManageGuild,
        },
      ],
    },
    {
      label: '常用设置',
      children: [
        {
          label: '加入与欢迎',
          key: 'joinWelcome',
          icon: 'PlusSquare',
          component: <JoinAndWelcomeSettings />,
          permissions: GuildPermission.ManageGuild,
        },
        {
          label: '领取身份组',
          key: 'roleGroup',
          icon: 'HiCircle',
          component: <AssignRoleSettings />,
          permissions: GuildPermission.ManageGuild,
        },
        {
          label: 'Banner图设置',
          key: 'bannerSetting',
          component: <BannerManage />,
          icon: 'Picture',
          permissions: GuildPermission.ManageGuild,
          whiteListField: 'guild_set_banner',
        },
      ],
    },
    {
      label: '首页设置',
      children: [
        {
          label: '圈子设置',
          key: 'circleSetting',
          icon: 'CameraBlink',
          onClick: () => {
            openChannelSettings({ channelId: guild.circle.channel_id, type: ChannelSettingType.Circle })
          },
          permissions: GuildPermission.ManageCircle,
        },
        // {
        //   label: '活动日历',
        //   key: 'eventCalendar',
        //   icon: 'Calendar',
        //   permissions: GuildPermission.ManageGuild,
        // },
        {
          label: '频道及分组设置',
          key: 'channelGroupSetting',
          icon: 'Channel-Setting',
          component: <ChannelManage />,
          permissions: GuildPermission.ManageChannels,
        },
      ],
    },
    {
      label: '成员管理',
      children: [
        {
          label: '身份组管理',
          key: 'roleGroupManagement',
          icon: 'UserShield',
          component: <RoleGroupManage />,
          permissions: GuildPermission.ManageRoles,
        },
        {
          label: '成员管理',
          key: 'memberManagement',
          icon: 'UserSetting',
          component: <MemberManage />,
          permissions: GuildPermission.ManageRoles,
        },
        {
          label: '邀请管理',
          key: 'invitationManagement',
          icon: 'Link-Normal',
          component: <InviteManage />,
          permissions: SpecialPermission.Administrator,
        },
        {
          label: '禁言管理',
          key: 'muteManagement',
          icon: 'CommentSetting',
          component: <MuteManage />,
          permissions: GuildPermission.DeafenMembers,
        },
        {
          label: '黑名单管理',
          key: 'blacklistManagement',
          icon: 'UserStop',
          component: <BlacklistManage />,
          permissions: GuildPermission.KickMembers,
        },
      ],
    },
    // {
    //   label: '其他',
    //   children: [
    //     {
    //       label: '社区表情',
    //       key: 'guildEmoji',
    //       icon: 'Emoji',
    //       permissions: GuildPermission.ManageEmojis,
    //     },
    //   ],
    // },
  ]

  const divider = (
    <div className="mx-[8px]">
      <Divider className={'my-[4px]'}></Divider>
    </div>
  )

  const onInvite = (allow: boolean) => {
    if (!allow) {
      FbToast.open({ content: '暂无权限' })
      return
    }
    setOpen(false)
    showInviteModal(guild_id)
  }

  const handleSetGuildNickname = async () => {
    await GuildAPI.setGuildNickname({ guildId: guild_id, nick: guildNickname.trim() })
    dispatch(
      guildUserActions.update({
        guildId: guild_id,
        userId: LocalUserInfo.userId,
        user: { nickname: guildNickname.trim() },
      })
    )
  }

  const handleReport = () => {
    report({ guildId: guild_id, accusedUserId: guild_id, accusedName: guild.name, complaintType: 1 })
  }

  const handleExit = () => {
    setMoreOpen(false)
    setTimeout(() => setOpen(false), 0)
    showGuildExitModal(guild_id)
  }

  return (
    <>
      <Popover
        overlayInnerStyle={{ borderRadius: 8, padding: 0 }}
        arrow={true}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
        align={{ offset: [-110, 10] }}
        content={
          <div className=" w-[280px]">
            <div className="flex items-center gap-2 p-[16px]">
              <CosImage src={guild.icon} size={64} className="mr-[8px] rounded-[10px]" />
              <div className={'flex flex-1 flex-col justify-center'}>
                <div className={'mb-[8px] flex items-center gap-1 text-[16px] font-medium leading-[22px] text-[var(--fg-b100)]'}>
                  <span className={'line-clamp-2'}>{guild.name}</span>
                  <AuthenticationIcon guild={guild} canHover={true} />
                </div>
                <div className={'flex items-center text-[12px] leading-[16px] text-[var(--fg-b95)]'}>{formatCount(memberCount)} 位成员</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-[8px] px-[8px] py-[4px] text-xs">
              <PermissionBuilder permission={ChannelPermission.CreateInstantInvite}>
                {allow => <InlineMenu icon={'UserAdd'} name={'邀请'} onClick={() => onInvite(allow)} disabled={!allow}></InlineMenu>}
              </PermissionBuilder>

              <InlineMenu
                icon={'Bell'}
                name={'通知'}
                disabled
                onClick={() => {
                  showUnsupportedFeatureToast()
                }}
              ></InlineMenu>
              <PermissionBuilder
                guildId={guild_id}
                permission={GuildPermission.ManageGuild | GuildPermission.ManageRoles | GuildPermission.ManageEmojis | GuildPermission.ManageChannels}
              >
                {allow => {
                  return (
                    allow && (
                      <InlineMenu
                        icon={'Setting'}
                        name={'设置'}
                        onClick={() => {
                          setOpen(false)
                          const { destroy: close } = showFbModal({
                            width: 960,
                            closable: false,
                            keyboard: false,
                            maskClosable: false,
                            className: 'large',
                            content: (
                              <GuildContext.Provider value={guild}>
                                <SettingsScaffold title={'社区设置'} menus={guildMenu} onClose={() => close()} />
                              </GuildContext.Provider>
                            ),
                            footer: null,
                          })
                        }}
                      ></InlineMenu>
                    )
                  )
                }}
              </PermissionBuilder>
            </div>
            <div className={'px-[8px]'}>
              {divider}
              <PermissionBuilder guildId={guild_id} permission={GuildPermission.ManageChannels}>
                {allow =>
                  allow && (
                    <>
                      <BlockMenu
                        icon={'PlusSquare'}
                        name={'创建频道'}
                        onClick={() => {
                          setOpen(false)
                          openCreateChannelModal({ guildId: guild_id })
                        }}
                      ></BlockMenu>
                      <BlockMenu
                        icon={'ThreeSquares1Plus'}
                        name={'创建频道分类'}
                        onClick={() => {
                          setOpen(false)
                          openChannelCategorySettings({ guildId: guild_id })
                        }}
                      ></BlockMenu>
                      {divider}
                    </>
                  )
                }
              </PermissionBuilder>
              <BlockMenu
                icon={'UserEdit'}
                name={'我在本社区昵称'}
                suffix={<RealtimeNickname className="inline-block w-[80px] truncate text-right" userId={LocalUserInfo.userId} guildId={guild_id} />}
                onClick={() => {
                  setOpen(false)
                  setModalChangeNameOpen(true)
                }}
              ></BlockMenu>
              {divider}
              <Popover
                overlayInnerStyle={{ borderRadius: 8, padding: 8 }}
                trigger="hover"
                placement="rightTop"
                arrow={false}
                open={moreOpen}
                onOpenChange={setMoreOpen}
                content={
                  <div className="w-[200px]">
                    <div className="flex h-[40px] cursor-pointer items-center rounded-md p-2 hover:bg-gray-100" onClick={handleReport}>
                      <iconpark-icon name="Warming" class="mr-2" size={18}></iconpark-icon>
                      举报社区
                    </div>
                    {!isOwner && (
                      <>
                        <Divider className="my-[4px]" />
                        <div
                          className="flex h-[40px] cursor-pointer items-center rounded-md p-2 text-[var(--function-red-1)] hover:bg-gray-100"
                          onClick={handleExit}
                        >
                          <iconpark-icon name="LoginOut" class="mr-2" size={18} fill="var(--function-red-1)"></iconpark-icon>
                          退出社区
                        </div>
                      </>
                    )}
                  </div>
                }
              >
                <BlockMenu icon={'MoreCircle'} name={'更多'} suffix={<iconpark-icon name="Right" fill="gray"></iconpark-icon>}></BlockMenu>
              </Popover>
              <div className={'h-[8px]'}></div>
            </div>
          </div>
        }
      >
        {props.children}
      </Popover>

      {/* 修改我在本社区的昵称 */}
      <FbModal
        width={450}
        open={modalChangeNameOpen}
        centered
        closable
        classNames={{ content: '!p-4' }}
        onCancel={() => {
          setModalChangeNameOpen(false)
          setGuildNickname(currentGuildNickname || StateUtils.localUser.nickname)
        }}
        title={<div className="font-normal text-[var(--fg-b100)]">我在本社区的昵称</div>}
        closeIcon={<iconpark-icon name="Close" fill="gray" size={18}></iconpark-icon>}
        footer={
          <Button
            type="primary"
            onClick={async () => {
              await handleSetGuildNickname()
              setModalChangeNameOpen(false)
            }}
          >
            确定
          </Button>
        }
      >
        <Form>
          <Form.Item>
            <Input
              maxLength={12}
              showCount
              placeholder="请输入昵称"
              size="large"
              value={guildNickname}
              onChange={evt => {
                setGuildNickname(evt.target.value)
              }}
            />
          </Form.Item>
        </Form>
      </FbModal>

      {/* 频道消息提醒设置 */}
      <FbModal
        width={450}
        centered
        classNames={{ content: '!p-4' }}
        open={modalMessageSettingsOpen}
        onCancel={() => setModalMessageSettingsOpen(false)}
        title={<div className="font-normal text-[var(--fg-b100)]">频道消息提醒</div>}
        closeIcon={<iconpark-icon name="Close" fill="gray" size={18}></iconpark-icon>}
        footer={
          <Button type="primary" onClick={() => setModalMessageSettingsOpen(false)}>
            确定
          </Button>
        }
      >
        <div className="flex items-center justify-between rounded">横幅通知</div>
      </FbModal>
    </>
  )
}

function InlineMenu({
  name,
  icon,
  disabled = false,
  ...restProps
}: {
  name: string
  icon: string
  disabled?: boolean
} & HTMLAttributes<never>) {
  return (
    <div
      className={`flex h-[50px] flex-1 cursor-pointer flex-col items-center justify-center hover:rounded-[6px]  hover:bg-[var(--fg-b5)] ${
        disabled ? `text-[${disableColor}]` : `text-[${enableColor}]`
      }`}
      {...restProps}
    >
      <iconpark-icon name={icon} size={20} fill={`${disabled ? disableColor : enableColor}`} class={'mb-[4px]'}></iconpark-icon>
      {name}
    </div>
  )
}

function BlockMenu({
  name,
  icon,
  suffix,
  className,
  disabled = false,
  ...restProps
}: {
  name: string
  icon: string
  className?: string
  disabled?: boolean
  suffix?: React.ReactNode
} & HTMLAttributes<never>) {
  return (
    <div
      className={`flex h-[40px] flex-1 cursor-not-allowed items-center justify-center px-[8px] hover:rounded-[6px] hover:bg-[var(--fg-b5)] ${
        disabled ? `cursor-not-allowed text-[${disableColor}]` : `cursor-pointer text-[${enableColor}]`
      } ${className}`}
      {...restProps}
    >
      <iconpark-icon name={icon} size={15} fill={`${disabled ? disableColor : enableColor}`} class={'mr-[8px] p-[2px]'}></iconpark-icon>
      <div className={'flex-1'}>{name}</div>
      {suffix}
    </div>
  )
}

export default GuildCard
