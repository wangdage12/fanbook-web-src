import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { isEmpty } from 'lodash-es'
import { RootState, store } from '../../app/store'
import { RemarkStruct, UserAPI } from '../../components/realtime_components/realtime_nickname/UserAPI'

interface RemarkState {
  list: Map<string, string>
}

const initialState: RemarkState = {
  list: new Map(),
}

export const getRemarkList = createAsyncThunk('remark/getRemarkList', async ({ userId }: { userId: string }) => {
  return UserAPI.fetchRemarkList(userId)
})

export const remarkFriend = createAsyncThunk(
  'remark/remarkFriend',
  async ({
    userId,
    friendId,
    name,
    description,
  }: {
    userId: string
    friendId: string
    name: string
    description?: string
  }): Promise<RemarkStruct> => {
    await UserAPI.remarkFriend(userId, friendId, name, description)
    return { friend_user_id: friendId, name, user_remark_id: userId }
  }
)

const remarkSlice = createSlice({
  name: 'remark',
  initialState,
  reducers: {
    updateRemark: (state, { payload }: { payload: RemarkStruct }) => {
      if (isEmpty(payload.name)) {
        state.list.delete(payload.friend_user_id)
        return
      }
      state.list.set(payload.friend_user_id, payload.name)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getRemarkList.fulfilled, (state, { payload }) => {
        state.list = new Map(payload.map(item => [item.friend_user_id, item.name]))
      })
      .addCase(remarkFriend.fulfilled, (state, { payload }) => {
        remarkSlice.caseReducers.updateRemark(state, { payload })
      })
  },
})

export default remarkSlice.reducer

// selectors
export const remarkSelectors = {
  remark:
    (userId?: string) =>
    (state: RootState): string | undefined =>
      userId ? state.remarks.list.get(userId) : undefined,
  remarkList: (state: RootState): Record<string, string> => Object.fromEntries(state.remarks.list.entries()),
}

export const remarkActions = remarkSlice.actions

export class RemarkHelper {
  static getRemark(userId: string): string | undefined {
    return remarkSelectors.remark(userId)(store.getState())
  }
}
