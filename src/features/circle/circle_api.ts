import axios from 'axios'
import CryptoJS from 'crypto-js'
import {
  CircleCommentItemStruct,
  CircleCommentStruct,
  CircleCommentType,
  CircleContentStruct,
  CircleDisplay,
  CircleGuildInfo,
  CircleInfo,
  CircleSortType,
  CircleTagDetailStruct,
  CircleTagType,
  PostStruct,
  PostType,
  TagStruct,
} from 'fb-components/circle/types.ts'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { PermissionOverwrite, SwitchType } from 'fb-components/struct/type.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse.ts'
import { keyBy } from 'lodash-es'
import { Op } from 'quill-delta'
import { BusinessError } from '../../base_services/interceptors/response_interceptor.ts'
import { default as ServeSideConfigService, default as serverSideConfig } from '../../services/ServeSideConfigService.ts'
import { PaginationResp3, PaginationResp4 } from '../../types.ts'
import { CircleUtils } from './CircleUtils.tsx'

export interface SupportDetail {
  id: number
  user_id: string
  action_value: number
  created_at: number
}

export interface CircleCommentListResp {
  list_id: string
  next: string
  records: CircleCommentItemStruct[]
  total: string
  size: number
  loading: boolean
}

export interface CircleHotInfo {
  id: number
  post_id: string
  update_user_id: string
  status: SwitchType
  end_time: number
  create_time: number
  minutes: number
  update_time: number
}

export type ReactionType = 'post' | 'comment'

export type CircleSearchResp = { tags: TagStruct[]; list: CircleContentStruct[] }

export default class CircleApi {
  static async createTopic(guild_id: string, name: string) {
    return axios
      .post<never, { tag_id: string }>('/api/circleTag/touch', {
        guild_id,
        tag_name: name,
      })
      .then(res => res.tag_id)
  }

  static async searchTopic({ search, guildId, page, size }: { search: string; guildId?: string; page?: number; size?: number }) {
    return axios.post<never, PaginationResp4<TagStruct>>('/api/circleTag/list', {
      ...(search ? { wd: search } : {}),
      guild_id: guildId,
      page_size: size,
      page,
    })
  }

  static async post(data: {
    // 如果是更新帖子，需要传入post_id
    post_id?: string
    guild_id: string
    channel_id: string
    post_type: PostType
    title: string
    content_v2: Op[]
    mentions?: string[]
    tag_ids?: string[]
    cover: { source: string; width: number; height: number }
    display: CircleDisplay
  }): Promise<PostStruct> {
    const content_v2 = JSON.stringify(data.content_v2)
    return axios.post<void, PostStruct>('/api/circle/postUpdate', {
      ...data,
      c_hash: CryptoJS.algo.MD5.create().update(`${data.title}${content_v2}${Date.now()}`).finalize().toString(),
      content_v2,
      geo_region: ServeSideConfigService.geo_region,
      content: '[]', // 该字段为冗余字段，但是必填
    })
  }

  static async getTopics(guild_id: string) {
    return axios.post<
      never,
      (ChannelStruct & {
        topic_id: string
        overwrite: PermissionOverwrite[]
      })[]
    >('/api/circle/topic', { guild_id })
  }

  static async getPostDetail(postId: string, toast = false): Promise<CircleContentStruct> {
    try {
      const res = await axios.post<undefined, CircleContentStruct>(
        '/api/circlePost/detail',
        {
          post_id: postId,
        },
        { toast }
      )
      if (res.post) {
        res.post = CircleUtils.transformCircleData(res.post)
      }
      return res
    } catch (err) {
      if (err instanceof BusinessError) {
        if (err.code === 1089) {
          return { post: { post_id: postId } as PostStruct, deleted: true }
        }
      }
      throw err
    }
  }

