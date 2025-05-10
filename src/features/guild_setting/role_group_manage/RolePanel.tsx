import { Form, Input, Switch, Tabs, TabsProps } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal'
import { TabLabel } from 'fb-components/base_ui/fb_tabs/TabLabel'
import FbToast from 'fb-components/base_ui/fb_toast'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { RoleStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import ColorUtils from 'fb-components/utils/ColorUtils'
import { isNil } from 'lodash-es'
import { useContext, useEffect, useMemo, useState } from 'react'
import PermissionValue from '../../../base_services/permission/permissionValue'
import BoostBadge from '../../../components/boost/BoostBadge'
import FormItem from '../../../components/form/FormItem'
import FormSection from '../../../components/form/FormSection'
import FormBodyCommon from '../../../components/form/body/FormBodyCommon'
import SingleImageUploader from '../../../components/single_image_uploader/SingleImageUploader'
import {
  AudiovisualPermission,
  ChannelPermission,
  GuildPermission,
  LivePermission,
  PERMISSION_NONE,
  PermissionService,
  PostPermission,
  SpecialPermission,
  permissionDescriptionMap,
} from '../../../services/PermissionService'
import Benefit from '../../guild_level/Benefit'
import useLevelBenefit from '../../guild_level/useLevelBenefit'
import GuildUtils from '../../guild_list/GuildUtils'
import LocalUserInfo from '../../local_user/LocalUserInfo'
import { GuildUserUtils } from '../../role/guildUserSlice'
import IdentityList from '../components/IdentityList'
import ChannelList from './ChannelList'
import ColorWheel from './ColorWheel'
import showRoleChannelListModal from './RoleChannelList'
import { DEFAULT_COLOR, RoleGroupContext } from './context'

enum RolePanelType {
  BaseSetting = 'BaseSetting',
  PermissionManage = 'PermissionManage',
  MemberManage = 'MemberManagement',
}

const RoleVisibilitySwitch = ({ checked, disabled, onChange }: { checked?: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }) => {
  return <Switch checked={!checked} disabled={disabled} onChange={checked => onChange?.(!checked)} />
}

function RoleBaseSetting({ hasPermission = false }: { hasPermission?: boolean }) {
  const context = useContext(RoleGroupContext)
  const { role, index = 0 } = context ?? {}
  const roleBadgeDisabled = !useLevelBenefit(Benefit.roleBadge)
  const customable = !(role && [RoleType.Owner, RoleType.NormalMember, RoleType.Visitor].includes(role?.t))

  return (
    <div className="h-full overflow-auto">
      <FormItem label="身份组名称">
        <Form.Item name={['roles', index, 'name']} rules={[{ required: true, whitespace: true, message: '身份组名称需包括 1 - 30 个字符' }]}>
          <Input size="large" placeholder="请输入身份组名称" showCount={customable} maxLength={30} disabled={!(customable && hasPermission)} />
        </Form.Item>
      </FormItem>
      <FormItem label="身份组颜色">
        <Form.Item name={['roles', index, 'color']}>
          <ColorWheel
            format="int"
            presetColor={
              !(customable && hasPermission) ?
                role && !isNil(role.color) ?
                  [ColorUtils.convertToCssColor(role.color, DEFAULT_COLOR)]
                : []
              : undefined
            }
            customable={customable && hasPermission}
          />
        </Form.Item>
      </FormItem>
      {role && RoleType.Visitor !== role.t && (
        <>
          <FormItem label="身份组显示" bottomDivider>
            <FormBodyCommon
              title="成员列表中分组显示"
              suffix={
                <Form.Item name={['roles', index, 'hoist']} valuePropName="checked">
                  <RoleVisibilitySwitch disabled={!hasPermission} />
                </Form.Item>
              }
            />
          </FormItem>
          <FormItem
            label={
              <span className="flex items-center gap-[8px] ">
                身份组图标
                {roleBadgeDisabled && <BoostBadge level={2} />}
              </span>
            }
          >
            <Form.Item name={['roles', index, 'icon']} valuePropName="url">
              <SingleImageUploader
                onlyIcon
                disabled={!(hasPermission && !roleBadgeDisabled)}
                useCrop={{ title: '编辑身份组图标' }}
                needBorder={true}
              />
            </Form.Item>
            <span className="mt-2 inline-block text-[12px] text-[var(--fg-b40)]">
              图标展示在成员昵称后，如果成员拥有多个身份组，将会展示成员权限最高的身份组的图标。
            </span>
          </FormItem>
        </>
      )}
    </div>
  )
}

const getPermissionMap = (role: RoleStruct) => {
  switch (role.t) {
    case RoleType.Owner:
    case RoleType.SeniorManager:
    case RoleType.Other:
      return [
        {
          section: '频道管理权限',
          permissions: [
            GuildPermission.ManageGuild,
            GuildPermission.ManageChannels,
            GuildPermission.ManageBot,
            GuildPermission.ManageEmojis,
            GuildPermission.ViewOperationLog,
          ],
        },
        {
          section: '内容与数据管理权限',
          permissions: [ChannelPermission.ManageMessages, GuildPermission.ManageCircle, GuildPermission.AttachFiles],
        },
        {
          section: '成员管理权限',
          permissions: [
            ChannelPermission.CreateInstantInvite,
            GuildPermission.ManageRoles,
            GuildPermission.KickMembers,
            GuildPermission.DeafenMembers,
          ],
        },
        {
          section: '高级权限',
          permissions: [SpecialPermission.Administrator],
        },
      ]
    case RoleType.ChannelManager:
      return [
        {
          section: '频道管理权限',
          permissions: [ChannelPermission.ChannelManager],
        },
      ]
    case RoleType.NormalMember:
      return [
        {
          section: '成员管理权限',
          permissions: [ChannelPermission.CreateInstantInvite],
        },
      ]
    default:
      return []
  }
}

function PermissionCheckList({
  renderPermissionMap,
  value,
  onChange,
  editable = true,
  fixed = false,
}: {
  value?: number
  onChange?: (value: number) => void
  editable?: boolean
  fixed?: boolean
  renderPermissionMap: (
    | {
        section: string
        permissions: (GuildPermission | ChannelPermission)[]
      }
    | {
        section: string
        permissions: SpecialPermission[]
      }
  )[]
}) {
  const permissionValue = useMemo(() => {
    if (!value) {
      return PERMISSION_NONE
    }
    return new PermissionValue(value)
  }, [value])

  const handleChange = (checked: boolean, permission: number) => {
    if (!onChange) {
      return
    }
    onChange(checked ? permissionValue.add(permission).valueOf() : permissionValue.remove(permission).valueOf())
  }

  return renderPermissionMap.map(({ section, permissions }) => (
    <FormSection key={section} title={section}>
      {permissions.map(permission => {
        const info = permissionDescriptionMap[permission]
        return info ?
            <FormItem key={permission} bottomDivider>
              <FormBodyCommon
                title={info.communityName}
                desc={info.communityDesc}
                suffix={
                  fixed ?
                    <iconpark-icon name="Check" size={16} class="text-[var(--fg-b40)]"></iconpark-icon>
                  : <Switch disabled={!editable} checked={permissionValue.has(permission)} onChange={checked => handleChange(checked, permission)} />
                }
              />
            </FormItem>
          : null
      })}
    </FormSection>
  ))
}

function getChannelRolePermissionList(
  guildId: string,
  role: RoleStruct
): Record<
  string,
  ChannelStruct & {
    rolePermission?: PermissionValue
  }
> {
  const guild = GuildUtils.getGuildById(guildId)
  if (!guild) {
    return {}
  }
  let _role: RoleStruct | undefined = guild.roles[role.role_id]
  // 访客使用普通成员的权限
  if (role.t == RoleType.Visitor) {
    _role = Object.values(guild.roles).find(role => role.t == RoleType.NormalMember)
  }
  if (!_role) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(guild.channels)
      ?.filter(([_, channel]) => {
        // 圈子频道 即将下线 忽略 FIXME
        if (channel.type === ChannelType.unsupported || channel.type === ChannelType.CircleTopic) return false
        // 列表忽略
        if (channel.type === ChannelType.Category) return true
        return true
      })
      .map(([channelId, channel]) => {
        if (channel.type === ChannelType.Category || !_role) return [channelId, channel]
        return [
          channelId,
          {
            ...channel,
            rolePermission: PermissionService.computeOverwriteWithRole(guildId, channel.channel_id, _role.role_id),
          },
        ]
      })
  )
}

