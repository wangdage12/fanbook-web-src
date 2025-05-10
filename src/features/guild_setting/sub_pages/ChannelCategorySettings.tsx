import { Form, Input } from 'antd'
import { useForm } from 'antd/es/form/Form'
import showFbModal, { ShowFbModalProps } from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { cloneDeep, keyBy } from 'lodash-es'
import { store } from '../../../app/store.ts'
import { FormType } from '../../../components/form/FbForm.tsx'
import FormSection from '../../../components/form/FormSection.tsx'
import ChannelAPI from '../../guild_container/ChannelAPI.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { guildListActions } from '../../guild_list/guildListSlice.ts'

interface ChannelCategorySettingsProps {
  guildId: string
  channelId?: string
  type?: FormType
  name?: string
  onClose?: (type: FormType, res?: ChannelStruct) => void
  updateLoading?: (val: boolean) => void
}

export function openChannelCategorySettings({ onClose, type = FormType.Create, ...props }: ChannelCategorySettingsProps) {
  const isCreate = type === FormType.Create
  const modal = showFbModal({
    width: 440,
    title: isCreate ? '创建频道分类' : '编辑频道分类',
    maskClosable: false,
    okButtonProps: {
      form: 'channel-category-setting-form',
      htmlType: 'submit',
      onClick: undefined,
    },
    okText: isCreate ? '创建' : '确定',
    onCancel: () => modal.destroy(),
    content: (
      <ChannelCategorySettings
        type={type}
        updateOkProps={props => modal.update({ okButtonProps: props })}
        onClose={(type, res) => {
          modal.destroy()
          onClose?.(type, res)
        }}
        {...props}
      />
    ),
  })
}

export function ChannelCategorySettings({
  guildId,
  channelId,
  name = '',
  onClose,
  type = FormType.Create,
  updateOkProps,
}: ChannelCategorySettingsProps & ShowFbModalProps) {
  const [form] = useForm()
  const setLoading = (loading: boolean) => {
    updateOkProps?.({ loading })
  }
  const initialValues = {
    name,
  }
  const isCreate = type === FormType.Create

  const onFinish = async () => {
    try {
      setLoading(true)
      if (isCreate) {
        const channelData = {
          ...form.getFieldsValue(),
          guild_id: guildId,
          type: ChannelType.Category,
          parent_id: '',
        } as ChannelStruct
        const { channel_id, permission_overwrites } = await ChannelAPI.create(channelData)
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
        store.dispatch(
          guildListActions.mergeGuild({
            guild_id: guildId,
            channel_lists: newGuild.channel_lists,
            channels: newGuild.channels,
          })
        )
        onClose?.(type, channelData)
      } else {
        const channelData = { ...form.getFieldsValue(), guild_id: guildId, channel_id: channelId }
        await ChannelAPI.update(channelData)
        store.dispatch(guildListActions.mergeChannel(channelData))
        onClose?.(type, channelData)
      }
    } catch (e) {
      console.log('creat channel category error', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} id={'channel-category-setting-form'} onFinish={onFinish} initialValues={initialValues}>
      <FormSection title={'频道分类名称'}>
        <Form.Item name="name" label="" rules={[{ required: true, whitespace: true, message: '请输入频道分类名称' }]}>
          <Input placeholder={'请输入频道分类名称'} size={'large'} maxLength={30} showCount />
        </Form.Item>
      </FormSection>
    </Form>
  )
}
