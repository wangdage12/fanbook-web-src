import { Button, Divider } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index.tsx'
import { CircleContentStruct, CircleSortType, CircleTagDetailStruct, CircleTagType } from 'fb-components/circle/types.ts'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { MessageType, TextMessageContentStruct } from 'fb-components/components/messages/types.ts'
import { TextContentMask } from 'fb-components/rich_text_editor/visitors/type.ts'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildBanLevelType, GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import sleep from 'fb-components/utils/sleep.ts'
import { isEqual, isNil } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../../app/hooks.ts'
import placeholderNoPermissionLightImage from '../../../assets/images/placeholder_nopermission_light.svg'
import placeholderUnpublishedLightImage from '../../../assets/images/placeholder_unpublished_light.svg'
import PermissionBuilder from '../../../base_services/permission/PermissionBuilder.tsx'
import EmptyPage from '../../../components/EmptyPage.tsx'
import ShareMenuDropdown from '../../../components/share/ShareMenuDropdown.tsx'
import { ShareType } from '../../../components/share/type.ts'
import { FetchConfig } from '../../../hooks/useFetchState.ts'
import { ChannelPermission, PostPermission } from '../../../services/PermissionService.ts'
import CircleTagLinkHandler from '../../../services/link_handler/CircleTagLinkHandler.ts'
import { copyText } from '../../../utils/clipboard.ts'
import GuildAPI from '../../guild_container/guildAPI.ts'
import { guildListSelectors } from '../../guild_list/guildListSlice.ts'
import { FilterItem, FilterTrigger } from '../../guild_setting/management_log/FilterTrigger.tsx'
import MessageService from '../../message_list/MessageService.ts'
import useJoinGuild from '../../question/hooks/useJoinGuild.ts'
import { useGotoLatestWhenPostCreated } from '../CircleContainer.tsx'
import { CircleUtils } from '../CircleUtils.tsx'
import CircleApi from '../circle_api.ts'
import { CircleCommonList } from '../components/CircleList.tsx'
import { CircleTab } from '../components/CircleTab.tsx'
import { PublishDropDownButton } from '../components/PublishDropDownButton.tsx'
import { useUpdateCircleInfo } from '../hooks/useUpdateCircleInfo.ts'

export const TagModalGroupKey = 'TagModalGroupKey'

export const showCircleTagDetailModal = ({ onClose, tagId, sourceGuildId, ...props }: CircleTagDetailProps) => {
  const { destroy: close } = showFbModal({
    groupKey: 'TagModalGroupKey',
    uniqueKey: `${tagId}-${sourceGuildId ?? ''}`,
    className: 'rounded-[8px] !w-auto',
    title: null,
    closable: false,
    content: (
      <CircleTagDetail
        tagId={tagId}
        sourceGuildId={sourceGuildId}
        onClose={() => {
          close()
          onClose?.()
        }}
        {...props}
      ></CircleTagDetail>
    ),
    showCancelButton: false,
    showOkButton: false,
    onCancel: onClose,
  })
}

interface CircleTagDetailProps {
  tagId: string
  sourceGuildId?: string
  /*
   *  新版 tag
   *  旧版 topic
   */
  type: CircleTagType
  onClose?: () => void
}