function getCanViewChannelList(
  channels: Record<string, ChannelStruct & { rolePermission?: PermissionValue }>
): Record<string, ChannelStruct & { rolePermission?: PermissionValue }> {
  return Object.fromEntries(
    Object.entries(channels)?.filter(([_, channel]) => {
      // 列表忽略
      if (channel.type === ChannelType.Category) return true
      if (channel.type === ChannelType.Metaverse || channel.type === ChannelType.PrivateTopic) return false
      return channel.rolePermission?.has(ChannelPermission.ViewChannel)
    })
  )
}

function getCanSpeckChannelList(
  channels: Record<string, ChannelStruct & { rolePermission?: PermissionValue }>
): Record<string, ChannelStruct & { rolePermission?: PermissionValue }> {
  // 可发言前提是可查看
  const _channels = getCanViewChannelList(channels)
  return Object.fromEntries(
    Object.entries(_channels)?.filter(([_, channel]) => {
      // 列表忽略
      switch (channel.type) {
        case ChannelType.Category:
          return true
        case ChannelType.guildVoice:
        case ChannelType.guildVideo:
          return channel.rolePermission?.has(AudiovisualPermission.Speak)
        case ChannelType.guildLive:
        case ChannelType.liveRoom:
          return channel.rolePermission?.has(LivePermission.OpenLive)
        case ChannelType.GuildNotice:
        case ChannelType.guildText:
          return channel.rolePermission?.has(ChannelPermission.SendMessage)
        case ChannelType.GuildQuestion:
          // 问答频道发布问题 或者 回答问题
          return channel.rolePermission?.any(PostPermission.CreatePost | PostPermission.ReplyPost)
        case ChannelType.Link:
        case ChannelType.circleNews:
        case ChannelType.circlePostNews:
        case ChannelType.officialOperation:
        case ChannelType.Metaverse:
        case ChannelType.CircleNews:
        case ChannelType.UserFollow:
        case ChannelType.ActivityCalendar:
        // 隐藏不支持的频道
        case ChannelType.CircleTopic:
        case ChannelType.guildCircle:
        case ChannelType.GroupDm:
        case ChannelType.DirectMessage:
        case ChannelType.task:
        case ChannelType.unsupported:
        default:
          return false
      }
    })
  )
}