  static async postList({
    guildId,
    channelId,
    keyword,
    topicId,
    size = 20,
    listId,
    lastPostId,
    sortType,
    order = '',
    hasVideo,
    createAt,
  }: {
    guildId: string
    channelId: string
    keyword?: string
    topicId?: string
    size?: number
    listId?: string
    lastPostId?: string
    sortType: CircleSortType
    order?: string
    hasVideo?: string
    createAt?: string
  }) {
    const isRainbowRule = serverSideConfig.isCircleUseRainbowHot(guildId)
    const result = await axios.post<void, PaginationResp3<CircleContentStruct>>('/api/circle/postList', {
      guild_id: guildId,
      channel_id: channelId,
      topic_id: topicId ?? channelId,
      size,
      wd: keyword ? keyword.trim() : undefined,
      list_id: listId,
      last_post_id: lastPostId,
      sort_type: sortType,
      ordering: order,
      ...(sortType == CircleSortType.Recommend ? { 'rule': isRainbowRule ?? false } : {}),
      has_video: hasVideo,
      create_at: createAt,
      // 新版圈子控制
      different: 0,
    })
    //获取topic列表后，更新权限
    //  PermissionModel.updateGuildCircleOverridePermission(guildId, topicRes);

    result.records = result.records.map(item => {
      if (item.post) {
        item.post = CircleUtils.transformCircleData(item.post)
      }
      return item
    })

    return result
  }

  /**
   * 搜索圈子列表（不分页，一次性展示），并返回对应tag信息
   * 假如批量获取tag接口失败或超时，则返回[]
   * @param guildId
   * @param keyword
   * @param page
   * @param size
   */
  static async search({
    guildId,
    keyword,
    page = 1,
    size = 500,
  }: {
    guildId: string
    keyword?: string
    page?: number
    size?: number
  }): Promise<CircleSearchResp> {
    const res = await axios.post<void, { list: CircleContentStruct[]; total: number }>('/api/search/circle', {
      guild_id: guildId,
      page,
      pageSize: size,
      wd: keyword ? keyword.trim() : undefined,
    })
    const tagIds: string[] = []
    res.list = res.list.map(item => {
      if (item.post) {
        item.post = CircleUtils.transformCircleData(item.post)
        tagIds.push(...(item.post.tag_ids ?? []))
      }
      return item
    })
    const top10Tags = findTopNumTagIds(tagIds, 10)
    let tags: TagStruct[]
    try {
      tags = await CircleApi.batchTag(top10Tags)
    } catch (e) {
      console.log('fetch tags error', e)
      tags = []
    }
    return {
      list: res.list,
      tags,
    }
  }

  static async batchTag(tagIds: string[]) {
    return axios.post<void, TagStruct[]>(
      '/api/circleTag/batch',
      {
        tag_ids: tagIds,
      },
      { timeout: 3000 }
    )
  }

  static async circleInfo({
    guildId,
    channelId,
    sortType,
    orderType = '',
  }: {
    guildId: string
    channelId: string
    sortType?: string
    orderType?: string
  }): Promise<CircleInfo> {
    const res = await axios.post<undefined, CircleInfo>('/api/circle/info', {
      guild_id: guildId,
      channel_id: channelId,
      sort_type: sortType,
      ordering: orderType,
    })
    res.top.records &&
      res.top.records.forEach(item => {
        if (item.post.post) {
          item.post.post = CircleUtils.transformCircleData(item.post.post)
          // 置顶帖子预处理
          item.post.parse_post = CircleUtils.parseToCardContent(item.post.post)
        }
      })

    res.channel.overwrite = keyBy(res.channel.overwrite, 'id')
    return res
  }

  static async circleGuildInfo(guildId: string) {
    return axios.post<undefined, CircleGuildInfo>('/api/circle/guildInfo', {
      guild_id: guildId,
    })
  }