function GuildFilter({
  guild,
  sourceGuild,
  className = '',
  onChange,
}: {
  guild?: GuildStruct
  sourceGuild?: GuildStruct
  className?: string
  onChange?: (guild: GuildStruct) => void
}) {
  const guildList = (useAppSelector<GuildStruct[] | undefined>(guildListSelectors.selectGuildList) ?? []).filter(
    e => e.banned_level != GuildBanLevelType.Dismiss
  )
  const [selected, setSelected] = useState<GuildStruct | undefined>(guildList.find(e => e.guild_id == guild?.guild_id))

  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    setSelected(guildList.find(e => e.guild_id == guild?.guild_id) ?? guild)
  }, [guild])

  return (
    <FilterTrigger
      open={open}
      onOpenChange={setOpen}
      conditions={[]}
      placement={'bottomRight'}
      className={className}
      overlayClassName={'[&_.ant-popover-inner]:max-h-[360px] [&_.ant-popover-inner]:overflow-y-auto'}
      title={
        <div className="flex items-center gap-2 py-1.5 overflow-x-hidden">
          {!isNil(selected) && <CosImage src={selected.icon} size={24} className={'rounded-[6px] flex-shrink-0'}></CosImage>}
          <span className="truncate text-fgB60">{selected?.name || '全部'}</span>
        </div>
      }
      iconBuilder={() => <iconpark-icon name="Filter" class="text-fgB60" size={12} />}
      content={
        <div className="w-[265px]">
          {sourceGuild ?
            <>
              <div className={'text-xs py-[10px] text-[var(--fg-b60)]'}>来源社区</div>
              <FilterItem
                className={'h-[52px]'}
                onClick={() => {
                  setSelected(sourceGuild)
                  onChange?.(sourceGuild)
                  setOpen(false)
                }}
                title={
                  <div className="flex items-center gap-2 truncate">
                    <CosImage src={sourceGuild?.icon} size={24} className={'rounded-[6px]'}></CosImage>
                    <span className={'flex-1 overflow-x-hidden w-0 truncate'}>{sourceGuild?.name}</span>
                  </div>
                }
                checked={selected?.guild_id === sourceGuild.guild_id}
              />
            </>
          : null}
          <div className={'text-xs py-[10px] text-[var(--fg-b60)]'}>我加入的社区</div>
          {guildList.map(item => (
            <FilterItem
              key={item.guild_id}
              className={'h-[52px]'}
              onClick={() => {
                setSelected(item)
                onChange?.(item)
                setOpen(false)
              }}
              title={
                <div className="flex items-center gap-2 truncate">
                  <CosImage src={item.icon} size={24} className={'rounded-[6px]'}></CosImage>
                  <span className={'flex-1 overflow-x-hidden w-0 truncate'}>{item.name}</span>
                </div>
              }
              checked={selected?.guild_id === item.guild_id}
            />
          ))}
        </div>
      }
    />
  )
}

// 若 sourceGuildId 存在，则需要判断是否有社区信息, 若不存在则表示不在社区内 需要提示加入社区, 若社区是公开的 可以看到内容但是不能发布内容, 若是私密,需要加入 才能看到社区内的内容
function useSourceGuild({ sourceGuildId, currentGuildId }: { sourceGuildId?: string; currentGuildId?: string }) {
  const joinedGuild = useAppSelector(guildListSelectors.guild(currentGuildId, true), isEqual)
  const [guild, setGuild] = useState<GuildStruct | undefined>()
  const [sourceGuild, setSourceGuild] = useState<GuildStruct | undefined>()
  const [isJoined, setIsJoined] = useState<boolean>(
    currentGuildId ?
      joinedGuild?.guild_id ?
        joinedGuild.guild_id == currentGuildId
      : false
    : true
  )

  useEffect(() => {
    if (isJoined && joinedGuild) {
      setGuild(joinedGuild)
      return
    }
    if (sourceGuild) {
      setGuild(sourceGuild)
      return
    }
    sourceGuildId &&
      GuildAPI.getFullGuildInfo(sourceGuildId).then(fetchGuild => {
        if (fetchGuild) {
          setGuild(fetchGuild)
          setSourceGuild(fetchGuild)
        }
      })
  }, [isJoined, joinedGuild, sourceGuildId])

  useEffect(() => {
    if (!currentGuildId) {
      return
    }
    setIsJoined(
      currentGuildId ?
        joinedGuild?.guild_id ?
          joinedGuild.guild_id == currentGuildId
        : false
      : true
    )
  }, [currentGuildId, joinedGuild])

  return { guild, sourceGuild, isJoined }
}

