import { useUpdate } from 'ahooks'
import { Divider, Form, FormInstance, Radio, Tabs, TabsProps } from 'antd'
import clsx from 'clsx'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import { GuildStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { clone, cloneDeep, difference, omit, pick } from 'lodash-es'
import { ReactElement, ReactNode, Ref, cloneElement, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch } from '../../../../app/hooks.ts'
import { store } from '../../../../app/store.ts'
import EmptyPage from '../../../../components/EmptyPage.tsx'
import SelectionList from '../../../../components/SelectionList.tsx'
import FbForm, { FbFormRef } from '../../../../components/form/FbForm.tsx'
import FormSection from '../../../../components/form/FormSection.tsx'
import FormInfoBlock from '../../../../components/form/body/FormInfoBlock.tsx'
import RoleItem from '../../../../components/realtime_components/item/RoleItem.tsx'
import UserItem from '../../../../components/realtime_components/item/UserItem.tsx'
import { ChannelPermission, Permission, PermissionService, PostPermission } from '../../../../services/PermissionService.ts'
import { circleActions } from '../../../circle/circleSlice.ts'
import GuildUtils from '../../../guild_list/GuildUtils.tsx'
import { guildListActions, handleCircleUpdate } from '../../../guild_list/guildListSlice.ts'
import { GuildUserUtils } from '../../../role/guildUserSlice.ts'
import { RoleAPI } from '../../../role/roleAPI.ts'
import showIdentityPickerModal, { IdentityType } from '../../components/IdentityPicker.tsx'
import { ChannelSettingsSubPageProps } from '../CircleChannelSettings.tsx'

type MenuItem = {
  label: string
  tips: string
  permission: Permission
  component?: ReactNode
}

export default function ChannelPermissionSettings({ value: channel, onChange }: ChannelSettingsSubPageProps) {
  const guild = useMemo(() => GuildUtils.getCurrentGuild() as GuildStruct, [])
  const { post_multi_para = SwitchType.No, upload_files = SwitchType.No } = guild ?? ({} as GuildStruct)
  const dispatch = useAppDispatch()
  const menu: MenuItem[] = useMemo(
    () => [
      { label: '谁可以发布动态', tips: '允许成员在圈子发布动态。', permission: PostPermission.CreatePost },
      { label: '谁可以评论', tips: '允许成员评论动态。', permission: PostPermission.ReplyPost },
      ...(upload_files == SwitchType.Yes ?
        [
          {
            label: '谁可以上传文件',
            tips: '允许成员在编辑动态时上传文件。',
            permission: ChannelPermission.UploadFile,
          },
        ]
      : []),
      ...(post_multi_para == SwitchType.Yes ?
        [
          {
            label: '高级发布',
            tips: '允许成员发布长文动态。',
            permission: PostPermission.RichTextPost,
          },
        ]
      : []),
    ],
    [channel]
  )
  const [selectedItem, setSelectedItem] = useState(0)
  const updater = useUpdate()
  useEffect(() => {
    // 更新身份组成员数量
    dispatch(guildListActions.getGuildRoles({ guildId: guild.guild_id, channelId: channel.channel_id })).then(updater)
  }, [guild])

  const formRef = useRef<FbFormRef<never>>(null)

  function handleChangeTab(index: number) {
    return new Promise<void>((resolve, reject) => {
      if (formRef.current?.isChanged()) {
        const { destroy } = FbModal.error({
          title: '切换编辑',
          content: '你做的修改尚未保存，确定切换吗？',
          okText: '切换',
          cancelText: '继续编辑',
          onOk: () => {
            setSelectedItem(index)
            resolve()
          },
          onCancel: () => {
            reject()
            destroy()
          },
        })
      } else {
        setSelectedItem(index)
        resolve()
      }
    })
  }

  return (
    <div className={'flex h-full'}>
      {/* 左侧列表 */}
      <div className={'flex h-full w-[224px] flex-shrink-0 flex-col gap-1 border-r-[0.5px] border-r-[var(--fg-b10)] py-3 px-4'}>
        <div className={'flex h-10 items-center text-[var(--fg-b60)]'}>频道权限</div>
        <SelectionList
          selected={'0'}
          className={'flex flex-col gap-1 mx-[-8px]'}
          itemClassName={'h-10 w-full !justify-start px-2 text-[var(--fg-b100)]'}
          data={menu}
          itemRenderer={e => e.label}
          onChange={e => handleChangeTab(parseInt(e))}
        />
      </div>
      <RightPane formRef={formRef} key={selectedItem} {...menu[selectedItem]} value={channel} onChange={onChange} />
    </div>
  )
}

function RightPane({
  formRef,
  tips,
  label,
  permission,
  component,
  value,
  onChange,
}: ChannelSettingsSubPageProps &
  MenuItem & {
    formUpdater?: () => void
    formRef: Ref<FbFormRef<never>>
  }) {
  const channel = useMemo(() => cloneDeep(value), [value])
  const initialValue = useMemo(() => {
    const guild = GuildUtils.getCurrentGuild() as GuildStruct
    const result = {
      public: migrateFromOldPermissionSystem(),
      ...PermissionService.splitAllowedRolesAndUsersFromOverwrites(channel.guild_id, channel.channel_id, permission),
    }
    result.roles = result.roles
      .map(id => guild.roles[id])
      .filter(Boolean)
      .sort((prev, next) => next.position - prev.position)
      .map(role => role.role_id)

    return result
  }, [permission])
  type T = typeof initialValue

  /**
   * 这个方法用于在新旧版本权限过渡时，检查和自动修正权限数据。
   * 待服务端完成了权限过渡后，这个方法可以删除。（有可能服务端不会迁移数据库）
   *
   * 原因：
   * 旧权限中，频道权限是社区权限的子集，但是新权限中，频道权限是独立的，而基本的计算逻辑还是用旧权限的计算方式，这样社区权限可以
   * 作为在频道权限之上的开关。
   *
   * 现在要求例如 @全体成员 这类高级功能从默认开启变成默认关闭。这就出问题了，因为服务端没有进行数据迁移
   * 所以如果某个用户拥有的角色拥有高级权限，就会导致无论 overwrite 怎么配置用户，此用户拥有该权限。
   *
   * 在不迁移数据迁移的情况下，有个办法可以解决这个问题：
   * 让频道的 overwrite 的 everyone 拥有覆盖设置，那么可以让社区的角色权限配置失效。
   *
   * 检查方式为：如果该频道的权限是指定成员可见，那么如果 everyone 没有 deny 该权限，就 deny 该权限。
   * 此行为需要修改服务端数据，否则最终效果还是不生效。
   */
  function migrateFromOldPermissionSystem() {
    const isPrivate = PermissionService.isPrivateChannel(channel.guild_id, channel.channel_id, permission)
    if (!isPrivate) return true

    const everyone = clone(channel.overwrite[channel.guild_id]) ?? {
      id: channel.guild_id,
      action_type: 'role',
      allows: 0,
      deny: 0,
    }
    if ((everyone.deny & permission) === 0) {
      everyone.deny |= permission
      // 修正服务端数据
      RoleAPI.updateOverwrite({
        ...everyone,
        guildId: channel.guild_id,
        channelId: channel.channel_id,
        actionType: 'role',
      }).catch(() => {})
      channel.overwrite[channel.guild_id] = everyone
      store.dispatch(circleActions.updateCircleChannel(pick(channel, 'guild_id', 'channel_id', 'overwrite')))
      const _channel = store.getState().circle.info.channel
      // 更新 guild list 里
      _channel && handleCircleUpdate({ data: _channel })

      onChange?.(clone(channel))
      console.info('Migrate from old permission system: Set everyone overwrite permission to deny')
    }
    return false
  }

  const submit = async (data: T, old: T) => {
    const permissions: Parameters<typeof RoleAPI.updateOverwrites>[0]['permissionOverwrites'] = []
    // 重新编码频道 everyone 权限
    // 如果是媒体频道，这个开关是 voice_control 控制的，不用管 public
    if (data.public !== old.public && !('voice_control' in data)) {
      if (!channel.overwrite[channel.guild_id]) {
        channel.overwrite[channel.guild_id] = {
          guild_id: channel.guild_id,
          id: channel.guild_id,
          action_type: 'role',
          allows: 0,
          deny: 0,
        }
      }
      const overwriteEveryone = channel.overwrite[channel.guild_id]

      if (data.public) {
        overwriteEveryone.allows |= permission
        overwriteEveryone.deny &= ~permission
      } else {
        overwriteEveryone.allows &= ~permission
        overwriteEveryone.deny |= permission
      }
      permissions.push(omit(overwriteEveryone, 'channel_id', 'guild_id'))
    }

    function encodePermissions(newData: string[], oldData: string[], actionType: 'role' | 'user') {
      // 重新编码频道身份组权限
      for (const removedId of difference(oldData, newData)) {
        const overwrite = channel.overwrite[removedId]
        if (overwrite) {
          overwrite.allows &= ~permission
          permissions.push(omit(overwrite, 'channel_id', 'guild_id'))
        }
      }
      for (const addedRoleId of difference(newData, oldData)) {
        const overwrite = channel.overwrite[addedRoleId]
        if (overwrite) {
          overwrite.allows |= permission
          permissions.push(omit(overwrite, 'channel_id', 'guild_id'))
        } else {
          const newOverwrite = {
            guild_id: channel.guild_id,
            id: addedRoleId,
            action_type: actionType,
            allows: permission,
            deny: 0,
          }
          channel.overwrite[addedRoleId] = newOverwrite
          permissions.push(omit(newOverwrite, 'channel_id', 'guild_id'))
        }
      }
    }

    // 重新编码频道身份组权限
    encodePermissions(data.roles, old.roles, 'role')
    // 重新编码频道成员权限
    encodePermissions(data.users, old.users, 'user')

    if (permissions.length) {
      await RoleAPI.updateOverwrites({
        guildId: channel.guild_id,
        channelId: channel.channel_id,
        permissionOverwrites: permissions,
      })
    }
    onChange?.(clone(channel))
  }
  return (
    <FbForm<T> ref={formRef as never} initialValue={initialValue} submit={submit} className={'flex flex-1 flex-col item-mb24'}>
      {form => {
        return (
          <div className={'px-6 py-4'}>
            <FormInfoBlock content={'权限说明：' + tips} />
            {component ?
              cloneElement(component as ReactElement, { form })
            : <FormSection title={label}>
                <Form.Item name={'public'}>
                  <Radio.Group className={'flex flex-col rounded-xl border px-3'}>
                    <Radio value={true} className={'h-10 items-center'}>
                      全体成员
                    </Radio>
                    <Divider className={'m-0'}></Divider>
                    <Radio value={false} className={'h-10 items-center'}>
                      指定成员
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </FormSection>
            }
            <ChannelPermissionMemberTabs form={form} channelId={channel.channel_id} />
          </div>
        )
      }}
    </FbForm>
  )
}

function ChannelPermissionMemberTabs({ form, channelId }: { form: FormInstance; channelId: string }) {
  const guild = useMemo(() => GuildUtils.getCurrentGuild() as GuildStruct, [])
  const guildId = guild.guild_id

  const pub = Form.useWatch<boolean | undefined>('public', { form, preserve: true })
  const show = !(pub ?? true)

  function fixedRolesFilter(t: RoleType) {
    return t == RoleType.Owner || t == RoleType.SeniorManager || t == RoleType.ChannelManager
  }

  const fixedRoles = useMemo(() => {
    return Object.values(guild.roles ?? {})
      .filter(r => fixedRolesFilter(r.t))
      .sort((prev, next) => next.position - prev.position)
  }, [guild])

  function handleAdd() {
    const selectedUsers = form.getFieldValue('users') as string[]
    const selectedRoles = form.getFieldValue('roles') as string[]
    showIdentityPickerModal({
      title: '添加身份组或成员',
      guildId: guildId,
      channelId,
      pickerMode: [IdentityType.Role, IdentityType.User],
      checkIfSelected: info => {
        if ('userId' in info) {
          return selectedUsers.includes(info.userId)
        } else {
          if (fixedRolesFilter(info.roleType)) return true
          return selectedRoles.includes(info.roleId)
        }
      },
      onConfirm: async ({ userIds, roleIds }) => {
        form.setFieldsValue({
          users: [...selectedUsers, ...userIds],
          roles: [...selectedRoles, ...roleIds],
        })
      },
    })
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      forceRender: true,
      label: '身份组',
      children: (
        <div className={'flex w-full flex-col'}>
          {fixedRoles.map(role => (
            <RoleItem guildId={guildId} channelId={channelId} key={role.role_id} value={role.role_id} />
          ))}
          <Form.List name={'roles'}>
            {(fields, { remove }) =>
              fields.map((field, index) => {
                return (
                  <Form.Item {...field} key={field.key} className="" name={index}>
                    <RoleItem
                      guildId={guildId}
                      channelId={channelId}
                      className="group/identity-item"
                      suffix={
                        <iconpark-icon
                          class={'invisible cursor-pointer text-[var(--fg-b40)] hover:text-[var(--function-red-1)] group-hover/identity-item:visible'}
                          name="CloseCircleFill"
                          size={16}
                          onClick={() => {
                            remove(index)
                          }}
                        ></iconpark-icon>
                      }
                    />
                  </Form.Item>
                )
              })
            }
          </Form.List>
        </div>
      ),
    },
    {
      key: '2',
      forceRender: true,
      label: ' 成员',
      children: (
        <Form.List name={'users'}>
          {(fields, { remove }) => {
            return fields.length === 0 ?
                <EmptyPage className={'pt-[72px]'} message={''} context={'暂无成员'} />
              : <div className={'flex w-full flex-col'}>
                  {fields.map((field, index) => {
                    return (
                      <Form.Item {...field} key={field.key} name={index}>
                        <UserItem
                          guildId={guildId}
                          className={'group'}
                          suffix={user => {
                            // 仅能修改编辑比自己权限低的身份组
                            const hasPermission = guildId ? GuildUserUtils.hasHigherRoleThan(guildId, user.user_id ?? '') : false
                            return hasPermission ?
                                <iconpark-icon
                                  class={'invisible cursor-pointer text-[var(--fg-b40)] group-hover:visible'}
                                  name={'CloseCircleFill'}
                                  onClick={() => remove(index)}
                                />
                              : null
                          }}
                        />
                      </Form.Item>
                    )
                  })}
                </div>
          }}
        </Form.List>
      ),
    },
  ]
  return (
    <Tabs
      defaultActiveKey="1"
      // 需要隐藏，而不是移除，用来保证表单项的完整性
      className={clsx({ 'hidden': !show })}
      indicator={{ size: 24 }}
      items={items}
      tabBarExtraContent={
        <div className={'flex cursor-pointer gap-1 text-xs text-[var(--fg-blue-1)] hover:opacity-80'} onClick={handleAdd}>
          <iconpark-icon name={'Plus'} size={14} />
          <div>添加身份组或成员</div>
        </div>
      }
    />
  )
}
