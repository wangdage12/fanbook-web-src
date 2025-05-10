import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface AudiovisualState {
  connecting: boolean
  currentRoomInfo: {
    guildId: string
    channelId: string
    roomId: string
  }
  needConfirm: boolean
  nextRoomInfo: {
    guildId: string
    channelId: string
    roomId: string
  }
}

const initialState: AudiovisualState = {
  connecting: false,
  currentRoomInfo: {
    guildId: '',
    channelId: '',
    roomId: '',
  },
  needConfirm: false,
  nextRoomInfo: {
    guildId: '',
    channelId: '',
    roomId: '',
  },
}
export interface AudiovisualRoomState {
  guildId: string
  channelId: string
  roomId: string
}

export const audiovisualSlice = createSlice({
  name: 'audiovisual',
  initialState,
  reducers: {
    joinRoom: state => {
      state.connecting = true
      state.currentRoomInfo = state.nextRoomInfo
    },
    leaveRoom: state => {
      state.currentRoomInfo = {
        guildId: '',
        channelId: '',
        roomId: '',
      }
      state.connecting = false
    },
    switchRoom: state => {
      state.currentRoomInfo = state.nextRoomInfo
    },
    beforeConfirm: (state, action: PayloadAction<AudiovisualRoomState>) => {
      state.needConfirm = true
      state.nextRoomInfo = { ...action.payload }
    },
    afterConfirm: state => {
      state.nextRoomInfo = {
        guildId: '',
        channelId: '',
        roomId: '',
      }
      state.needConfirm = false
    },
  },
})

export const { joinRoom, leaveRoom, switchRoom, beforeConfirm, afterConfirm } = audiovisualSlice.actions

export const isRoomConnecting = (state: RootState) => state.audiovisual.connecting

export const needConfirm = (state: RootState) => state.audiovisual.needConfirm

export const currentRoomInfo = (state: RootState) => state.audiovisual.currentRoomInfo

export const nextRoomInfo = (state: RootState) => state.audiovisual.nextRoomInfo

export default audiovisualSlice.reducer
