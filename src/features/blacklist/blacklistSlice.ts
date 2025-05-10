import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState, store } from '../../app/store'
import { UserAPI } from '../../components/realtime_components/realtime_nickname/UserAPI'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'

interface BlacklistState {
  list: Set<string>
}

const initialState: BlacklistState = {
  list: new Set(),
}

export const getBlackList = createAsyncThunk('blacklist/getBlacklist', async ({ userId }: { userId: string }) => {
  return UserAPI.getBlackList(userId)
})

export const addBlacklist = createAsyncThunk(
  'blacklist/add',
  async ({ userId, friendId }: { userId: string; friendId: string }): Promise<{ friendId: string }> => {
    await UserAPI.addToBlackList(userId, friendId)
    return { friendId }
  }
)

export const removeBlacklist = createAsyncThunk(
  'blacklist/remove',
  async ({ userId, friendId }: { userId: string; friendId: string }): Promise<{ friendId: string }> => {
    await UserAPI.removeFromBlackList(userId, friendId)
    return { friendId }
  }
)

const blacklistSlice = createSlice({
  name: 'blacklist',
  initialState,
  reducers: {
    addBlacklist: (state, { payload }: { payload: { friendId: string } }) => {
      state.list.add(payload.friendId)
    },
    removeBlacklist: (state, { payload }: { payload: { friendId: string } }) => {
      state.list.delete(payload.friendId)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getBlackList.fulfilled, (state, { payload }) => {
        state.list = new Set(payload.map(item => item.black_id))
      })
      .addCase(addBlacklist.fulfilled, (state, { payload }) => {
        blacklistSlice.caseReducers.addBlacklist(state, { payload })
      })
      .addCase(removeBlacklist.fulfilled, (state, { payload }) => {
        blacklistSlice.caseReducers.removeBlacklist(state, { payload })
      })
  },
})

export default blacklistSlice.reducer

// selectors
export const blacklist = (state: RootState): string[] => Array.from(state.blacklist.list)

export const isBlacklist =
  (userId: string) =>
  (state: RootState): boolean =>
    state.blacklist.list.has(userId)

export function handleBlackDel({ data }: { data: { user_id: string; black_id: string } }) {
  if (data.user_id === LocalUserInfo.userId) {
    store.dispatch(blacklistSlice.actions.removeBlacklist({ friendId: data.black_id }))
  }
}

export function handleBlackAdd({ data }: { data: { user_id: string; black_id: string } }) {
  if (data.user_id === LocalUserInfo.userId) {
    store.dispatch(blacklistSlice.actions.addBlacklist({ friendId: data.black_id }))
  }
}
