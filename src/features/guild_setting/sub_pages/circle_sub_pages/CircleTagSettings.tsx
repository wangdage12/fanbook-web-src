import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { useDebounce, useDebounceEffect, useHover } from 'ahooks'
import { Button, Input } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast'
import { TagStruct } from 'fb-components/circle/types'
import CircularLoading from 'fb-components/components/CircularLoading'
import { formatCount } from 'fb-components/utils/common'
import { isEqual } from 'lodash-es'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../app/hooks'
import searchLightImage from '../../../../assets/images/placeholder_search_light.svg'
import EmptyPage from '../../../../components/EmptyPage'
import { Sortable, UniqueSortableItem, move } from '../../../../components/Sortable'
import serverSideConfig from '../../../../services/ServeSideConfigService'
import { circleActions, circleSelectors } from '../../../circle/circleSlice'
import CircleApi from '../../../circle/circle_api'
import { ChannelSettingsSubPageProps } from '../CircleChannelSettings'

function CircleTagItem({ tag, onDelete, dragHandlerProps }: { tag: TagStruct; onDelete?: () => void; dragHandlerProps?: SyntheticListenerMap }) {
  const itemRef = useRef<HTMLDivElement>(null)
  const isHover = useHover(itemRef)
  return (
    <div ref={itemRef} className="px-4 -mx-4 rounded-[10px] hover:bg-fgB5">
      <div className="flex items-center cursor-pointer text-sm border-b border-b-fgB5 py-2.5">
        <iconpark-icon
          {...dragHandlerProps}
          name="DragVertical"
          class={`drag-handle flex-shrink-0 text-fgB60 -ml-3 ${isHover ? '' : 'opacity-0'}`}
        ></iconpark-icon>
        <span className="flex-1 truncate mr-2">#{tag.tag_name}#</span>
        <iconpark-icon name="Delete" onClick={onDelete} class={`flex-shrink-0 text-fgB60 ${isHover ? '' : 'opacity-0'}`}></iconpark-icon>
      </div>
    </div>
  )
}