  static async getCommentList({ channelId, postId, size = 10, listId }: { channelId: string; postId: string; size?: number; listId?: string }) {
    const res = await axios.post<void, CircleCommentListResp>('/api/circlePostComment/Lists', {
      channel_id: channelId,
      post_id: postId,
      list_id: listId,
      size: size,
      behavior: 'after',
    })
    res.records.forEach(e => {
      e.comment.content = safeJSONParse(e.comment.content_v2 || e.comment.content, [])
      if (e.comment.reply_list) {
        e.comment.reply_list.forEach(e => (e.comment.content = safeJSONParse(e.comment.content_v2 || e.comment.content, [])))
      }
    })
    return res
  }

  static async getReactionList({
    postId,
    listId,
    size = 30,
    order = 'desc',
  }: {
    postId: string
    listId?: string
    size?: number
    order?: 'desc' | 'asc'
  }) {
    return await axios.post<void, PaginationResp3<SupportDetail>>('/api/circlePost/reactionList', {
      'post_id': postId,
      'list_id': listId,
      'size': size,
      'order': order,
    })
  }

  static async createComment({
    guildId,
    channelId,
    topicId,
    content,
    postId,
    quote1,
    quote2,
    mentions = [],
    contentType = CircleCommentType.RichText,
    geoRegion,
  }: {
    guildId: string
    channelId: string
    topicId: string
    content: string
    postId: string
    quote1?: string
    quote2?: string
    mentions?: string[]
    contentType?: CircleCommentType
    geoRegion?: string
  }): Promise<CircleCommentStruct> {
    mentions = mentions ?? []
    const data = {
      guild_id: guildId,
      channel_id: channelId,
      topic_id: topicId,
      content,
      content_v2: undefined,
      content_type: contentType,
      post_id: postId,
      quote_l1: quote1,
      quote_l2: quote2,
      mentions,
      geo_region: geoRegion,
    }

    const res = await axios.post<void, CircleCommentStruct>('/api/circlePostComment/comment', data, { toast: true })
    res.content = safeJSONParse(res.content_v2 || res.content, [])
    res.reply_list ??= []
    res.comment_total ??= 0
    res.like_total ??= 0
    res.liked ??= SwitchType.No
    return res
  }

  static async delReaction({
    channelId,
    postId,
    topicId,
    delType,
    id,
    commentId,
  }: {
    channelId: string
    postId: string
    topicId: string
    delType: ReactionType
    id: string
    commentId?: string
  }): Promise<void> {
    const data = {
      'channel_id': channelId,
      'topic_id': topicId,
      'post_id': postId,
      't': delType,
      'id': id,
      'comment_id': commentId,
    }

    await axios.post('/api/circlePost/delReaction', data, { toast: true })
  }

  static async addReaction({
    channelId,
    postId,
    topicId,
    addType,
    commentId,
  }: {
    channelId: string
    postId: string
    topicId: string
    addType: ReactionType
    commentId?: string
  }): Promise<string> {
    const data = {
      'channel_id': channelId,
      'topic_id': topicId,
      'post_id': postId,
      't': addType,
      'comment_id': commentId,
    }

    const res = await axios.post<
      void,
      {
        guild_id: string
        id: string
      }
    >('/api/circlePost/addReaction', data, { toast: true })
    return res.id
  }

  static async toggleFollow({ channelId, postId, flag }: { channelId?: string | null; postId?: string | null; flag: boolean }): Promise<void> {
    return await axios.post(
      '/api/circle/follow',
      {
        'channel_id': channelId,
        'post_id': postId,
        'flag': flag ? '1' : '0',
        'server_json': {},
      },
      { toast: true }
    )
  }

  static async deleteComment({ commentId, postId }: { commentId: string; postId: string }): Promise<void> {
    return await axios.post(
      '/api/circlePostComment/del',
      {
        'comment_id': commentId,
        'post_id': postId,
      },
      { toast: true }
    )
  }