function PermissionManage({ hasPermission = false }: { hasPermission?: boolean }) {
  const guildId = GuildUtils.getCurrentGuildId()
  const context = useContext(RoleGroupContext)
  const { role, index = 0 } = context ?? {}

  const renderPermissionMap = useMemo(() => {
    if (!role) {
      return []
    }
    return getPermissionMap(role)
  }, [role])

  const roleChannels = useMemo(() => {
    if (!role || !guildId) {
      return {}
    }

    return getChannelRolePermissionList(guildId, role)
  }, [role, guildId])

  const viewChannels = useMemo(() => {
    if (!role || !guildId) {
      return {}
    }
    switch (role.t) {
      case RoleType.Other:
      case RoleType.NormalMember:
      case RoleType.Visitor: {
        // 访客使用普通成员的权限
        return getCanViewChannelList(roleChannels)
      }
      default:
        return {}
    }
  }, [roleChannels])

  const speckChannels = useMemo(() => {
    if (!role || !guildId) {
      return {}
    }
    switch (role.t) {
      case RoleType.Other:
      case RoleType.NormalMember:
        return getCanSpeckChannelList(roleChannels)
      // 访客没有发言权限
      case RoleType.Visitor:
      default:
        return {}
    }
  }, [role, guildId])

  const canViewLabel = useMemo(() => {
    switch (role?.t) {
      case RoleType.Owner:
      case RoleType.SeniorManager:
        return '全部频道'
      case RoleType.ChannelManager:
        return '所管理的频道'
      default:
        return `${Object.values(viewChannels).filter(channel => channel.type !== ChannelType.Category).length} 个`
    }
  }, [role, viewChannels])

  const canSpeckLabel = useMemo(() => {
    switch (role?.t) {
      case RoleType.Owner:
      case RoleType.SeniorManager:
        return '全部频道'
      case RoleType.ChannelManager:
        return '所管理的频道'
      case RoleType.Other:
      default:
        return `${Object.values(speckChannels).filter(channel => channel.type !== ChannelType.Category).length} 个`
    }
  }, [role, speckChannels])

  const isFixedRole = useMemo(() => {
    return role && [RoleType.Owner, RoleType.SeniorManager, RoleType.ChannelManager].includes(role.t)
  }, [role])

  return (
    <div className="h-full overflow-auto">
      <FormSection title="查看与发言权限">
        <FormItem bottomDivider>
          <FormBodyCommon
            title="可查看的频道"
            arrowCallback={
              isFixedRole ? undefined : (
                () => {
                  if (Object.values(viewChannels).length > 0) {
                    guildId &&
                      showRoleChannelListModal({
                        guildId: guildId,
                        channels: viewChannels,
                        title: '可查看的频道',
                        message: '暂不支持编辑。',
                      })
                  }
                }
              )
            }
            suffix={<span className="text-[var(--fg-b60)]">{canViewLabel}</span>}
          />
        </FormItem>
        <FormItem bottomDivider>
          <FormBodyCommon
            title="可发言的频道"
            arrowCallback={
              isFixedRole ? undefined : (
                () => {
                  if (Object.values(speckChannels).length > 0) {
                    guildId &&
                      showRoleChannelListModal({
                        guildId: guildId,
                        channels: speckChannels,
                        title: '可发言的频道',
                        message: '频道发言权限包含文字频道发消息、音视频视频开麦、直播频道开播、问答频道发布问答。',
                      })
                  } else {
                    FbToast.open({ content: '暂无可发言的频道', key: 'no_speck_channel' })
                  }
                }
              )
            }
            suffix={<span className="text-[var(--fg-b60)]">{canSpeckLabel}</span>}
          />
        </FormItem>
      </FormSection>
      <Form.Item name={['roles', index, 'permissions']}>
        <PermissionCheckList renderPermissionMap={renderPermissionMap} fixed={isFixedRole} editable={hasPermission} />
      </Form.Item>
    </div>
  )
}

