import { isEqual } from 'lodash-es'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import ServerTime from './base_services/ServerTime'
import Ws, { WsAction } from './base_services/ws'
import { localUserInfo, refreshTokenAsync } from './features/local_user/localUserSlice'

export default function FBServiceLayer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(localUserInfo, isEqual)
  function checkTokenTime() {
    // 如果过期时间少于 15 天 进行换签
    if (userInfo && userInfo.expire_time - 1296000 < ServerTime.now()) {
      dispatch(refreshTokenAsync())
    }
  }

  useEffect(() => {
    Ws.instance.addListener(WsAction.Pong, checkTokenTime)
    return () => {
      Ws.instance.removeListener(WsAction.Pong, checkTokenTime)
    }
  }, [checkTokenTime])
  return children
}
