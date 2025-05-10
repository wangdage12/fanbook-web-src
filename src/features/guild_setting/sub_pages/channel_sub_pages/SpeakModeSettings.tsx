import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { FormInstance, Input, Radio, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Form from 'antd/es/form/index'
import TextArea from 'antd/es/input/TextArea'
import clsx from 'clsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { HTTP_URL_PATTERN } from 'fb-components/rich_text/FbPlainText.tsx'
import { cloneDeep, isEqual } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import CommonApi from '../../../../CommonApi.ts'
import { store } from '../../../../app/store.ts'
import ChannelSettingsSpeakModePic1 from '../../../../assets/images/channel-settings-speak-mode-pic-1.png'
import LogoImg from '../../../../assets/images/logo.svg'
import { Sortable } from '../../../../components/Sortable.tsx'
import FbForm from '../../../../components/form/FbForm.tsx'
import FormSection from '../../../../components/form/FormSection.tsx'
import ChannelUtils, { LocalSpeakMode } from '../../../../utils/ChannelUtils.ts'
import StringUtils from '../../../../utils/StringUtils.ts'
import ChannelAPI from '../../../guild_container/ChannelAPI.ts'
import { guildListActions } from '../../../guild_list/guildListSlice.ts'
import { ChannelSettingsSubPageProps } from '../ChannelSettings.tsx'

function getSpeakModeDescription(mode: LocalSpeakMode) {
  switch (mode) {
    case LocalSpeakMode.Normal:
      return '用户发言频次不受限制'
    case LocalSpeakMode.Slow:
      return '每隔一段时间只能发送一条消息'
    case LocalSpeakMode.Readonly:
      return '除管理员外其他用户不可发言'
    case LocalSpeakMode.Announcement:
      return '转发的圈子动态，在移动端将以标准公告卡片展示'
  }
}

function getSpeakModeText(mode: LocalSpeakMode) {
  switch (mode) {
    case LocalSpeakMode.Normal:
      return '常规模式'
    case LocalSpeakMode.Slow:
      return '慢速模式'
    case LocalSpeakMode.Readonly:
      return '只读模式'
    case LocalSpeakMode.Announcement:
      return '公告模式'
  }
}

export default function SpeakModeSettings({ value: channel, onChange }: ChannelSettingsSubPageProps) {
  const speakMode = ChannelUtils.getSpeakMode(channel)

  const initialValues = useMemo(
    () => ({
      speakMode,
      ...(speakMode === LocalSpeakMode.Slow && {
        coolDownForSlowMode: channel.slow_mode ?? 5,
      }),
      ...((speakMode === LocalSpeakMode.Announcement || speakMode === LocalSpeakMode.Readonly) && {
        announcement_menu: channel.announcement_menu as MenuItemType[],
      }),
    }),
    [channel]
  )

  const DEFAULT_SLOW_MODE = 5

  async function submit(value: typeof initialValues, old: typeof initialValues) {
    const data: Parameters<typeof ChannelAPI.update>[0] = { guild_id: channel.guild_id, channel_id: channel.channel_id }
    switch (value.speakMode) {
      case LocalSpeakMode.Normal:
        data.announcement_mode = false
        data.slow_mode = 0
        break
      case LocalSpeakMode.Slow:
        data.announcement_mode = false
        data.slow_mode = value.coolDownForSlowMode ?? DEFAULT_SLOW_MODE
        break
      case LocalSpeakMode.Readonly:
        data.announcement_mode = false
        data.slow_mode = -1
        break
      case LocalSpeakMode.Announcement:
        data.announcement_mode = true
        data.slow_mode = -1
        break
    }
    if (
      (value.speakMode === LocalSpeakMode.Readonly || value.speakMode === LocalSpeakMode.Announcement) &&
      !isEqual(value.announcement_menu, old.announcement_menu)
    ) {
      // 使用 cloneDeep 是因为 value.announcement_menu 可能是不能修改的数据
      const announcementMenu = value.announcement_menu ? cloneDeep(value.announcement_menu) : undefined
      announcementMenu?.forEach(e => {
        e.type = 'link'
      })
      data.announcement_menu = announcementMenu
    }
    store.dispatch(guildListActions.updateChannel(data))
    await ChannelAPI.update(data)
    onChange({ ...channel, ...data })
  }

  const slowModeOptions = [
    { label: '每5秒一条', value: 5 },
    { label: '每30秒一条', value: 30 },
    { label: '每1分钟一条', value: 60 },
    { label: '每5分钟一条', value: 300 },
    { label: '每1小时一条', value: 3600 },
  ]

  function addMenuItem(form: FormInstance<typeof initialValues>, value?: [number, MenuItemType]) {
    const isEdit = !!value
    let formValues: MenuItemType
    const { update } = showFbModal({
      title: isEdit ? '编辑菜单选项' : '添加菜单选项',
      okText: '完成',
      maskClosable: false,
      content: (
        <AddMenuItemForm
          initialValue={value?.[1]}
          onConfirmableChanged={(confirmable, value) => {
            update({ okButtonProps: { disabled: !confirmable, className: 'btn-primary' } })
            formValues = value
          }}
        />
      ),
      onOk() {
        const array = form.getFieldValue('announcement_menu') || []
        if (isEdit) {
          array[value?.[0]] = formValues
          form.setFieldValue('announcement_menu', array)
        } else {
          form.setFieldValue('announcement_menu', [...array, formValues])
        }
      },
    })
  }

  return (
    <FbForm<typeof initialValues> initialValue={initialValues} submit={submit} className={'item-mb24'}>
      {form => {
        const mode = form.getFieldValue('speakMode')
        return (
          <div className={'flex gap-8 px-6 py-4'}>
            <div className={'flex flex-col'}>
              <FormSection title={'选择发言模式'} formStyle={'border'}>
                <Form.Item name={'speakMode'}>
                  <Radio.Group className={'vertical-radio-group flex w-[304px]'}>
                    {Object.values(LocalSpeakMode).map(mode => (
                      <Radio className={'py-[9px]'} value={mode} key={mode}>
                        {getSpeakModeText(mode)}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </FormSection>
              {mode === LocalSpeakMode.Slow && (
                <FormSection title={'用户发言频次'}>
                  <Form.Item name={'coolDownForSlowMode'}>
                    <Select defaultValue={DEFAULT_SLOW_MODE} options={slowModeOptions} size={'large'} />
                  </Form.Item>
                </FormSection>
              )}

              {(mode === LocalSpeakMode.Readonly || mode === LocalSpeakMode.Announcement) && (
                <Form.List name={'announcement_menu'}>
                  {(fields, { remove, move }) => {
                    return (
                      <div className={'flex flex-col'}>
                        <FormSection
                          title={`已添加菜单（${fields.length}/3）`}
                          tailSlot={
                            fields.length >= 3 ?
                              undefined
                            : <iconpark-icon onClick={() => addMenuItem(form)} class={'icon-bg-btn text-[var(--fg-b40)]'} name={'Plus'} />
                          }
                        >
                          <Sortable
                            items={fields.map(e => e.key + 1)}
                            itemRenderer={({ dragHandlerProps, index }) => (
                              <Form.Item name={[index]}>
                                <MenuItem
                                  dragHandlerProps={dragHandlerProps}
                                  onDelete={() => remove(index)}
                                  onEdit={e => addMenuItem(form, [index, e])}
                                />
                              </Form.Item>
                            )}
                            onChange={({ from, to }) => move(from, to)}
                          />
                        </FormSection>
                      </div>
                    )
                  }}
                </Form.List>
              )}
            </div>
            {/* 右侧 */}
            <div className={'flex flex-1 justify-center py-9'}>
              <div className={'flex flex-col items-center gap-3'}>
                <Form.Item name={'speakMode'}>
                  <DemoCard menu={form.getFieldValue('announcement_menu')} />
                </Form.Item>
                <div className={'text-[var(--fg-b40)] text-xs'}>{getSpeakModeDescription(form.getFieldValue('speakMode'))}</div>
              </div>
            </div>
          </div>
        )
      }}
    </FbForm>
  )
}

function DemoCard({ value, menu }: { value?: LocalSpeakMode; menu: MenuItemType[] }) {
  const inputText =
    value === LocalSpeakMode.Slow ? '慢速模式已启用'
    : value === LocalSpeakMode.Readonly ? '该频道为只读模式'
    : value === LocalSpeakMode.Announcement ? '该频道为公告模式'
    : '发送到 闲聊大厅'

  const readonly = value === LocalSpeakMode.Readonly || value === LocalSpeakMode.Announcement

  return (
    <div className={clsx(['flex flex-col rounded-xl bg-[var(--bg-bg-2)] px-2 py-4 pb-0', 'w-[288px]'])}>
      <div className={'mb-3 flex items-start gap-1.5'}>
        {/* 头像 */}
        <img src={LogoImg} alt={''} width={19} height={19} className={'rounded-full'} />
        <div className={'flex flex-col justify-start gap-1'}>
          <div className={'h-2.5 origin-top-left scale-50 text-[var(--fg-blue-1)]'}>Fanbook（官方）</div>
          <div className={'flex w-[126px] flex-col overflow-hidden rounded'}>
            {/* 图片 */}
            <img src={ChannelSettingsSpeakModePic1} alt="" width={126} height={94} />
            <div className={'flex flex-col gap-1 bg-[var(--fg-white-1)] p-1.5'}>
              <div
                className={'origin-top-left font-medium text-[var(--fg-b100)]'}
                style={{
                  width: 160,
                  height: 30,
                  transform: 'scale(0.7)',
                }}
              >
                【产品更新】Fanbook版本更新公告
              </div>
              <div className={'flex'}>
                <img src={LogoImg} alt={''} width={12} height={12} className={'mr-1 rounded-full border-[0.5px] border-[var(--fg-b5)]'} />
                <div className={'h-2.5 w-[83px] origin-top-left scale-50 whitespace-nowrap text-[var(--fg-b60)]'}>Fanbook（官方）</div>
                <div className={'ml-[-15px] flex gap-0.5 text-[var(--fg-b40)]'}>
                  <iconpark-icon name="Heart" size={9} />
                  <div className={'h-2.5 origin-top-left scale-50'}>999</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={'flex pb-2 pt-1.5'}>
        {
          readonly && menu?.length ?
            // 菜单
            <div className={'mx-[-15px] flex w-[320px] scale-[0.875] divide-x rounded-[10px] border bg-[var(--bg-bg-3)] py-1.5'}>
              {menu.map((item, index) => (
                <div className={'flex-center flex-1 text-xs'} key={index}>
                  {item.name}
                </div>
              ))}
            </div>
            // 输入框
          : <div
              className={clsx([
                'flex h-7 flex-1 gap-1 rounded border-[0.5px] border-[var(--fg-b10)] px-1.5 text-[var(--fg-b100)]',
                readonly ? 'bg-[var(--bg-bg-1)]' : 'bg-[var(--bg-bg-3)] ',
              ])}
            >
              <div className={'flex-1 origin-top-left translate-y-[6px] scale-[0.71] text-[var(--fg-b40)]'}>{inputText}</div>
              {!readonly && (
                <>
                  <iconpark-icon name="Emoji" size={14} />
                  <iconpark-icon name="At" size={14} />
                  <iconpark-icon name="Picture" size={14} />
                </>
              )}
            </div>

        }
      </div>
    </div>
  )
}

type MenuItemType = {
  type: 'link'
  name: string
  link: string
}
const linkPattern = new RegExp(HTTP_URL_PATTERN)

function AddMenuItemForm({
  onConfirmableChanged,
  initialValue,
}: {
  onConfirmableChanged?: (confirmable: boolean, value: MenuItemType) => void
  initialValue?: MenuItemType
}) {
  const [form] = useForm<MenuItemType>()
  const values = Form.useWatch([], form)
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => {
        onConfirmableChanged?.(true, values)
      })
      .catch(() => {
        onConfirmableChanged?.(false, values)
      })
  }, [values])

  return (
    <Form form={form} initialValues={initialValue}>
      <FormSection title={'菜单名称'} className={'!mb-3'}>
        <Form.Item
          name={'name'}
          help={'仅支持中英文和数字，不超过4个汉字或8个字母。'}
          rules={[
            { required: true, whitespace: true },
            {
              validator: (_, value) => (StringUtils.getVisualLength(value) <= 8 ? Promise.resolve() : Promise.reject()),
            },
          ]}
        >
          <Input className={'h-10'} placeholder={'请输入菜单名称'} />
        </Form.Item>
      </FormSection>
      <FormSection title={'跳转至'} className={'!mb-2'}>
        <Form.Item<string>
          name={'link'}
          validateFirst={true}
          validateTrigger="onBlur"
          validateDebounce={300}
          rules={[
            {
              required: true,
              pattern: linkPattern,
              message: '请输入正确的 URL',
            },
            {
              validateTrigger: 'onBlur',
              validator: (_, value) => CommonApi.validateUrl(value).catch(e => Promise.reject(e.desc)),
            },
          ]}
        >
          <TextArea className={'!h-20'} placeholder={'请输入链接：https://...'} />
        </Form.Item>
      </FormSection>
    </Form>
  )
}

function MenuItem({
  value,
  onDelete,
  onEdit,
  dragHandlerProps,
}: {
  value?: MenuItemType
  onDelete: () => void
  onEdit: (value: MenuItemType) => void
  dragHandlerProps: SyntheticListenerMap | undefined
}) {
  if (!value) {
    return null
  }
  return (
    <HoverBox radius={10} className={'form-item-bottom-border form-item group -ml-4 h-10 !w-[calc(100%_+_16px)] cursor-auto gap-3 px-2'}>
      <div className={'flex-1 flex'}>
        <iconpark-icon
          class={'drag-handle invisible -ml-2 w-4 group-hover:visible'}
          name={'DragVertical'}
          color={'var(--fg-b40)'}
          {...dragHandlerProps}
        />
        <div className={'flex-1'}>{value.name}</div>
      </div>
      <iconpark-icon name={'Edit'} class={'icon-color-btn !m-0 opacity-0 group-hover:opacity-100'} onClick={() => onEdit(value)} />
      <iconpark-icon name={'Delete'} class={'icon-color-btn !m-0 opacity-0 group-hover:opacity-100'} onClick={onDelete} />
    </HoverBox>
  )
}
