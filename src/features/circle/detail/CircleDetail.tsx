import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import './circle-detail.less'

import { useSize } from 'ahooks'
import { Alert, Divider } from 'antd'
import clsx from 'clsx'
import FbToast from 'fb-components/base_ui/fb_toast'
import CircleArticle from 'fb-components/circle/CircleArticle.tsx'
import CircleDetailContext, { ReplyParams } from 'fb-components/circle/CircleDetailContext.ts'
import CircleImageSlider from 'fb-components/circle/CircleImageSlider.tsx'
import useCircleContent from 'fb-components/circle/hooks/useCircleContent.tsx'
import {
  CircleActionType,
  CircleCommentItemStruct,
  CircleCommentStruct,
  CircleCommentUserStruct,
  CircleContentStruct,
  CircleDisplay,
  CircleVisibility,
  PostStruct,
  PostType,
  SubInfo,
} from 'fb-components/circle/types.ts'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { MessageType } from 'fb-components/components/messages/types.ts'
import FbVideo from 'fb-components/components/video/FbVideo.tsx'
import { VideoWrapper } from 'fb-components/components/video/VideoWrapper.tsx'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { SimpleUserStruct, SwitchType } from 'fb-components/struct/type.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { cloneDeep, isNil } from 'lodash-es'
import { Op } from 'quill-delta'
import { CSSProperties, HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { v4 as uuidv4 } from 'uuid'
import placeholderNoMessageImage from '../../../assets/images/placeholder_nomessage_light.svg'
import placeholderPermissionImage from '../../../assets/images/placeholder_nopermission_light.svg'
import ServerTime from '../../../base_services/ServerTime.ts'
import { useGuild } from '../../../base_services/permission/usePermissions.ts'
import Delay from '../../../components/Delay.tsx'
import EmptyPage from '../../../components/EmptyPage.tsx'
import ListFooter from '../../../components/ListFooter.tsx'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import ShareMenuDropdown from '../../../components/share/ShareMenuDropdown.tsx'
import { ShareType } from '../../../components/share/type.ts'
import UserCard from '../../../components/user_card'
import CircleLinkHandler from '../../../services/link_handler/CircleLinkHandler.ts'
import { PaginationResp3, invertSwitchType } from '../../../types.ts'
import StateUtils from '../../../utils/StateUtils.ts'
import { copyText } from '../../../utils/clipboard.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { GuildContext } from '../../home/GuildWrapper.tsx'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import MessageService from '../../message_list/MessageService.ts'
import { CircleShareContentStruct } from '../../message_list/items/CircleShareMessage.tsx'
import useJoinGuild from '../../question/hooks/useJoinGuild.ts'
import { CircleUtils } from '../CircleUtils.tsx'
import CircleApi, { CircleCommentListResp } from '../circle_api.ts'
import { useUpdateCircleInfo } from '../hooks/useUpdateCircleInfo.ts'
import { CircleComment } from './CircleComment.tsx'
import CircleDetailBottomBar from './CircleDetailBottomBar.tsx'
import CircleMenuDropdown, { CircleActions } from './CircleMenuDropdown.tsx'
import SupportSection from './SupportSection.tsx'

const rightWidth = 480
const leftWidth = `calc(100vw - ${rightWidth}px - 100px)`
const leftMinWidth = 480
const leftArticleWidth = 720

export interface BaseCircleDetailProps {
  guildId?: string
  postId: string
  targetCommentId?: string
  originDetail?: CircleContentStruct
  onClose?: () => void
}

export type CircleDetailProps = BaseCircleDetailProps & CircleActions & HTMLAttributes<never>

const RenderEmptyPage = ({
  style,
  onClose,
  message,
  context,
}: {
  style?: React.CSSProperties
  onClose?: () => void
  message?: string
  context?: string
}) => (
  <div className="flex-center" style={style}>
    {onClose && (
      <HoverBox className="absolute right-[16px] top-[14px]" onClick={onClose}>
        <iconpark-icon size={20} name="Close" />
      </HoverBox>
    )}
    <EmptyPage image={placeholderPermissionImage} imageSize={120} message={message} context={context} />
  </div>
)

export function CircleDetail({
  guildId,
  postId,
  targetCommentId,
  originDetail,
  onClose,
  onDelete,
  onLike,
  onUpdateVisibility,
  onUpdateUnRecommend,
  onUpdateRecommend,
  onUpdateTags,
  onTop,
  style,
  ...props
}: CircleDetailProps) {
  guildId ??= GuildUtils.getCurrentGuildId()
  const [circleDetail, setCircleDetail] = useState<CircleContentStruct | undefined>(originDetail)
  const [loading, setLoading] = useState(false)
  const replyHeadRef = useRef<HTMLDivElement>(null)
  const {
    post,
    user,
    guild,
    sub_info = {
      comment_total: 0,
      like_total: 0,
      share_total: 0,
      can_del: 0,
      like_id: undefined,
      liked: SwitchType.No,
      like_detail: [],
      is_top: false,
      is_follow: false,
      follow_total: 0,
    },
    deleted,
  } = circleDetail ?? {
    post: {},
    loading: false,
  }
  const { post_type, channel_id, guild_id, tag_ids, tags } = post
  const { liked, is_follow, is_top, like_id } = sub_info
  const guildFromList = useGuild(guild_id)

  // 打开圈子时更新信息 否则无法获取频道权限信息
  useUpdateCircleInfo({ guildId: guild_id, channelId: channel_id })

  // const permission = usePermissions({
  //   permission: ChannelPermission.ChannelManager,
  //   guildId: guild_id,
  //   channelId: channel_id,
  // })

  const [commentDetail, setCommentDetail] = useState<CircleCommentListResp>({
    list_id: '',
    next: '0',
    records: [],
    total: '0',
    size: 20,
    loading: false,
  })
  const { records: commentList = [], loading: answerLoading, next } = commentDetail ?? {}
  const articleRef = useRef<HTMLDivElement>(null)
  const leftContainerRef = useRef<HTMLDivElement>(null)
  const leftContainerSize = useSize(leftContainerRef) ?? { width: 0, height: 0 }
  const [stickyCommentIds, setStickyCommentIds] = useState<string[]>([])
  const [modalWidth, setModalWidth] = useState(0)
  const { images, video } = useCircleContent(circleDetail?.post.content ?? [], circleDetail?.post.post_type ?? PostType.empty)
  const [replyPageParams, setReplyPageParams] = useState<Map<string, Omit<PaginationResp3<CircleCommentItemStruct>, 'list'>>>(new Map())
  const scrollableDivId = useMemo(() => `${uuidv4()}`, [])
  const handleGuildClick = useJoinGuild(guild_id)

  // const computeLeftMaxWidth = () => {
  //   if (!post_type) return 0
  //   if (![PostType.video, PostType.image].includes(post_type)) {
  //     return leftArticleWidth
  //   }
  //   return window.innerHeight - 80
  // }

  const computeModalWidth = () => {
    let modalWidth
    if (post_type && [PostType.video, PostType.image].includes(post_type)) {
      modalWidth = rightWidth + (window.innerHeight - 80)
    } else {
      modalWidth = rightWidth + leftArticleWidth
    }
    setModalWidth(Math.min(modalWidth, window.innerWidth - 80))
  }

  useEffect(() => {
    computeModalWidth()
    window.addEventListener('resize', computeModalWidth)
    return () => {
      window.removeEventListener('resize', computeModalWidth)
    }
  }, [])

  useEffect(() => {
    if (postId) {
      if (loading) return
      if (!circleDetail) {
        setLoading(true)
      }
      CircleApi.getPostDetail(postId)
        .then(detail => {
          setCircleDetail(detail)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [postId])

  useEffect(() => {
    const { list_id, loading } = commentDetail
    if (!list_id && !loading) {
      if (circleDetail)
        fetchCommentList(true).then(() => {
          setTimeout(() => {
            targetCommentId && scrollToReplyHead()
          }, 0)
        })
    }
  }, [circleDetail, commentDetail])

  const fetchCommentList = useCallback(
    async (firstLoad: boolean = false) => {
      setCommentDetail({
        ...commentDetail,
        loading: true,
      })
      const { list_id } = commentDetail ?? {}
      if (!channel_id) return
      const res = await CircleApi.getCommentList({ postId, channelId: channel_id, listId: list_id })
      if (targetCommentId) {
        let stickyCommentIds: string[] = []
        if (firstLoad) {
          const recordIdx = res.records.findIndex(e => e.comment.comment_id === targetCommentId)
          if (recordIdx === -1) {
            try {
              const commentItem = await CircleApi.getCommentById(postId, targetCommentId)
              res.records.unshift(commentItem[0])
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
            }
          } else {
            const record = res.records[recordIdx]
            res.records.splice(recordIdx, 1)
            res.records.unshift(record)
          }
          const firstCommentItem = res.records[0]
          stickyCommentIds =
            firstCommentItem ? [firstCommentItem.comment.comment_id, ...firstCommentItem.comment.reply_list.map(e => e.comment.comment_id)] : []
          setStickyCommentIds(stickyCommentIds)
        }
        const recordIdx = res.records.findIndex((e, i) => i !== 0 && stickyCommentIds.includes(e.comment.comment_id))
        recordIdx !== -1 && res.records.splice(recordIdx, 1)
      }
      setCommentDetail({
        ...res,
        records: [...commentDetail.records, ...res.records],
        loading: false,
      })
    },
    [circleDetail, commentDetail, loading]
  )

  function onSubInfoChange(subInfo: Partial<SubInfo>) {
    setCircleDetail({
      ...circleDetail,
      sub_info: {
        ...sub_info,
        ...subInfo,
      },
    } as CircleContentStruct)
    onLike?.(subInfo)
  }

  function onCopy(content: Op[]) {
    const text = richText2PlainText(transformRichText(content))
    copyText(text).then()
  }

  function scrollToReplyHead() {
    replyHeadRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleToggleLike({
    type,
    liked,
    likeId,
    commentId,
    replyId,
  }: {
    type: CircleActionType
    liked: SwitchType
    likeId?: string
    commentId?: string
    replyId?: string
  }) {
    const { channel_id, post_id, topic_id } = post ?? {}
    if (!channel_id || !topic_id || !post_id) return
    let updateLikeId
    const actionType = type === CircleActionType.post ? 'post' : 'comment'
    const actionCommentId =
      type == CircleActionType.post ? undefined
      : type === CircleActionType.comment ? commentId
      : replyId
    if (liked) {
      likeId && (await CircleUtils.deleteLike(channel_id, topic_id, post_id, likeId, actionType, actionCommentId))
    } else {
      updateLikeId = await CircleUtils.addLike(channel_id, topic_id, post_id, actionType, actionCommentId)
    }
    const updateLiked = invertSwitchType(liked)

    if (type === CircleActionType.post) {
      const like_detail = [...(sub_info?.like_detail ?? [])]
      if (updateLiked == SwitchType.Yes && updateLikeId) {
        like_detail.unshift({ user_id: LocalUserInfo.userId, reaction_id: updateLikeId })
      } else {
        const userIdx = like_detail.findIndex(e => e.user_id == LocalUserInfo.userId)
        if (userIdx != -1) {
          like_detail.splice(userIdx, 1)
        }
      }
      onSubInfoChange({
        like_id: updateLikeId,
        liked: updateLiked,
        like_total: Math.max(0, (sub_info?.like_total ?? 0) + (updateLiked === SwitchType.Yes ? 1 : -1)),
        like_detail: [...like_detail],
      })
    } else if (type === CircleActionType.comment) {
      const commentIdx = commentList.findIndex(e => e.comment.comment_id === commentId)
      if (commentIdx === -1) return
      const commentItem = commentList[commentIdx]
      const updateCommentItem: CircleCommentItemStruct = {
        ...commentItem,
        comment: {
          ...commentItem.comment,
          liked: updateLiked,
          like_total: commentItem.comment.like_total + (updateLiked === SwitchType.Yes ? 1 : -1),
          like_id: updateLikeId,
        },
      }
      commentList.splice(commentIdx, 1, updateCommentItem)
      setCommentDetail({
        ...commentDetail,
        records: [...commentList],
      })
    } else if (type === CircleActionType.reply) {
      const commentIdx = commentList.findIndex(e => e.comment.comment_id === commentId)
      if (commentIdx === -1) return
      const commentItem = commentList[commentIdx]
      const { comment } = commentItem
      const replyIdx = comment.reply_list.findIndex(e => e.comment.comment_id === replyId)
      if (replyIdx === -1) return
      const reply = comment.reply_list[replyIdx]
      const updateReply = {
        ...reply,
        comment: {
          ...reply.comment,
          liked: updateLiked,
          like_total: reply.comment.like_total + (updateLiked === SwitchType.Yes ? 1 : -1),
          like_id: updateLikeId,
        },
      }
      comment.reply_list.splice(replyIdx, 1, updateReply)
      const updateCommentItem: CircleCommentItemStruct = {
        ...commentItem,
        comment: { ...comment },
      }
      commentList.splice(commentIdx, 1, updateCommentItem)
      setCommentDetail({
        ...commentDetail,
        records: [...commentList],
      })
    }
  }

  async function handleToggleFollow() {
    const { channel_id } = post
    const updateFollow = !is_follow
    await CircleApi.toggleFollow({
      channelId: channel_id,
      postId,
      flag: updateFollow,
    })
    onSubInfoChange({
      is_follow: updateFollow,
      follow_total: sub_info.follow_total + (updateFollow ? 1 : -1),
    })
  }

  function handleComment(comment: CircleCommentStruct, replyParams: ReplyParams) {
    const { replyType, commentId, replyId } = replyParams
    const { user_id, nickname, username, avatar } = StateUtils.localUser
    const newComment = {
      user: { user_id, nickname, avatar, username },
      comment,
    } as CircleCommentItemStruct
    switch (replyType) {
      case CircleActionType.post: {
        const commentList = commentDetail.records
        commentList.unshift(newComment)
        setCommentDetail({
          ...commentDetail,
          records: [...commentList],
        })
        setTimeout(() => {
          scrollToReplyHead()
        }, 200)
        break
      }
      case CircleActionType.comment: {
        const commentList = commentDetail.records
        const commentItemIdx = commentList.findIndex(e => e.comment.comment_id === commentId)
        if (commentItemIdx === -1) return
        const commentItem = commentList[commentItemIdx]
        const { comment } = commentItem
        commentItem.comment.reply_list.unshift(newComment)
        commentList.splice(commentItemIdx, 1, {
          ...commentItem,
          comment: {
            ...comment,
            comment_total: comment.comment_total + 1,
            reply_list: [...comment.reply_list],
          },
        })
        setCommentDetail({
          ...commentDetail,
          records: [...commentList],
        })
        break
      }
      case CircleActionType.reply: {
        const commentItemIdx = commentList.findIndex(e => e.comment.comment_id === commentId)
        if (commentItemIdx === -1) return
        const commentItem = commentList[commentItemIdx]
        const replyIdx = commentItem.comment.reply_list.findIndex(e => e.comment.comment_id === replyId)
        if (replyIdx === -1) return
        const { comment } = commentItem
        comment.reply_list.splice(replyIdx + 1, 0, newComment)
        commentList.splice(commentItemIdx, 1, {
          ...commentItem,
          comment: {
            ...comment,
            comment_total: comment.comment_total + 1,
            reply_list: [...comment.reply_list],
          },
        })
        setCommentDetail({
          ...commentDetail,
          records: [...commentList],
        })
        break
      }
    }

    onSubInfoChange({ comment_total: sub_info?.comment_total + 1 })
  }

  async function handleDeleteComment({
    type,
    commentId,
    replyId,
  }: {
    type: CircleActionType.comment | CircleActionType.reply
    commentId: string
    replyId?: string
  }) {
    const commentIdx = commentList.findIndex(e => e.comment.comment_id === commentId)
    if (commentIdx === -1) return
    const targetId = type === CircleActionType.comment ? commentId : replyId

    !isNil(targetId) &&
      (await CircleApi.deleteComment({
        postId,
        commentId: targetId,
      }))

    const commentItem = commentList[commentIdx]
    const { comment } = commentItem
    if (type === CircleActionType.comment) {
      commentList.splice(commentIdx, 1)
      setCommentDetail({
        ...commentDetail,
        list: [...commentList],
      } as CircleCommentListResp)
      setCircleDetail({
        ...circleDetail,
        sub_info: {
          ...circleDetail?.sub_info,
          comment_total: (circleDetail?.sub_info?.comment_total ?? 1) - (comment.comment_total + 1),
        },
      } as CircleContentStruct)
    } else if (type === CircleActionType.reply) {
      const replyIdx = comment.reply_list.findIndex(e => e.comment.comment_id === replyId)
      if (replyIdx === -1) return
      comment.reply_list.splice(replyIdx, 1)
      commentList.splice(commentIdx, 1, {
        ...commentItem,
        comment: { ...comment, comment_total: comment.comment_total - 1, reply_list: comment.reply_list },
      })
      setCommentDetail({
        ...commentDetail,
        list: [...commentList],
      } as CircleCommentListResp)
      setCircleDetail({
        ...circleDetail,
        sub_info: {
          ...circleDetail?.sub_info,
          comment_total: (circleDetail?.sub_info?.comment_total ?? 1) - 1,
        },
      } as CircleContentStruct)
    }
  }

  async function onLoadReply(commentId: string) {
    const apiState = replyPageParams.get(commentId)
    const res = await CircleApi.getReplyList({ postId, commentId, listId: apiState?.list_id })
    const commentItemIdx = commentList.findIndex(e => e.comment.comment_id === commentId)
    if (commentItemIdx === -1) return
    const commentItem = commentList[commentItemIdx]
    if (!commentItem) return
    const { comment } = commentItem
    const firstLoad = res.records.length > 0 && !apiState?.list_id
    if (targetCommentId && stickyCommentIds.includes(commentId)) {
      res.records = res.records.filter(e => !stickyCommentIds.includes(e.comment.comment_id))
    } else {
      if (firstLoad) {
        res.records = res.records.filter(r => !comment.reply_list.map(e => e.comment.comment_id).includes(r.comment.comment_id))
      }
    }
    comment.reply_list = [...(comment.reply_list ?? []), ...res.records]
    commentList.splice(commentItemIdx, 1, commentItem)
    setCommentDetail({
      ...commentDetail,
      records: [...commentList],
    })
    replyPageParams.set(commentId, { ...res })
    setReplyPageParams(new Map(replyPageParams))
  }

  async function onShare(
    control: ShareType,
    extraParams?: {
      channelId: string
      channelType: ChannelType
      guildId: string
    }
  ) {
    switch (control) {
      case ShareType.Link: {
        try {
          const link = CircleLinkHandler.getShareLink({ postId })
          await copyText(link, '分享链接已复制，快去分享给好友吧。')
        } catch (err) {
          FbToast.open({ type: 'error', content: '分享链接复制失败，请重试。', key: 'share-link-failed' })
          console.error(err)
        }
        break
      }
      case ShareType.Channel: {
        const { channelId, channelType, guildId } = extraParams || {}
        if (!channelId || !guildId || channelType === undefined) {
          FbToast.open({ type: 'error', content: '分享至频道失败，请重试。', key: 'share-link-failed' })
          console.error(new Error('share channelId or guildId is empty'))
          break
        }
        try {
          await MessageService.instance.sendMessage(
            channelId,
            {
              type: MessageType.CircleShare,
              data: {
                user: user,
                post: CircleUtils.tinyShareData(cloneDeep(post) as PostStruct),
                sub_info: sub_info,
              },
            } as CircleShareContentStruct,
            {
              guildId,
              channelType,
              desc: `${StateUtils.localUser.nickname}：分享了[${user?.nickname}的动态]`,
            }
          )
          CircleApi.shareCounter(postId).catch(() => {
            /* ignore */
          })
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

  const [replyParams, setReplyParams] = useState<ReplyParams>({ replyType: CircleActionType.post })
  const detailConfig = {
    buildAvatar: (user: CircleCommentUserStruct, size: number) => {
      return (
        <UserCard userId={user.user_id}>
          <RealtimeAvatar userId={user.user_id} size={size} />
        </UserCard>
      )
    },
    buildName: (user: CircleCommentUserStruct) => (
      <UserCard userId={user.user_id} guildId={guild?.guild_id}>
        <RealtimeNickname userId={user.user_id} />
      </UserCard>
    ),
    buildMentionUser: (user: SimpleUserStruct) => (
      <UserCard userId={user.user_id} guildId={guild?.guild_id}>
        <RealtimeNickname prefix={'@'} userId={user.user_id} className={'mx-1 text-[var(--fg-blue-1)]'} />
      </UserCard>
    ),
  }

  const baseStyle: CSSProperties = { height: 'calc(100vh - 80px)', width: modalWidth }
  if (loading || !circleDetail) {
    return (
      <div className="flex-center" style={baseStyle}>
        <CircularLoading size={24} />
      </div>
    )
  }

  // 不在社区中，并且社区设置为私密
  if (!guildFromList && guild?.guild_circle_view === 0) {
    return <RenderEmptyPage style={baseStyle} onClose={onClose} message="暂时无法查看" />
  }

  if (deleted || !post) {
    return <RenderEmptyPage style={baseStyle} onClose={onClose} message="动态不见了" />
  }

  const isPrivatePost = post.visibility !== CircleVisibility.all && user?.user_id !== LocalUserInfo.userId

  if (isPrivatePost) {
    return <RenderEmptyPage style={baseStyle} onClose={onClose} message="暂时无法查看" context="作者目前未公开此动态" />
  }

  return (
    <GuildContext.Provider value={GuildUtils.getGuildById(guildId)}>
      <CircleDetailContext.Provider value={{ replyParams, setReplyParams, circleTagIds: tag_ids ?? [], circleTagList: tags, ...detailConfig }}>
        <div className="relative">
          {/* {isPrivatePost ?
            <div className="absolute top-0 right-0 bottom-0 left-0 z-50 flex-center bg-fgWhite1/60">
              {onClose && (
                <HoverBox className=" absolute right-[16px] top-[14px]" onClick={onClose}>
                  <iconpark-icon size={20} name="Close" />
                </HoverBox>
              )}
              <div className="bg-fgWhite1 px-9 pb-4 rounded-xl ">
                <EmptyPage image={placeholderPermissionImage} imageSize={120} message="暂时无法查看" context="作者目前未公开此动态" />
              </div>
            </div>
          : null} */}
          <div {...props} className={`flex-center circle-detail ${isPrivatePost ? 'blur' : ''}`} style={{ ...baseStyle, ...style }}>
            <div className={clsx(['left h-full flex-center flex-1 overflow-hidden', post_type === PostType.video && 'bg-black'])}>
              <div ref={leftContainerRef} className="flex-center h-full" style={{ width: leftWidth, minWidth: leftMinWidth }}>
                {(() => {
                  switch (post_type) {
                    case PostType.image:
                      return (
                        images &&
                        images.length > 0 && (
                          <CircleImageSlider
                            width={leftContainerSize.width}
                            height={leftContainerSize.height}
                            rootClassName={'circle-detail-carousel w-full'}
                            images={images.map(e => e.url)}
                            imageStyle={{
                              minWidth: leftMinWidth,
                              height: 'calc(100vh - 80px)',
                              margin: '0 auto',
                              backgroundSize: 'contain',
                            }}
                          />
                        )
                      )
                    case PostType.video: {
                      const { width, height } = leftContainerSize
                      return (
                        video && (
                          <div className="flex-center h-full w-full">
                            <VideoWrapper url={video.url} originSize={{ width: video.width, height: video.height }} limitSize={{ width, height }}>
                              {size => <FbVideo width={size.width} height={size.height} poster={video.preview} src={video.url} />}
                            </VideoWrapper>
                          </div>
                        )
                      )
                    }
                    case PostType.article:
                    case PostType.multi_para:
                    case PostType.none:
                    case PostType.empty:
                    case undefined: {
                      return (
                        <div className={'flex h-full w-full flex-col'}>
                          <LongArticleTag />
                          {/* 手动设为不推荐、被ai舆情管控导致设为不推荐，均不出现此提示（新版本需求） */}
                          {/* {post.recommend != SwitchType.Yes && permission.has(ChannelPermission.ChannelManager) ?
                          <Alert
                            className="w-[calc(100%-48px)] mx-6 rounded-lg"
                            type="warning"
                            icon={<iconpark-icon name="ExclamationCircle" class=" text-functionYellow1" size={16}></iconpark-icon>}
                            banner
                            message={
                              <div className="flex items-center gap-1 text-xs">
                                <span className="ml-2">动态已被设置为不推荐，当前圈子内不可见</span>
                                <iconpark-icon name="DoubleRight"></iconpark-icon>
                              </div>
                            }
                          />
                        : null} */}
                          {post.visibility !== CircleVisibility.all ?
                            <Alert
                              className="w-[calc(100%-48px)] mx-6 rounded-lg"
                              type="warning"
                              icon={<iconpark-icon name="ExclamationCircle" class=" text-functionYellow1" size={16}></iconpark-icon>}
                              banner
                              message={<span className="ml-2 text-xs">此动态仅自己可见，可设置为公开可见</span>}
                            />
                          : null}
                          <div className={'flex-1 overflow-y-auto px-6 pb-20 pt-2'}>
                            <CircleArticle
                              ref={articleRef}
                              detail={circleDetail}
                              currentGuildId={guildId}
                              parentWidth={leftContainerSize.width - 48}
                              buildAvatar={detailConfig.buildAvatar}
                              buildName={detailConfig.buildName}
                              buildMentionUser={detailConfig.buildMentionUser}
                              guildVisible={guildId !== guild_id}
                              onGuildClick={handleGuildClick}
                            />
                          </div>
                        </div>
                      )
                    }
                  }
                })()}
              </div>
            </div>
            <Divider type={'vertical'} rootClassName={'m-0 h-full'} />

            <div className="flex h-full flex-col rounded-xl bg-[var(--bg-bg-3)] leading-[1.625] text-[var(--fg-b100)]" style={{ width: rightWidth }}>
              <div className={'flex h-14 flex-shrink-0 items-center pl-6 pr-[18px] text-[14px]'}>
                <UserCard userId={user?.user_id ?? ''}>
                  <div className="flex-center">
                    <RealtimeUserInfo userId={user?.user_id ?? ''}>
                      <RealtimeAvatar userId={user?.user_id ?? ''}></RealtimeAvatar>
                      <RealtimeNickname userId={user?.user_id ?? ''} className={'truncate pl-2 pr-3'}></RealtimeNickname>
                    </RealtimeUserInfo>
                  </div>
                </UserCard>
                <div className={'flex-1'}></div>
                <ShareMenuDropdown guildId={guild_id} channelId={channel_id} afterHandler={onShare}>
                  <HoverBox className="mr-[12px]">
                    <iconpark-icon size={20} name="Share" />
                  </HoverBox>
                </ShareMenuDropdown>
                <CircleMenuDropdown
                  detail={circleDetail}
                  onDelete={() => {
                    setCircleDetail({ deleted: true, post: { post_id: postId } as PostStruct })
                    onClose?.()
                    onDelete?.()
                  }}
                  onTop={(res, detail) => {
                    onSubInfoChange({
                      is_top: !is_top,
                    })
                    onTop?.(res, detail)
                  }}
                  onUpdateVisibility={display => {
                    setCircleDetail({
                      ...circleDetail,
                      post: {
                        ...post,
                        display: display,
                        visibility: display == CircleDisplay.public ? CircleVisibility.all : CircleVisibility.onlyMe,
                      },
                    } as CircleContentStruct)
                    onUpdateVisibility?.(display)
                  }}
                  onUpdateRecommend={recommendDay => {
                    setCircleDetail({
                      ...circleDetail,
                      post: {
                        ...post,
                        recommend_at: ServerTime.now(),
                        recommend_day: recommendDay,
                      },
                    } as CircleContentStruct)
                    onUpdateRecommend?.(recommendDay)
                  }}
                  onUpdateTags={tags => {
                    setCircleDetail({
                      ...circleDetail,
                      post: {
                        ...post,
                        tags,
                        tag_ids: tags.map(tag => tag.tag_id),
                      },
                    } as CircleContentStruct)
                    onUpdateTags?.(tags)
                  }}
                  onUpdateUnRecommend={recommend => {
                    setCircleDetail({
                      ...circleDetail,
                      post: {
                        ...post,
                        recommend,
                      },
                    } as CircleContentStruct)
                    onUpdateUnRecommend?.(recommend)
                  }}
                >
                  <HoverBox className="mr-[12px]">
                    <iconpark-icon size={20} name="More" />
                  </HoverBox>
                </CircleMenuDropdown>
                {onClose && (
                  <HoverBox onClick={onClose}>
                    <iconpark-icon size={20} name="Close" />
                  </HoverBox>
                )}
              </div>
              {/*分割线*/}
              <Divider rootClassName={'m-0'} />
              {/*滚动区域*/}
              <div className={'flex-1 overflow-y-auto'} id={scrollableDivId}>
                {/*加延迟处理，避免InfiniteScroll组件内部在componentDidMount获取scrollableTarget可能为空（可能和antd modal组件有关）*/}
                <Delay waitTime={0}>
                  <InfiniteScroll
                    scrollableTarget={scrollableDivId}
                    dataLength={commentList.length}
                    next={() => {
                      fetchCommentList().then()
                    }}
                    hasMore={next === '1'}
                    loader={
                      !commentList.length ?
                        <></>
                      : <div className={'flex-center h-[48px]'}>
                          <CircularLoading />
                        </div>
                    }
                    endMessage={<ListFooter visible={commentList.length > 0} />}
                  >
                    {/* 手动设为不推荐、被ai舆情管控导致设为不推荐，均不出现此提示（新版本需求） */}
                    {/* {(post_type == PostType.image || post_type == PostType.video) && post.recommend != SwitchType.Yes && permission.has(ChannelPermission.ChannelManager) ?
                      <Alert
                        className="w-full pl-6"
                        type="warning"
                        icon={<iconpark-icon name="WarmingFill" class=" text-functionYellow1" size={16}></iconpark-icon>}
                        banner
                        message={
                          <div className="flex items-center gap-1 text-xs">
                            <span className="ml-2">动态已被设置为不推荐，当前圈子内不可见</span>
                            <iconpark-icon name="DoubleRight"></iconpark-icon>
                          </div>
                        }
                      />
                    : null} */}
                    {(post_type == PostType.image || post_type == PostType.video) && post.visibility !== CircleVisibility.all ?
                      <Alert
                        className="w-full pl-6"
                        type="warning"
                        icon={<iconpark-icon name="ExclamationCircle" class=" text-functionYellow1" size={16}></iconpark-icon>}
                        banner
                        message={<span className="ml-2 text-xs">此动态仅自己可见，可设置为公开可见</span>}
                      />
                    : null}
                    <div className={'flex flex-1 flex-col overflow-y-scroll px-6'}>
                      {(post_type == PostType.image || post_type == PostType.video) && (
                        <CircleArticle
                          ref={articleRef}
                          detail={circleDetail}
                          currentGuildId={guildId}
                          buildAvatar={detailConfig.buildAvatar}
                          buildName={detailConfig.buildName}
                          buildMentionUser={detailConfig.buildMentionUser}
                          guildVisible={guildId !== guild_id}
                          onGuildClick={handleGuildClick}
                        />
                      )}
                      {/*点赞*/}
                      {sub_info && (
                        <SupportSection
                          detail={circleDetail}
                          onToggleLike={() =>
                            handleToggleLike({
                              type: CircleActionType.post,
                              liked: liked ?? SwitchType.No,
                              likeId: like_id,
                            })
                          }
                        />
                      )}
                      {/*回答列表*/}
                      {commentList.length ?
                        <>
                          <div ref={replyHeadRef} className={'pb-1 pt-4 text-[14px] font-medium'}>
                            评论&nbsp;{formatCount(sub_info?.comment_total)}
                          </div>
                          {commentList.map(item =>
                            item?.comment ?
                              <CircleComment
                                key={item.comment.comment_id}
                                data={item}
                                highlightCommentId={targetCommentId}
                                authorId={user?.user_id}
                                onToggleLike={() =>
                                  handleToggleLike({
                                    type: CircleActionType.comment,
                                    liked: item.comment.liked,
                                    commentId: item.comment.comment_id,
                                    likeId: item.comment.like_id,
                                  })
                                }
                                onReplyToggleLike={(replyId, liked, likeId) =>
                                  handleToggleLike({
                                    type: CircleActionType.reply,
                                    liked,
                                    commentId: item.comment.comment_id,
                                    likeId: likeId,
                                    replyId,
                                  })
                                }
                                onDeleteComment={() => {
                                  handleDeleteComment({
                                    type: CircleActionType.comment,
                                    commentId: item.comment.comment_id,
                                  }).then()
                                }}
                                onCopy={() => onCopy(item.comment.content)}
                                onDeleteReply={replyId => {
                                  handleDeleteComment({
                                    type: CircleActionType.reply,
                                    commentId: item.comment.comment_id,
                                    replyId,
                                  }).then()
                                }}
                                onLoadReply={() => onLoadReply(item.comment.comment_id)}
                              />
                            : null
                          )}
                        </>
                      : answerLoading ?
                        <div className="flex w-full items-center justify-center py-[48px]">
                          <CircularLoading size={24} />
                        </div>
                      : <div className="h-full w-full py-[48px]">
                          <EmptyPage image={placeholderNoMessageImage} imageSize={120} message="" context="快来参与讨论吧~" />
                        </div>
                      }
                    </div>
                  </InfiniteScroll>
                </Delay>
              </div>
              <Divider rootClassName={'m-0 w-full'} />
              <CircleDetailBottomBar
                detail={circleDetail}
                onToggleLike={() =>
                  handleToggleLike({
                    type: CircleActionType.post,
                    liked: liked ?? SwitchType.No,
                    likeId: like_id,
                  })
                }
                onToggleFollow={handleToggleFollow}
                onComment={handleComment}
                onScrollToComment={scrollToReplyHead}
              />
            </div>
          </div>
        </div>
      </CircleDetailContext.Provider>
    </GuildContext.Provider>
  )
}

function LongArticleTag() {
  return (
    <div className={'flex h-14 flex-shrink-0 items-center px-6 pt-4'}>
      <div className={'flex-center h-[24px] w-[80px] gap-1 rounded-full bg-[var(--fg-b5)] text-xs font-medium text-[var(--fg-b40)]'}>
        <iconpark-icon name="Article" color={'var(--fg-b40)'}></iconpark-icon>
        <span>长文详情</span>
      </div>
    </div>
  )
}

export default CircleDetail
