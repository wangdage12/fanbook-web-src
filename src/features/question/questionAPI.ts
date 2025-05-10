import axios from 'axios'
import {
  QuestionAnswerArticleStruct,
  QuestionAnswerContentType,
  QuestionAnswerStruct,
  QuestionArticleStruct,
  QuestionStruct,
  QuestionTagStruct,
} from 'fb-components/question/types'
import { SimpleUserStruct } from 'fb-components/struct/type'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse.ts'
import { Op } from 'quill-delta'
import { cachedAxios } from '../../base_services/http.ts'
import { BusinessError } from '../../base_services/interceptors/response_interceptor'
import serverSideConfig from '../../services/ServeSideConfigService.ts'
import { PaginationResp, PaginationResp2 } from '../../types.ts'
import { QuestionPostSort } from './questionEntity'

export default class QuestionApi {
  static async questionList({
    guildId,
    channelId,
    lastId,
    session,
    sortType = QuestionPostSort.Latest,
    isDigest,
    isResolved,
    searchKey,
    pageSize = 20,
    tagIds = [],
  }: {
    guildId?: string
    channelId?: string
    lastId?: string
    session?: string
    sortType?: QuestionPostSort
    isDigest?: number
    isResolved?: number
    searchKey?: string
    pageSize?: number
    tagIds?: string[]
  }) {
    const res = await axios.post<
      void,
      {
        last_id: string
        session: string
        next: number
        list: QuestionStruct[]
        page_size: number
      }
    >('/api/v2/forum/question/list', {
      guild_id: guildId,
      channel_id: channelId,
      last_id: lastId,
      page_size: pageSize,
      sort_type: sortType,
      is_digest: isDigest,
      is_resolved: isResolved,
      title: searchKey,
      session: session,
      tag_ids: tagIds,
    })

    res.list.forEach(e => {
      e.question.content = safeJSONParse(e.question.content as unknown as string, [] as Op[])
    })
    return res
  }

  /// - 获取问题收藏列表
  static async questionCollectList({
    guildId,
    channelId,
    lastId,
    session,
    pageSize = 10,
  }: {
    guildId?: string
    channelId?: string
    lastId?: string
    session?: string
    pageSize?: number
  }) {
    const res = await axios.post<
      void,
      {
        last_id: string
        session: string
        next: number
        list: QuestionStruct[]
        page_size: number
      }
    >('/api/forum/question/collection/list', {
      guild_id: guildId,
      channel_id: channelId,
      last_id: lastId,
      page_size: pageSize,
      session: session,
    })

    res.list.forEach(e => {
      e.question.content = safeJSONParse(e.question.content as unknown as string, [] as Op[])
    })
    return res
  }

  /// 问题详情
  static async questionDetail(questionId: string, enableCache = false) {
    const url = '/api/forum/question/detail'
    try {
      const res = await (enableCache ? cachedAxios : axios).post<undefined, QuestionStruct>(
        url,
        {
          question_id: questionId,
        },
        enableCache ?
          {
            id: `${url}?question_id=${questionId}`,
          }
        : undefined
      )
      res.question.content = safeJSONParse(res.question.content as unknown as string, [] as Op[])
      if (res.guild) {
        // @ts-expect-error 服务端给的是字符串格式，需要转成 bool
        res.guild.is_private = res.guild.is_private && res.guild.is_private != '0'
      }
      return res
    } catch (err) {
      if (err instanceof BusinessError) {
        switch (err.code) {
          // 51000 问题不存在
          case 51000:
            return { deleted: true, question: { question_id: questionId } } as QuestionStruct
          // 1012 无权限
          case 1012:
            return { deleted: true, no_permission: true, question: { question_id: questionId } } as QuestionStruct
          default:
        }
      }
      throw err
    }
  }

  /// 问题详情浏览次数
  static async questionView(question_id: string): Promise<boolean> {
    return axios
      .post<never, { result: number }>('/api/forum/question/view', {
        question_id,
      })
      .then(res => !!res.result)
  }

  // 增加回答分享数
  static async increaseAnswerShareCount(answer_id: string): Promise<void> {
    await axios.post('/api/forum/answer/share', {
      answer_id,
    })
  }

