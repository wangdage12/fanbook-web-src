/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FormInstance, Radio, Switch } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { Form } from 'antd/lib/index'
import clsx from 'clsx'
import FbSelect from 'fb-components/base_ui/fb_select'
import fb_toast from 'fb-components/base_ui/fb_toast'
import { MessageType } from 'fb-components/components/messages/types.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import InlineWrapper from 'fb-components/rich_text_editor/InlineWrapper.tsx'
import RichTextEditorUtils, { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils.tsx'
import RichTextElementRenderer from 'fb-components/rich_text_editor/RichTextElementRenderer.tsx'
import RichTextLeafRenderer from 'fb-components/rich_text_editor/RichTextLeafRenderer.tsx'
import RichTextToolbar, { RichTextToolBarIconButton } from 'fb-components/rich_text_editor/RichTextToolbar.tsx'
import RichTextWrapper from 'fb-components/rich_text_editor/RichTextWrapper.tsx'
import { MentionElement } from 'fb-components/rich_text_editor/custom-editor'
import withEmoji from 'fb-components/rich_text_editor/plugins/withEmoji.tsx'
import withMedia from 'fb-components/rich_text_editor/plugins/withMedia.tsx'
import withSearch, { SearchEditor } from 'fb-components/rich_text_editor/plugins/withSearch.tsx'
import { FbRichTextQuillDeltaVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextQuillDeltaVisitor.ts'
import { FbRichTextSlateVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor.ts'
import { AutoWelcomeNewcomerMessageType, GuildStruct, GuildVerificationLevel } from 'fb-components/struct/GuildStruct.ts'
import OpsUtils from 'fb-components/utils/OpsUtils.ts'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos.ts'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType.ts'
import { cloneDeep, isEqual, isString } from 'lodash-es'
import { Op } from 'quill-delta'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { BaseEditor, Descendant, Editor, createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import { RenderElementProps, RenderLeafProps } from 'slate-react/dist/components/editable'
import { store } from '../../../app/store.ts'
import AutoWelcomeNewcomerPicTemplate1 from '../../../assets/images/auto-welcome-newcomer-pic-template-1.svg'
import AutoWelcomeNewcomerPicTemplate2 from '../../../assets/images/auto-welcome-newcomer-pic-template-2.svg'
import ChannelSelect from '../../../components/ChannelSelect.tsx'
import SelectionList from '../../../components/SelectionList.tsx'
import FbForm from '../../../components/form/FbForm.tsx'
import FormSection from '../../../components/form/FormSection.tsx'
import FormBodyCommon from '../../../components/form/body/FormBodyCommon.tsx'
import RealtimeChannelName from '../../../components/realtime_components/RealtimeChannel.tsx'
import Channel from '../../../components/rich_text_editor/Channel.tsx'
import { useSearchChannel } from '../../../components/rich_text_editor/hooks/useSearchChannel.tsx'
import SingleImageUploader from '../../../components/single_image_uploader/SingleImageUploader.tsx'
import GuildAPI from '../../guild_container/guildAPI.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { guildListActions } from '../../guild_list/guildListSlice.ts'
import InviteApi from '../../invite/invite_api.ts'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import WelcomeMessage from '../../message_list/items/WelcomeMessage.tsx'
import { AddQuestionButton, QuestionList, QuestionStructForJoinAndWelcome, QuestionType } from './AssignRoleSettings.tsx'

interface T {
  public: boolean
  customMessageTitle: string
  customMessageContent: Descendant[]
  questions: QuestionStructForJoinAndWelcome[] | undefined
  system_channel_type: number
  system_channel_id: string
  autoSendWelcomeMessage: boolean
  passNumber: number | undefined
  system_channel_message_pic: GuildStruct['system_channel_message_pic'] & {
    customPicture: string | undefined | LocalCustomPicture
  }
}

interface LocalCustomPicture {
  file: File
  url: string
}

export default function JoinAndWelcomeSettings() {
  const guild = useMemo(() => GuildUtils.getCurrentGuild() as GuildStruct, [])

  const [selectedTab, setSelectedTab] = useState(0)

  const autoWelcomeNewcomerFormRef = React.createRef<AutoWelcomeNewcomerFormRef>()
  const menu = [{ label: '加入方式' }, { label: '自动欢迎新人' }]
  const initialValue = async () => {
    const {
      verify_info: { test_questions_questionnaires },
    } = await InviteApi.getVerifyInfo(guild.guild_id)

    let customMessageContent = EMPTY_SLATE,
      customMessageTitle = ''

    try {
      const { v2, title } = GuildUtils.getCurrentGuild()!.system_channel_message!
      customMessageTitle = title

      const content = new FbRichTextQuillDeltaVisitor(JSON.parse(v2)).result
      if (content.length) {
        customMessageContent = content
      }
    } catch (e) {
      console.info('parse guild.system_channel_message error', e)
    }

    return {
      /// 加入与欢迎相关字段
      public: !(guild.verification_level & GuildVerificationLevel.Questionnaire),
      questions: test_questions_questionnaires?.questions,
      passNumber: test_questions_questionnaires?.passNumber,
      /// 自动欢迎新人相关字段
      // system_channel_flags 是位组合形式的数值，正常情况下，置位表示开，清零表示关
      // 但是这里的 autoSendWelcomeMessage 从代码看是反的，置位表示关，清零表示开，
      // 由于这个奇怪的设定，并且其他地方没有使用，此处暂不使用枚举
      autoSendWelcomeMessage: ((guild.system_channel_flags ?? 0) & 1) === 0,
      // 这个字段如果是空字符或者字符 '0'，需要设置为 undefined，以让 Select 显示 placeholder
      system_channel_id: (guild.system_channel_id?.length ?? 0) <= 1 ? undefined : guild.system_channel_id,
      system_channel_type: guild.system_channel_type ?? AutoWelcomeNewcomerMessageType.Pic,
      system_channel_message_pic: Object.assign(
        {
          template: 1,
          useCustomPicture: false,
          customPicture: undefined,
        },
        guild.system_channel_message_pic ?? {}
      ),
      customMessageContent,
      customMessageTitle,
    } as T
  }

  async function submit(value: T, old: T) {
    function checkIfCorrectOptionIsSet(questions: QuestionStructForJoinAndWelcome[]) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        if (question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) {
          const options = question.options
          const correctOption = options.find(option => option.isAnswer)
          if (!correctOption) {
            fb_toast.open({ type: 'warning', content: `请设置问题${i + 1}的正确答案`, key: 'joinAndWelcomeSettings' })
            return false
          }
        }
      }
      return true
    }

    if (!checkIfCorrectOptionIsSet(value.questions ?? [])) {
      return Promise.reject('Please set the correct option for each question')
    }

    const requests: Promise<unknown>[] = []
    const guildUpData: Partial<Omit<GuildStruct, 'system_channel_message_pic'> & T> = {
      // 这个字段是个必填字段
      system_channel_type: value.system_channel_type,
    }

    // 加入与欢迎 - 选择加入方式
    if (value.public !== old.public) {
      let verification_level = guild.verification_level
      if (value.public) {
        verification_level &= ~GuildVerificationLevel.Questionnaire
      } else {
        verification_level |= GuildVerificationLevel.Questionnaire
      }
      guildUpData.verification_level = verification_level
    }

    // 自动欢迎新人 - 自动发送欢迎消息
    if (value.autoSendWelcomeMessage !== old.autoSendWelcomeMessage) {
      let system_channel_flags = guild.system_channel_flags ?? 0
      if (value.autoSendWelcomeMessage) {
        system_channel_flags &= ~1
      } else {
        system_channel_flags |= 1
      }
      guildUpData.system_channel_flags = system_channel_flags
    }

    if (value.customMessageTitle !== old.customMessageTitle || !isEqual(value.customMessageContent, old.customMessageContent)) {
      const ops = autoWelcomeNewcomerFormRef.current!.getContent()
      await OpsUtils.uploadFilesInOps(ops)
      guildUpData.system_channel_message = {
        title: value.customMessageTitle,
        v2: JSON.stringify(OpsUtils.removeRedundantFields(ops)),
      }
    }

    const passthroughFields: Extract<keyof GuildStruct, keyof T>[] = ['system_channel_id']
    for (const key of passthroughFields) {
      if (value[key] !== old[key]) {
        guildUpData[key] = value[key] as never
      }
    }

    if (!isEqual(value.system_channel_message_pic, old.system_channel_message_pic)) {
      guildUpData.system_channel_message_pic = value.system_channel_message_pic
      const customPicture = value.system_channel_message_pic.customPicture
      if (customPicture && customPicture !== old.system_channel_message_pic.customPicture && !isString(customPicture)) {
        guildUpData.system_channel_message_pic.customPicture = await UploadCos.getInstance().uploadFile({
          type: CosUploadFileType.image,
          file: (customPicture as LocalCustomPicture).file,
        })
      }
    }

    if (Object.keys(guildUpData).length) {
      requests.push(GuildAPI.updateGuild(guild.guild_id, guildUpData as never))
    }

    if (!isEqual(value.questions, old.questions) || value.passNumber !== old.passNumber) {
      const questions = cloneDeep(value.questions) ?? []
      // 把 boolean 转换成 number，虽然后端可以接受 boolean，但是移动端无法兼容
      for (const question of questions) {
        if (question.type === 'radio' || question.type === 'checkbox') {
          question.options = question.options.map(e => ({ ...e, isAnswer: Number(e.isAnswer) as never }))
          // 这个字段是个冗余对于选择题来说是冗余字段，但是问卷那边使用该字段来判断答案，而不是 `isAnswer`，只能保留
          question.answers = question.options.filter(e => e.isAnswer).map(e => e.content)
        }
      }

      requests.push(
        GuildAPI.saveJoinAndWelcomeSettings(guild.guild_id, {
          passNumber: value.passNumber,
          questions,
        })
      )
    }

    if (requests.length) {
      await Promise.all(requests)
      store.dispatch(
        guildListActions.updateGuild({
          guild_id: guild.guild_id,
          ...guildUpData,
        } as never)
      )
    }
  }

  return (
    <FbForm<T> className={'flex item-mb24'} initialValue={initialValue} submit={submit}>
      {form => {
        return (
          <div className={'flex h-full'}>
            {/* 左侧列表 */}
            <div className={'flex h-full w-[224px] flex-shrink-0 flex-col gap-1 border-r-[0.5px] border-r-[var(--fg-b10)] p-3'}>
              <div className={'flex h-10 items-center px-1 text-[var(--fg-b60)]'}>加入与欢迎</div>
              <SelectionList
                selected={'0'}
                className={'flex flex-col gap-1'}
                itemClassName={'h-10 w-full !justify-start px-2 text-[var(--fg-b100)]'}
                data={menu}
                itemRenderer={e => e.label}
                onChange={e => setSelectedTab(parseInt(e))}
              />
            </div>

            {/* 右侧表单 */}
            <div className={'py-4 px-6 flex-1 overflow-y-auto'}>
              <div className={clsx(selectedTab !== 0 && 'hidden')}>
                <JoinMethodForm form={form} />
              </div>
              <div className={clsx(selectedTab !== 1 && 'hidden')}>
                <AutoWelcomeNewcomerForm ref={autoWelcomeNewcomerFormRef} form={form} />
              </div>
            </div>
          </div>
        )
      }}
    </FbForm>
  )
}

function JoinMethodForm({ form }: { form: FormInstance }) {
  const isPublic = form.getFieldValue('public')
  const questions: QuestionStructForJoinAndWelcome[] = Form.useWatch(['questions'], form) ?? []
  useEffect(() => {
    if (!questions.length) return

    const passNumber = form.getFieldValue('passNumber')
    if (passNumber > questions.length) {
      form.setFieldsValue({ passNumber: questions.length })
    }
  }, [questions])

  return (
    <>
      <FormSection title={'选择加入方式'} formStyle={'border'}>
        <Form.Item name={'public'} noStyle>
          <Radio.Group className={'vertical-radio-group'}>
            <Radio value={true}>允许任何人加入</Radio>
            <Radio value={false}>需答题验证加入</Radio>
          </Radio.Group>
        </Form.Item>
      </FormSection>
      <FormSection hidden={isPublic} title={'设置及格题目数'}>
        <Form.Item
          name={'passNumber'}
          rules={[
            {
              required: !isPublic,
              message: '请设置及格题目数',
            },
          ]}
        >
          <FbSelect
            className={'w-[320px]'}
            size={'large'}
            options={questions.map((_, i) => ({ label: i + 1, value: i + 1 }))}
            suffixIcon={<iconpark-icon color={'var(--fg-b40)'} size={16} name="Down" />}
          />
        </Form.Item>
      </FormSection>
      <Form.List name={'questions'}>
        {(fields, formOps) => (
          <FormSection hidden={isPublic} title={'问题设置'} tailSlot={<AddQuestionButton form={form} />}>
            <QuestionList scene={'joinAndWelcome'} form={form} fields={fields} {...formOps} />
          </FormSection>
        )}
      </Form.List>
    </>
  )
}

function getJoinOrderNodeData(isOrderNode: boolean) {
  return {
    type: 'mention',
    name: isOrderNode ? 'user.count' : 'user.id',
    children: [{ text: '' }],
  }
}

interface AutoWelcomeNewcomerFormRef {
  getContent: () => Op[]
}

const AutoWelcomeNewcomerForm = forwardRef<AutoWelcomeNewcomerFormRef, { form: FormInstance }>(({ form }, ref) => {
  const { editor, editorNode, searchNode } = useEditor(GuildUtils.getCurrentGuildId() as string)
  const messageType = form.getFieldValue('system_channel_type') as AutoWelcomeNewcomerMessageType
  const pic = form.getFieldValue(['system_channel_message_pic']) as T['system_channel_message_pic']
  const useCustomPic = pic.useCustomPicture
  const customMessageContent = Form.useWatch('customMessageContent', form) as Descendant[]
  const customMessageTitle = form.getFieldValue('customMessageTitle') as string

  const parsedCustomMessageContent = useMemo(() => {
    if (!customMessageContent)
      return {
        v2: [],
        parsed: [],
      }
    const ops = new DataSlateVisitor(customMessageContent, editor, GuildUtils.getCurrentGuildId()!).result.ops
    const mockOps = cloneDeep(ops).map(e => {
      if (e.insert === 'user.count') {
        return {
          ...e,
          insert: '8888',
        }
      } else if (e.attributes?.at === 'user.id') {
        return {
          ...e,
          attributes: {
            ...e.attributes,
            at: LocalUserInfo.userId,
          },
        }
      }
      return e
    })
    return {
      v2: ops,
      parsed: transformRichText(mockOps),
    }
  }, [customMessageContent])

  useImperativeHandle(
    ref,
    () => ({
      getContent: () => parsedCustomMessageContent.v2,
    }),
    [form, parsedCustomMessageContent]
  )

  return (
    <div>
      <FormSection title={'自动欢迎新人'} bottomDivider>
        <FormBodyCommon
          title={'自动发送欢迎消息'}
          desc={'新用户加入后，自动发送消息到选中频道。'}
          suffix={
            <Form.Item name={'autoSendWelcomeMessage'} noStyle>
              <Switch />
            </Form.Item>
          }
        />
      </FormSection>
      <FormSection title={'选择推送频道'}>
        <Form.Item
          name={'system_channel_id'}
          rules={[
            {
              required: true,
              message: '请选择推送频道',
            },
          ]}
        >
          <ChannelSelect guildId={GuildUtils.getCurrentGuildId()!} />
        </Form.Item>
      </FormSection>
      <FormSection title={'选择消息类型'}>
        <Form.Item name={'system_channel_type'}>
          <Radio.Group className={'py-[9px]'}>
            <Radio value={AutoWelcomeNewcomerMessageType.Pic}>图片欢迎语</Radio>
            <Radio value={AutoWelcomeNewcomerMessageType.Text}>文字欢迎语</Radio>
            <Radio value={AutoWelcomeNewcomerMessageType.Custom}>自定义欢迎语</Radio>
          </Radio.Group>
        </Form.Item>
      </FormSection>
      <FormSection title={'选择图片模板'} hidden={messageType !== AutoWelcomeNewcomerMessageType.Pic}>
        <Form.Item name={['system_channel_message_pic', 'template']}>
          <Radio.Group className={'flex gap-3'}>
            <AutoWelcomeNewcomerPicTemplateRadio value={0} pic={AutoWelcomeNewcomerPicTemplate1} title={'模板一'} />
            <AutoWelcomeNewcomerPicTemplateRadio value={1} pic={AutoWelcomeNewcomerPicTemplate2} title={'模板二'} />
          </Radio.Group>
        </Form.Item>
      </FormSection>
      <FormSection title={'设置模板背景图'} hidden={messageType !== AutoWelcomeNewcomerMessageType.Pic}>
        <FormBodyCommon
          bottomBorder
          title={'自定义模板背景'}
          suffix={
            <Form.Item name={['system_channel_message_pic', 'useCustomPicture']} noStyle>
              <Switch />
            </Form.Item>
          }
        />
        <Form.Item
          name={['system_channel_message_pic', 'customPicture']}
          rules={[
            ({ getFieldValue }) => ({
              required: getFieldValue(['system_channel_message_pic', 'useCustomPicture']),
              message: '请设置模板背景图',
            }),
          ]}
          hidden={!useCustomPic}
        >
          <AutoWelcomeNewcomerFormCustomPicRow />
        </Form.Item>
      </FormSection>
      <FormSection formStyle={'border'} title={'自定义消息'} hidden={messageType !== AutoWelcomeNewcomerMessageType.Custom}>
        <Form.Item
          name={'customMessageContent'}
          valuePropName={'initialValue'}
          rules={[
            ({ getFieldValue }) => ({
              validator: async (_, value) => {
                if (getFieldValue('system_channel_type') !== AutoWelcomeNewcomerMessageType.Custom) {
                  return Promise.resolve()
                }

                if (isEqual(value, EMPTY_SLATE)) {
                  return Promise.reject('请输入消息内容')
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Slate editor={editor} initialValue={[]}>
            <RichTextWrapper>
              <RichTextToolbar
                className={'border -b-[0.5px] -mx-3 px-1.5'}
                channel
                disableWhenNotFocused
                moreButtons={
                  <>
                    <RichTextToolBarIconButton
                      tooltip={'@新成员'}
                      icon="UserAt"
                      onClick={() => {
                        RichTextEditorUtils.insertArbitrary(editor, getJoinOrderNodeData(false) as never)
                      }}
                    />
                    <RichTextToolBarIconButton
                      tooltip={'新成员位数'}
                      icon="DoubleUser"
                      onClick={() => {
                        RichTextEditorUtils.insertArbitrary(editor, getJoinOrderNodeData(true) as never)
                      }}
                    />
                  </>
                }
              />
              <Form.Item
                name={'customMessageTitle'}
                className={'mb-0'}
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('system_channel_type') === AutoWelcomeNewcomerMessageType.Custom,
                    whitespace: true,
                    message: '请输入标题',
                  }),
                ]}
              >
                <TextArea autoSize maxLength={30} placeholder={'请输入标题'} bordered={false} className={'text-lg font-medium py-0 mt-4 mb-1 px-0'} />
              </Form.Item>
              {editorNode}
              {searchNode}
            </RichTextWrapper>
          </Slate>
        </Form.Item>
      </FormSection>
      <FormSection title={'预览效果'}>
        <>
          {AutoWelcomeNewcomerMessageType.Custom === messageType && isEqual(EMPTY_SLATE, customMessageContent) ?
            <div className={'py-3 text-[var(--fg-b40)] text-center rounded-[10px] bg-[var(--bg-bg-2)]'}>填写消息内容后可预览效果</div>
          : <div
              className={'origin-top-left p-4 bg-[var(--bg-bg-2)] rounded-[20px]'}
              style={{
                zoom: 0.6,
              }}
            >
              <WelcomeMessage
                className={'min-h-[136px] pt-2 pointer-events-none'}
                message={{
                  type: MessageType.Welcome,
                  order: 8888,
                  index: 0,
                  content:
                    AutoWelcomeNewcomerMessageType.Custom === messageType ?
                      {
                        type: MessageType.RichText,
                        title: customMessageTitle,
                        ...parsedCustomMessageContent,
                      }
                    : undefined,
                  picture:
                    AutoWelcomeNewcomerMessageType.Pic === messageType ?
                      {
                        template: pic.template,
                        customPicture:
                          useCustomPic && pic.customPicture ?
                            isString(pic.customPicture) ? pic.customPicture
                            : (pic.customPicture as LocalCustomPicture).url
                          : undefined,
                      }
                    : undefined,
                }}
                userId={LocalUserInfo.userId}
                guildId={GuildUtils.getCurrentGuildId()}
              />

              <div className={'flex gap-1 mt-6 rounded-lg h-10 border px-3 text-[var(--fg-b100)] bg-[var(--bg-bg-3)]'}>
                <div className={'text-[var(--fg-b40)] leading-10 flex-1'}>
                  发送到
                  <RealtimeChannelName className={'ml-1'} channelId={form.getFieldValue('system_channel_id')} prefixChannelIcon />
                </div>
                <iconpark-icon name="Emoji" size={16} />
                <iconpark-icon name="At" size={16} />
                <iconpark-icon name="Picture" size={16} />
              </div>
            </div>
          }
        </>
      </FormSection>
    </div>
  )
})
AutoWelcomeNewcomerForm.displayName = 'AutoWelcomeNewcomerForm'

function AutoWelcomeNewcomerPicTemplateRadio({
  value,
  pic,
  title,
}: {
  pic: string
  title: string
  value?: number
  onChange?: (value: number) => void
}) {
  return (
    <Radio value={value} className={'p-3 pt-[14px] border rounded-lg [&>.ant-radio]:self-start [&>.ant-radio]:pt-[3.5px]'}>
      <div className={'flex flex-col gap-2'}>
        <div className={'flex-shrink-0'}>{title}</div>
        <img src={pic} alt="" />
      </div>
    </Radio>
  )
}

function AutoWelcomeNewcomerFormCustomPicRow({
  value,
  onChange,
}: {
  value?: NonNullable<unknown> | string
  onChange?: (value: { file: File; url: string }) => void
}) {
  return (
    <FormBodyCommon
      bottomBorder
      title={'模板背景图'}
      desc={'建议上传比例 16:9'}
      suffix={
        <div className={'relative'}>
          <SingleImageUploader
            button
            defaultUrl={isString(value) ? value : undefined}
            onChange={(file, url) => onChange?.({ file, url })}
            useCrop={{ aspect: 16 / 9, title: '编辑模板背景图' }}
            className={'!rounded-[10px] !absolute right-0 top-0'}
            onlyIcon={true}
          />
        </div>
      }
    />
  )
}

function useEditor(guildId: string, handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void) {
  // noinspection RequiredAttributes
  const renderElement = useCallback(
    (props: RenderElementProps) => <RichTextElementRenderer {...props} Mention={MentionRenderer} Channel={Channel} />,
    []
  )
  // noinspection RequiredAttributes
  const renderLeaf = useCallback((props: RenderLeafProps) => <RichTextLeafRenderer {...props} />, [])

  const editor = useMemo(() => {
    let editor = withReact(createEditor())
    editor = withSearch(
      {
        '#': {
          elementType: 'channel',
          onSearch: s => channelSearchOptions.setSearch(s),
        },
      },
      editor
    )
    editor = withMention(editor)
    editor = withEmoji(editor)
    editor = withMedia(editor)
    return withHistory(editor)
  }, [])

  // 处理 # 频道搜索
  const channelSearchOptions = useSearchChannel(editor as never as SearchEditor, guildId, { usePopup: true })

  const editorNode = (
    <Editable
      className={
        'message-rich-text [&>p>span>span>span]:my-1 !min-h-[80px] flex-shrink overflow-hidden overflow-y-scroll break-all text-[14px] caret-[var(--fg-blue-1)] outline-none'
      }
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      placeholder={'请输入消息内容（必填），点击上方「+」可输入变量'}
      spellCheck
      autoFocus
      onKeyDown={event => {
        if (channelSearchOptions.onKeyDown(event)) return
        handleKeyDown?.(event)
        // RichTextEditorUtils.handleEditorShortcut(editor, event)
      }}
    />
  )

  const searchNode = <>{channelSearchOptions.element}</>

  return { editor, editorNode, searchNode }
}

function MentionRenderer({ element, attributes, children }: RenderElementProps) {
  return (
    <span {...attributes}>
      <span className={'leading-[24px] inline-block mx-1 font-medium px-2 bg-[var(--fg-b5)] rounded-full'}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(element as any).name === 'user.count' ? '新成员位数' : '@新成员'}
      </span>
      <InlineWrapper>{children}</InlineWrapper>
    </span>
  )
}

function withMention(editor: BaseEditor & ReactEditor) {
  const { isInline, isVoid, markableVoid } = editor

  editor.isInline = element => {
    return 'mention' === element.type ? true : isInline(element)
  }

  editor.isVoid = element => {
    return 'mention' === element.type ? true : isVoid(element)
  }

  editor.markableVoid = element => {
    return 'mention' === element.type || markableVoid(element)
  }
  return editor
}

class DataSlateVisitor extends FbRichTextSlateVisitor {
  constructor(
    content: Descendant[],
    editor: Editor,
    private guildId: string
  ) {
    super(content, editor)
  }

  visitMention(node: MentionElement): void {
    if (node.name === 'user.count') {
      this.result.ops.push({
        insert: 'user.count',
        attributes: { placeholder: { content: 'user.count', color: '0xffffffff' } },
      })
    } else {
      this.result.ops.push({
        insert: `@{${this.guildId}:user.id}`,
        'attributes': { 'at': 'user.id', 'atGuildId': this.guildId },
      })
    }
  }
}
