import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Form,
  FormInstance,
  FormListFieldData,
  Input,
  MenuProps,
  Radio,
  SelectProps,
  Switch,
  TimeRangePickerProps,
} from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { FormListOperation } from 'antd/es/form/FormList'
import clsx from 'clsx'
import dayjs from 'dayjs'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbSelect from 'fb-components/base_ui/fb_select/index.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { GuildStruct, GuildVerificationLevel } from 'fb-components/struct/GuildStruct.ts'
import sleep from 'fb-components/utils/sleep.ts'
import { omit } from 'lodash-es'
import { HTMLProps, useCallback, useMemo } from 'react'
import Ws, { WsAction } from '../../../base_services/ws.ts'
import EmptyPage from '../../../components/EmptyPage.tsx'
import { RoleSelectionWithRoleTags } from '../../../components/RoleSelectionList.tsx'
import { Sortable } from '../../../components/Sortable.tsx'
import FbForm from '../../../components/form/FbForm.tsx'
import FormItem from '../../../components/form/FormItem.tsx'
import FormSection from '../../../components/form/FormSection.tsx'
import FormBodyCommon from '../../../components/form/body/FormBodyCommon.tsx'
import GuildAPI from '../../guild_container/guildAPI.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { guildListActions } from '../../guild_list/guildListSlice.ts'

const { RangePicker } = DatePicker

interface RootType {
  isOpen: boolean
  questions: QuestionStruct[]
}

interface QuestionOptionStruct {
  content: string
  // 加入与欢迎里面的问题才有这个字段
  isAnswer?: boolean
  ext: {
    roleIds: string[]
  }
}

export type QuestionStruct =
  | {
      type: QuestionType.MultipleChoice
      title: string
      options: QuestionOptionStruct[]
      maxAnswers: number
    }
  | {
      type: QuestionType.SingleChoice
      title: string
      options: QuestionOptionStruct[]
    }
  | {
      type: QuestionType.BlankFill
      title: string
      ext: {
        roleIds: string[]
      }
    }

export type QuestionStructForJoinAndWelcome = QuestionStruct & {
  answers: string[]
}

function getDefaultQuestionStruct(type: QuestionType) {
  switch (type) {
    case QuestionType.SingleChoice:
      return {
        'type': QuestionType.SingleChoice,
        'title': '',
        'options': [{ content: '', ext: { roleIds: [] } }],
        'ext': {},
      } as QuestionStruct
    case QuestionType.MultipleChoice:
      return {
        'type': QuestionType.MultipleChoice,
        'title': '',
        'options': [{ content: '', ext: { roleIds: [] } }],
        'maxAnswers': 0,
        'ext': {},
      } as QuestionStruct
    case QuestionType.BlankFill:
      return {
        'type': QuestionType.BlankFill,
        'title': '',
        'ext': {
          'roleIds': [],
        },
      } as QuestionStruct
  }
}

