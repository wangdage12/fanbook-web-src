import { Op } from 'quill-delta'
import { MediaInsertInfo } from '../rich_text/transform_rich_text'
import { ChannelInfoStruct, GuildInfoStruct, PermissionOverwrite, SimpleUserStruct, SwitchType } from '../struct/type'

export enum PostType {
  image = 'image',
  video = 'video',
  multi_para = 'multi_para',
  article = 'article',
  empty = '',
  // @ts-expect-error 部分历史数据为null
  none = null,
}

export interface CircleCardContentStruct {
  cover?: MediaInsertInfo
  title: string
  content: string
  has_video: boolean
}

export type DocInfoStruct = {
  url: string
  title: string
  role: number
  type: number
}

export interface CircleContentStruct {
  user?: SimpleUserStruct
  post: PostStruct
  sub_info?: SubInfo
  doc_info?: DocInfoStruct
  support_info?: SupportInfo
  guild?: GuildInfoStruct
  /** 1089 */
  deleted?: boolean
  /** 1012 */
  no_permission?: boolean
  /** 为卡片展示解析的数据结构 */
  parse_post?: CircleCardContentStruct
}

/// * - 展示状态：（原display，1.8.0后不再使用）
/// * 0 正常，默认值
/// * 1 隐藏，圈子列表中仅作者可见，可以从分享卡片或链接正常打开
/// * 2 仅频道可见：在'全部'中不可见,在所属频道列表可见
/// * 3 仅作者可见，审核中和拒绝的帖子
/// * - 作者设置动态对外状态：
/// * 0,2 全部可见
/// * 1,3 仅自己可见
export enum CircleDisplay {
  public,
  circleUnVisible,
  channelVisible,
  authorVisible,
}

// 新版 需要通过 display 转换
export enum CircleVisibility {
  all, // 公开可见 display 0 1
  onlyMe, //  仅自己可见 display 2
  onlyMeButCanNotOperation, // 仅自己可见但是不能操作 display 3
}

/*
 * 风控状态
 * 0 审核中
 * 1 审核通过， 默认值
 * 2 审核不通过
 */
export enum CircleStatus {
  pending,
  success,
  fail,
}

export interface PostStruct extends TopRecord {
  read_only: 0 | 1
  post_id: string
  guild_id: string
  channel_id: string
  topic_id: string
  user_id: string
  title: string
  content: Op[]
  mentions: string[]
  reaction: boolean
  comment: boolean
  created_at: number
  updated_at: number
  comment_at: number
  post_type: PostType
  content_v2: Op[]
  has_video: SwitchType
  file_id: string
  support_cnt: number
  display: CircleDisplay
  geo_region: string
  app_data: string
  recommend_at: number
  hot_size: number
  cover: MediaInsertInfo
  status: CircleStatus
  check_id: number
  recommend_day: number
  /**
   * 是否推荐
   */
  recommend: SwitchType
  topic_name: string
  guild_name: string
  mentions_info: Record<string, SimpleUserStruct>
  dm_title: string
  channel_icon: string
  tab_ids?: string[]
  tags?: TagStruct[]
  score: number
  channel_permission: ChannelInfoStruct
  tag_ids: string[]

  // 本地处理
  visibility: CircleVisibility
}

export interface MultiParaItemStruct {
  title: string
  assets?: MediaInsertInfo[]
  content?: Op[]
}

export interface SubInfo {
  comment_total: number
  like_total: number
  share_total: number
  can_del: number
  liked: SwitchType
  like_id?: string
  like_detail: LikeDetail[]
  is_top: boolean
  is_follow: boolean
  follow_total: number
}

export interface LikeDetail {
  user_id: string
  reaction_id: string
}

export interface SupportInfo {
  liked: SwitchType
  is_give_coffee: number
  current_user_reward: number
  support_total: number
  coffee_total: number
  support_detail: SupportDetail[]
  like_total: number
}

export interface SupportDetail {
  id: number
  user_id: string
  action_value: number
  created_at: number
}

export interface CircleGuildInfo {
  list: List[]
  hot_list: HotList[]
  circle_display: boolean
}

interface HotList {
  record: PostStruct[]
}

export interface List {
  records: PostStruct[]
  new_post_total: number
  channel_id: string
  guild_id: string
}

export interface CircleInfo {
  channel: CircleChannelStruct
  topic: Topic[]
  topic_add_post: Topic[]
  records: TopRecord[]
  top: Top
  list_id: string
  size: string
  next: string
  sort_type: string
}

export interface CircleChannelStruct {
  guild_id: string
  channel_id: string
  owner_id: string
  name: string
  banner: string
  icon: string
  description: string
  sort_type: string
  /**
   * 原始数据为 PermissionOverwrite[] 请求后转换为 Record<string, PermissionOverwrite>
   */
  overwrite: Record<string, PermissionOverwrite>
}

export interface Top {
  records?: TopRecord[]
  type: Type[]
}

export interface TopRecord {
  channel_id: string
  list_id: string
  created_at: number
  guild_id: string
  post_id: string
  title: string
  topic_id: string
  type_id: string
  type_name: string
  post: CircleContentStruct
}

interface Type {
  type_id: string
  type_name: string
}

export interface Topic {
  channel_id: string
  topic_id: string
  guild_id: string
  name: string
  type: number
  overwrite: PermissionOverwrite[]
  sort: number
  show_type: number
  list_display: number
  top_define: null
}

export enum CircleActionType {
  post = 'post',
  comment = 'comment',
  reply = 'reply',
}

export enum CircleCommentType {
  Text = '',
  RichText = 'richText',
}

export interface CircleCommentItemStruct {
  user: CircleCommentUserStruct
  comment: CircleCommentStruct
}

export interface CircleCommentUserStruct {
  avatar: string
  user_id: string
  username: string
  nickname: string
  avatar_nft: string
  gnick?: string
  assist_level: number
}

export interface CircleCommentStruct {
  post_id: string
  comment_id: string
  channel_id: string
  comment_reaction: string
  content: Op[]
  content_type: CircleCommentType
  content_v2: Op[]
  created_at: number
  geo_region: string
  guild_id: string
  mentions: string[]
  quote_l1: string
  quote_l2: string
  quote_status: boolean
  reaction: boolean
  topic_id: string
  user_id: string
  reply_list: CircleCommentItemStruct[]
  like_total: number
  comment_total: number
  liked: SwitchType
  like_id?: string
  mentions_info: MentionsInfo
  reply_user_info?: CircleCommentUserStruct
}

export interface CircleComponentConfig {
  buildAvatar: (user: CircleCommentUserStruct, size: number) => React.ReactNode
  buildName: (user: CircleCommentUserStruct) => React.ReactNode
  buildMentionUser?: (user: SimpleUserStruct) => React.ReactNode
  guildVisible?: boolean
  onGuildClick?: () => void
}

export interface MentionsInfo {}

export interface TagStruct {
  tag_id: string
  tag_name: string
  status: SwitchType

  id?: number
  position?: number
  created_at?: string
  updated_at?: string
  guild_id?: string
  user_id?: string

  view_count?: number
  like_count?: number
  post_count?: number
}

export enum CircleSortType {
  Recommend = 'hot',
  Latest = 'publish',
}

export enum CircleTagType {
  /**
   * 旧版话题
   */
  Topic = 'topic',
  /**
   * 新版话题
   */
  Tag = 'tag',
}

export interface CircleTagDetailStruct {
  tag_id: string
  tag_name: string
  status: SwitchType
  view_count: number
  like_count: number
  post_count: number

  // 本地
  type?: CircleTagType
  guildId?: string
}