  static async getReplyList({ commentId, postId, size = 10, listId }: { commentId: string; postId: string; size?: number; listId?: string }) {
    const res = await axios.post<void, PaginationResp3<CircleCommentItemStruct>>('/api/circlePostComment/replyLists', {
      'comment_id': commentId,
      'post_id': postId,
      'list_id': listId,
      'size': size,
    })
    res.records.forEach(e => {
      e.comment.content = safeJSONParse(e.comment.content_v2 || e.comment.content, [])
    })
    return res
  }

  static async shareCounter(postId: string) {
    return axios.post('/api/circlePost/counter', {
      'post_id': postId,
      'type': 'post_share',
    })
  }

  static async deletePost({
    postId,
    channelId,
    topicId,
    isNotification = false,
    reason,
  }: {
    postId: string
    channelId: string
    topicId: string
    isNotification?: boolean
    reason?: string
  }) {
    return await axios.post('/api/circle/postDelete', {
      'post_id': postId,
      'channel_id': channelId,
      'topic_id': topicId,
      'notification': isNotification ? 0 : 1,
      'reason': reason,
    })
  }

  static async togglePin({
    postId,
    channelId,
    topicId,
    status,
    title,
  }: {
    postId: string
    channelId: string
    topicId: string
    status: '0' | '1'
    title?: string
  }) {
    return await axios.post(
      '/api/circlePost/top',
      {
        'post_id': postId,
        'channel_id': channelId,
        'topic_id': topicId,
        'status': status,
        'title': title,
      },
      { toast: true }
    )
  }

  static async setPostVisibility(postId: string, display: CircleDisplay) {
    return await axios.post(
      '/api/circlePost/display',
      {
        'post_id': postId,
        'display': display,
      },
      { toast: true }
    )
  }

  /// * 根据ID获取圈子评论：
  /// * commentId 是一级评论，附带返回它的第一条二级评论
  /// * commentId 是二级评论，附带返回一级评论
  static async getCommentById(postId: string, commentId: string) {
    const res = await axios.post<void, CircleCommentItemStruct[]>('/api/circlePostComment/commentDetail', {
      'post_id': postId,
      'comment_id': commentId,
      'level': 2, //表示多返回一条评论,即目标评论的引用二级评论
    })
    res.forEach(c => {
      c.comment.content = safeJSONParse(c.comment.content_v2 || c.comment.content, [])
      c.comment.reply_list.forEach(e => {
        e.comment.content = safeJSONParse(e.comment.content_v2 || e.comment.content, [])
        if (e.comment.reply_list) {
          e.comment.reply_list.forEach(e => (e.comment.content = safeJSONParse(e.comment.content_v2 || e.comment.content, [])))
        }
      })
    })
    return res
  }

  /**
   * 旧版的话题为 topicId 通过分享链接 type=topicId 判断 或 ChannelType.CircleTopic 判断
   * 新版的话题为 tagId 通过分享链接 type=tagId 判断
   */
  static async getCircleTagDetail({ tagId, guildId, type }: { tagId?: string; topicId?: string; guildId?: string; type: CircleTagType }) {
    return await axios.post<void, CircleTagDetailStruct>(
      '/api/circleTag/detail',
      {
        ...(type === CircleTagType.Tag ? { tag_id: tagId } : { topic_id: tagId }),
        guild_id: guildId,
      },
      { toast: true }
    )
  }

  /**
   * 旧版的话题为 topicId 通过分享链接 type=topicId 判断 或 ChannelType.CircleTopic 判断
   * 新版的话题为 tagId 通过分享链接 type=tagId 判断
   */
  static async tagPostList({
    tagId,
    guildId,
    size = 20,
    listId,
    sortType,
    type,
  }: {
    tagId?: string
    guildId?: string
    size?: number
    listId?: string
    sortType: CircleSortType
    type: CircleTagType
  }) {
    const result = await axios.post<void, PaginationResp3<CircleContentStruct>>('/api/circleTag/postList', {
      ...(type === CircleTagType.Tag ? { tag_id: tagId } : { topic_id: tagId }),
      guild_id: guildId,
      size,
      list_id: listId,
      sort_type: sortType,
    })
    result.records = result.records.map(item => {
      if (item.post) {
        item.post = CircleUtils.transformCircleData(item.post)
      }
      return item
    })

    return result
  }