// const change = () => {
//   RoleAPI.batchAddMemberForRole({
//     guildId: '524165240108093440',
//     roleId: '524165240238116864',
//     memberIds: ['524164837345857536'],
//   })
// }

function MemberManage({ hasPermission = false }: { hasPermission?: boolean }) {
  const context = useContext(RoleGroupContext)
  const guildId = GuildUtils.getCurrentGuildId()
  const { role } = context ?? {}
  const [collapseCateIds, setInnerCollapseCateIds] = useState<Record<string, boolean>>({})
  const [selectedChannel, setSelectedChannel] = useState<ChannelStruct | undefined>(undefined)
  return (
    role?.t == RoleType.ChannelManager ?
      selectedChannel ?
        <div className="flex h-full flex-1 flex-col">
          <span className="mb-4 flex cursor-pointer items-center gap-1 text-sm" onClick={() => setSelectedChannel(undefined)}>
            <iconpark-icon name="Left" class="text-[var(--fg-b60)]" size={16}></iconpark-icon>
            <span className="text-[var(--fg-b40)]">频道列表 / </span>
            <span>{selectedChannel?.name}</span>
          </span>
          <IdentityList className="flex-1" role={role} channel={selectedChannel} editable={hasPermission} title="频道管理员" />
        </div>
      : <ChannelList
          guildId={guildId}
          collapseCateIds={collapseCateIds}
          onCollapseChange={setInnerCollapseCateIds}
          onChange={setSelectedChannel}
        ></ChannelList>
    : <IdentityList
        role={role}
        // 有编辑权限的身份组且身份组类型不是频道主才能编辑, 普通成员不能删除 但是可以添加
        editable={{
          add: hasPermission && role?.t != RoleType.Owner,
          remove: hasPermission && !isNil(role?.t) && ![RoleType.Owner, RoleType.NormalMember].includes(role.t),
        }}
        beforeEdit={async () => {
          return role?.t == RoleType.NormalMember ?
              new Promise(resolve => {
                const { destroy: close } = FbModal.info({
                  content: '将成员设为普通成员身份组后，将会撤销成员已有的其他身份组。',
                  showCancelButton: false,
                  closable: false,
                  maskClosable: false,
                  onCancel: () => {
                    close()
                    resolve()
                  },
                  onOk: () => {
                    close()
                    resolve()
                  },
                })
              })
            : Promise.resolve()
        }}
      />
  )
}