function SelectCircleTag({ onSelect, guildId }: { guildId: string; onSelect: (tag: TagStruct) => void }) {
  const [keyword, setKeyword] = useState<string>('')
  const debounceKeyword = useDebounce(keyword.trim(), {
    wait: 200,
  })
  const [tags, setTags] = useState<TagStruct[]>([])
  const [loading, setLoading] = useState(true)

  useDebounceEffect(
    () => {
      CircleApi.searchTopic({ search: keyword.trim(), guildId })
        .then(res => {
          const { list } = res
          setTags(list)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [keyword],
    { wait: 200 }
  )

  return (
    <div className="flex flex-col mb-4 h-[500px]">
      <Input
        className="flex-shrink-0 w-full rounded-full my-2"
        placeholder="输入关键词搜索话题"
        onChange={evt => setKeyword(evt.target.value)}
        allowClear
        size="large"
        prefix={<iconpark-icon name="Search" size={16} color="var(--fg-b40)"></iconpark-icon>}
      ></Input>

      {loading ?
        <div className="flex-center flex-1 overflow-auto">
          <CircularLoading></CircularLoading>
        </div>
      : tags?.length > 0 ?
        <div className="flex flex-col flex-1 overflow-auto">
          {tags.map(tag => {
            return (
              <div key={tag.tag_id} className={'icon-bg-btn !px-2 !py-2.5 flex items-center !rounded-[10px]'} onClick={() => onSelect(tag)}>
                <div className={'flex-1 truncate'}>#{tag.tag_name}#</div>
                {tag.view_count && tag.view_count > 0 ?
                  <div className={'ml-2 text-fgB60'}>{formatCount(tag.view_count)}次浏览</div>
                : null}
              </div>
            )
          })}
        </div>
      : <EmptyPage
          className="!h-[220px]"
          image={debounceKeyword ? searchLightImage : undefined}
          message=""
          context={debounceKeyword ? '暂无相关话题' : '暂无话题'}
        />
      }
    </div>
  )
}

function showSelectCircleTagModal({ guildId }: { guildId: string }) {
  return new Promise<TagStruct>((resolve, reject) => {
    const { destroy: onClose } = showFbModal({
      title: '选择话题',
      content: (
        <SelectCircleTag
          guildId={guildId}
          onSelect={tag => {
            onClose()
            resolve(tag)
          }}
        />
      ),
      onCancel: () => {
        reject('取消选择话题')
        onClose()
      },
      footer: null,
    })
  })
}

function CircleTagSettings({ value: channel }: ChannelSettingsSubPageProps) {
  const dispatch = useAppDispatch()
  const recommendedTags = useAppSelector(circleSelectors.recommendTagList, isEqual)
  const [tags, setTags] = useState<TagStruct[]>([])
  const maxLimit = serverSideConfig.circle?.recommend_tag_limit ?? 15

  const handleClick = async () => {
    if (tags.length >= maxLimit) {
      FbToast.open({ content: `最多只能添加 ${maxLimit} 个话题哦`, type: 'warning', key: 'add-circle-tag' })
      return
    }
    try {
      const tag = await showSelectCircleTagModal({ guildId: channel.guild_id })
      // 没有添加的才调用接口
      if (tags.every(_tag => _tag.tag_id !== tag.tag_id)) {
        await CircleApi.addRecommendTag(channel.guild_id, tag.tag_id)
        setTags([...tags, { ...tag, position: 0 }])
      }
      FbToast.open({ content: '添加成功', type: 'success', key: 'add-circle-tag' })
    } catch (err) {
      console.error(err)
    }
  }

  const onSwap = async ({ from, to }: { from: number; to: number }) => {
    // 可优化点 从 to - 1 处 往上都比 to - 1 递增 1 提高性能,减少变动梳理
    const _tags = move(tags, from, to).map((_tag, index, arr) => {
      _tag.position = arr.length + 1 - index
      return _tag
    })
    setTags(_tags)
    await CircleApi.sortRecommendTag(
      channel.guild_id,
      _tags.reduce(
        (sortTags, tag) => {
          sortTags[tag.tag_id] = tag.position ?? 0
          return sortTags
        },
        {} as Record<string, number>
      )
    )
  }

  async function onDelete(tag: TagStruct) {
    await CircleApi.deleteRecommendTag(channel.guild_id, tag.tag_id)
    setTags(tags.filter(_tag => _tag.tag_id !== tag.tag_id))
    FbToast.open({ content: '删除成功', type: 'success', key: 'add-circle-tag' })
  }

  useEffect(() => {
    dispatch(circleActions.fetchCircleRecommendTagList({ guildId: channel.guild_id }))
    return () => {
      dispatch(circleActions.fetchCircleRecommendTagList({ guildId: channel.guild_id }))
    }
  }, [])

  useEffect(() => {
    setTags(
      recommendedTags.map(tag => {
        const { id, ...rest } = tag
        return rest
      })
    )
  }, [recommendedTags])

  return (
    <div className={'flex h-full flex-col overflow-hidden'}>
      <div className={'flex items-center px-6 py-4'}>
        <div className={'text-base font-medium flex-1'}>设置推荐话题</div>
        <Button type="primary" onClick={handleClick}>
          选择话题
        </Button>
      </div>
      {tags?.length === 0 ?
        <EmptyPage message="暂无推荐话题" />
      : <>
          <span className="mx-6 mb-2 text-xs text-fgB60">
            推荐话题（{tags.length ?? 0}/{serverSideConfig.circle?.recommend_tag_limit ?? 15}）
          </span>
          <div className="flex overflow-auto mb-2">
            <div className="mx-6 w-full">
              <Sortable<TagStruct & UniqueSortableItem<'tag_id'>, 'tag_id'>
                uniqueKey="tag_id"
                items={tags}
                customDragHandler={true}
                itemRenderer={({ item: tag, dragHandlerProps }) => {
                  return (
                    <CircleTagItem
                      key={tag.tag_id}
                      tag={tag}
                      dragHandlerProps={dragHandlerProps}
                      onDelete={() => {
                        FbModal.error({
                          title: '移除推荐话题',
                          content: '移除后，此话题将不再是推荐话题，成员无法在圈子顶部直接查看此话题？',
                          okText: '移除推荐话题',
                          okButtonProps: {
                            danger: true,
                          },
                          onOk: async () => {
                            await onDelete(tag)
                          },
                        })
                      }}
                    ></CircleTagItem>
                  )
                }}
                onChange={onSwap}
              ></Sortable>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default CircleTagSettings