export function AssignRoleSettings() {
  const guild = { ...GuildUtils.getCurrentGuild() } as GuildStruct

  const fetchFunc = useCallback(
    () =>
      GuildAPI.fetchSettingsForRoleAssignment(guild.guild_id).then(res => {
        guild.verification_level = res.guild.verification_level
        res.verify_info.questionnaire_verification ??= { questions: [], isOpen: false }
        res.verify_info.questionnaire_verification.isOpen = (res.guild.verification_level & GuildVerificationLevel.RoleAssignment) !== 0
        const obj = res.verify_info.questionnaire_verification

        // 这些该死的、不存在的、没用的字段会影响 antd 的表单校验，所以要删掉
        return omit(obj, 'passNumber', 'title')
      }),
    [guild]
  )

  function submit(data: RootType) {
    // 保存可能要请求多个接口
    // 必须去掉 isOpen 字段，开关控制是另一个接口需要的。
    // 这个字段是 boolean 对服务端没问题，但是移动端只能接受 0 和 1
    const requests: Promise<never>[] = [GuildAPI.saveAssignRolesSettings(guild.guild_id, omit(data, 'isOpen'))]

    let verificationLevel = guild.verification_level
    if (data.isOpen) {
      verificationLevel |= GuildVerificationLevel.RoleAssignment
    } else {
      verificationLevel &= ~GuildVerificationLevel.RoleAssignment
    }
    const verificationLevelChanged = verificationLevel !== guild.verification_level
    if (verificationLevelChanged) {
      requests.push(GuildAPI.updateGuild(guild.guild_id, { verification_level: verificationLevel }) as never)
    }
    return Promise.all(requests).then(() => {
      if (verificationLevelChanged) {
        guild.verification_level = verificationLevel
        guildListActions.updateGuild({
          guild_id: guild.guild_id,
          verification_level: verificationLevel,
        })
      }
    })
  }

  function handleExportData() {
    const out: { from?: string; to?: string } = {}
    const md = showFbModal({
      title: '导出问卷数据',
      content: (
        <ExportDataPanel
          onChange={({ from, to }) => {
            out.from = from
            out.to = to
            md.update({ okButtonProps: { disabled: !from || !to } })
          }}
        />
      ),
      okText: '导出数据',
      okButtonProps: { disabled: true },
      maskClosable: false,
      showCancelButton: false,
      onOk: async () => {
        const { url } = await GuildAPI.exportAssignRolesSettings(guild.guild_id, out.from as string, out.to as string)
        return new Promise<void>(resolve => {
          // HTTP 返回时，文件还在异步生成，所以必须等待 ws 通知
          Ws.instance.once(WsAction.GuildRoleAssignmentExportData, () => {
            window.open(url)
            resolve()
          })
        })
      },
    })
  }

  const toggleEnabled = (checked: boolean, form: FormInstance) => {
    const questions = form.getFieldValue('questions')
    if (checked && questions.length === 0) {
      form.setFieldValue('isOpen', false)
      const { destroy } = FbModal.info({
        content: '需要添加并配置好问题后才能开启答题领取身份组功能',
        okText: '添加问题',
        cancelText: '暂不添加',
        onOk: () => {
          destroy()
          handleAddQuestion(form)
        },
      })
    }
  }

  return (
    <FbForm<RootType> initialValue={fetchFunc} submit={submit} className={'item-mb24'}>
      {form => (
        <div className={'flex flex-col items-stretch px-6 pt-4 text-[var(--fg-b100)]'}>
          <FormSection title={'答题领取身份组'} bottomDivider={true}>
            <FormItem
              content={
                <FormBodyCommon
                  title={'答题领取身份组'}
                  desc={'开启后，普通成员可以通过回答问题获得身份组。'}
                  suffix={
                    <Form.Item name={'isOpen'} valuePropName={'checked'}>
                      <Switch onChange={checked => toggleEnabled(checked, form)} />
                    </Form.Item>
                  }
                />
              }
            />
          </FormSection>
          <Form.List name={'questions'}>
            {(fields, formOps) => {
              const hasAnyQuestion = fields.length > 0
              return (
                <FormSection
                  title={'问题设置'}
                  tailSlot={
                    hasAnyQuestion && (
                      <div className={'flex gap-4'}>
                        <Button
                          icon={<iconpark-icon class={'anticon'} name="Download" />}
                          type={'primary'}
                          ghost
                          size={'small'}
                          className={'btn-middle'}
                          onClick={handleExportData}
                        >
                          导出数据
                        </Button>
                        <AddQuestionButton form={form} />
                      </div>
                    )
                  }
                >
                  <QuestionList scene={'roleAssignment'} form={form} fields={fields} {...formOps} />
                </FormSection>
              )
            }}
          </Form.List>
        </div>
      )}
    </FbForm>
  )
}

