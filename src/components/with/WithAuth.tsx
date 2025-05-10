import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import LocalUserInfo from '../../features/local_user/LocalUserInfo'
import { LocalUser, UserStatus, localUserStatus, updateLocalUser } from '../../features/local_user/localUserSlice'
import { getDecryptedCookie } from '../../utils/cookie'

interface WithAuthProps {
  children: React.ReactNode
}

export default function WithAuth({ children }: WithAuthProps) {
  const dispatch = useAppDispatch()
  const userStatus = useAppSelector(localUserStatus)
  const location = useLocation()

  let user: LocalUser
  const checkUserStatus = () => {
    try {
      const userStr = getDecryptedCookie('user')
      if (!userStr) {
        dispatch(updateLocalUser({ login: UserStatus.NotLoggedIn }))
        return
      }
      user = JSON.parse(userStr)
      LocalUserInfo.userId = user.user_id
      if (!user.nickname || !user.gender) {
        dispatch(updateLocalUser({ login: UserStatus.RegisterIncomplete, userInfo: user }))
      } else {
        dispatch(updateLocalUser({ login: UserStatus.LoggedIn, userInfo: user }))
      }
    } catch (e) {
      console.log('checkUserStatus error', e)
      dispatch(updateLocalUser({ login: UserStatus.NotLoggedIn }))
    }
  }
  useEffect(() => {
    checkUserStatus()
  }, [])
  if (userStatus === undefined) return null
  if (userStatus === UserStatus.NotLoggedIn) {
    // 未登录，重定向到登录页面
    const searchParams = new URLSearchParams()
    searchParams.append('redirectUrl', location.pathname + location.search)
    const target = `${AppRoutes.LOGIN}?${searchParams.toString()}`

    return <Navigate to={target} replace={true} />
  }
  if (userStatus === UserStatus.RegisterIncomplete) {
    if (location.pathname === AppRoutes.MODIFY_INFO) {
      return children
    }
    const searchParams = new URLSearchParams()
    searchParams.append('redirectUrl', location.pathname + location.search)
    const target = `${AppRoutes.MODIFY_INFO}?${searchParams.toString()}`
    return <Navigate to={target} replace={true} />
  }

  return children
}
