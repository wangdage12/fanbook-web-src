import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState, store } from '../../app/store'
import Ws, { WsEvent } from '../../base_services/ws'

export enum NetworkStatus {
  Online = 'online',
  Offline = 'offline',
  Connecting = 'connecting',
}

export interface networkState {
  status: NetworkStatus
  wsStatus: NetworkStatus
}

const initialState: networkState = {
  status: NetworkStatus.Online,
  wsStatus: NetworkStatus.Online,
}

const networkState = createSlice({
  name: 'network',
  initialState,
  reducers: {
    updateStatus: (state: networkState, { payload }: PayloadAction<NetworkStatus>) => {
      state.status = payload
      return state
    },
    updateWsStatus: (state: networkState, { payload }: PayloadAction<NetworkStatus>) => {
      state.wsStatus = payload
      return state
    },
  },
})

export default networkState.reducer

export const networkActions = {
  ...networkState.actions,
}

export const networkSelectors = {
  networkStatus: (state: RootState) => state.network.status,
  wsStatus: (state: RootState) => state.network.wsStatus,
}

function updateNetworkStatus() {
  store.dispatch(networkActions.updateStatus(navigator.onLine ? NetworkStatus.Online : NetworkStatus.Offline))
}

function updateWsStatus() {
  Ws.instance.ws &&
    store.dispatch(
      networkActions.updateWsStatus(
        Ws.instance.ws?.readyState === WebSocket.CONNECTING ? NetworkStatus.Connecting
        : Ws.instance.ws?.readyState === WebSocket.OPEN ? NetworkStatus.Online
        : NetworkStatus.Offline
      )
    )
}

export function networkWsInit() {
  updateNetworkStatus()
  updateWsStatus()
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  Ws.instance.on(WsEvent.CONNECT, updateWsStatus)
  Ws.instance.on(WsEvent.CONNECTING, updateWsStatus)
  Ws.instance.on(WsEvent.DISCONNECT, updateWsStatus)
  return () => {
    window.removeEventListener('online', updateNetworkStatus)
    window.removeEventListener('offline', updateNetworkStatus)
    Ws.instance.off(WsEvent.CONNECT, updateWsStatus)
    Ws.instance.off(WsEvent.CONNECTING, updateWsStatus)
    Ws.instance.off(WsEvent.DISCONNECT, updateWsStatus)
  }
}