function MaxNumChoicesDropdown({
  form,
  index,
  value,
  onChange,
}: {
  form: FormInstance
  index: number
  value?: number
  onChange?: (num: number) => void
}) {
  const question = form.getFieldValue(['questions', index])
  const numOptions = question?.options?.length ?? 0
  const options = useMemo<SelectProps['options']>(() => {
    if (question.type !== QuestionType.MultipleChoice) return []
    return new Array(numOptions + 1).fill(0).map((_, i) => ({
      label: i === 0 ? '不限' : `${i}项`,
      value: i,
    }))
  }, [numOptions])
  return (
    <div className={'flex gap-1'}>
      <div className={'whitespace-nowrap'}>最多可选</div>
      <FbSelect className={'!w-[72px]'} size={'small'} value={value} onChange={onChange} options={options} />
    </div>
  )
}

function QuestionWrapper({
  scene,
  form,
  index,
  onDelete,
  dragHandlerProps,
}: {
  form: FormInstance
  index: number
  onDelete: (index: number) => void
  dragHandlerProps: SyntheticListenerMap | undefined
  scene: 'joinAndWelcome' | 'roleAssignment'
}) {
  const questionType = form.getFieldValue(['questions', index, 'type'])
  const handleDelete = () => {
    FbModal.error({
      title: '提示',
      content: '确定删除此题目吗？',
      okText: '删除',
      onOk: onDelete,
    })
  }

  return (
    <div className={'group/question flex flex-col rounded-lg border border-[var(--fg-b10)] bg-[var(--bg-bg-3)] px-3 text-[var(--fg-b40)]'}>
      {/* 拖拽区域 */}
      <div className={'relative flex justify-between pb-1 pt-3'}>
        <iconpark-icon
          {...dragHandlerProps}
          color={'var(--fg-b40)'}
          size={16}
          class={
            'drag-handle absolute left-1/2 mt-[-12px] h-11 -translate-x-1/2 animate-[opacity] px-5 opacity-0 duration-100 group-hover/question:opacity-100'
          }
          name="DragHorizontal"
        />
        <Tag2 text={getQuestionTypeText(questionType)} />
        <div className={'flex'}>
          {scene === 'roleAssignment' && questionType === QuestionType.MultipleChoice && (
            <Form.Item name={[index, 'maxAnswers']}>
              <MaxNumChoicesDropdown form={form} index={index} />
            </Form.Item>
          )}

          <HoverBox onClick={handleDelete}>
            <iconpark-icon name="Delete" size={16} />
          </HoverBox>
        </div>
      </div>
      {/* 问题表单 */}
      <div className={'flex gap-2'}>
        <div className={'px-[3px] leading-10 text-[var(--fg-b100)]'}>{index + 1}.</div>
        <Form.Item className={'flex-1'} name={[index, 'title']} rules={[{ required: true, whitespace: true, message: '请输入标题' }]}>
          <Input className={'input-underline h-10 px-0'} placeholder={'请输入问题标题，最多32个字'} maxLength={32} />
        </Form.Item>
      </div>
      <div>
        {/* 每种题目的内容表单不通用部分 */}
        {questionType == QuestionType.SingleChoice && <ChoiceQuestionItem scene={scene} form={form} index={index} />}
        {questionType == QuestionType.MultipleChoice && <ChoiceQuestionItem scene={scene} form={form} index={index} />}
        {questionType == QuestionType.BlankFill && <BlankFillQuestionItem scene={scene} index={index} />}
      </div>
    </div>
  )
}

function Tag2({ text }: { text: string }) {
  return <div className={'rounded-full bg-black/5 px-2 py-1 text-xs text-[var(--fg-b60)]'}>{text}</div>
}

/* 添加选项 */
function AddOptionButton(props: HTMLProps<HTMLDivElement>) {
  return (
    <div className={'flex cursor-pointer items-center gap-2 py-2.5'} {...props}>
      <iconpark-icon name="PlusCircle" color={'var(--fg-b60)'} />
      <div className={'text-[var(--fg-b100)]'}>添加选项</div>
    </div>
  )
}

/**
 * 添加分配角色的 UI
 * @param note 说明文字
 * @param className
 * @param selected  已选中的角色
 * @param props
 */