  /// 表态
  static async reactionAdd({ questionId, channelId, emoji }: { questionId?: string; channelId?: string; emoji: string }): Promise<void> {
    await axios.post(
      '/api/forum/question/reaction/add',
      {
        question_id: questionId,
        channel_id: channelId,
        name: emoji,
      },
      {
        toast: true,
      }
    )
  }

  /// 取消表态
  static async reactionCancel({ questionId, channelId, emoji }: { questionId?: string; channelId?: string; emoji: string }): Promise<void> {
    await axios.post(
      '/api/forum/question/reaction/cancel',
      {
        question_id: questionId,
        channel_id: channelId,
        name: emoji,
      },
      {
        toast: true,
      }
    )
  }

  /// 收藏
  static async collectionAdd({ questionId, channelId }: { questionId: string | undefined; channelId: string | undefined }): Promise<void> {
    await axios.post(
      '/api/forum/question/collection/add',
      {
        question_id: questionId,
        channel_id: channelId,
      },
      {
        toast: true,
      }
    )
  }

  /// 取消收藏
  static async collectionCancel({ questionId, channelId }: { questionId: string | undefined; channelId: string | undefined }): Promise<void> {
    await axios.post(
      '/api/forum/question/collection/cancel',
      {
        question_id: questionId,
        channel_id: channelId,
      },
      {
        toast: true,
      }
    )
  }

  /// 删除问题
  static async questionDelete({
    questionId,
    channelId,
    reason,
    reasonType,
  }: {
    questionId?: string
    channelId?: string
    reasonType?: number
    reason?: string
  }): Promise<void> {
    await axios.post(
      '/api/forum/question/delete',
      {
        question_id: questionId,
        channel_id: channelId,
        reason,
        reason_type: reasonType,
      },
      {
        toast: true,
      }
    )
  }

  /// 删除回答
  static async answerDelete({
    questionId,
    answerId,
    channelId,
  }: {
    questionId: string | undefined
    answerId: string | undefined
    channelId: string | undefined
  }): Promise<void> {
    await axios.post(
      '/api/forum/answer/delete',
      {
        question_id: questionId,
        answer_id: answerId,
        channel_id: channelId,
      },
      {
        toast: true,
      }
    )
  }

  /// 点赞回答
  static async forumLikeAdd({ questionId, channelId, answerId }: { questionId?: string; channelId?: string; answerId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/answer/like/add',
      {
        question_id: questionId,
        channel_id: channelId,
        answer_id: answerId,
      },
      {
        toast: true,
      }
    )
  }

  /// 取消点赞回答
  static async forumLikeCancel({ questionId, channelId, answerId }: { questionId?: string; channelId?: string; answerId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/answer/like/cancel',
      {
        question_id: questionId,
        channel_id: channelId,
        answer_id: answerId,
      },
      {
        toast: true,
      }
    )
  }

  /// 创建回复
  static answerCreate({
    questionId,
    channelId,
    answerId,
    content,
    mentions,
    content_type,
  }: {
    questionId: string
    channelId: string
    answerId?: string
    content: string
    mentions: string[] | undefined
    content_type: QuestionAnswerContentType
  }): Promise<{ answer_id: string }> {
    return axios.post(
      '/api/forum/answer/create',
      {
        question_id: questionId,
        channel_id: channelId,
        answer_id: answerId,
        content: content,
        mentions: mentions,
        geo_region: serverSideConfig.geo_region,
        content_type,
      },
      {
        toast: true,
      }
    )
  }

  /// 编辑回答
  static async updateAnswer({
    channelId,
    questionId,
    answerId,
    content,
    contentType,
  }: {
    channelId: string | undefined
    questionId: string | undefined
    answerId: string | undefined
    content: string | undefined
    contentType: number | undefined
  }): Promise<{ answer_id: string }> {
    const res = await axios.post<undefined, { answer_id: string }>(
      '/api/forum/answer/update',
      {
        channel_id: channelId,
        question_id: questionId,
        answer_id: answerId,
        content: content,
        content_type: contentType,
      },
      {
        toast: true,
      }
    )
    return res
  }

