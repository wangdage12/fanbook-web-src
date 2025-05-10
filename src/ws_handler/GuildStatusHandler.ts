import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { store } from '../app/store'
import { guildListActions } from '../features/guild_list/guildListSlice'

export function handlerGuildStatus({ data }: { data: Partial<GuildStruct> }) {
  store.dispatch(guildListActions.mergeGuild(data))
}
