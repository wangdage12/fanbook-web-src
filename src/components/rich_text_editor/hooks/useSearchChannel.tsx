import RichTextEditorUtils from 'fb-components/rich_text_editor/RichTextEditorUtils'
import { UseSearchFeatureOptions, UseSearchFeatureResult, useSearchFeature } from 'fb-components/rich_text_editor/hooks/useSearchFeature'
import { SearchEditor } from 'fb-components/rich_text_editor/plugins/withSearch'
import { WrapperContext } from '../WrapperContext.tsx'
import MentionChannelList from '../mention/MentionChannelList.tsx'

/**
 * 与 `withSearch` 配合使用，用于支持 # 频道搜索
 */
export function useSearchChannel(editor: SearchEditor, guildId: string, options?: UseSearchFeatureOptions): UseSearchFeatureResult {
  return useSearchFeature(
    editor,
    (search, setSearch, updateResultCount) => (
      <WrapperContext guildId={guildId}>
        <MentionChannelList
          guildId={guildId}
          filter={search}
          onUpdateResultCount={updateResultCount}
          onSelect={data => {
            setSearch(undefined)
            editor.selectReplacement()
            RichTextEditorUtils.insertChannel(editor, data)
          }}
          onClose={() => setSearch(undefined)}
        />
      </WrapperContext>
    ),
    options
  )
}
