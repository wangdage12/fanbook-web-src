import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useAppSelector } from '../../app/hooks'
import { RootState, store } from '../../app/store'
import BotAPI, { BotStruct } from './BotAPI'

export interface BotState {
  [botId: string]: BotStruct
}

const initialState: BotState = {}

export const getBotFromNet = createAsyncThunk('bot/getBot', async (botId: string) => {
  return BotAPI.getBot(botId)
})

const botSlice = createSlice({
  name: 'bot',
  initialState,
  reducers: {
    updateBot: (state, { payload }: { payload: BotStruct }) => {
      state[payload.bot_id] = { ...state[payload.bot_id], ...payload }
    },
    updateBots: (state, { payload }: { payload: BotStruct[] }) => {
      for (const user of payload) {
        state[user.bot_id] = { ...state[user.bot_id], ...user }
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(getBotFromNet.fulfilled, (state, { payload }) => {
      botSlice.caseReducers.updateBot(state, { payload })
    })
  },
})

export const botActions = botSlice.actions

export default botSlice.reducer

// selectors
export const selectBot = (botId: string) => (state: RootState) => state.bot[botId]

export function useBot(botId: string): BotStruct | undefined {
  const bot = useAppSelector(selectBot(botId))
  if (!bot) {
    // 避免 React 出现错误，加上延迟
    setTimeout(() => {
      store.dispatch(getBotFromNet(botId))
    })
  }
  return bot
}
