import { useThrottle } from 'ahooks'
import { CircleContentStruct, CircleSortType } from 'fb-components/circle/types.ts'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import sleep from 'fb-components/utils/sleep.ts'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks.ts'
import { store } from '../../app/store.ts'
import placeholderUnpublishedLightImage from '../../assets/images/placeholder_unpublished_light.svg'
import { GlobalEvent, globalEmitter } from '../../base_services/event.ts'
import EmptyPage from '../../components/EmptyPage.tsx'
import { useLocationConsumer } from '../../components/with/WithLocation.tsx'
import { FetchConfig } from '../../hooks/useFetchState.ts'
import ChannelContainer, { ChannelContainerContext, ChannelContainerContextData } from '../home/ChannelContainer.tsx'
import { GuildContext } from '../home/GuildWrapper.tsx'
import { unreadActions } from '../message_list/unreadSlice.ts'
import { CircleUtils } from './CircleUtils.tsx'
import { CircleExtraInfo } from './circleEntity.ts'
import { circleActions } from './circleSlice.ts'
import CircleApi from './circle_api.ts'
import CircleHeader from './components/CircleHeader.tsx'
import { CircleCommonList, CircleSearchList } from './components/CircleList.tsx'
import { useUpdateCircleInfo } from './hooks/useUpdateCircleInfo.ts'
import { CircleTagList } from './tag/CircleTagList.tsx'

export function useGotoLatestWhenPostCreated(
  circleCommonListRef: React.RefObject<{
    refresh: () => void
  }>,
  setSortType: (value: ((prevState: CircleSortType) => CircleSortType) | CircleSortType) => void
) {
  useEffect(() => {
    function cb() {
      // 圈子发布成功后，需要跳转到最新 tab，如果当前是最新 tab，需要刷新
      // 这种做法会导致地址栏不更新，但是产品需求如此
      setSortType(sortType => {
        if (sortType === CircleSortType.Recommend) {
          return CircleSortType.Latest
        } else {
          circleCommonListRef.current?.refresh()
        }
        return sortType
      })
    }

    globalEmitter.on(GlobalEvent.CircleCreatedPost, cb)
    return () => {
      globalEmitter.off(GlobalEvent.CircleCreatedPost, cb)
    }
  })
}

