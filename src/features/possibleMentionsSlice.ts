import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove } from 'lodash-es'
import { RootState } from '../app/store.ts'

type PossibleMentionsState = Record<string, string[]>

const QUEUE_MAX_SIZE = 5
const possibleMentionsSlice = createSlice({
  name: 'possibleMentions',
  initialState: {} as PossibleMentionsState,
  reducers: {
    /**
     * 往队列中追加一个可能的提及，如果队列中已经存在，则将其移动到队列的末尾，队列最多不超过 QUEUE_MAX_SIZE 个元素
     */
    append(state, action: PayloadAction<{ guild: string; user: string }>) {
      const { guild, user } = action.payload
      const guildMentions = state[guild] ?? []
      remove(guildMentions, e => e === user)
      guildMentions.push(user)
      if (guildMentions.length > QUEUE_MAX_SIZE) {
        guildMentions.shift()
      }
      state[guild] = guildMentions
    },
  },
})

export default possibleMentionsSlice.reducer
export const possibleMentionsActions = possibleMentionsSlice.actions
export const possibleMentionsSelectors = {
  getPossibleMentions:
    (guild?: string) =>
    (state: RootState): string[] =>
      guild ? state.possibleMentions[guild] ?? [] : [],
}