function CircleTagDetail({ tagId, sourceGuildId, type = CircleTagType.Tag, onClose }: CircleTagDetailProps) {
  const [guildId, setGuildId] = useState<string | undefined>(sourceGuildId)
  const { isJoined, sourceGuild, guild } = useSourceGuild({ sourceGuildId, currentGuildId: guildId })
  const { refresh } = useUpdateCircleInfo({ guildId, channelId: guild?.circle.channel_id })
  const handleGuildClick = useJoinGuild(guildId, {
    autoJumpToGuild: false,
    afterJoin: isCancel => {
      if (!isCancel) {
        refresh()
      }
    },
  })

  const circleCommonListRef = useRef<{ refresh: () => void }>(null)
  const [sortType, setSortType] = useState<CircleSortType>(CircleSortType.Recommend)
  const [circleTagDetail, setCircleTagDetail] = useState<CircleTagDetailStruct | undefined>()

  useGotoLatestWhenPostCreated(circleCommonListRef, setSortType)

  const handleTabClick = (sortType: string) => {
    setSortType(sortType as CircleSortType)
  }

  // const [loading, setLoading] = useState<boolean>(false)
  const fetchTagDetail = async () => {
    try {
      // setLoading(true)
      const res = await CircleApi.getCircleTagDetail({ tagId, guildId, type })
      setCircleTagDetail(res)
    } finally {
      // setLoading(false)
    }
  }

  useEffect(() => {
    fetchTagDetail().then()
  }, [guildId])

  useEffect(() => {
    setSortType(sortType == CircleSortType.Latest ? CircleSortType.Latest : CircleSortType.Recommend)
  }, [])

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
        await sleep(1000)
        const { list_id } = params ?? {}
        const result = await CircleApi.tagPostList({
          type,
          tagId,
          guildId,
          listId: list_id,
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
  }, [guildId, sortType])

  async function onShare(
    control: ShareType,
    extraParams?: {
      channelId: string
      channelType: ChannelType
      guildId: string
    }
  ) {
    const link = CircleTagLinkHandler.getShareLink({ tagId, guildId, type })
    switch (control) {
      case ShareType.Link: {
        try {
          await copyText(link, '分享链接已复制，快去分享给好友吧。')
        } catch (err) {
          FbToast.open({ type: 'error', content: '分享链接复制失败，请重试。', key: 'share-link-failed' })
          console.error(err)
        }
        break
      }
      case ShareType.Channel: {
        const { channelId, channelType, guildId: sendGuildId } = extraParams || {}
        if (!channelId || !guildId || channelType === undefined) {
          FbToast.open({ type: 'error', content: '分享至频道失败，请重试。', key: 'share-link-failed' })
          console.error(new Error('share channelId or guildId is empty'))
          break
        }
        try {
          await MessageService.instance.sendMessage(
            channelId,
            {
              type: MessageType.text,
              text: link,
              contentType: TextContentMask.UrlLink,
            } as TextMessageContentStruct,
            {
              guildId: sendGuildId,
              channelType,
              desc: link,
            }
          )

          FbToast.open({ type: 'success', content: '分享至频道成功。', key: 'share-link-success' })
        } catch (err) {
          // 空值为取消分享
          if (!err) {
            return
          }
          FbToast.open({ type: 'error', content: '分享至频道失败，请重试。', key: 'share-link-failed' })
          console.error(err)
        }
        break
      }
      default:
        break
    }
  }

  return (
    <div className={'h-[calc(100vh-80px)] w-[calc(100vw-80px)] max-w-[1280px] flex flex-col relative'}>
      <div className={'flex h-14 flex-shrink-0 items-center px-6 font-bold text-[18px]'}>
        <span className={'flex-1'}>话题详情</span>
        {circleTagDetail && (
          <ShareMenuDropdown guildId={guildId} afterHandler={onShare}>
            <HoverBox className="mr-4">
              <iconpark-icon size={20} name="Share" />
            </HoverBox>
          </ShareMenuDropdown>
        )}
        {
          <HoverBox onClick={onClose}>
            <iconpark-icon size={20} name="Close" />
          </HoverBox>
        }
      </div>
      <div className={'px-6 pt-4'}>
        <div className={'text-[20px] leading-[28px] font-bold'}>#{circleTagDetail?.tag_name}#</div>
        <div className={'text-xs text-[var(--fg-b40)] mt-[6px] flex gap-1 items-center'}>
          {formatCount(circleTagDetail?.view_count)}浏览
          <div className={'w-[2px] h-[2px] bg-[var(--fg-b40)] rounded-full'}></div>
          {formatCount(circleTagDetail?.post_count)}动态
          <div className={'w-[2px] h-[2px] bg-[var(--fg-b40)] rounded-full'}></div>
          {formatCount(circleTagDetail?.like_count)}点赞
        </div>
        <Divider rootClassName={'mx-0 mb-4 mt-4'} />
      </div>
      <div className={'flex items-center px-6'}>
        <CircleTab sortType={sortType} onChange={handleTabClick} className={'w-auto flex-1 [&_.ant-tabs-tab]:!text-sm'} />
        <GuildFilter className={'overflow-x-hidden'} guild={guild} sourceGuild={sourceGuild} onChange={guild => setGuildId(guild.guild_id)} />
      </div>
      {!guild ?
        <div className="w-full h-full flex-center">
          <CircularLoading></CircularLoading>
        </div>
      : null}
      {!isJoined && guild && guild.guild_circle_view === SwitchType.No ?
        <div className="flex-1 w-full h-full flex-center bg-[var(--bg-bg-2)]">
          <EmptyPage message="仅社区成员可查看" image={placeholderNoPermissionLightImage} context={'先让朋友邀请你加入吧！'} />
        </div>
      : <></>}
      {/* 避免布局错误 */}
      <div
        className={`flex-1 overflow-y-auto relative bg-[var(--bg-bg-2)] ${
          !guild || (!isJoined && guild.guild_circle_view === SwitchType.No) ? 'hidden' : ''
        }`}
      >
        <CircleCommonList
          ref={circleCommonListRef}
          groupKey={TagModalGroupKey}
          fetchConfig={postFetchConfig}
          showPined={sortType == CircleSortType.Recommend}
          sortType={sortType}
          emptyMessage={
            <EmptyPage
              className={'pt-[8%] !justify-start'}
              message={!isJoined ? '快加入社区发布你的第一个动态~' : '发布你的第一个动态~'}
              image={placeholderUnpublishedLightImage}
              context={'这里空空如也，快去发布动态\n遇见更多有趣的人吧'}
            />
          }
        />
      </div>

      <div className={'absolute bottom-4 z-[2] ml-[50%] translate-x-[-50%]'}>
        {isJoined ?
          <PermissionBuilder
            permission={ChannelPermission.ChannelManager | PostPermission.CreatePost}
            guildId={guild?.circle.guild_id}
            channelId={guild?.circle.channel_id}
          >
            {allow =>
              allow && guild && <PublishDropDownButton tag={tagId} showPublisher placement="top" channelId={guild.circle.channel_id} guild={guild} />
            }
          </PermissionBuilder>
        : guild ?
          <Button className="h-12 flex items-center text-base pl-4" type="primary" onClick={handleGuildClick}>
            <CosImage
              className={'rounded-lg border-fgWhite1 !border-[1.5px] bg-[var(--fg-white-1)] object-cover mr-2'}
              src={guild.icon}
              size={32}
              placeholder={<iconpark-icon name="Server-Avatar" size={30} class={'text-[var(--fg-b5)]'}></iconpark-icon>}
              fallback={<iconpark-icon name="Server-Avatar" size={30} class={'text-[var(--fg-b5)]'}></iconpark-icon>}
            />
            加入社区
          </Button>
        : null}
      </div>
    </div>
  )
}
