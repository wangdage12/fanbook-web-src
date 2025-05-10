import { Form, FormInstance, Radio } from 'antd'
import clsx from 'clsx'
import FbSwitch from 'fb-components/base_ui/fb_switch'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildStruct, RoleType } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { useMemo } from 'react'
import { store } from '../../app/store.ts'
import { RoleSelectionWithRoleTags } from '../../components/RoleSelectionList.tsx'
import FbForm from '../../components/form/FbForm.tsx'
import FormSection from '../../components/form/FormSection.tsx'
import FormBodyCommon from '../../components/form/body/FormBodyCommon.tsx'
import ObjectUtils from '../../utils/ObjectUtils.ts'
import GuildAPI from '../guild_container/guildAPI.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { guildListActions } from '../guild_list/guildListSlice.ts'
import showRoleChannelListModal from './role_group_manage/RoleChannelList.tsx'
import { getAccessibleChannels } from './role_group_manage/RolePanel.tsx'

export default function PrivacySetting() {
  const guild = useMemo(() => GuildUtils.getCurrentGuild() as GuildStruct, [])

  const initialValues = useMemo(() => {
    const memberSettings = guild.guild_member_dm_friend_setting
    return {
      is_private: guild.is_private,
      guild_circle_comment: guild.guild_circle_comment,
      guild_member_dm_friend_setting: {
        friend_allow_roles: memberSettings.friend_allow_roles ?? [],
        dm_allow_roles: memberSettings.dm_allow_roles ?? [],
        // 1 为开启发私信 0 为禁止发私信
        dm_switch: memberSettings.dm_switch,
        // 1 为开启添加好友 0 为禁止添加好友
        friend_switch: memberSettings.friend_switch,
      },
    }
  }, [])
  type T = typeof initialValues

  const guestAccessibleChannels = useMemo(() => {
    // 访客使用普通成员的权限去计算
    const guestRole = Object.values(guild.roles).find(role => role.t == RoleType.NormalMember)
    if (!guestRole) return {}

    return getAccessibleChannels(guild.guild_id, guestRole)
  }, [])

  async function submit(values: T, old: T) {
    const diff = ObjectUtils.shallowDiff(old, values)
    await GuildAPI.updateGuild(guild.guild_id, diff)
    store.dispatch(guildListActions.updateGuild({ guild_id: guild.guild_id, ...diff }))
  }

  function openGuestAccessibleChannelList() {
    showRoleChannelListModal({
      title: '可查看的频道',
      guildId: GuildUtils.getCurrentGuildId() as string,
      channels: guestAccessibleChannels,
    })
  }

  return (
    <FbForm<T> className={'item-mb24 flex h-full flex-col'} initialValue={initialValues} submit={submit}>
      {form => {
        const isPrivate = form.getFieldValue('is_private')

        return (
          <div className={'flex-1 px-6 py-4'}>
            <FormSection title={'社区'} bottomDivider={true}>
              <Form.Item<boolean> name={'is_private'}>
                <Radio.Group className={'vertical-radio-group vertical-radio-group-multiline'}>
                  <Radio value={SwitchType.No}>
                    公开
                    <div className={'subtitle'}>支持通过推荐和搜索发现服务器，访客可浏览所有公开频道和内容。</div>
                  </Radio>
                  <Radio value={SwitchType.Yes}>
                    私密
                    <div className={'subtitle'}>仅能通过邀请链接和邀请码加入，内容只限服务器成员浏览。</div>
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </FormSection>

            {/* 公开才有的设置 */}
            <FormSection title={'访客设置'} hidden={isPrivate}>
              <FormBodyCommon
                title={'访客可查看的频道'}
                desc={'包含全体成员可查看的所有频道。'}
                suffix={
                  <>
                    {Object.values(guestAccessibleChannels).filter(c => c.type !== ChannelType.Category && c.type !== ChannelType.PlazaNotice).length}
                    个
                  </>
                }
                bottomBorder
                arrowCallback={openGuestAccessibleChannelList}
              />
              <FormBodyCommon
                title={'访客互动'}
                desc={'开启后，允许访客进行评论圈子、回答问题。'}
                suffix={
                  <Form.Item name={'guild_circle_comment'} noStyle>
                    <FbSwitch returnType="number" />
                  </Form.Item>
                }
                bottomBorder
              />
            </FormSection>
            <FormSection title="成员">
              <MemberSettingsFormSection form={form} title={'禁止发私信'} switchFormField={'dm_switch'} rolesFormField={'dm_allow_roles'} />
              <MemberSettingsFormSection form={form} title={'禁止添加好友'} switchFormField={'friend_switch'} rolesFormField={'friend_allow_roles'} />
            </FormSection>
          </div>
        )
      }}
    </FbForm>
  )
}

/**
 * @returns
 */
function MemberSettingsFormSection({
  form,
  title,
  switchFormField,
  rolesFormField,
}: {
  form: FormInstance
  title?: string
  switchFormField: string
  rolesFormField: string
}) {
  const disabled = form.getFieldValue(['guild_member_dm_friend_setting', switchFormField]) === SwitchType.No
  const fixedRoles = useMemo(() => {
    const guild = GuildUtils.getCurrentGuild()!
    return Object.values(guild.roles)
      .filter(r => r.t == RoleType.Owner || r.t == RoleType.SeniorManager)
      .map(r => r.role_id)
  }, [])

  return (
    <>
      <FormBodyCommon
        title={title}
        suffix={
          <Form.Item name={['guild_member_dm_friend_setting', switchFormField]} noStyle>
            <FbSwitch returnType="number" reverse />
          </Form.Item>
        }
        bottomBorder
      />
      <div className={clsx(disabled ? 'display' : 'hidden')}>
        <div className={'pb-1 pt-3 text-xs text-[var(--fg-b40)]'}>不受限的身份组</div>
        <Form.Item name={['guild_member_dm_friend_setting', rolesFormField]}>
          <RoleSelectionWithRoleTags
            enableChannelManager
            enableCommonMember
            fixedRoles={fixedRoles}
            className={'pb-3 pt-2'}
            guildId={GuildUtils.getCurrentGuildId()!}
          />
        </Form.Item>
      </div>
    </>
  )
}