  /// 创建问题
  static async createQuestion({
    channelId,
    title = '',
    content = '',
    mentions = [],
    hash,
    tagIds,
  }: {
    channelId: string
    title: string
    postType?: string
    content: string
    mentions?: string[]
    hash?: string
    geoRegion?: string
    tagIds?: string[]
  }): Promise<{ question_id: string }> {
    mentions = mentions || []
    const data = {
      channel_id: channelId,
      content,
      title,
      mentions,
      geo_region: serverSideConfig.geo_region,
      ...(hash && { c_hash: hash }),
      ...(tagIds && tagIds.length > 0 && { tag_ids: tagIds }),
    }
    return await axios.post<undefined, { question_id: string }>('/api/forum/question/create', data, {
      toast: true,
    })
  }

  /// 一级回复列表
  static async answerList({
    questionId,
    lastId,
    pageSize,
  }: {
    questionId: string | undefined
    lastId?: string
    pageSize?: number
  }): Promise<PaginationResp<QuestionAnswerStruct>> {
    return await axios
      .post<undefined, PaginationResp<QuestionAnswerStruct>>('/api/v2/forum/answer/list', {
        question_id: questionId,
        last_id: lastId,
        page_size: pageSize || 10,
      })
      .then(res => {
        res.list.forEach(e => {
          e.answer.content = safeJSONParse(e.answer.content as unknown as string, [] as Op[])
        })
        return res
      })
  }

  static async questionAnswerReplyList(answer_id: string, reply_quote_l1?: string, session?: string, from?: string) {
    return await axios
      .post<undefined, PaginationResp2<QuestionAnswerStruct>>('/api/forum/answer/comment/list', {
        answer_id,
        reply_quote_l1,
        session,
        from,
        page_size: '5',
      })
      .then(res => {
        res.list.forEach(item => {
          item.answer.content = safeJSONParse(item.answer.content as unknown as string, [] as Op[])
          item.reply_list?.forEach(subItem => {
            subItem.answer.content = safeJSONParse(subItem.answer.content as unknown as string, [] as Op[])
          })
        })
        res.hasMore = res.next != 0
        return res
      })
  }

  /// 二级回复列表
  static async answerReplyList({
    questionId,
    lastId,
    pageSize,
    quoteL1,
  }: {
    questionId: string | undefined
    lastId?: string
    pageSize?: string
    quoteL1?: string
  }): Promise<PaginationResp2<QuestionAnswerStruct>> {
    const res = await axios.post<undefined, PaginationResp2<QuestionAnswerStruct>>(
      '/api/forum/answer/reply/list',
      {
        question_id: questionId,
        last_id: lastId,
        page_size: pageSize ?? '10',
        quote_l1: quoteL1,
      },
      { toast: true }
    )
    return res
  }

  /// 获取单条回答
  static async answerDetail({
    questionId,
    answerId,
    enabledCache = false,
  }: {
    questionId: string | undefined
    answerId: string | undefined
    enabledCache?: boolean
  }): Promise<QuestionAnswerStruct> {
    const url = '/api/v2/forum/answer/detail'
    try {
      const res = await (enabledCache ? cachedAxios : axios).post<void, QuestionAnswerStruct>(
        url,
        {
          question_id: questionId,
          answer_id: answerId,
        },
        enabledCache ?
          {
            id: `${url}?question_id=${questionId}&answer_id=${answerId}`,
          }
        : undefined
      )
      res.answer.content = safeJSONParse(res.answer.content as unknown as string, [] as Op[])
      return res
    } catch (err) {
      if (err instanceof BusinessError) {
        switch (err.code) {
          // 52000 回答不存在
          case 52000:
            return { deleted: true, answer: { question_id: questionId, answer_id: answerId } } as QuestionAnswerStruct
          // 无权限
          case 1012:
            return {
              deleted: true,
              no_permission: true,
              answer: { question_id: questionId, answer_id: answerId },
            } as QuestionAnswerStruct
          default:
        }
      }
      throw err
    }
  }

  /// 设置为精选答案
  static async answerChoose({ channelId, questionId, answerId }: { channelId?: string; questionId?: string; answerId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/answer/choose',
      {
        question_id: questionId,
        answer_id: answerId,
        channel_id: channelId,
      },
      { toast: true }
    )
  }

  /// 取消精选答案
  static async answerUnchosen({ channelId, questionId, answerId }: { channelId?: string; questionId?: string; answerId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/answer/unchosen',
      {
        question_id: questionId,
        answer_id: answerId,
        channel_id: channelId,
      },
      { toast: true }
    )
  }

