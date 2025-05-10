import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DraftContent = any
type DraftSliceState = Record<string, DraftContent>

const initialState: DraftSliceState = {}

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    setDraft(state, action: PayloadAction<{ key: string; content: DraftContent }>) {
      const { key, content } = action.payload
      state[key] = content
    },
  },
})

export default draftSlice.reducer

export const draftActions = draftSlice.actions
export const draftSelectors = {
  getDraft: (key?: string) => (state: RootState) => (key ? state.draft[key] : undefined),
}
