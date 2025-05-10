import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { get } from 'lodash-es'
import { RootState, store } from '../../../app/store'
import { guildUserActions } from '../../../features/role/guildUserSlice'
import { UserAPI, UserStruct } from './UserAPI'

export interface UserState {
  [userId: string]: UserStruct
}

const initialState: UserState = {}

export const getUserFromNet = createAsyncThunk('user/getUser', async ({ guildId, userId }: { guildId?: string; userId: string }) => {
  return UserAPI.fetchGuildUser(userId, guildId)
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    update: (state, { payload }: { payload: Partial<UserStruct> }) => {
      if (payload.user_id) {
        state[payload.user_id] = { ...state[payload.user_id], ...payload }
      }
    },
    updateUsers: (state, { payload }: { payload: Partial<UserStruct>[] }) => {
      for (const user of payload) {
        console.assert(user.user_id, 'user_id is null')
        if (user.user_id) {
          state[user.user_id] = { ...state[user.user_id], ...user }
        }
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(getUserFromNet.fulfilled, (state, { payload }) => {
      userSlice.caseReducers.update(state, { payload })
    })
  },
})

export const userActions = userSlice.actions

export default userSlice.reducer

// selectors
export const selectUser =
  (userId?: string) =>
  (state: RootState): UserStruct | undefined =>
    userId ? state.users[userId] : undefined
export const selectUsers = (userIds: string[]) => (state: RootState) =>
  userIds.reduce<Record<string, UserStruct>>((result, userId) => {
    result[userId] = state.users[userId]
    return result
  }, {})

// actions

export class UserHelper {
  static getUserLocally(userId: string): UserStruct | undefined {
    return store.getState().users[userId]
  }

  static async getUser(userId: string, guildId?: string, options?: { fetchServer?: boolean }): Promise<UserStruct> {
    let user = store.getState().users[userId]
    if (user && !options?.fetchServer) return user

    const request = get(UserAPI.fetchGuildUserBuffer, [guildId ?? '', userId])
    if (request && request.promise != null) return request.promise

    const result = store.dispatch(getUserFromNet({ guildId, userId }))
    user = await result.unwrap()

    if (guildId && user.role_ids)
      store.dispatch(
        guildUserActions.update({
          guildId: guildId,
          userId,
          user: {
            roles: user.role_ids,
            nickname: user.gnick,
          },
        })
      )

    return user
  }

  // 异步获取用户名（优先级 1、备注 2、社区昵称 3、用户昵称）
  static async getName(userId: string, guildId?: string): Promise<string> {
    const other = UserHelper.getAliasName(userId, guildId)
    if (other) {
      return other
    }
    const user = await UserHelper.getUser(userId, guildId)
    return user.nickname
  }

  // 同步获取用户别名（优先级 1、备注 2、社区昵称）
  static getAliasName<T extends string | undefined>(userId: string, guildId?: string, nickname?: T): AliasNameReturnType<T> {
    // 函数实现

    const remark = store.getState().remarks.list.get(userId)
    if (remark) return remark

    const guildNickname = store.getState().guildUsers[guildId ?? '']?.[userId]?.nickname
    if (guildNickname) return guildNickname

    return nickname as AliasNameReturnType<T>
  }
}

type AliasNameReturnType<T extends string | undefined> = T extends string ? string : string | undefined
