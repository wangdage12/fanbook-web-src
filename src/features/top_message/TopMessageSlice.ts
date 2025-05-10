import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TopMessageStruct } from 'fb-components/components/messages/types'
import { RootState } from '../../app/store'
import { WsAction } from '../../base_services/ws'

type TopMessageState = Record<string, TopMessageStruct>

const initialState: TopMessageState = {}
const topMessageSlice = createSlice({
  name: 'message/top',
  initialState,
  reducers: {
    setTop(state, { payload }: PayloadAction<TopMessageStruct>) {
      state[payload.channel_id] = { ...payload, hide: state[payload.channel_id]?.hide }
    },
    toggleTop(state, { payload }: PayloadAction<TopMessageStruct>) {
      const newState = { ...state }
      if (payload.action === WsAction.UnTop) {
        delete newState[payload.channel_id]
      } else {
        newState[payload.channel_id] = payload
      }
      return newState
    },
    hideTopMessage(state, { payload: channelId }: PayloadAction<string>) {
      state[channelId] = { ...state[channelId], hide: true }
    },
  },
})

export default topMessageSlice.reducer

export const topMessageActions = topMessageSlice.actions

export const topMessageSelectors = {
  topMessage:
    (channelId: string) =>
    (state: RootState): TopMessageStruct | undefined =>
      state.topMessage[channelId],
}
