import { Button, Form, Input, Radio } from 'antd'
import { useForm } from 'antd/es/form/Form'
import TextArea from 'antd/es/input/TextArea'
import clsx from 'clsx'
import showFbModal, { ConfigUpdate } from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { PermissionOverwrite } from 'fb-components/struct/type.ts'
import { cloneDeep, isEmpty, keyBy, values } from 'lodash-es'
import isEqual from 'lodash-es/isEqual'
import { useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/hooks.ts'
import { store } from '../../../app/store.ts'
import ChannelIcon from '../../../components/ChannelIcon.tsx'
import FadeInOutSwitch from '../../../components/fade_in_out_switch'
import FormSection from '../../../components/form/FormSection.tsx'
import { ChannelPermission } from '../../../services/PermissionService.ts'
import ChannelAPI from '../../guild_container/ChannelAPI.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { guildListActions, guildListSelectors } from '../../guild_list/guildListSlice.ts'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import { IdentityPickerContent, IdentityRoleInfo, IdentityType, IdentityUserInfo } from '../components/IdentityPicker.tsx'
import linkInputRoles from './LinkInputRoles.ts'

interface CreateChannelModalProps {
  guildId: string
  parentId?: string
  parentName?: string
  onClose?: (res?: ChannelStruct) => void
  update?: (res: ConfigUpdate) => void
}

export function openCreateChannelModal({ onClose, ...props }: CreateChannelModalProps) {
  const { destroy, update } = showFbModal({
    width: 440,
    title: '创建频道',
    maskClosable: false,
    footer: null,
    style: { transition: 'width 0.1s ease 0s' },
    onCancel: () => destroy(),
    content: (
      <CreateChannelModal
        {...props}
        update={res => update(res)}
        onClose={res => {
          destroy()
          onClose?.(res)
        }}
      />
    ),
  })
}

export function CreateChannelModal({ guildId, onClose, update, parentId = '0', parentName }: CreateChannelModalProps) {
  const [form] = useForm()
  const [loading, setLoading] = useState(false)
  const channelType = Form.useWatch<ChannelType>('type', form)
  const viewType = Form.useWatch<number>('viewType', form)
  const [isNext, setIsNext] = useState(false)
  const channelTypes = useMemo(() => {
    return [
      { type: ChannelType.guildText, name: '文字频道' },
      { type: ChannelType.Link, name: '链接频道' },
      { type: ChannelType.GuildQuestion, name: '问答频道' },
      { type: ChannelType.guildVoice, name: '音视频频道' },
    ]
  }, [])
  const viewTypes = useMemo(() => {
    return [
      { type: 0, name: '全体成员可查看' },
      { type: 1, name: '指定成员可查看' },
    ]
  }, [])
  const roles = useAppSelector(guildListSelectors.roles(guildId), isEqual) ?? {}

  const defaultIdentityUsers: IdentityUserInfo[] = useMemo(() => {
    return [
      {
        userId: LocalUserInfo.userId,
        roleIds: [],
        type: IdentityType.User,
      },
    ]
  }, [])
  const defaultIdentityRoles: IdentityRoleInfo[] = useMemo(() => {
    return values(roles)
      .filter(e => [RoleType.SeniorManager, RoleType.Owner, RoleType.ChannelManager].includes(e.t))
      .map(e => ({
        roleId: e.role_id,
        roleType: e.t,
        type: IdentityType.Role,
      }))
  }, [roles])

  const initialValues = {
    name: undefined,
    type: ChannelType.guildText,
    viewType: 0,
  }

  const onNext = async () => {
    await form.validateFields()
    setIsNext(true)
    update?.({
      width: 720,
      title: (
        <div className={'flex flex-row items-center text-[18px] gap-2'}>
          <HoverBox className={'w-8 h-8 flex-center'}>
            <iconpark-icon
              name="Left"
              class={'cursor-pointer'}
              size={20}
              onClick={() => {
                update?.({ width: 440, title: '创建频道' })
                setIsNext(false)
              }}
            ></iconpark-icon>
          </HoverBox>
          <span>谁可以查看频道 </span>
        </div>
      ),
    })
  }
  const onSubmit = async (overwrites?: PermissionOverwrite[]) => {
    await form.validateFields()
    try {
      setLoading(true)
      const formData = form.getFieldsValue()
      delete formData.viewType

      const channelData = {
        guild_id: guildId,
        parent_id: parentId,
        permission_overwrites: overwrites ?? [],
        ...formData,
      }
      const { channel_id, permission_overwrites } = await ChannelAPI.create(channelData)
      FbToast.open({ type: 'success', content: '创建成功', key: 'create-channel-success' })
      const guild = GuildUtils.getGuildById(guildId)
      if (!guild) return
      const newGuild = cloneDeep<GuildStruct>(guild)
      channelData.channel_id = channel_id
      channelData.overwrite = keyBy(permission_overwrites, 'id')
      const channelId = channelData.channel_id
      if (newGuild.channel_lists.includes(channelId)) return
      newGuild.channel_lists.push(channelId)
      newGuild.channels[channelData.channel_id] = channelData as ChannelStruct
      GuildUtils.sortChannelList(newGuild)
      store.dispatch(guildListActions.replaceGuild(newGuild))
      onClose?.(channelData)
    } catch (e) {
      console.log('creat channel error', e)
    } finally {
      setLoading(false)
    }
  }
  const createForm = (
    <Form
      form={form}
      initialValues={initialValues}
      className={'fb-form mx-[-24px] flex flex-col  overflow-hidden'}
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      <div className={'flex-1 overflow-auto px-[24px]'}>
        <FormSection title={'频道名称'}>
          <Form.Item name="name" label="" rules={[{ required: true, whitespace: true, message: '请输入频道名称' }]}>
            <Input placeholder={'请输入频道名称'} size={'large'} maxLength={30} showCount />
          </Form.Item>
          {parentId && parentName && <div className={clsx(['py-2 text-xs text-[var(--fg-b60)]', isEmpty()])}> 所属分类：{parentName}</div>}
        </FormSection>
        <FormSection title={'频道类型'} formStyle={'border'}>
          <Form.Item name="type" label="">
            <Radio.Group className={'vertical-radio-group'}>
              {channelTypes.map(channelType => (
                <Radio key={channelType.type} value={channelType.type}>
                  <div className={'ga flex flex-row gap-2'}>
                    <ChannelIcon type={channelType.type} size={16} isPrivate={viewType == 1}></ChannelIcon>
                    {channelType.name}
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </FormSection>
        {channelType == ChannelType.Link && (
          <FormSection>
            <Form.Item name={'link'} rules={linkInputRoles} validateFirst={true}>
              <TextArea className="!min-h-[110px] w-full resize-none" placeholder={'请输入URL，示例：https://www.baidu.com'} />
            </Form.Item>
          </FormSection>
        )}
        <FormSection title={'谁可以查看'} formStyle={'border'}>
          <Form.Item name="viewType" label="">
            <Radio.Group className={'vertical-radio-group'}>
              {viewTypes.map(viewType => (
                <Radio key={viewType.type} value={viewType.type}>
                  <div className={'ga flex flex-row gap-2'}>{viewType.name}</div>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </FormSection>
      </div>
      <div className="gap flex flex-shrink-0 flex-row justify-end gap-4 px-6 py-[18px]">
        <Button className={'btn-middle'} onClick={() => onClose?.()}>
          取消
        </Button>
        <Button className="btn-middle" type={'primary'} loading={loading} onClick={viewType === 0 ? () => onSubmit() : onNext}>
          {viewType == 0 ? '创建' : '下一步'}
        </Button>
      </div>
    </Form>
  )

  async function onIdPickerConfirm(roleIds: string[], userIds: string[]) {
    const everyOneViewDeny: PermissionOverwrite = {
      id: guildId,
      guild_id: guildId,
      deny: ChannelPermission.ViewChannel,
      allows: 0,
      action_type: 'role',
    }
    let permissionOverwrites: PermissionOverwrite[] = []
    permissionOverwrites = [everyOneViewDeny]
    if (roleIds.length > 0) {
      const rolePermissions: PermissionOverwrite[] = [...roleIds].map((e: string) => ({
        id: e,
        guild_id: guildId,
        allows: ChannelPermission.ViewChannel,
        deny: 0,
        action_type: 'role',
        name: null,
      }))

      permissionOverwrites = [...permissionOverwrites, ...rolePermissions]
    }

    const userPermissions: PermissionOverwrite[] = [...defaultIdentityUsers.map(e => e.userId), ...userIds].map((e: string) => ({
      id: e,
      guild_id: guildId,
      allows: ChannelPermission.ViewChannel,
      deny: 0,
      action_type: 'user',
    }))
    permissionOverwrites = [...permissionOverwrites, ...userPermissions]
    await onSubmit(permissionOverwrites)
  }

  return (
    <FadeInOutSwitch index={isNext ? 1 : 0} className={''}>
      <div className={clsx(['duration-400  transition-all', !isNext && 'translate-x-0', isNext && 'translate-x-[-100px]'])}>{createForm}</div>
      <div className={clsx(['duration-400 w-[672px] transition-all', !isNext && 'translate-x-[100px]', isNext && 'translate-x-0'])}>
        <IdentityPickerContent
          guildId={guildId}
          pickerMode={[IdentityType.Role, IdentityType.User]}
          checkIfSelected={item => {
            if (item.type == IdentityType.Role && !!defaultIdentityRoles.find(e => e.roleId == (item as IdentityRoleInfo).roleId)) {
              return true
            }
            return item.type == IdentityType.User && !!defaultIdentityUsers.find(e => e.userId == (item as IdentityUserInfo).userId)
          }}
          onCancel={() => onClose?.()}
          onConfirm={async ({ roleIds, userIds }) => {
            await onIdPickerConfirm(roleIds, userIds)
          }}
        ></IdentityPickerContent>
      </div>
    </FadeInOutSwitch>
  )
}
