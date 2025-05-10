import { useDebounce } from 'ahooks'
import { Input } from 'antd'
import clsx from 'clsx'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import Highlighter from 'fb-components/components/Highlighter.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { Portal } from 'fb-components/components/Portal.tsx'
import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import { QuestionAnswerContentType, QuestionAnswerStruct, QuestionArticleStruct } from 'fb-components/question/types.ts'
import { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils.tsx'
import RichTextToolbar from 'fb-components/rich_text_editor/RichTextToolbar.tsx'
import RichTextWrapper from 'fb-components/rich_text_editor/RichTextWrapper.tsx'
import { formatCount } from 'fb-components/utils/common.ts'
import { Op } from 'quill-delta'
import React, { useEffect, useRef } from 'react'
import { Descendant, Range } from 'slate'
import { ReactEditor, Slate } from 'slate-react'
import NoSearchDataImage from '../../assets/images/no-search-data.svg'
import KeyboardNavigationList from '../../components/KeyboardNavigationList.tsx'
import ServeSideConfigService from '../../services/ServeSideConfigService.ts'
import { PaginationResp } from '../../types.ts'
import StateUtils from '../../utils/StateUtils.ts'
import usePublishTextMode from './hooks/usePublishTextMode.ts'
import useQuestionArticleMediaForTextMode from './hooks/useQuestionArticleMediaForTextMode.tsx'
import useQuestionEditor from './hooks/useQuestionEditor.tsx'
import QuestionApi, { QuestionSearchRange } from './questionAPI.ts'

interface AnswerPublisherProps {
  initialValue?: Descendant[]
  question: QuestionArticleStruct
  onClose?: (newAnswer?: QuestionAnswerStruct) => void
}

export default function AnswerPublisher({ onClose, ...props }: AnswerPublisherProps) {
  const enabledRichTextFormat = false
  const questionSearchPanelRef = useRef<HTMLDivElement>(null)
  const { channel_id, guild_id } = props.question as { channel_id: string; guild_id: string }
  const { editor, editorNode, searchNode } = useQuestionEditor(guild_id, channel_id, '输入回答内容', 5000)
  const { images, video, pickVideo, pickImage, disabledVideo, disabledImage, mediaNode } = useQuestionArticleMediaForTextMode()

  const [duringPublishing, setDuringPublishing] = React.useState(false)
  const publishTextMode = usePublishTextMode(editor)

  const publish = async () => {
    setDuringPublishing(true)
    const exporter = await publishTextMode(images, video)
    const newAnswer = await postPublish({
      questionId: props.question.question_id,
      guildId: guild_id,
      channelId: channel_id,
      content: exporter.ops,
      mentions: exporter.mentions,
      // content_type: QuestionAnswerContentType.RichText,
    }).finally(() => setDuringPublishing(false))

    onClose?.(newAnswer)
  }

  const postPublish = async ({
    channelId,
    questionId,
    content,
    mentions,
    guildId,
  }: {
    guildId: string
    channelId: string
    questionId: string
    content: Op[]
    mentions: string[]
  }) => {
    const { answer_id } = await QuestionApi.answerCreate({
      questionId,
      channelId,
      content: JSON.stringify(content),
      mentions,
      content_type: QuestionAnswerContentType.Text,
    })
    const localUser = StateUtils.localUser

    const newAnswer: QuestionAnswerStruct = {
      reply_list: [],
      // @ts-expect-error 本地填充的数据会少很多，尽量填上有的
      answer: {
        like_count: 0,
        channel_id: channelId,
        geo_region: ServeSideConfigService.geo_region,
        content,
        reply_count: 0,
        answer_id,
        question_id: questionId,
        created_at: Date.now() / 1000,
        guild_id: guildId,
        user_id: localUser.user_id,
      },
      author: {
        user_id: localUser.user_id,
        nickname: localUser.nickname,
      },
    }
    return newAnswer
  }

  const [showQuestionSearch, setShowQuestionSearch] = React.useState(false)
  const buildQuestionSearch = () => {
    const domRange = ReactEditor.toDOMRange(editor, (editor.selection as Range) ?? editor.end([0, 0]))
    const rect = domRange.getBoundingClientRect()

    return (
      <Portal>
        <div
          ref={questionSearchPanelRef}
          className={'absolute h-[400px] w-[480px] rounded-lg bg-[var(--bg-bg-3)]'}
          style={{
            top: rect.top + 24,
            left: rect.left,
            zIndex: 10000,
          }}
        >
          <QuestionSearchPanel guildId={guild_id} channelId={channel_id} onClose={() => setShowQuestionSearch(false)} />
        </div>
      </Portal>
    )
  }

  return (
    <FbModal
      open={true}
      onCancel={() => onClose?.()}
      centered
      cancelButtonProps={{ className: 'hidden' }}
      okText={'发布'}
      onOk={publish}
      okButtonProps={{ className: 'w-20 mx-6 !my-4', shape: 'round', loading: duringPublishing }}
      title={<div className={'flex-center w-full select-none pt-3 text-lg'}>回答</div>}
      width={800}
      maskClosable={false}
    >
      <div className={'flex h-[70vh] max-h-[600px] flex-col overflow-hidden px-6 pb-2'} {...props}>
        <Slate editor={editor} initialValue={props.initialValue ?? EMPTY_SLATE}>
          <RichTextWrapper>
            <RichTextToolbar
              mention
              channel
              video
              onPickImage={enabledRichTextFormat ? undefined : pickImage}
              onPickVideo={enabledRichTextFormat ? undefined : pickVideo}
              disabledImage={disabledImage}
              disabledVideo={disabledVideo}
              // moreButtons={[
              //   <Tooltip key={'search-question'} title={'插入问题卡片'}>
              //     <HoverBox onClick={() => setShowQuestionSearch(true)}>
              //       <iconpark-icon size={20} name="Help" />
              //     </HoverBox>
              //   </Tooltip>,
              // ]}
            />
            <div className={'flex h-[50px] flex-shrink-0 items-center gap-2'}>
              <TenSizeTag color="blue" text="问" bordered className="align-[.05em]"></TenSizeTag>
              <div className={'truncate text-lg font-medium text-[var(--fg-b100)]'}>{props.question.title}</div>
            </div>
            {editorNode}
          </RichTextWrapper>
        </Slate>
        {mediaNode}
        {searchNode}
        {showQuestionSearch && buildQuestionSearch()}
      </div>
    </FbModal>
  )
}

interface QuestionSearchPanelProps {
  guildId: string
  channelId: string
  onClose: React.MouseEventHandler<HTMLDivElement> | undefined
}

export function QuestionSearchPanel({ guildId, channelId, onClose }: QuestionSearchPanelProps) {
  const [query, setQuery] = React.useState('')
  const debounced = useDebounce(query, { wait: 500 })

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div
      className={'w-[480px] text-[var(--fg-b100)]'}
      style={{
        boxShadow: '0px 8px 16px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className={'flex select-none items-center justify-between gap-4 p-4 text-lg font-medium'}>
        <div>插入问题卡片</div>
        <HoverBox onClick={onClose}>
          <iconpark-icon name="Close" size={20} />
        </HoverBox>
      </div>

      <div className={'px-4 py-2'}>
        <Input
          autoFocus
          type={'search'}
          className={'h-10'}
          prefix={<iconpark-icon name="Search" size={16} color={'var(--fg-b40)'} />}
          placeholder={'搜索问题'}
          onChange={onChange}
        />
      </div>

      <QuestionSearchResult guildId={guildId} channelId={channelId} search={debounced} />
    </div>
  )
}

function QuestionSearchResult({ guildId, channelId, search }: { guildId: string; channelId: string; search: string }) {
  const [result, setResult] = React.useState<
    | PaginationResp<{
        question: QuestionArticleStruct
      }>
    | undefined
  >(undefined)

  useEffect(() => {
    if (!search) {
      setResult(undefined)
      return
    }

    QuestionApi.searchQuestion({
      guildId,
      channelId,
      keyword: search,
      type: QuestionSearchRange.Question,
    }).then(v => setResult(v))
  }, [search])

  if (result === undefined || result.list.length === 0) {
    return (
      <div className={'flex-center flex h-[286px] flex-col gap-4'}>
        <img width={56} height={56} src={NoSearchDataImage} alt="" />
        <div className={'text-[var(--fg-b60)]'}>{result === undefined ? '搜索问答' : '暂无相关问题'}</div>
      </div>
    )
  }

  return (
    <KeyboardNavigationList
      className={'h-[286px] overflow-y-scroll px-4 py-2 text-[var(--fg-b100)]'}
      dataSource={result.list}
      renderItem={(data, _index, selected) => (
        // todo dark mode for bg color
        <div className={clsx(['round-lg flex h-14 cursor-pointer flex-col justify-between p-2', selected && 'bg-[rgba(26,32,51,0.03)]'])}>
          <Highlighter keyword={search} text={data.question.title} prefixSize={0} />
          <div className={'flex gap-3 text-xs text-[var(--fg-b40)]'}>
            <div>{formatCount(data.question.view_count)}浏览</div>
            <div>{formatCount(data.question.answer_count)}回答</div>
          </div>
        </div>
      )}
    />
  )
}