function CircleWrapper() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const guild = useContext(GuildContext)
  const guild_id = guild?.guild_id
  const circleChannelId = guild?.circle.channel_id

  // 进圈子时更新圈子信息
  const {
    loading: circleInfoLoading,
    channel,
    info: circleInfo,
    isInitial,
  } = useUpdateCircleInfo({ guildId: guild?.guild_id, channelId: circleChannelId })
  const circleCommonListRef = useRef<{ refresh: () => void }>(null)

  const contextValue = useContext<ChannelContainerContextData<CircleExtraInfo> | undefined>(ChannelContainerContext)
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')
  const { extraInfo } = contextValue
  const throttledKeyword = useThrottle(extraInfo?.keyword ?? '', { wait: 500 })
  const [sortType, setSortType] = useState<CircleSortType>(CircleSortType.Recommend)
  const locationTrans = useLocationConsumer()
  const { top } = circleInfo ?? {}

  const pinedPostIds = useMemo(() => {
    const { records = [] } = top ?? {}
    return (records ?? []).map(record => record.post_id)
  }, [circleInfo])
  const handleTabClick = (sortType: string) => {
    setSearchParams(sortType && sortType !== circleChannelId ? { sort: sortType } : {})
    setSortType(sortType as CircleSortType)
  }

  useGotoLatestWhenPostCreated(circleCommonListRef, setSortType)

  useEffect(() => {
    const sortType = searchParams.get('sort') ?? undefined
    setSortType(sortType == CircleSortType.Latest ? CircleSortType.Latest : CircleSortType.Recommend)
  }, [locationTrans])

  // 清空未读
  useEffect(() => {
    if (!guild?.guild_id || !circleChannelId) {
      return
    }
    dispatch(
      unreadActions.clearUnread({
        guildId: guild.guild_id,
        channelId: circleChannelId,
        type: ChannelType.guildCircle,
      })
    )
  }, [guild?.guild_id, circleChannelId])

  const postFetchConfig: FetchConfig<
    CircleContentStruct,
    {
      list_id?: string
      hasMore: boolean
      topicId?: string
    }
  > = useMemo(() => {
    return {
      fetchData: async params => {
        await sleep(50)
        const { list_id } = params ?? {}
        if (!guild_id || !circleChannelId) {
          return {
            data: {},
            params: { hasMore: true },
          }
        }
        const result = await CircleApi.postList({
          guildId: guild_id,
          channelId: circleChannelId,
          topicId: circleChannelId,
          listId: list_id,
          size: 30,
          sortType: sortType ?? CircleSortType.Recommend,
        })
        const { records, list_id: fetchLastId, next } = result
        return {
          data: {
            records: records.map(item => {
              item.parse_post = CircleUtils.parseToCardContent(item.post)
              return item
            }),
          },
          params: {
            list_id: fetchLastId,
            hasMore: next == '1',
          },
        }
      },
    }
  }, [guild_id, circleChannelId, sortType])

  const postSearchFetchConfig = useMemo(() => {
    return async () => {
      if (!guild?.guild_id || !circleChannelId || !throttledKeyword) {
        return {
          tags: [],
          list: [] as CircleContentStruct[],
        }
      }
      const result = await CircleApi.search({
        guildId: guild.guild_id,
        keyword: throttledKeyword,
      })
      const { list, tags } = result
      return {
        list: list.map(item => {
          item.parse_post = CircleUtils.parseToCardContent(item.post)
          return item
        }),
        tags,
      }
    }
  }, [guild, circleChannelId, throttledKeyword])

  if (!guild) {
    return null
  }

  if (circleInfoLoading && isInitial)
    return (
      <div className={'w-full h-full flex-center'}>
        <CircularLoading></CircularLoading>
      </div>
    )
  return (
    <>
      <CircleHeader channel={channel} sortType={sortType} onTabClick={handleTabClick} />
      <CircleTagList className={`mx-4 mt-3 mb-1 !w-[calc(100%-32px)] ${throttledKeyword ? 'hidden' : ''}`} guild={guild}></CircleTagList>
      <div className={'flex-1 overflow-y-auto relative'}>
        <CircleCommonList
          ref={circleCommonListRef}
          className={throttledKeyword ? 'opacity-0' : 'opacity-100'}
          fetchConfig={postFetchConfig}
          pinedPostIds={pinedPostIds}
          showPined={sortType == CircleSortType.Recommend}
          sortType={sortType}
          topRecords={circleInfo.top?.records}
          emptyMessage={
            <EmptyPage
              className={'pt-[8%] !justify-start'}
              message="发布你的第一个动态~"
              image={placeholderUnpublishedLightImage}
              context={'这里空空如也，快去发布动态\n遇见更多有趣的人吧'}
            />
          }
        />
        {throttledKeyword && (
          <CircleSearchList
            className={'absolute top-0 left-0 w-full h-full'}
            fetchConfig={postSearchFetchConfig}
            emptyMessage={<EmptyPage message="" context="暂无动态" />}
            keyword={throttledKeyword}
          />
        )}
      </div>
    </>
  )
}

export default function CircleContainer() {
  const guild = useContext(GuildContext)

  if (!guild) {
    return null
  }

  useEffect(() => {
    // 退出圈子时清空圈子的数据，否则会造成意外的 bug
    return () => {
      store.dispatch(circleActions.clear())
    }
  }, [])

  return (
    <ChannelContainer className="min-w-[475px]" key={'circle'}>
      <CircleWrapper />
    </ChannelContainer>
  )
}
