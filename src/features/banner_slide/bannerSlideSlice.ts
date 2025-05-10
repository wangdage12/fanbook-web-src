import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GuildPosterStruct } from 'fb-components/struct/GuildStruct.ts'
import { RootState } from '../../app/store'
import GuildAPI from '../guild_container/guildAPI.ts'

export enum BannerSlideType {
  // 使用中
  Active = '1',
  // 历史记录
  History = '2',
}

type BannerSlideState = Record<string, GuildPosterStruct[]>

const initialState: BannerSlideState = {}

export const fetchBannerSlideData = createAsyncThunk('guild/bannerSlide', async (guildId: string) => {
  return GuildAPI.getBannerList(guildId)
})

const bannerSlideSlice = createSlice({
  name: 'bannerSlide',
  initialState,
  reducers: {
    update(
      state,
      {
        payload,
      }: PayloadAction<{
        guildId: string
        bannerList: GuildPosterStruct[]
      }>
    ) {
      const { guildId, bannerList } = payload
      state[guildId] = bannerList
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBannerSlideData.fulfilled, (state, { meta: { arg: guildId }, payload }) => {
      bannerSlideSlice.caseReducers.update(state, { type: 'guild/bannerSlide', payload: { guildId, bannerList: payload } })
    })
  },
})

export default bannerSlideSlice.reducer
export const bannerSlideActions = bannerSlideSlice.actions

export const bannerSlideSelector =
  (guildId: string) =>
  (state: RootState): GuildPosterStruct[] | undefined =>
    state.bannerSlide[guildId]