function RolePanel({ className = '' }: { className?: string }) {
  const [activeKey, setActiveKey] = useState(RolePanelType.BaseSetting)
  const context = useContext(RoleGroupContext)
  const { role } = context ?? {}
  const guildId = GuildUtils.getCurrentGuildId()
  // 仅能修改编辑比自己权限低的身份组 或 频道主自身的身份组
  const hasPermission =
    guildId ? GuildUserUtils.hasHigherRoleThanRole(guildId, role?.role_id ?? '') || GuildUserUtils.hasOwnerRole(guildId, LocalUserInfo.userId) : false
  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: RolePanelType.BaseSetting,
        label: <TabLabel selected={activeKey === RolePanelType.BaseSetting}>基础设置</TabLabel>,
        children: <RoleBaseSetting hasPermission={hasPermission} />,
      },
      {
        key: RolePanelType.PermissionManage,
        label: <TabLabel selected={activeKey === RolePanelType.PermissionManage}>权限管理</TabLabel>,
        children: <PermissionManage hasPermission={hasPermission} />,
      },
      ...(role && RoleType.Visitor !== role.t ?
        [
          {
            key: RolePanelType.MemberManage,
            label: <TabLabel selected={activeKey === RolePanelType.MemberManage}>成员管理</TabLabel>,
            children: <MemberManage hasPermission={hasPermission} />,
            destroyInactiveTabPane: role.t != RoleType.ChannelManager,
          },
        ]
      : []),
    ],
    [activeKey, role]
  )

  const handleChange = (key: string | number) => {
    setActiveKey(key as RolePanelType)
  }
  // 当前角色为游客时, tab 页为成员管理时, 默认展示基础设置
  useEffect(() => {
    if (!role || role.t != RoleType.Visitor || activeKey !== RolePanelType.MemberManage) {
      return
    }
    setActiveKey(RolePanelType.BaseSetting)
  }, [role, activeKey])

  return (
    <div className={`${className} px-[24px] pt-[16px]`}>
      <Tabs
        activeKey={activeKey?.toString()}
        size="large"
        tabBarGutter={48}
        className="h-full w-full [&_.ant-tabs-content-holder]:h-full [&_.ant-tabs-content]:h-full [&_.ant-tabs-tabpane>*]:mx-[-16px] [&_.ant-tabs-tabpane>*]:px-[16px] [&_.ant-tabs-tabpane]:h-full"
        indicatorSize={24}
        renderTabBar={(props, DefaultTabBar) => {
          return <DefaultTabBar {...props} className="!mb-4 h-[36px]"></DefaultTabBar>
        }}
        items={items}
        onChange={handleChange}
      />
    </div>
  )
}

/**
 * TODO 这个方法理应只返回可查看的频道，不包括分类，但是由于分类数据在展示的时候要，所以并不合理
 */
export function getAccessibleChannels(guildId: string, role: RoleStruct) {
  return getCanViewChannelList(getChannelRolePermissionList(guildId, role))
}

export default RolePanel
