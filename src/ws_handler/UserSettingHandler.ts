import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { isArray } from 'lodash-es'
import { store } from '../app/store'
import GuildUtils from '../features/guild_list/GuildUtils'
import { guildListActions } from '../features/guild_list/guildListSlice'
import { updateSetting } from '../features/local_user/localUserSlice'
import { GuildFolder, UserSettingStruct } from '../features/user_center/SettingAPI'
import { handleUpdate } from './utils'

export function handlerUserSetting({ data }: { data: UserSettingStruct }) {
  store.dispatch(updateSetting(handleUpdate<UserSettingStruct>(data)))
  const guildFolderData = data.guild_folders
  // 社区顺序
  if (guildFolderData) {
    let guildFolders: GuildFolder[] | undefined = undefined
    if (typeof guildFolderData == 'string') {
      guildFolders = safeJSONParse(guildFolderData, [] as GuildFolder[])
    } else if (isArray(guildFolderData)) {
      guildFolders = guildFolderData as GuildFolder[]
    }
    if (!guildFolders) return
    const guildIds = guildFolders.map(e => e.guild_ids[0])
    const newGuilds: GuildStruct[] = []
    guildIds.forEach(guildId => {
      const guild = GuildUtils.getGuildById(guildId)
      if (guild) {
        newGuilds.push(guild)
      }
    })
    store.dispatch(guildListActions.updateList(newGuilds))
  }
}
