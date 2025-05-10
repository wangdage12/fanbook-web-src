import { Form, Input, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { pick } from 'lodash-es'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import FbForm from '../../../../components/form/FbForm.tsx'
import FormSection from '../../../../components/form/FormSection.tsx'
import { GuildPermission, PermissionService } from '../../../../services/PermissionService.ts'
import ChannelAPI from '../../../guild_container/ChannelAPI.ts'
import GuildUtils from '../../../guild_list/GuildUtils.tsx'
import { guildListActions } from '../../../guild_list/guildListSlice.ts'
import LocalUserInfo from '../../../local_user/LocalUserInfo.ts'
import MediaChannelSettings from '../../components/channel_specified_settings/MediaChannelSettings.tsx'
import { ChannelSettingsSubPageProps } from '../ChannelSettings.tsx'
import linkInputRoles from '../LinkInputRoles.ts'

interface ChannelInfo {
  name: string
  topic?: string
  parent_id: string
  link?: string
}

export default function ChannelInfoSettings({ value: channel, onChange }: ChannelSettingsSubPageProps) {
  const dispatch = useDispatch()

  const editable = useMemo(
    function () {
      const guild = GuildUtils.getCurrentGuild() as GuildStruct
      return PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId).has(GuildPermission.ManageChannels)
    },
    [channel.channel_id]
  )

  const options = useMemo(() => {
    const guild = GuildUtils.getCurrentGuild() as GuildStruct
    return [{ value: '0', label: '无分类' }].concat(
      Object.values(guild.channels)
        .filter(channel => channel.type === ChannelType.Category)
        .map(e => ({
          value: e.channel_id,
          label: e.name,
        }))
    )
  }, [])

  async function submit(data: ChannelInfo) {
    const newData = {
      guild_id: channel.guild_id,
      channel_id: channel.channel_id,
      ...data,
    }
    await ChannelAPI.update(newData)
    onChange({ ...channel, ...newData })
    dispatch(guildListActions.updateChannel(newData))
  }

  const initialValues = useMemo(() => {
    const value = {
      ...pick(channel, ['name', 'parent_id']),
      topic: channel.topic ?? '',
      ...(channel.type === ChannelType.Link ? { link: channel.link ?? '' } : {}),
      ...(channel.type === ChannelType.guildVideo || channel.type === ChannelType.guildVoice ?
        {
          quality: channel.quality || 16,
          user_limit: channel.user_limit ?? 10,
        }
      : {}),
    } as ChannelInfo
    value.parent_id = !value.parent_id ? '0' : value.parent_id
    return value
  }, [channel])

  return (
    <FbForm<ChannelInfo> initialValue={initialValues} className={'item-mb24'} submit={submit}>
      {() => (
        <div className={'px-6 py-3'}>
          <FormSection title={'频道名称'}>
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: '请输入频道名称',
                },
              ]}
            >
              <Input className="w-full" size={'large'} placeholder={'请输入频道名称'} disabled={!editable} maxLength={30} showCount />
            </Form.Item>
          </FormSection>
          <FormSection title={'频道简介'}>
            <Form.Item name="topic">
              <TextArea
                showCount
                className="min-h-[66px] w-full resize-none"
                placeholder={'向伙伴们介绍频道…'}
                maxLength={80}
                autoSize
                disabled={!editable}
              />
            </Form.Item>
          </FormSection>
          <FormSection title={'频道分类'}>
            <Form.Item name="parent_id">
              <Select
                size={'large'}
                disabled={!editable}
                options={options}
                className={'!w-[320px]'}
                suffixIcon={<iconpark-icon color={'var(--fg-b40)'} size={16} name="Down" />}
              />
            </Form.Item>
          </FormSection>

          {channel.type === ChannelType.Link && (
            <FormSection title={'频道链接'}>
              <Form.Item name="link" rules={linkInputRoles} validateFirst={true}>
                <TextArea className="!min-h-[110px] w-full resize-none" placeholder={'请输入URL，示例：https://fanbook.cn'} />
              </Form.Item>
            </FormSection>
          )}

          {(channel.type === ChannelType.guildVoice || channel.type === ChannelType.guildVideo) && <MediaChannelSettings />}
        </div>
      )}
    </FbForm>
  )
}