function RoleAssignmentView({
  note,
  className,
  value = [],
  onChange,
  ...props
}: {
  value?: string[]
  note: string
  onChange?: (roles: string[]) => void
} & Omit<HTMLProps<HTMLDivElement>, 'onChange'>) {
  const guild = GuildUtils.getCurrentGuildId()

  return (
    <div className={clsx(['py-3', className])} {...props}>
      <div className={'error-tip mb-3 text-xs text-[var(--fg-b40)]'}>{note}</div>
      <RoleSelectionWithRoleTags guildId={guild ?? ''} value={value} onChange={onChange} />
    </div>
  )
}

function ChoiceQuestionItem({ index, form, scene }: { form: FormInstance; index: number; scene: 'joinAndWelcome' | 'roleAssignment' }) {
  const questionType = form.getFieldValue(['questions', index, 'type'])

  /// 删除选项后，如果选项数量小于最大可选数量，把最大可选数量更新为选项数量
  function checkUpdateNumMaxChoices(num: number) {
    const old = form.getFieldValue(['questions', index, 'maxAnswers'])
    if (old > num) {
      form.setFieldValue(['questions', index, 'maxAnswers'], num)
    }
  }

  function handleClickSingleChoice(index: number, optionIndex: number) {
    const path = ['questions', index, 'options']
    form.setFieldValue(
      path,
      (form.getFieldValue(path) as QuestionOptionStruct[]).map((option, i) => ({
        ...option,
        isAnswer: i === optionIndex,
      }))
    )
  }

  return (
    <Form.List name={[index, 'options']}>
      {(fields, { add, remove, move }) => {
        return (
          <>
            <Sortable
              customDragHandler={true}
              items={fields.map(e => e.key + 1)}
              itemRenderer={({ index: optionIndex, dragHandlerProps }) => {
                function removeOption() {
                  FbModal.error({
                    title: '提示',
                    content: '确定删除此选项吗？',
                    onOk: () => {
                      remove(optionIndex)
                      checkUpdateNumMaxChoices(fields.length - 1)
                    },
                  })
                }

                const prefixComponent =
                  questionType === QuestionType.SingleChoice ?
                    <Radio
                      className={'h-10'}
                      onClick={scene === 'joinAndWelcome' ? () => handleClickSingleChoice(index, optionIndex) : undefined}
                      checked={false}
                    />
                  : <Checkbox className={'h-10 pr-2'} checked={false} />
                return (
                  <div className={'group/option bg-[var(--bg-bg-3)]'}>
                    <div className={'flex items-start'}>
                      <iconpark-icon
                        {...dragHandlerProps}
                        class={'drag-handle ml-[-12px] h-10 animate-[opacity] opacity-0 duration-100 group-hover/option:opacity-100'}
                        name="DragVertical"
                      />
                      {scene === 'joinAndWelcome' ?
                        <Form.Item name={[optionIndex, 'isAnswer']} valuePropName={'checked'}>
                          {prefixComponent}
                        </Form.Item>
                      : prefixComponent}
                      <Form.Item
                        name={[optionIndex, 'content']}
                        rules={[{ required: true, whitespace: true, message: ' 请输入选项' }]}
                        className={'flex-1'}
                      >
                        <Input
                          maxLength={16}
                          className={'input-underline h-10 p-0'}
                          placeholder={'请输入选项，最多16个字'}
                          suffix={
                            <div className={'flex items-center gap-2'}>
                              <Form.Item name={[optionIndex, 'isAnswer']}>
                                <AnswerTag />
                              </Form.Item>
                              {scene === 'joinAndWelcome' ?
                                <JoinAndWelcomeOptionMenuButton
                                  checked={
                                    questionType === QuestionType.MultipleChoice &&
                                    form.getFieldValue(['questions', index, 'options', optionIndex, 'isAnswer'])
                                  }
                                  onDelete={removeOption}
                                  onCheck={() => {
                                    if (questionType === QuestionType.SingleChoice) {
                                      handleClickSingleChoice(index, optionIndex)
                                    } else {
                                      const path = ['questions', index, 'options', optionIndex, 'isAnswer']
                                      form.setFieldValue(path, !form.getFieldValue(path))
                                    }
                                  }}
                                />
                              : <HoverBox className={'mr-[-4px] animate-[opacity] opacity-0 group-hover/option:opacity-100'} onClick={removeOption}>
                                  <iconpark-icon color={'var(--fg-b40)'} name="CloseCircleFill" />
                                </HoverBox>
                              }
                            </div>
                          }
                        />
                      </Form.Item>
                    </div>
                    {scene === 'roleAssignment' && (
                      <Form.Item name={[optionIndex, 'ext', 'roleIds']} rules={[{ required: true, message: '' }]}>
                        <RoleAssignmentView className={'pl-6'} note={'回答此问题后分配的身份组'} />
                      </Form.Item>
                    )}
                  </div>
                )
              }}
              onChange={({ from, to }) => move(from, to)}
            />
            <AddOptionButton
              onClick={() => {
                add(getDefaultQuestionStruct(questionType))
                sleep(500).then(() => {
                  form.getFieldInstance(['questions', index, 'options', fields.length, 'content'])?.focus?.()
                })
              }}
            />
          </>
        )
      }}
    </Form.List>
  )
}