  /// 置顶
  static async questionTopAdd({ channelId, questionId }: { channelId?: string; questionId?: string }): Promise<void> {
    const res = await axios.post(
      '/api/forum/question/top/add',
      {
        question_id: questionId,
        channel_id: channelId,
      },
      { toast: true }
    )
    return res.data
  }

  /// 取消置顶
  static async questionTopCancel({ channelId, questionId }: { channelId?: string; questionId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/question/top/cancel',
      {
        question_id: questionId,
        channel_id: channelId,
      },
      { toast: true }
    )
  }

  /// 精选
  static async questionDigestAdd({ channelId, questionId }: { channelId?: string; questionId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/question/digest/add',
      {
        question_id: questionId,
        channel_id: channelId,
      },
      { toast: true }
    )
  }

  /// 取消精选
  static async questionDigestCancel({ channelId, questionId }: { channelId?: string; questionId?: string }): Promise<void> {
    await axios.post(
      '/api/forum/question/digest/cancel',
      {
        question_id: questionId,
        channel_id: channelId,
      },
      { toast: true }
    )
  }

  /// 通过hash获取问题
  static async getByHash(hash: string): Promise<QuestionStruct> {
    const res = await axios.post<void, QuestionStruct>('/api/forum/question/getByHash', {
      c_hash: hash,
    })
    return res
  }

  /// 更改问题可见性
  static async questionReadPermissionUpdate({
    channelId,
    questionId,
    readPermission,
  }: {
    channelId?: string
    questionId?: string
    readPermission: ReadPermission
  }): Promise<void> {
    await axios.post(
      '/api/forum/question/read-permission/update',
      {
        question_id: questionId,
        channel_id: channelId,
        read_permission: readPermission,
      },
      { toast: true }
    )
  }

  /// - 新增标签
  static async createQuestionTag(channelId: string, name: string): Promise<string> {
    const res = await axios.post<never, { tag_id: string }>(
      '/api/forum/tag/create',
      {
        channel_id: channelId,
        name: name,
      },
      { toast: true }
    )
    return res.tag_id
  }

  /// - 删除标签
  static deleteQuestionTag(channelId: string, tagId: string): Promise<void> {
    return axios.post(
      '/api/forum/tag/delete',
      {
        channel_id: channelId,
        tag_id: tagId,
      },
      { toast: true }
    )
  }

  /// - 获取问答标签
  static async getQuestionTags(channelId: string): Promise<QuestionTagStruct[]> {
    try {
      const res = await axios.post<void, QuestionTagStruct[]>('/api/forum/tags', {
        channel_id: channelId,
      })
      if (Array.isArray(res)) {
        return res
      } else {
        return []
      }
    } catch (e) {
      return []
    }
  }

  /// - 简化详情 用于卡片
  static async getBasicQuestionDetail(questionId: string): Promise<QuestionStruct> {
    const res = await axios.post<undefined, QuestionStruct>('/api/forum/question/basic', {
      question_id: questionId,
    })
    return res
  }

  static async searchQuestion({
    guildId,
    channelId,
    lastId,
    session,
    keyword,
    pageSize = 10,
    type,
  }: {
    keyword: string
    guildId?: string
    channelId?: string
    lastId?: string
    session?: string
    pageSize?: number
    // 1=问题，2=回答 不传或空表示全部
    type?: QuestionSearchRange
  }): Promise<PaginationResp<QuestionSearchInfo>> {
    return axios.post('/api/forum/search', {
      guild_id: guildId,
      channel_id: channelId,
      last_id: lastId,
      page_size: pageSize,
      search_content: keyword,
      session: session,
      type,
    })
  }
}

export enum ReadPermission {
  /// 全部可见
  All = 0,
  /// 仅楼主可见
  Owner = 1,
}

export enum QuestionSearchRange {
  Question = 1,
  Answer = 2,
}

export interface QuestionSearchInfo {
  question: QuestionArticleStruct & { author: SimpleUserStruct }
  answer: QuestionAnswerArticleStruct & { author: SimpleUserStruct }
  type: QuestionSearchRange
  highlight: {
    title: {
      keyword: string[]
      text: string
    }
    content: {
      keyword: string[]
      text: string
    }
  }
}
