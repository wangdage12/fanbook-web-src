import TextArea from 'antd/es/input/TextArea'
import clsx from 'clsx'
import CryptoJS from 'crypto-js'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { QuestionTagStruct } from 'fb-components/question/types.ts'
import { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils.tsx'
import RichTextToolbar from 'fb-components/rich_text_editor/RichTextToolbar.tsx'
import RichTextWrapper from 'fb-components/rich_text_editor/RichTextWrapper.tsx'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { SwitchType } from 'fb-components/struct/type'
import React, { useCallback, useState } from 'react'
import { Descendant } from 'slate'
import { Slate } from 'slate-react'
import { useAppDispatch } from '../../app/hooks.ts'
import { store } from '../../app/store.ts'
import ServerTime from '../../base_services/ServerTime.ts'
import StateUtils from '../../utils/StateUtils.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import usePublishTextMode from './hooks/usePublishTextMode.ts'
import useQuestionArticleMediaForTextMode from './hooks/useQuestionArticleMediaForTextMode.tsx'
import useQuestionEditor from './hooks/useQuestionEditor.tsx'
import QuestionApi from './questionAPI.ts'
import { questionActions } from './questionSlice.ts'

const MAX_TAGS = 5

interface QuestionPublisherProps {
  initialValue?: Descendant[]
  onClose?: () => void
}

export default function QuestionPublisher({ initialValue, onClose }: QuestionPublisherProps) {
  const channel = GuildUtils.getCurrentChannel() as ChannelStruct
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')

  const { editor, editorNode, searchNode } = useQuestionEditor(
    channel.guild_id,
    channel.channel_id,
    '对问题进行描述说明可以收到更满意的回答哦~',
    5000
  )
  const { images, video, pickVideo, pickImage, disabledVideo, disabledImage, mediaNode } = useQuestionArticleMediaForTextMode()

  const tags = store.getState().question.tags
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const onToggleSelectTag = useCallback(
    (select: boolean, tagId: string) => {
      if (selectedTags.length >= MAX_TAGS && select)
        return FbToast.open({ content: `最多可选择${MAX_TAGS}个标签`, key: 'question-publish-max-selection' })

      setSelectedTags(prev => {
        if (select) {
          return [...prev, tagId]
        } else {
          return prev.filter(id => id !== tagId)
        }
      })
    },
    [selectedTags]
  )

  const publishTextMode = usePublishTextMode(editor)
  const [duringPublish, setDuringPublish] = useState(false)
  const publish = async () => {
    setDuringPublish(true)

    const exporter = await publishTextMode(images, video)
    const content = JSON.stringify(exporter.ops)
    try {
      const { question_id } = await QuestionApi.createQuestion({
        channelId: channel.channel_id,
        content,
        mentions: exporter.mentions,
        title,
        hash: CryptoJS.MD5(`${title}${content}${ServerTime.now()}`).toString(),
        tagIds: selectedTags,
      })
      FbToast.open({ content: '提问发布成功', type: 'success' })
      dispatch(
        questionActions.addQuestionToList({
          question: {
            title,
            content: exporter.ops,
            guild_id: channel.guild_id,
            channel_id: channel.channel_id,
            question_id,
            parsed: [],
            created_at: Date.now() / 1000,
            is_collected: SwitchType.Yes,
          },
          author: {
            user_id: LocalUserInfo.userId,
            nickname: StateUtils.localUser.nickname,
            avatar: StateUtils.localUser.avatar,
          },
          deleted: false,
          tags: [...tags].filter(tag => selectedTags.includes(tag.tag_id)),
        })
      )
      onClose?.()
    } catch (err) {
      console.error(err)
    }
    setDuringPublish(false)
  }
  return (
    <FbModal
      width={800}
      centered
      cancelButtonProps={{
        className: 'hidden',
      }}
      okButtonProps={{
        className: 'w-20 !my-4 mx-6',
        disabled: title.length < 5,
        loading: duringPublish,
      }}
      okText={'发布'}
      onOk={publish}
      open={true}
      onCancel={onClose}
      maskClosable={false}
      title={<div className={'flex-center select-none pt-3 text-lg'}>提问</div>}
    >
      <div className={'flex h-[70vh] max-h-[600px] flex-col overflow-hidden px-6 pb-2'}>
        <Slate editor={editor} initialValue={initialValue ?? EMPTY_SLATE}>
          <RichTextWrapper>
            <RichTextToolbar
              mention
              channel
              video
              onPickImage={pickImage}
              onPickVideo={pickVideo}
              disabledImage={disabledImage}
              disabledVideo={disabledVideo}
            />
            <TextArea
              autoSize={{ maxRows: 10 }}
              maxLength={30}
              bordered={false}
              className={'flex-shrink-0 px-0 py-2 text-[22px] font-medium leading-9'}
              placeholder={'输入问题，5-30字（必填）'}
              onChange={e => setTitle(e.target.value)}
            />
            {editorNode}
          </RichTextWrapper>
        </Slate>
        {mediaNode}
        <Tags tags={tags} selected={selectedTags} onToggleSelect={onToggleSelectTag} />
        {searchNode}
      </div>
    </FbModal>
  )
}

function Tags({
  tags,
  selected,
  onToggleSelect,
}: {
  tags: QuestionTagStruct[]
  selected: string[]
  onToggleSelect: (select: boolean, tagId: string) => void
}) {
  if (!tags.length) return null

  return (
    <div>
      <div className={'flex items-center gap-2 pb-2 pt-6'}>
        <iconpark-icon size={14} color={'var(--fg-b60)'} name="Tag" />
        <div className={'font-medium text-[var(--fg-b100)]'}>选择标签：</div>
      </div>
      <div className={'flex flex-wrap gap-2 py-1'}>
        {tags.map(tag => {
          const sel = selected.includes(tag.tag_id)
          return (
            <div
              key={tag.tag_id}
              onClick={() => onToggleSelect(!sel, tag.tag_id)}
              className={clsx([
                'flex-center h-7 cursor-pointer select-none rounded-full border px-3 transition-colors',
                sel ? 'text-[var(--fg-blue-1)]' : 'text-[var(--fg-b60)]',
                sel ? 'border-[var(--fg-blue-2)]' : 'border-transparent',
                sel ? 'bg-[var(--fg-blue-3)]' : 'bg-[var(--fg-b5)]',
              ])}
            >
              {tag.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}
