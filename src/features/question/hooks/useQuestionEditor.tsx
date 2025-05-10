import RichTextElementRenderer from 'fb-components/rich_text_editor/RichTextElementRenderer.tsx'
import RichTextLeafRenderer from 'fb-components/rich_text_editor/RichTextLeafRenderer.tsx'
import RichTextPlaceholderRenderer from 'fb-components/rich_text_editor/RichTextPlaceholderRenderer.tsx'
import withDivider from 'fb-components/rich_text_editor/plugins/withDivider.tsx'
import withEmoji from 'fb-components/rich_text_editor/plugins/withEmoji.tsx'
import withLink from 'fb-components/rich_text_editor/plugins/withLink.tsx'
import withMedia from 'fb-components/rich_text_editor/plugins/withMedia.tsx'
import withSearch, { SearchEditor } from 'fb-components/rich_text_editor/plugins/withSearch.tsx'
import withTextLimit from 'fb-components/rich_text_editor/plugins/withTextLimit.tsx'
import React, { useCallback, useMemo } from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, withReact } from 'slate-react'
import { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from 'slate-react/dist/components/editable'

import 'fb-components/rich_text/rich-text.css'
import Channel from '../../../components/rich_text_editor/Channel'
import Mention from '../../../components/rich_text_editor/Mention'
import { useSearchChannel } from '../../../components/rich_text_editor/hooks/useSearchChannel'
import { useSearchMention } from '../../../components/rich_text_editor/hooks/useSearchMention'

export default function useQuestionEditor(
  guildId: string,
  channelId: string,
  placeholder: string,
  maxLength?: number,
  handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
) {
  // noinspection RequiredAttributes
  const renderElement = useCallback((props: RenderElementProps) => <RichTextElementRenderer {...props} Channel={Channel} Mention={Mention} />, [])
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
        '#': {
          elementType: 'channel',
          onSearch: s => channelSearchOptions.setSearch(s),
        },
      },
      editor
    )
    editor = withEmoji(editor)
    editor = withLink(editor)
    editor = withMedia(editor)
    editor = withDivider(editor)
    if (maxLength) editor = withTextLimit(maxLength, editor)
    return withHistory(editor)
  }, [])

  // 处理 @ 搜索
  const mentionSearchOptions = useSearchMention(editor as never as SearchEditor, guildId, {
    channelId,
    usePopup: true,
    enabledPossibleMention: true,
  })
  // 处理 # 频道搜索
  const channelSearchOptions = useSearchChannel(editor as never as SearchEditor, guildId, { usePopup: true })

  const editorNode = (
    <Editable
      className={
        'message-rich-text mb-2 !min-h-[138px] flex-shrink overflow-hidden overflow-y-scroll break-all text-[16px] leading-[26px] text-[var(--fg-b100)] caret-[var(--fg-blue-1)] outline-none'
      }
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      renderPlaceholder={renderPlaceholder}
      placeholder={placeholder}
      spellCheck
      autoFocus
      onKeyDown={event => {
        if (channelSearchOptions.onKeyDown(event)) return
        if (mentionSearchOptions.onKeyDown(event)) return
        handleKeyDown?.(event)
        // RichTextEditorUtils.handleEditorShortcut(editor, event)
      }}
    />
  )

  const searchNode = (
    <>
      {mentionSearchOptions.element}
      {channelSearchOptions.element}
    </>
  )

  return { editor, editorNode, searchNode }
}
