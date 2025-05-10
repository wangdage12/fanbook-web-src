import { Portal } from 'fb-components/components/Portal'
import { ReactNode, useEffect } from 'react'
import { useAppSelector } from '../../app/hooks'
import { UserStatus, localUserStatus } from '../local_user/localUserSlice'
import { NetworkStatus, networkSelectors, networkWsInit } from './netWorkSlice'

export function NetWorkStatusWrapper({ children }: { children: ReactNode }) {
  const networkStatus = useAppSelector(networkSelectors.networkStatus)
  const wsStatus = useAppSelector(networkSelectors.wsStatus)
  useEffect(() => {
    const clear = networkWsInit()
    return () => {
      clear()
    }
  }, [])

  const loginState = useAppSelector(localUserStatus)

  return (
    <>
      {children}
      {networkStatus === NetworkStatus.Offline || wsStatus !== NetworkStatus.Online ?
        <Portal key="network-bar">
          <div className="z-999 pointer-events-none fixed left-0 top-0 flex h-[32px] w-full select-none items-center justify-center text-[12px] text-[var(--fg-b95)]">
            <div className="flex items-center gap-[4px]">
              {networkStatus === NetworkStatus.Offline ?
                <>
                  <iconpark-icon name="NetWork" class="text-[var(--function-red-1)]"></iconpark-icon>网络异常，请检查网络
                </>
              : wsStatus !== NetworkStatus.Online && loginState !== UserStatus.NotLoggedIn ?
                <>
                  <iconpark-icon name="NetWork" class="text-[var(--fg-b40)]"></iconpark-icon>连接中...
                </>
              : null}
            </div>
          </div>
        </Portal>
      : null}
    </>
  )
}
