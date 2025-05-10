import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState, store } from '../../app/store'

export interface LatestMessageStruct {
  reactions: Record<string, number>
  desc: string
  messageId: string
  timestamp: number
}

type LatestMessageState = Record<string, LatestMessageStruct>

const initialState: LatestMessageState = {}

const latestMessageSlice = createSlice({
  name: 'latestMessage',
  initialState,
  reducers: {
    update(
      state,
      {
        payload,
      }: PayloadAction<
        Partial<LatestMessageStruct> & {
          channelId: string
          messageId: string | bigint
        }
      >
    ) {
      const mid = BigInt(payload.messageId)
      if (mid < BigInt(state[payload.channelId]?.messageId ?? 0)) return

      const { channelId, ...rest } = payload
      state[channelId] = { ...state[channelId], ...rest }
    },
    batchUpdate(state, action: PayloadAction<Array<LatestMessageStruct & { channelId: string }>>) {
      action.payload.forEach(message => {
        if (BigInt(message.messageId) < BigInt(state[message.channelId]?.messageId ?? 0)) return

        const { channelId, ...rest } = message
        state[channelId] = rest
      })
    },
  },
})

export default latestMessageSlice.reducer
export const latestMessageActions = latestMessageSlice.actions

export const latestMessageSelectors = {
  byChannelId:
    (channelId?: string) =>
    (state: RootState): LatestMessageStruct | undefined =>
      channelId ? state.latestMessages[channelId] : undefined,
}

export class LatestMessageHelper {
  static getLatestMessage(channelId: string) {
    return latestMessageSelectors.byChannelId(channelId)(store.getState())
  }
}
