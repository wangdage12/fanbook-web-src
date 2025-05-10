import AppRoutes from '@/app/AppRoutes'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import Ws, { WsAction } from '@/base_services/ws'
import Loading from '@/components/loading/Loading'
import { BehaviorParams, behaviorSubject } from '@/components/with/routeCheck.tsx'
import { reportLogin } from '@/event_tracker/SessionReporter.ts'
import { initServerSideConfigService } from '@/services/ServeSideConfigService.ts'
import WsHandler from '@/ws_handler/WsHandler'
import React, { useEffect } from 'react'
import { Outlet, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AudiovisualWrapper from '../audiovisual/AudiovisualWrapper'
import { getBlackList } from '../blacklist/blacklistSlice'
import { friendListAsync } from '../contact_list/contact-list-slice'
import { dmActions } from '../dm/dmSlice'
import { GuildList } from '../guild_list/GuildList'
import { guildListActions, guildListSelectors } from '../guild_list/guildListSlice'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { getSettingAsync } from '../local_user/localUserSlice'
import { getRemarkList } from '../remark/remarkSlice'
import { handleHomeBusiness } from './HomeBusinessHandler.ts'
import HomeHeader from './HomeHeader.tsx'
import { RootNavigate } from './RootNavigate'
import loadGuildList from './createGuildFetcher'
import './home.less'

const HomeScaffold: React.FC = () => {
  useEffect(() => {
    reportLogin()
  }, [])

  const location = useLocation()
  if ([AppRoutes.ROOT].includes(location.pathname)) {
    return <RootNavigate></RootNavigate>
  }

  return (
    <AudiovisualWrapper>
      <div className="flex h-screen w-screen flex-col bg-[var(--bg-bg-1)]">
        <HomeHeader />
        <div className="flex w-full flex-1 flex-row overflow-hidden">
          <div className={'h-full w-[68px] flex-shrink-0'}>
            <GuildList />
          </div>
          <Outlet />
          <RouteListener />
        </div>
      </div>
    </AudiovisualWrapper>
  )
}

const Home: React.FC = () => {
  const loading = useAppSelector(guildListSelectors.showLoading)
  const [_, setURLSearchParams] = useSearchParams()

  const dispatch = useAppDispatch()

  // 初始化
  useEffect(() => {
    function onConnected() {
      loadGuildList().then()
      dispatch(getRemarkList({ userId: LocalUserInfo.userId }))
      dispatch(dmActions.fetchDmList(0))
      dispatch(getBlackList({ userId: LocalUserInfo.userId }))
      dispatch(friendListAsync())
      dispatch(getSettingAsync())
    }

    initServerSideConfigService()

    Ws.instance.on(WsAction.Connect, onConnected)
    let removeListener: null | (() => void) = null
    let unmount = false
    Ws.instance.connect().then(() => {
      if (unmount) {
        return
      }
      removeListener = WsHandler.init()
    })
    return () => {
      unmount = true
      Ws.instance.off(WsAction.Connect, onConnected)
      removeListener?.()
    }
  }, [])

  const behaviorHandler = (value: BehaviorParams) => {
    behaviorSubject.start()
    handleHomeBusiness(value, (scene, fields) => {
      // 移除对应路由参数
      setURLSearchParams(URLSearchParams => {
        fields.forEach(e => URLSearchParams.delete(e))
        return URLSearchParams
      })
    }).finally(() => {
      behaviorSubject.stop()
    })
  }
  // 订阅
  useEffect(() => {
    behaviorSubject.subscribe(behaviorHandler)
    return () => {
      behaviorSubject.unsubscribe(behaviorHandler)
    }
  }, [])

  if (loading) return <Loading />
  return <HomeScaffold />
}

export default Home

/*
  使用useParams监听路由变化
  由于在Home使用useParams回刷新整个页面，为减小刷新范围移动到空组件内执行
 */
const RouteListener = (): React.ReactNode => {
  const dispatch = useAppDispatch()
  const { guildId, channelId } = useParams()
  dispatch(guildListActions.updateCurrentId({ guildId: guildId ?? '', channelId }))
  return null
}
