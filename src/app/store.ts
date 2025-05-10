import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { getLocalForageInstance, getVersion } from 'fb-components/utils/localStore'
import { enableMapSet } from 'immer'
import { createTransform, persistReducer, persistStore } from 'redux-persist'
import initSubscriber from 'redux-subscriber'
import userSlice from '../components/realtime_components/realtime_nickname/userSlice'
import audiovisualSlice from '../features/audiovisual/audiovisual-slice'
import bannerSlideSlice from '../features/banner_slide/bannerSlideSlice'
import blacklistSlice from '../features/blacklist/blacklistSlice'
import botSlice from '../features/bot/botSlice'
import circleSlice from '../features/circle/circleSlice'
import contactSlice from '../features/contact_list/contact-list-slice'
import dmSlice from '../features/dm/dmSlice'
import draftSlice from '../features/draft/draftSlice.ts'
import guildLevelSlice from '../features/guild_level/guild-level-slice'
import guildListSlice from '../features/guild_list/guildListSlice'
import latestMessageSlice from '../features/latest_message/latestMessageSlice'
import localUserSlice from '../features/local_user/localUserSlice'
import unreadSlice from '../features/message_list/unreadSlice'
import netWorkSlice from '../features/network/netWorkSlice.ts'
import possibleMentionsSlice from '../features/possibleMentionsSlice.ts'
import questionSlice from '../features/question/questionSlice.ts'
import remarkSlice from '../features/remark/remarkSlice'
import guildUserSlice from '../features/role/guildUserSlice'
import topMessageSlice from '../features/top_message/TopMessageSlice'
import JsonBigint from '../utils/JsonBigint.ts'

// https://github.com/reduxjs/redux-toolkit/issues/466
enableMapSet()

const jsonBigTransform = createTransform(
  (inboundState: Record<string, unknown>) => {
    return JsonBigint.stringify(inboundState) as string
  },
  (outboundState: string | Record<string, unknown>) => {
    return JsonBigint.parse(outboundState as string)
  }
)

const version = getVersion(import.meta.env.FANBOOK_VERSION)

const reducer = combineReducers({
  guild: persistReducer(
    {
      key: 'guild',
      storage: getLocalForageInstance({
        storeName: 'guild',
        version,
      }),
    },
    guildListSlice
  ),
  localUser: localUserSlice,
  unread: persistReducer(
    {
      key: 'unread',
      storage: getLocalForageInstance({
        storeName: 'unread',
        version,
      }),
    },
    unreadSlice
  ),
  topMessage: persistReducer(
    {
      key: 'topMessage',
      transforms: [jsonBigTransform],
      storage: getLocalForageInstance({
        storeName: 'topMessage',
        version,
      }),
    },
    topMessageSlice
  ),
  circle: circleSlice,
  users: userSlice,
  guildLevel: guildLevelSlice,
  guildUsers: persistReducer(
    {
      key: 'guildUsers',
      storage: getLocalForageInstance({
        storeName: 'guildUsers',
        version,
      }),
    },
    guildUserSlice
  ),
  audiovisual: audiovisualSlice,
  network: netWorkSlice,
  contact: contactSlice,
  blacklist: blacklistSlice,
  bannerSlide: bannerSlideSlice,
  remarks: remarkSlice,
  dm: dmSlice,
  latestMessages: persistReducer(
    {
      key: 'latestMessages',
      storage: getLocalForageInstance({
        storeName: 'latestMessages',
        version,
      }),
    },
    latestMessageSlice
  ),
  bot: botSlice,
  draft: persistReducer(
    {
      key: 'draft',
      storage: getLocalForageInstance({
        storeName: 'draft',
        version,
      }),
    },
    draftSlice
  ),
  possibleMentions: persistReducer(
    {
      key: 'possibleMentions',
      storage: getLocalForageInstance({
        storeName: 'possibleMentions',
        version,
      }),
    },
    possibleMentionsSlice
  ),
  question: questionSlice,
})

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    // 忽略 IM 消息序列化检查，因为它不会保存，需要它允许用一些特殊类型，IM 数据需要脱离 Redux，否则会让时间旅行失效
    getDefaultMiddleware({ serializableCheck: false }).concat(process.env.NODE_ENV !== 'production' ? [] : []),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)
initSubscriber(store)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
// export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
