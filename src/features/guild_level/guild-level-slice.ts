import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState, store } from '../../app/store'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { GuildLevelConfigData, GuildLevelData, getLevel } from './guild-list-api'

interface GuildListState {
  list: Map<string, GuildLevelData>
  config: GuildLevelConfigData
}

const initialState: GuildListState = {
  list: new Map<string, GuildLevelData>(),
  config: [],
}

export const getGuildLevel = createAsyncThunk('guild/level/getGuildLevel', async (guildIds: string[]) => {
  return getLevel(guildIds)
})

export const guildLevelSlice = createSlice({
  name: 'guild/level',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getGuildLevel.fulfilled, (state, { payload }) => {
      for (const item of payload.guild_list ?? []) {
        state.list.set(item.guild_id, item)
      }
      state.config = payload.config
    })
  },
})

export default guildLevelSlice.reducer

// selectors
export const guildLevelSelectors = {
  guildLevelInfoByGuildId: (guildId?: string) => (state: RootState) => (guildId ? state.guildLevel.list.get(guildId) : undefined),
  guildLevelConfig: (state: RootState) => state.guildLevel.config,
}

export class GuildLevelHelper {
  static getLevel(guildId: string) {
    if (VerificationStatus.officialVerified(guildId)) return Infinity

    const data = store.getState().guildLevel.list.get(guildId)
    return data?.hierarchy ?? 0
  }

  // 计算服务器助力进度
  static computePercent(guildId: string): number {
    const levelConfig = store.getState().guildLevel.config
    const guildLevel = store.getState().guildLevel.list.get(guildId)
    if (!guildLevel) return 0
    const currentLevelIdx = levelConfig.findLastIndex(e => e <= guildLevel.points)
    const currentLevelPoints = levelConfig[currentLevelIdx]
    let nextLevelPoints = Infinity
    if (currentLevelIdx != levelConfig.length - 1) {
      nextLevelPoints = levelConfig[currentLevelIdx + 1]
    }
    if (nextLevelPoints == Infinity) return 100
    if (nextLevelPoints - guildLevel.points == nextLevelPoints - currentLevelPoints) return 0
    return ((nextLevelPoints - guildLevel.points) / (nextLevelPoints - currentLevelPoints)) * 100
  }
}

/**
 * 社区认证状态工具类
 */
export class VerificationStatus {
  static UserVerified = 1
  static OfficialVerified = 2
  static OfficialPartner = 4

  /**
   * 社区是否经过官方认证
   */
  static officialVerified(guildId: string) {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return false
    return !!(guild.authenticate & (VerificationStatus.OfficialVerified | VerificationStatus.OfficialPartner))
  }
}