  /// 动态上热门
  /// action 1：是新增加热 0是取消加热
  static async circleTopHot(postId: string, action: SwitchType, minutes?: number): Promise<void> {
    await axios.post(
      '/api/circlePost/hot',
      {
        post_id: postId,
        action,
        ...(minutes ? { minutes } : {}),
      },
      { toast: true }
    )
  }

  // 获得当前圈子热门信息
  static async circlePostGetHot(postId: string): Promise<CircleHotInfo> {
    const data = await axios.post<undefined, CircleHotInfo>(
      '/api/circlePost/getHot',
      {
        post_id: postId,
        strval: 1, //  post_id 和 user_id 返回 字符串
      },
      { toast: true }
    )
    return data
  }

  // 设置动态不推荐或取消不推荐
  static async circlePostUnRecommend(postId: string, unRecommend: SwitchType): Promise<void> {
    await axios.post(
      '/api/circlePost/recommended',
      {
        'post_id': postId,
        'recommend': unRecommend,
      },
      { toast: true }
    )
  }

  // 优先推荐或取消
  static async circlePostRecommend(postId: string, recommendDay: number): Promise<void> {
    await axios.post(
      '/api/circlePost/recommend',
      {
        'post_id': postId,
        'recommend_day': recommendDay,
      },
      { toast: true }
    )
  }

  // 添加圈子推荐话题
  static async addRecommendTag(guildId: string, tagId: string) {
    const res = await axios.post(
      '/api/circle/recommendTagCreate',
      {
        guild_id: guildId,
        tag_id: tagId,
      },
      { toast: true }
    )
    return res
  }

  // 删除圈子推荐话题
  static async deleteRecommendTag(guildId: string, tagId: string) {
    await axios.post(
      '/api/circle/recommendTagDel',
      {
        guild_id: guildId,
        tag_id: tagId,
      },
      { toast: true }
    )
  }

  // 获取圈子中推荐话题列表
  static async getRecommendTagList(guildId: string) {
    const res = await axios.post<undefined, TagStruct[]>('/api/circle/recommendTagList', {
      guild_id: guildId,
    })
    return res
  }

  // 圈子推荐话题排序
  static async sortRecommendTag(guildId: string, sortedTags: { [key: string]: number }) {
    await axios.post(
      '/api/circle/recommendTagPosition',
      {
        tags: sortedTags,
        guild_id: guildId,
      },
      { toast: true }
    )
  }

  // 使圈子内容中某个tag失效
  static async deactivatedCircleTag(postId: string, tagId: string) {
    await axios.post('/api/circlePost/removeTag', {
      post_id: postId,
      tag_id: tagId,
    })
  }

  // 使圈子内容中某个tag恢复
  static async activateCircleTag(postId: string, tagId: string) {
    await axios.post('/api/circlePost/recoverTag', {
      post_id: postId,
      tag_id: tagId,
    })
  }
}

// 筛选出现频率最高的tag
function findTopNumTagIds(tagIds: string[], limit: number): string[] {
  const countMap: { [key: string]: number } = {}

  for (const item of tagIds) {
    if (countMap[item]) {
      countMap[item] = countMap[item] + 1
    } else {
      countMap[item] = 1
    }
  }

  const sortedKeys = Object.keys(countMap).sort((k1, k2) => {
    const result = countMap[k2] - countMap[k1]
    if (result !== 0) return result
    return k1.localeCompare(k2)
  })

  const topKItems: string[] = []
  for (let i = 0; i < limit; i++) {
    if (i < sortedKeys.length) {
      topKItems.push(sortedKeys[i])
    }
  }

  return topKItems
}
