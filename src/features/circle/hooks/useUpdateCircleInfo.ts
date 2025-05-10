import { CircleChannelStruct } from 'fb-components/circle/types'
import { isEqual } from 'lodash-es'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { handleCircleUpdate } from '../../guild_list/guildListSlice'
import { circleActions, circleSelectors } from '../circleSlice'

export function useUpdateCircleInfo({ guildId, channelId }: { guildId?: string; channelId?: string }) {
  const loading = useAppSelector(circleSelectors.infoLoading)
  const info = useAppSelector(circleSelectors.info, isEqual)
  const channel = useAppSelector(circleSelectors.channel, isEqual)
  const [isInitial, setIsInitial] = useState(true)
  const dispatch = useAppDispatch()

  const loadingRef = useRef(loading)
  const guildIdRef = useRef(guildId)
  const channelIdRef = useRef(channelId)

  function getCircleInfo() {
    guildIdRef.current &&
      channelIdRef.current &&
      dispatch(
        circleActions.fetchCircleInfo({
          guildId: guildIdRef.current,
          channelId: channelIdRef.current,
        })
      ).then(res => {
        handleCircleUpdate({ data: (res.payload as any)?.channel as CircleChannelStruct })
      })
  }

  useEffect(() => {
    if (loadingRef.current && guildIdRef.current === guildId && channelIdRef.current === channelId) {
      return
    }
    guildIdRef.current = guildId
    channelIdRef.current = channelId
    getCircleInfo()
  }, [guildId, channelId])

  useEffect(() => {
    loadingRef.current = loading
    if (!loading) {
      setIsInitial(false)
    }
  }, [loading])

  return {
    loading,
    isInitial,
    info,
    channel,
    refresh: getCircleInfo,
  }
}
