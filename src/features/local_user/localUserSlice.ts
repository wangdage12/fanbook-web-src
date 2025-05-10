import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { setSentryScope } from '../../base_services/sentry/sentry'
import { deleteCookie, setEncryptedCookie } from '../../utils/cookie'
import { login, LoginType, refreshToken } from '../login/loginAPI'
import SettingAPI, { UserSettingStruct } from '../user_center/SettingAPI'
import LocalUserInfo from './LocalUserInfo.ts'

export enum Gender {
  Unknown,
  Male,
  FeMale,
}

export enum UserStatus {
  NotLoggedIn,
  RegisterIncomplete,
  LoggedIn,
}

export interface LocalUserState {
  userInfo?: LocalUser
  setting?: UserSettingStruct
  login?: UserStatus
}

export interface LocalUser {
  // 未注册完成的用户才有的字段
  pre_data?: LocalUser
  user_id: string
  avatar: string
  avatar_nft?: string
  username: string
  mobile: string
  encryption_mobile: string
  joined_at: number
  gender?: Gender
  nickname: string
  ban_type: number
  level: number
  area_code: number
  expire_time: number
  sign: string
}

const initialState: LocalUserState = {
  userInfo: undefined,
  setting: undefined,
  login: undefined,
}

export type LogArgs =
  | {
      mobile: string
      areaCode: string
      captcha: string
      type: LoginType.mobile
    }
  | {
      type: LoginType.token
      token: string
    }

export const loginAsync = createAsyncThunk('localUser/login', async (args: LogArgs) => {
  const res = await login(args)
  return {
    ...res,
    mobile: 'mobile' in args ? args.mobile : '',
  }
})

export const refreshTokenAsync = createAsyncThunk('localUser/refresh', async () => await refreshToken())

export const getSettingAsync = createAsyncThunk('localUser/getSetting', async () => {
  return SettingAPI.getUserSetting()
})

export const localUserSlice = createSlice({
  name: 'localUser',
  initialState,
  reducers: {
    updateLocalUser: (state, { payload: { userInfo, login } }: PayloadAction<LocalUserState>) => {
      login != undefined && (state.login = login)
      if (userInfo) {
        state.userInfo = userInfo
        if (userInfo.user_id) {
          // 给 sentry 注入登陆人员信息
          setSentryScope({ id: userInfo.user_id, username: userInfo.username })
        }
      }
    },
    updateSetting: (state, { payload }: PayloadAction<Partial<UserSettingStruct>>) => {
      state.setting = { ...state.setting, ...payload } as UserSettingStruct
    },
    logout: state => {
      state.login = UserStatus.NotLoggedIn
      state.userInfo = undefined
      LocalUserInfo.userId = undefined as never
      setSentryScope(null)
      deleteCookie('user')
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginAsync.fulfilled, (state, action) => {
        const user = action.payload

        state.login = !user.nickname || !user.gender ? UserStatus.RegisterIncomplete : UserStatus.LoggedIn
        state.userInfo = action.payload
        LocalUserInfo.userId = user.user_id
        setEncryptedCookie('user', JSON.stringify(state.userInfo), { expires: 30 })
      })
      .addCase(getSettingAsync.fulfilled, (state, action) => {
        state.setting = action.payload
      })
      .addCase(refreshTokenAsync.fulfilled, (state, { payload }) => {
        const user = state.userInfo
        if (!payload || !user) {
          return
        }
        state.userInfo = { ...user, ...payload }
        setEncryptedCookie('user', JSON.stringify(state.userInfo), { expires: 30 })
      })
  },
})

export const { updateLocalUser, updateSetting, logout } = localUserSlice.actions

export const localUserInfo = (state: RootState) => state.localUser.userInfo
export const localUserStatus = (state: RootState) => state.localUser.login
export const localUserSetting = (state: RootState) => state.localUser.setting

export default localUserSlice.reducer

export const settingSelectors = {
  channelMute: (channelId: string) => (state: RootState) => {
    const setting = state.localUser.setting
    if (!setting) return false
    return !!setting.mute?.channel?.includes(channelId)
  },
}