function BlankFillQuestionItem({ index, scene }: { index: number; scene: 'joinAndWelcome' | 'roleAssignment' }) {
  if (scene === 'joinAndWelcome') {
    return (
      <div className={'ml-6 mb-2'}>
        <div className={'text-xs text-[var(--fg-b40)] pt-3 pb-1'}>正确答案</div>
        <Form.List name={[index, 'answers']}>
          {() => (
            <Form.Item name={[0]} rules={[{ required: true, whitespace: true, message: '请输入答案' }]} className={'mb-2'}>
              <Input className={'input-underline h-10 px-0'} placeholder={'请输入答案，最多16个字'} maxLength={32} />
            </Form.Item>
          )}
        </Form.List>
      </div>
    )
  } else {
    return (
      <Form.Item className={'pl-6'} name={[index, 'ext', 'roleIds']} rules={[{ required: true, message: '' }]}>
        <RoleAssignmentView note={'回答此问题后分配的身份组'} />
      </Form.Item>
    )
  }
}

export enum QuestionType {
  SingleChoice = 'radio',
  MultipleChoice = 'checkbox',
  // 填空题
  BlankFill = 'input',
}

const questionTypes = [
  {
    type: QuestionType.BlankFill,
    icon: 'Edit',
    text: '填空题',
  },
  {
    type: QuestionType.SingleChoice,
    icon: 'CheckCircle',
    text: '单选题',
  },
  {
    type: QuestionType.MultipleChoice,
    icon: 'CheckList',
    text: '多选题',
  },
]

// 根据问题类型获取对应的文本
function getQuestionTypeText(type: QuestionType) {
  return questionTypes.find(item => item.type == type)?.text ?? ''
}

/**
 * 添加问题打开的弹窗，包含了问题类型的选择
 * @param out     用于传递数据的对象，返回用户选中的问题类型
 */
function QuestionCategoryList({ out }: { out: { selectedType: QuestionType } }) {
  return (
    <Radio.Group
      className={'text-[--fg-b100]'}
      defaultValue={out.selectedType}
      onChange={e => {
        out.selectedType = e.target.value
      }}
    >
      {questionTypes.map(({ type, icon, text }) => {
        return (
          <Radio value={type} key={type} className={'block'}>
            <div className={'inline-flex h-10 items-center'}>
              <iconpark-icon name={icon} size={16} color={'var(--fg-b40)'} />
              <span className={'pl-2'}>{text}</span>
            </div>
          </Radio>
        )
      })}
    </Radio.Group>
  )
}

