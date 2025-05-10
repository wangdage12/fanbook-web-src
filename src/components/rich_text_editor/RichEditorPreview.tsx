/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useUpdate } from 'ahooks'
import { Button } from 'antd'
import clsx from 'clsx'
import RichTextRenderer from 'fb-components/rich_text/RichTextRenderer'
import 'fb-components/rich_text/rich-text.css'
import transformRichText from 'fb-components/rich_text/transform_rich_text'
import RichTextEditorUtils, { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils'
import RichTextElementRenderer from 'fb-components/rich_text_editor/RichTextElementRenderer'
import RichTextLeafRenderer from 'fb-components/rich_text_editor/RichTextLeafRenderer'
import RichTextPlaceholderRenderer from 'fb-components/rich_text_editor/RichTextPlaceholderRenderer'
import RichTextToolbar from 'fb-components/rich_text_editor/RichTextToolbar'
import RichTextWrapper from 'fb-components/rich_text_editor/RichTextWrapper'
import withDivider from 'fb-components/rich_text_editor/plugins/withDivider'
import withEmoji from 'fb-components/rich_text_editor/plugins/withEmoji'
import withLink from 'fb-components/rich_text_editor/plugins/withLink'
import withMedia from 'fb-components/rich_text_editor/plugins/withMedia'
import withSearch, { SearchEditor } from 'fb-components/rich_text_editor/plugins/withSearch'
import withTextLimit from 'fb-components/rich_text_editor/plugins/withTextLimit'
import { FbRichTextQuillDeltaVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextQuillDeltaVisitor'
import { FbRichTextSlateVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor'
import { Op } from 'quill-delta'
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Transforms, createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, RenderElementProps, RenderLeafProps, RenderPlaceholderProps, Slate, withReact } from 'slate-react'
import { Content, JSONContent, JSONEditor, Mode, TextContent } from 'vanilla-jsoneditor'
import GuildUtils from '../../features/guild_list/GuildUtils'
import { ChannelContext, GuildContext } from '../../features/home/GuildWrapper'
import Channel from './Channel'
import Mention from './Mention'
import { useSearchChannel } from './hooks/useSearchChannel'
import { useSearchMention } from './hooks/useSearchMention'

const initialValue = EMPTY_SLATE

function JSONEditorView({ content, onChange, readOnly }: { content: unknown; readOnly?: boolean; onChange?: (content: Content) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const editor = useRef<JSONEditor | null>(null)

  useEffect(() => {
    if (!container.current) return
    if (!editor.current) {
      editor.current = new JSONEditor({
        target: container.current,
        props: {
          mode: Mode.text,
          content: {
            json: { content },
          },
          readOnly,
          mainMenuBar: false,
          navigationBar: false,
          statusBar: true,
          onChange: (updatedContent, previousContent, { contentErrors, patchResult }) => {
            // content is an object { json: unknown } | { text: string }
            console.log('onChange', { updatedContent, previousContent, contentErrors, patchResult })
            onChange?.(updatedContent)
          },
        },
      })
    }
    editor.current.set({ json: content })
  }, [content])

  return <div ref={container} className="h-full w-full" />
}

export function useEditor(
  guildId: string,
  placeholder: string,
  options?: {
    className?: string
    maxLength?: number
    handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
    channelId?: string
    onInsertMention?: (data: { userId: string; displayName: string }) => void
    channelLink?: boolean | { useSearchChannel: (editor: SearchEditor) => void }
    renderElement?: (props: RenderElementProps) => ReactElement | undefined
    maxSearchLength?: number
    autoFocus?: boolean
  }
) {
  // noinspection RequiredAttributes
  const renderElement = useCallback(
    (props: RenderElementProps) => options?.renderElement?.(props) ?? <RichTextElementRenderer {...props} Channel={Channel} Mention={Mention} />,
    [options?.renderElement]
  )
  // noinspection RequiredAttributes
  const renderLeaf = useCallback((props: RenderLeafProps) => <RichTextLeafRenderer {...props} />, [])

  const renderPlaceholder = useCallback((props: RenderPlaceholderProps) => <RichTextPlaceholderRenderer {...props} />, [])

  const editor = useMemo(() => {
    let editor = withReact(createEditor())

    editor = withSearch(
      {
        '@': {
          elementType: 'mention',
          onSearch: s => mentionSearchOptions.setSearch(s),
        },
        ...(options?.channelLink ?
          {
            '#': {
              elementType: 'channel',
              onSearch: s => channelSearchOptions!.setSearch(s),
            },
          }
        : {}),
      },
      editor,
      { maxLength: options?.maxSearchLength }
    )
    editor = withEmoji(editor)
    editor = withLink(editor)
    editor = withMedia(editor)
    editor = withDivider(editor)
    if (options?.maxLength) editor = withTextLimit(options.maxLength, editor)
    return withHistory(editor)
  }, [])

  // 处理 @ 搜索
  const mentionSearchOptions = useSearchMention(editor as never as SearchEditor, guildId, {
    channelId: options?.channelId,
    usePopup: true,
    enabledPossibleMention: true,
    onInsertMention: options?.onInsertMention,
  })
  // 处理 # 频道搜索
  const channelSearchOptions = (() => {
    if (!options?.channelLink) return undefined
    if (typeof options.channelLink === 'boolean' || !options.channelLink.useSearchChannel) {
      return useSearchChannel(editor as never as SearchEditor, guildId, { usePopup: true })
    }
    return options.channelLink.useSearchChannel(editor as never as SearchEditor)
  })()

  const editorNode = (
    <Editable
      className={clsx([
        'message-rich-text mb-2 !min-h-[138px] flex-1 overflow-hidden overflow-y-scroll break-all text-[16px] leading-[26px] text-[var(--fg-b100)] caret-[var(--fg-blue-1)] outline-none',
        options?.className,
      ])}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      renderPlaceholder={renderPlaceholder}
      placeholder={placeholder}
      spellCheck
      autoFocus={options?.autoFocus}
      onKeyDown={event => {
        if (channelSearchOptions?.onKeyDown(event)) return
        if (mentionSearchOptions.onKeyDown(event)) return
        if (RichTextEditorUtils.handleEditorShortcut(editor, event)) return
        if (RichTextEditorUtils.handleEditorHotKey(editor, event)) return
        RichTextEditorUtils.listenToBreakLinkBySpace(editor, event)
        options?.handleKeyDown?.(event)
      }}
    />
  )

  const searchNode = (
    <>
      {mentionSearchOptions.element}
      {channelSearchOptions?.element}
    </>
  )

  return { editor, editorNode, searchNode }
}

export default function RichEditorPreview() {
  const guild = GuildUtils.getFirstGuild()
  const [op, setOp] = useState<Op[]>([])
  const channel = GuildUtils.getFirstAccessibleTextChannel(guild?.guild_id ?? '')
  const update = useUpdate()
  const { editor, editorNode, searchNode } = useEditor(guild?.guild_id ?? '', '输入内容', {
    maxLength: 5000,
    channelId: channel?.channel_id,
    channelLink: true,
  })

  const renderData = useMemo(() => transformRichText(op), [op])

  const handleChange = () => {
    try {
      const exporter = new FbRichTextSlateVisitor(editor.children, editor).result
      setOp(exporter.ops)
    } catch (error) {
      console.log(error)
    }
  }

  const handleClick = () => {
    try {
      const result = new FbRichTextQuillDeltaVisitor(op).result
      // 清空编辑器内容
      Transforms.removeNodes(editor, { at: [0] })

      // 插入新的节点
      Transforms.insertNodes(editor, result, { at: [0] })

      // 设置光标位置
      Transforms.setSelection(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleJsonChange = (content: Content) => {
    if ((content as TextContent).text) {
      setOp(JSON.parse((content as TextContent).text))
      return
    }
    setOp((content as JSONContent).json as Op[])
  }

  useEffect(() => {
    handleChange()
  }, [])

  return (
    <GuildContext.Provider value={guild}>
      <ChannelContext.Provider value={channel}>
        <div className="flex items-center gap-2">
          <span>
            社区：{guild?.name} {guild?.guild_id}
          </span>
          <span>
            频道：{channel?.name} {channel?.channel_id}
          </span>
        </div>
        <div className="flex [&>*]:h-[calc((100vh-22px)/2)] [&>*]:w-[50vw]">
          <div className="flex flex-col border px-2">
            <Slate
              editor={editor}
              initialValue={initialValue}
              onChange={() => {
                handleChange()
                update()
              }}
            >
              <RichTextWrapper>
                <RichTextToolbar
                  mention
                  channel
                  video
                  link
                  inlines
                  blocks
                  // moreButtons={[
                  //   <Tooltip key={'search-question'} title={'插入问题卡片'}>
                  //     <HoverBox onClick={() => setShowQuestionSearch(true)}>
                  //       <iconpark-icon size={20} name="Help" />
                  //     </HoverBox>
                  //   </Tooltip>,
                  // ]}
                />
                {editorNode}
              </RichTextWrapper>
            </Slate>
            {searchNode}
          </div>
          <div className="message-rich-text overflow-auto border border-l-0 p-2">
            <RichTextRenderer data={renderData} guildId={guild?.guild_id} />
          </div>
        </div>
        <div className="flex [&>*]:h-[calc((100vh-22px)/2)] [&>*]:w-[calc(100vw/3)]">
          <JSONEditorView readOnly content={editor.children} />
          <div>
            <Button onClick={handleClick}>使用</Button>
            <JSONEditorView content={op} onChange={handleJsonChange} />
          </div>
          <JSONEditorView readOnly content={renderData} />
        </div>
      </ChannelContext.Provider>
    </GuildContext.Provider>
  )
}
