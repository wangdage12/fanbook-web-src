import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { FriendInfo, applyUnreadCount, getFriendList, updateUnreadTime } from '../../components/user_card/RelationAPI'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'

export interface ContactState {
  unread: number
  friends: Record<string, FriendInfo>
}

const initialState: ContactState = {
  unread: 0,
  friends: {},
}

export const friendListAsync = createAsyncThunk('contact/friendList', async () => {
  return await getFriendList(LocalUserInfo.userId)
})

export const applyUnreadAsync = createAsyncThunk('contact/totalUnread', async () => {
  return await applyUnreadCount()
})

export const updateUnreadTimeAsync = createAsyncThunk('contact/updateUnreadTime', async () => {
  await updateUnreadTime()
})

export const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    unreadReduced(state) {
      state.unread = Math.max(0, state.unread - 1)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(applyUnreadAsync.fulfilled, (state, action) => {
        state.unread = action.payload
      })
      .addCase(updateUnreadTimeAsync.fulfilled, state => {
        state.unread = 0
      })
      .addCase(friendListAsync.fulfilled, (state, action) => {
        state.friends = action.payload.reduce<Record<string, FriendInfo>>((list, item) => {
          list[item.user_id] = item
          return list
        }, {})
      })
  },
})

export const { unreadReduced } = contactSlice.actions

export const unread = (state: RootState) => state.contact.unread
export const friendList = (state: RootState) => state.contact.friends

export default contactSlice.reducer
