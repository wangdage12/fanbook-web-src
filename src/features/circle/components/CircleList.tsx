import { useEventListener, useSize, useThrottle } from 'ahooks'
import clsx from 'clsx'
import { WaterfallEventHandlersEventMap } from 'fb-components/base_component/waterfall/type.ts'
import CircleBaseCard from 'fb-components/circle/card/CircleBaseCard.tsx'
import { CircleContentStruct, CircleSortType, TagStruct, TopRecord } from 'fb-components/circle/types.ts'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { LimitSize } from 'fb-components/components/type.ts'
import { isEmpty } from 'lodash-es'
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useAppDispatch } from '../../../app/hooks.ts'
import ListFooter from '../../../components/ListFooter.tsx'
import { RealtimeAvatar, RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { FetchConfig, useFetchState } from '../../../hooks/useFetchState.ts'
import { PaginationResp3 } from '../../../types.ts'
import { GuildContext } from '../../home/GuildWrapper.tsx'
import { showCircleDetailModal } from '../CircleModal.tsx'
import { SearchTagList } from '../SearchTagList.tsx'
import { ArticleStatus, LoadingType, circleActions } from '../circleSlice.ts'
import { CircleSearchResp } from '../circle_api.ts'
import usePostActions from '../hooks/usePostActions.ts'

const CARD_MIN_WIDTH = 220
const CARD_MIN_COUNT = 2
const CARD_GAP = 16
const CARD_MAX_WIDTH = CARD_MIN_WIDTH + (CARD_MIN_WIDTH - CARD_GAP) / CARD_MIN_COUNT
const CARD_MIN_HEIGHT = 100

function getCols(width: number) {
  return Math.max(CARD_MIN_COUNT, Math.floor((width - CARD_GAP * 4) / (CARD_MIN_WIDTH + CARD_GAP)))
}

type PostListDataType = PaginationResp3<CircleContentStruct> & ArticleStatus

function pinedPosts(topRecords: TopRecord[], posts: CircleContentStruct[]): CircleContentStruct[] {
  const topPosts: CircleContentStruct[] = topRecords.map(top => top.post)
  const remainingPosts: CircleContentStruct[] = []

  const idMap: Map<string, CircleContentStruct> = new Map()

  // 构建 ID 和文章的映射关系
  for (const post of posts) {
    idMap.set(post.post.post_id, post)
  }

  // 按照置顶 ID 数组的顺序放置置顶文章
  for (const top of topRecords) {
    const article = idMap.get(top.post_id)
    if (article) {
      // 替换
      const index = topPosts.findIndex(post => post.post.post_id === article.post.post_id)
      if (index > -1) {
        topPosts[index] = article
      }
      idMap.delete(top.post_id)
    }
  }

  // 将剩余文章添加到结果数组中
  remainingPosts.push(...idMap.values())
  return [...topPosts, ...remainingPosts]
}

const resortList = (list: CircleContentStruct[], topRecords: TopRecord[] = [], sortType: CircleSortType) => {
  let changeList = list
  // 若是全部帖子，则置顶帖子放在第一位
  if (sortType === CircleSortType.Recommend && !isEmpty(topRecords)) {
    changeList = pinedPosts(topRecords, changeList)
  }
  return changeList
}

export const CircleCommonList = forwardRef<
  { refresh: () => void },
  {
    fetchConfig: FetchConfig<
      CircleContentStruct,
      {
        hasMore: boolean
        topicId?: string
        // sortType?: CircleSortType
        list_id?: string
      }
    >
    groupKey?: string
    emptyMessage?: React.ReactNode
    pinedPostIds?: string[]
    showPined?: boolean
    hasControl?: boolean
    sortType: CircleSortType
    topRecords?: TopRecord[]
    className?: string
  }
>(({ groupKey, fetchConfig, pinedPostIds = [], emptyMessage, showPined = false, hasControl = true, sortType, topRecords, className = '' }, ref) => {
  const guild = useContext(GuildContext)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const waterfallRef = useRef<HTMLDivElement>(null)
  const [colWidth, setColWidth] = useState(CARD_MIN_WIDTH)
  const [isTop, setIsTop] = useState(true)
  const [listLoading, setListLoading] = useState<LoadingType | undefined>(LoadingType.Top)
  const [emptyVisible, setEmptyVisible] = useState<boolean>(false)
  const [firstRequest, setFirstRequest] = useState<boolean>(true)
  const dispatch = useAppDispatch()
  const waterfallSize = useSize(waterfallRef.current)
  const cols = useThrottle(getCols(waterfallSize?.width ?? 0), { wait: 100 })
  const [_, setPostData] = useState<PostListDataType>({
    loading: false,
    records: [],
    next: '1',
    size: 20,
    hasMore: true,
  })

  const { updateSubInfo, deletePost, list: records, resetList } = usePostActions([])
  const [tempRecords, setTempRecords] = useState<CircleContentStruct[]>([])
  const { fetchData, fetchState, isFetching } = useFetchState<
    CircleContentStruct,
    {
      hasMore: boolean
      topicId?: string
      sortType?: CircleSortType
    }
  >(fetchConfig)

  useImperativeHandle(
    ref,
    () => {
      return {
        refresh,
      }
    },
    []
  )

  useEffect(() => {
    if (!isFetching) {
      setListLoading(undefined)
      if (firstRequest) {
        setEmptyVisible(false)
      } else {
        setEmptyVisible(tempRecords.length === 0)
      }
    }
  }, [isFetching, firstRequest, tempRecords])

  async function getPostList(init = false) {
    if ((isFetching || !(fetchState?.hasMore ?? true)) && !init) {
      return
    }

    try {
      const info = (await fetchData(init)) as Partial<
        PaginationResp3<CircleContentStruct> & {
          topicId?: string | undefined
          sortType?: CircleSortType | undefined
        }
      >
      setPostData({
        ...info,
        records: info.records,
      } as PostListDataType)
      setTempRecords([...(init ? [] : records), ...(info.records ?? [])])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getPostList(true).then(() => setFirstRequest(false))
    scrollToTop()
    setListLoading(LoadingType.Top)
    setIsTop(false)
  }, [fetchConfig])

  const handleScroll: React.UIEventHandler<HTMLElement> = event => {
    const scrolledDiv = event.target as HTMLElement

    // 获取滚动相关信息
    const scrollTop = scrolledDiv.scrollTop
    const clientHeight = scrolledDiv.clientHeight
    const scrollHeight = scrolledDiv.scrollHeight
    setIsTop(!emptyVisible && scrollTop >= 20)
    // 判断是否滚动到底部
    const isScrollAtBottom = scrollTop + clientHeight + 4 >= scrollHeight
    if (isScrollAtBottom) {
      getPostList().then()
    }
  }

  useEventListener('colwidthchange', (evt: WaterfallEventHandlersEventMap['colwidthchange']) => setColWidth(evt.detail.colWidth), {
    target: waterfallRef,
  })

  function scrollToTop() {
    wrapperRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function refresh() {
    setListLoading(LoadingType.Top)
    getPostList(true).then()
  }

  useEffect(() => {
    resetList(resortList(tempRecords, topRecords, sortType))
  }, [topRecords, tempRecords])

  const loading = listLoading == LoadingType.Top
  return (
    <div ref={wrapperRef} className={`h-full w-full overflow-auto ${className}`} onScroll={handleScroll}>
      <div
        className="flex-center transition-[width,height,opacity] duration-500 box-border m-auto"
        style={{
          height: loading ? 56 : 0,
          width: loading ? 56 : 0,
          opacity: loading ? 1 : 0,
        }}
      >
        <iconpark-icon name="Loading-Blue" spin size={'30%'} class={'mt-[10px] transition-[font-size]'} />
      </div>
      {emptyVisible && emptyMessage}
      <fb-waterfall
        ref={waterfallRef}
        gap={CARD_GAP}
        cols={cols}
        class="w-[calc(100%-32px)] px-[16px] pt-[16px]"
        style={{
          minWidth: CARD_MIN_WIDTH * CARD_MIN_COUNT + CARD_GAP * (CARD_MIN_COUNT + 1),
        }}
      >
        {records.map(detail => {
          const { parse_post, user } = detail
          let limitSize: LimitSize | undefined
          if (parse_post?.cover) {
            const rowHeight = (CARD_MAX_WIDTH / 3) * 4
            const colMaxWidth = (rowHeight / 3) * 4
            const maxWidth = parse_post.cover.width >= parse_post.cover.height ? CARD_MAX_WIDTH : colMaxWidth
            limitSize = {
              max: { width: maxWidth, height: rowHeight },
              min: { width: CARD_MAX_WIDTH, height: CARD_MIN_HEIGHT },
            }
          }
          let displaySize: LimitSize | undefined
          const _colWidth = Math.max(colWidth, CARD_MIN_WIDTH)
          if (parse_post?.cover) {
            const rowHeight = (_colWidth / 3) * 4
            const colMaxWidth = (rowHeight / 3) * 4
            const maxWidth = parse_post.cover.width >= parse_post.cover.height ? _colWidth : colMaxWidth
            displaySize = {
              max: { width: maxWidth, height: rowHeight },
              min: { width: _colWidth, height: CARD_MIN_HEIGHT },
            }
          }
          const { post_id } = detail.post
          return (
            <CircleBaseCard
              className="h-fit !cursor-pointer border-[0.5px] border-[var(--fg-b10)] transition-all duration-300 hover:mt-[-4px] hover:shadow-[0_8px_16px_0_rgba(26,32,51,0.1)]"
              style={{ minWidth: CARD_MIN_WIDTH }}
              limitSize={limitSize}
              displaySize={displaySize}
              key={`${post_id}`}
              detail={detail}
              authorAvatar={<RealtimeAvatar userId={user?.user_id || ''} size={16}></RealtimeAvatar>}
              authorName={<RealtimeNickname userId={user?.user_id || ''} guildId={guild?.guild_id}></RealtimeNickname>}
              hiddenGuildOrigin
              isPined={showPined && pinedPostIds.includes(detail.post.post_id)}
              onClick={() => {
                showCircleDetailModal({
                  groupKey,
                  postId: post_id,
                  originDetail: detail,
                  onDelete: () => {
                    deletePost(post_id)
                  },
                  onLike: subInfo => updateSubInfo(post_id, subInfo),
                  onTop: async (pinned, detail) => {
                    dispatch(circleActions.changePostPined({ pinned, detail }))
                  },
                })
              }}
            ></CircleBaseCard>
          )
        })}
      </fb-waterfall>

      <ListFooter visible={!isEmpty(records) && !(fetchState?.hasMore ?? true)} />
      {hasControl ?
        <div className="absolute bottom-[24px] right-[24px] flex h-[48px] w-[48px] items-center justify-center">
          {isTop ?
            <div
              className="flex h-[48px] w-[48px] cursor-pointer select-none flex-col items-center justify-center rounded-[12px] border-[0.5px] border-[var(--fg-b10)] bg-[var(--fg-white-1)] text-[var(--fg-b60)] shadow-[0_8px_16px_0_rgba(26,32,51,0.1)] hover:bg-[var(--bg-bg-2)] active:h-[44px] active:w-[44px] active:border-none active:bg-[var(--bg-bg-1)] active:shadow-[0_2px_4px_0_rgba(26,32,51,0.1)]"
              onClick={scrollToTop}
            >
              <iconpark-icon name="TriangleUp" size={16}></iconpark-icon>
              顶部
            </div>
          : <div
              className="flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-[12px] border-[0.5px] border-[var(--fg-b10)] bg-[var(--fg-white-1)] text-[var(--fg-b60)] shadow-[0_8px_16px_0_rgba(26,32,51,0.1)] hover:bg-[var(--bg-bg-2)] active:h-[44px] active:w-[44px] active:border-none active:bg-[var(--bg-bg-1)] active:shadow-[0_2px_4px_0_rgba(26,32,51,0.1)]"
              onClick={refresh}
            >
              <iconpark-icon name="Reload" size={24}></iconpark-icon>
            </div>
          }
        </div>
      : null}
    </div>
  )
})
CircleCommonList.displayName = 'CircleCommonList'

export function CircleSearchList({
  fetchConfig: fetchData,
  emptyMessage,
  keyword,
  className = '',
}: {
  fetchConfig: () => Promise<CircleSearchResp>
  emptyMessage?: React.ReactNode
  keyword?: string
  className?: string
}) {
  const guild = useContext(GuildContext)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const waterfallRef = useRef<HTMLDivElement>(null)
  const [colWidth, setColWidth] = useState(CARD_MIN_WIDTH)

  const waterfallSize = useSize(waterfallRef.current)
  const cols = useThrottle(getCols(waterfallSize?.width ?? 0), { wait: 100 })
  const [searchTagId, setSearchTagId] = useState<string>('all')
  const [searchIng, setSearchIng] = useState<boolean>(false)

  const [postSearchData, setPostSearchData] = useState<{
    list: CircleContentStruct[]
    tags: TagStruct[]
  }>({
    list: [],
    tags: [],
  })
  const { tags } = postSearchData
  const { updateSubInfo, deletePost, list: records, resetList } = usePostActions([])

  const searchKeyPrefix = records.length
  const filterList = useMemo(() => {
    if (searchTagId == 'all') return records
    return records.filter(e => e.post.tag_ids.includes(searchTagId))
  }, [searchTagId, records])
  useEffect(() => {
    getPostList().then()
  }, [fetchData])

  async function getPostList() {
    try {
      setSearchIng(true)
      const res = await fetchData()
      setPostSearchData(res)
      resetList(res.list)
    } catch (error) {
      console.error(error)
    } finally {
      setSearchIng(false)
    }
  }

  const handleScroll: React.UIEventHandler<HTMLElement> = event => {
    const scrolledDiv = event.target as HTMLElement

    // 获取滚动相关信息
    const scrollTop = scrolledDiv.scrollTop
    const clientHeight = scrolledDiv.clientHeight
    const scrollHeight = scrolledDiv.scrollHeight
    // 判断是否滚动到底部
    const isScrollAtBottom = scrollTop + clientHeight + 4 >= scrollHeight
    if (isScrollAtBottom) {
      getPostList()
    }
  }

  useEventListener('colwidthchange', (evt: WaterfallEventHandlersEventMap['colwidthchange']) => setColWidth(evt.detail.colWidth), {
    target: waterfallRef,
  })

  return (
    <div ref={wrapperRef} className={`mb-[16px] h-full w-full flex flex-col ${className}`} onScroll={handleScroll}>
      {searchIng && (
        <div className={clsx(['flex-center', ' mt-[10%]'])}>
          <CircularLoading />
          <span className={'ml-3 text-[var(--fg-b60)]'}>搜索中...</span>
        </div>
      )}
      {!searchIng && isEmpty(filterList) ? emptyMessage : null}
      {!searchIng && !isEmpty(filterList) && (
        <>
          <SearchTagList tags={tags} value={searchTagId} onChange={setSearchTagId} />
          <div className={'flex-1 overflow-y-auto'}>
            <fb-waterfall
              ref={waterfallRef}
              gap={CARD_GAP}
              cols={cols}
              class="w-[calc(100%-32px)] px-[16px]"
              style={{
                minWidth: CARD_MIN_WIDTH * CARD_MIN_COUNT + CARD_GAP * (CARD_MIN_COUNT + 1),
              }}
            >
              {filterList.map(detail => {
                const { parse_post, user } = detail
                let limitSize: LimitSize | undefined
                if (parse_post?.cover) {
                  const rowHeight = (CARD_MAX_WIDTH / 3) * 4
                  const colMaxWidth = (rowHeight / 3) * 4
                  const maxWidth = parse_post.cover.width >= parse_post.cover.height ? CARD_MAX_WIDTH : colMaxWidth
                  limitSize = {
                    max: { width: maxWidth, height: rowHeight },
                    min: { width: CARD_MAX_WIDTH, height: CARD_MIN_HEIGHT },
                  }
                }
                let displaySize: LimitSize | undefined
                const _colWidth = Math.max(colWidth, CARD_MIN_WIDTH)
                if (parse_post?.cover) {
                  const rowHeight = (_colWidth / 3) * 4
                  const colMaxWidth = (rowHeight / 3) * 4
                  const maxWidth = parse_post.cover.width >= parse_post.cover.height ? _colWidth : colMaxWidth
                  displaySize = {
                    max: { width: maxWidth, height: rowHeight },
                    min: { width: _colWidth, height: CARD_MIN_HEIGHT },
                  }
                }
                const { post_id } = detail.post
                return (
                  <CircleBaseCard
                    className="h-fit !cursor-pointer border-[0.5px] border-[var(--fg-b10)] hover:mt-[-4px] hover:shadow-[0_8px_16px_0_rgba(26,32,51,0.1)] transition-all duration-300"
                    style={{ minWidth: CARD_MIN_WIDTH }}
                    limitSize={limitSize}
                    displaySize={displaySize}
                    key={`${searchKeyPrefix}-${post_id}`}
                    detail={detail}
                    keyword={keyword}
                    authorAvatar={<RealtimeAvatar userId={user?.user_id || ''} size={16}></RealtimeAvatar>}
                    authorName={<RealtimeNickname userId={user?.user_id || ''} guildId={guild?.guild_id}></RealtimeNickname>}
                    hiddenGuildOrigin
                    onClick={() =>
                      showCircleDetailModal({
                        postId: post_id,
                        originDetail: detail,
                        onDelete: () => deletePost(post_id),
                        onLike: subInfo => updateSubInfo(post_id, subInfo),
                      })
                    }
                  ></CircleBaseCard>
                )
              })}
            </fb-waterfall>
            <ListFooter visible={true} />
          </div>
        </>
      )}
    </div>
  )
}