/// 到处数据面板
function ExportDataPanel({ onChange }: { onChange: (args: { from?: string; to?: string }) => void }) {
  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: '今天', value: [dayjs(), dayjs()] },
    { label: '最近 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: '最近 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
    { label: '最近 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
    { label: '最近 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
  ]
  const disabledDate: RangePickerProps['disabledDate'] = current => {
    // Can not select days before today and today
    return current && (current > dayjs() || current < dayjs().subtract(1, 'year'))
  }
  const onRangeChange = (_: never, dateStrings: string[]) => {
    onChange({ from: dateStrings[0], to: dateStrings[1] })
  }
  return (
    <div className={'flex flex-col py-3'}>
      <div className={'py-2 font-medium text-[var(--fg-b100)]'}>选择时间</div>
      <RangePicker
        presets={rangePresets}
        disabledDate={disabledDate}
        onChange={onRangeChange as never}
        suffixIcon={<iconpark-icon name="ClockCircle" />}
        separator={<iconpark-icon name="Arrow-Right" color={'var(--fg-b40)'} />}
      />
    </div>
  )
}

function handleAddQuestion(form: FormInstance<RootType>) {
  const questions = form.getFieldValue('questions') ?? []
  const out = { selectedType: QuestionType.BlankFill }
  showFbModal({
    title: '添加问题',
    content: <QuestionCategoryList out={out} />,
    onOk: () => {
      form.setFieldValue('questions', [...questions, getDefaultQuestionStruct(out.selectedType)])
      sleep(500).then(() => {
        const fieldPath = ['questions', questions.length, 'title']
        form.getFieldInstance(fieldPath)?.focus?.()
      })
    },
  })
}

export function AddQuestionButton({ form }: { form: FormInstance }) {
  return (
    <Button
      type={'primary'}
      size={'small'}
      className={'btn-middle'}
      ghost
      icon={<iconpark-icon name={'Plus'} class={'anticon'} />}
      onClick={() => handleAddQuestion(form)}
    >
      添加问题
    </Button>
  )
}

export function QuestionList({
  scene,
  form,
  fields,
  remove,
  move,
}: {
  form: FormInstance
  fields: FormListFieldData[]
  scene: 'joinAndWelcome' | 'roleAssignment'
} & FormListOperation) {
  if (fields.length === 0) {
    return (
      <EmptyPage
        className={'!h-[380px] !w-auto'}
        message=""
        context={'暂未设置问题'}
        buttonLabel={'添加问题'}
        buttonClass={'btn-tertiary'}
        buttonOnClick={() => handleAddQuestion(form)}
      />
    )
  }

  return (
    <Sortable
      customDragHandler={true}
      className={'mt-1 flex flex-col gap-4'}
      items={fields.map(e => e.key + 1)}
      itemRenderer={({ index, dragHandlerProps }) => (
        <QuestionWrapper scene={scene} form={form} dragHandlerProps={dragHandlerProps} index={index} onDelete={() => remove(index)} />
      )}
      onChange={({ from, to }) => move(from, to)}
    />
  )
}

function AnswerTag({ value }: { value?: boolean }) {
  if (!value) return
  return (
    <div className={'bg-[var(--function-green-3)] text-[var(--function-green-1)] rounded px-1'}>
      <div className={'text-xs scale-[0.91]'}>答案</div>
    </div>
  )
}

function JoinAndWelcomeOptionMenuButton({ onCheck, onDelete, checked }: { onCheck?: () => void; onDelete?: () => void; checked: boolean }) {
  const items: MenuProps['items'] = [
    {
      label: checked ? '取消正确答案' : '设为正确答案',
      key: '1',
      icon: <iconpark-icon class="anticon ant-dropdown-menu-item-icon" name={checked ? 'CheckCircleMuted' : 'CheckCircle'} size={16} />,
    },
    {
      label: '删除选项',
      key: '2',
      icon: <iconpark-icon class="anticon ant-dropdown-menu-item-icon" name="Delete" size={16} />,
      danger: true,
    },
  ]
  const menuProps = {
    items,
    onClick: handleMenuClick,
  }

  function handleMenuClick({ key }: { key: string }) {
    if (key === '1') {
      onCheck?.()
    } else if (key === '2') {
      onDelete?.()
    }
  }

  return (
    <Dropdown menu={menuProps} placement={'bottomRight'} trigger={['click']}>
      <iconpark-icon name="More" size={16} class={'text-[var(--fg-b40)] icon-bg-btn'} />
    </Dropdown>
  )
}
