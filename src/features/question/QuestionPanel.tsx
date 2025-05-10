import { useThrottle } from 'ahooks'
import { Tabs, TabsProps } from 'antd'
import { QuestionStruct, QuestionTagStruct } from 'fb-components/question/types.ts'
import { SwitchType } from 'fb-components/struct/type'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import placeholderUnpublishedLightImage from '../../assets/images/placeholder_unpublished_light.svg'
import EmptyPage from '../../components/EmptyPage'
import { FetchConfig } from '../../hooks/useFetchState.ts'
import { ChannelContainerContext, ChannelContainerContextData } from '../home/ChannelContainer'
import { ChannelContext, GuildContext } from '../home/GuildWrapper'
import { QuestionFilter, QuestionPostStatus } from './components/QuestionFilter'
import { QuestionCommonList, QuestionSearchList } from './components/QuestionList'
import QuestionApi, { QuestionSearchInfo } from './questionAPI.ts'
import { QuestionExtraInfo, QuestionPostSort } from './questionEntity'
import { QuestionTypeKey, questionActions } from './questionSlice.ts'

function QuestionPanel() {
  const guild = useContext(GuildContext)
  const channel = useContext(ChannelContext)
  const contextValue = useContext<ChannelContainerContextData<QuestionExtraInfo> | undefined>(ChannelContainerContext)
  const [selected, setSelected] = useState(QuestionTypeKey.All)
  const [sort, setSort] = useState<QuestionPostSort>(QuestionPostSort.Latest)
  const [status, setStatus] = useState<QuestionPostStatus>(QuestionPostStatus.All)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tags, setTags] = useState<QuestionTagStruct[]>([])
  const [filterVisible, setFilterVisible] = useState(false)
  const { questionId, answerId } = useParams()
  const dispatch = useDispatch()
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')

  const { extraInfo } = contextValue
  const throttledKeyword = useThrottle(extraInfo?.keyword ?? '', { wait: 500 })

  const getTags = async () => {
    if (!channel) {
      return []
    }
    const tags = await QuestionApi.getQuestionTags(channel?.channel_id)
    dispatch(questionActions.setTags(tags))
    setTags(tags)
  }
  const handleFilterChange = (sort: QuestionPostSort, status: QuestionPostStatus, selectedTags: string[]) => {
    setSort(sort)
    setStatus(status)
    setSelectedTags(selectedTags)
  }

  const isFiltering = selectedTags?.length === 0 && sort !== QuestionPostSort.Earliest && status !== QuestionPostStatus.All

  const QuestionFetchConfig: FetchConfig<
    QuestionStruct,
    {
      session?: string
      lastId?: string
      hasMore: boolean
    }
  > = useMemo(() => {
    return {
      getInitialFetchState: () => ({ session: undefined, lastId: undefined, hasMore: true }),
      fetchData: async params => {
        const { session, lastId } = params ?? {}
        const result = await QuestionApi.questionList({
          guildId: guild?.guild_id,
          channelId: channel?.channel_id,
          session,
          lastId,
          sortType: sort,
          ...(status === QuestionPostStatus.All ? {} : { isResolved: status === QuestionPostStatus.Resolved ? SwitchType.Yes : SwitchType.No }),
          tagIds: selectedTags,
        })
        const { list, session: fetchSession, last_id, next } = result
        return {
          data: { list },
          params: { session: fetchSession, lastId: last_id, hasMore: next === 1, type: QuestionTypeKey.All },
        }
      },
    }
  }, [guild, channel, sort, status, selectedTags])

  const QuestionDigestFetchConfig: FetchConfig<
    QuestionStruct,
    {
      session?: string
      lastId?: string
      hasMore: boolean
    }
  > = useMemo(() => {
    return {
      getInitialFetchState: () => ({ session: undefined, lastId: undefined, hasMore: true }),
      fetchData: async params => {
        const { session, lastId } = params ?? {}
        const result = await QuestionApi.questionList({
          guildId: guild?.guild_id,
          channelId: channel?.channel_id,
          session,
          lastId,
          isDigest: SwitchType.Yes,
        })
        const { list, session: fetchSession, last_id, next } = result
        return {
          data: { list },
          params: { session: fetchSession, lastId: last_id, hasMore: next === 1, type: QuestionTypeKey.Selected },
        }
      },
    }
  }, [guild, channel])

  const QuestionCollectFetchConfig: FetchConfig<
    QuestionStruct,
    {
      session?: string
      lastId?: string
      hasMore: boolean
    }
  > = useMemo(() => {
    return {
      getInitialFetchState: () => ({ session: undefined, lastId: undefined, hasMore: true }),
      fetchData: async params => {
        const { session, lastId } = params ?? {}
        const result = await QuestionApi.questionCollectList({
          guildId: guild?.guild_id,
          channelId: channel?.channel_id,
          session,
          lastId,
        })
        const { list, session: fetchSession, last_id, next } = result
        return {
          data: { list },
          params: { session: fetchSession, lastId: last_id, hasMore: next === 1, type: QuestionTypeKey.Collection },
        }
      },
    }
  }, [guild, channel])

  const QuestionSearchFetchConfig: FetchConfig<
    QuestionSearchInfo,
    {
      session?: string
      lastId?: string
      hasMore: boolean
    }
  > = useMemo(() => {
    return {
      getInitialFetchState: () => ({ session: undefined, lastId: undefined, hasMore: true }),
      fetchData: async params => {
        const { session, lastId } = params ?? {}
        const result = await QuestionApi.searchQuestion({
          guildId: guild?.guild_id,
          channelId: channel?.channel_id,
          keyword: throttledKeyword,
          session,
          lastId,
        })
        const { list, session: fetchSession, last_id, next } = result
        return { data: { list }, params: { session: fetchSession, lastId: last_id, hasMore: next === 1 } }
      },
    }
  }, [guild, channel, throttledKeyword])

  const listConfigs = {
    [QuestionTypeKey.All]: {
      fetchConfig: QuestionFetchConfig,
      emptyMessage:
        !isFiltering ?
          <EmptyPage
            message="发布你的第一个提问"
            image={placeholderUnpublishedLightImage}
            context={'这里空空如也，快去发起提问\n让更多人参与讨论吧'}
          />
        : <EmptyPage message="暂无相关问题" context={'切换或减少其他筛选内容试试吧'} />,
    },
    [QuestionTypeKey.Selected]: {
      fetchConfig: QuestionDigestFetchConfig,
      emptyMessage: '暂无精选问题',
    },
    [QuestionTypeKey.Collection]: {
      fetchConfig: QuestionCollectFetchConfig,
      emptyMessage: '暂无收藏问题',
    },
  }

  const items: TabsProps['items'] = [
    {
      key: QuestionTypeKey.All,
      label: (
        <span className={`mx-[12px] ${selected === QuestionTypeKey.All ? 'font-bold text-[var(--fg-b100)]' : 'text-[var(--fg-b60)]'}`}>全部</span>
      ),
    },
    {
      key: QuestionTypeKey.Selected,
      label: (
        <span className={`mx-[12px] ${selected === QuestionTypeKey.Selected ? 'font-bold text-[var(--fg-b100)]' : 'text-[var(--fg-b60)]'}`}>
          精选
        </span>
      ),
    },
    {
      key: QuestionTypeKey.Collection,
      label: (
        <span className={`mx-[12px] ${selected === QuestionTypeKey.Collection ? 'font-bold text-[var(--fg-b100)]' : 'text-[var(--fg-b60)]'}`}>
          收藏
        </span>
      ),
    },
  ]

  useEffect(() => {
    getTags()
  }, [])

  if (!guild || !channel) return null
  return throttledKeyword ?
      <div className="h-[calc(100vh-148px)]">
        <QuestionSearchList
          fetchConfig={QuestionSearchFetchConfig}
          className="mt-[8px] h-full"
          questionId={questionId}
          answerId={answerId}
          keyword={throttledKeyword}
        />
      </div>
    : <div className="flex flex-col">
        <Tabs
          activeKey={selected}
          size="small"
          animated
          tabBarGutter={0}
          indicatorSize={20}
          destroyInactiveTabPane={false}
          className="h-full w-full"
          renderTabBar={(props, DefaultTabBar) => {
            return <DefaultTabBar {...props} className="!mx-[16px] h-[36px] before:!content-[none]"></DefaultTabBar>
          }}
          items={items}
          tabBarExtraContent={
            QuestionTypeKey.All === selected && (
              <div
                className={`mr-[12px] flex cursor-pointer select-none items-center ${
                  filterVisible ? 'text-[var(--fg-blue-1)]' : 'text-[var(--fg-b60)]'
                } hover:text-[var(--fg-blue-1)]`}
                onClick={() => setFilterVisible(!filterVisible)}
              >
                <iconpark-icon name="Filter" class="mr-[4px]"></iconpark-icon>
                筛选
              </div>
            )
          }
          onChange={activeKey => {
            setSelected(activeKey as QuestionTypeKey)
            setFilterVisible(false)
          }}
        />
        <div className="flex h-[calc(100vh-132px)] flex-col">
          {QuestionTypeKey.All === selected && (
            <QuestionFilter
              sort={sort}
              status={status}
              selectedTags={selectedTags}
              tags={tags}
              className="flex-shrink-0"
              onChange={handleFilterChange}
              visible={filterVisible}
            />
          )}
          <QuestionCommonList
            type={selected}
            fetchConfig={listConfigs[selected].fetchConfig}
            emptyMessage={listConfigs[selected].emptyMessage}
            className={`mt-[8px] ${
              filterVisible ?
                tags.length > 0 ?
                  'h-[calc(100%-184px)]'
                : 'h-[calc(100%-144px)]'
              : 'h-full'
            }`}
            questionId={questionId}
          />
        </div>
      </div>
}

export default QuestionPanel
