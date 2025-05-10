import { TextMentionSign } from 'fb-components/rich_text/types.ts'
import RichTextEditorUtils from 'fb-components/rich_text_editor/RichTextEditorUtils'
import { UseSearchFeatureOptions, UseSearchFeatureResult, useSearchFeature } from 'fb-components/rich_text_editor/hooks/useSearchFeature'
import { SearchEditor } from 'fb-components/rich_text_editor/plugins/withSearch'
import { RoleStruct } from 'fb-components/struct/GuildStruct.ts'
import { isString } from 'lodash-es'
import GuildUtils from '../../../features/guild_list/GuildUtils.tsx'
import { ChannelPermission, PermissionService } from '../../../services/PermissionService.ts'
import { UserHelper } from '../../realtime_components/realtime_nickname/userSlice.ts'
import { WrapperContext } from '../WrapperContext.tsx'
import MentionUserList from '../mention/MentionUserList.tsx'

async function generateMention(data: string | RoleStruct, guildId?: string) {
  const id = isString(data) ? data : data.role_id

  if (isString(data)) {
    const name = await UserHelper.getName(id, guildId)
    return {
      id,
      name,
      sign: TextMentionSign.User,
    }
  } else {
    return {
      id,
      name: data.name,
      color: data.color,
      sign: TextMentionSign.Role,
    }
  }
}

/**
 * 与 `withSearch` 配合使用，用于支持 @ 搜索
 *
 * @param editor
 * @param guildId
 * @param options
 * @param options.channelId 频道 ID，用于判断是否有权限 @，如果不传则不判断权限
 * @param options.enabledMentionAll 是否启用 @ 全体成员
 * @param options.enabledPossibleMention 是否启用 @ 可能的成员
 * @param options.enabledMentionRoles 是否启用 @ 角色
 * @returns
 */
export function useSearchMention(
  editor: SearchEditor,
  guildId: string,
  options?: UseSearchFeatureOptions & {
    channelId?: string
    enabledMentionAll?: boolean
    enabledPossibleMention?: boolean
    enabledMentionRoles?: boolean
    onInsertMention?: (data: { userId: string; displayName: string }) => void
  }
): UseSearchFeatureResult {
  const { enabledMentionAll, enabledPossibleMention, enabledMentionRoles, ..._options } = options ?? {}
  return useSearchFeature(
    editor,
    (search, setSearch, updateResultCount) => (
      <WrapperContext guildId={guildId} channelId={options?.channelId}>
        <MentionUserList
          guildId={guildId}
          filter={search}
          onClose={() => {
            setSearch(undefined)
          }}
          onSelect={data => {
            setSearch(undefined)
            editor.selectReplacement()
            // 如果有传入 guildId，通过 guildId 获取 guild，否则获取当前 guild
            const guild = guildId ? GuildUtils.getGuildById(guildId) : GuildUtils.getCurrentGuild()

            // 机器人不属于频道，而是属于社区，不要去判断权限。 并且只要能搜到就在社区中
            if (isString(data) && UserHelper.getUserLocally(data)?.bot) {
              generateMention(data, guild?.guild_id).then(data => {
                RichTextEditorUtils.insertMention(editor, data)
                options?.onInsertMention?.({ userId: data.id, displayName: data.name })
              })
              return
            }

            // 私信不需要计算权限
            if (
              options?.channelId &&
              isString(data) &&
              guild &&
              !PermissionService.computeChannelPermissions(guild, options.channelId, data).has(ChannelPermission.ViewChannel)
            ) {
              UserHelper.getName(data, guild?.guild_id).then(name => {
                RichTextEditorUtils.insertArbitrary(editor, `@${name} `)
              })
            } else {
              generateMention(data, guild?.guild_id).then(data => {
                RichTextEditorUtils.insertMention(editor, data)
                options?.onInsertMention?.({ userId: data.id, displayName: data.name })
              })
            }
          }}
          onUpdateResultCount={updateResultCount}
          enabledMentionAll={enabledMentionAll}
          enabledPossibleMention={enabledPossibleMention}
          enabledMentionRoles={enabledMentionRoles}
        />
      </WrapperContext>
    ),
    _options
  )
}
