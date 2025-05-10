import { TopLevelBlock } from '@contentful/rich-text-types'
import { Op } from 'quill-delta'
import { ChannelInfoStruct, GuildInfoStruct, ReactionStruct, SimpleUserStruct, SwitchType } from '../struct/type'

export enum QuestionAnswerContentType {
  Text = 1,
  RichText = 2,
}

export interface QuestionAnswerArticleStruct {
  reply_quote_l1?: string
  like_count: number
  geo_region: string
  created_at: number
  is_choose: number
  reply_count: number
  answer_id: string
  question_id: string
  content: Op[]
  parsed: TopLevelBlock[]
  quote_l2?: string
  quote_l1?: string
  updated_at: number
  user_id: string
  guild_id: string
  channel_id: string
  status: number
  is_liked: SwitchType
  is_questioner_liked: number
  share_count: number
  content_type: QuestionAnswerContentType
}

export interface QuestionAnswerStruct {
  reply_user?: SimpleUserStruct
  reply_list: QuestionAnswerStruct[]
  reply_list_has_more: boolean
  answer: QuestionAnswerArticleStruct
  author?: SimpleUserStruct
  guild?: GuildInfoStruct
  channel?: ChannelInfoStruct
  question?: {
    question_id: string
    title: string
    view_count: number
    answer_count: number
    user_id: string
  }
  /** 52000 */
  deleted?: boolean
  /** 1012 */
  no_permission?: boolean
}

export interface QuestionArticleStruct {
  question_id: string
  guild_id?: string
  channel_id?: string
  title?: string
  content: Op[]
  parsed: TopLevelBlock[]
  is_top?: number
  is_digest?: number
  is_resolved?: number
  geo_region?: string
  resolved_at?: number
  replied_at?: number
  created_at: number
  collector_count?: number
  view_count?: number
  answer_count?: number
  is_collected?: number
  reactions?: ReactionStruct[]
  read_permission?: number
}

export interface QuestionTagStruct {
  tag_id: string
  name: string
}

export interface QuestionStruct {
  question: QuestionArticleStruct
  author?: SimpleUserStruct
  guild?: GuildInfoStruct
  channel?: ChannelInfoStruct
  tags?: Array<QuestionTagStruct>
  /** 51000 */
  deleted?: boolean
  /** 1012 */
  no_permission?: boolean
}
