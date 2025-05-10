import { PostType } from 'fb-components/circle/types.ts'
import { SwitchType } from 'fb-components/struct/type'

export enum InteractiveType {
  All,
  CommentAt,
  LikeCollect,
  Reward,
}

export enum InteractiveMessageType {
  /** 如果返回这种信息表示无更多新消息 */
  start = 'start',

  postLike = 'post_like',
  commentLike = 'comment_like',
  postReward = 'post_reward',
  postAt = 'post_at',
  postComment = 'post_comment',
  postCommentAt = 'post_comment_at',
  commentComment = 'comment_comment',
  commentCommentAt = 'comment_comment_at',
  postFollow = 'post_follow',
  postDel = 'post_del',
  commentDel = 'comment_del',

  questionAt = 'question_at',
  questionFollow = 'question_follow',
  questionAnswer = 'question_answer',
  questionAnswerAt = 'question_answer_at',
  answerLike = 'answer_like',

  answerAnswer = 'answer_answer',
  answerAnswerAt = 'answer_answer_at',
  answerCommentLike = 'answer_comment_like',

  replyComment = 'reply_comment',

  questionCancel = 'question_cancel',
  questionAnswerCancel = 'question_answer_cancel',
  answerAnswerCancel = 'answer_answer_cancel',
  replyCommentCancel = 'reply_comment_cancel',

  // /// 公告at
  // operatesMentions = 'operates_mentions',

  // /// 公告评论
  // operatesComment = 'operates_comment',

  // /// 公告二级评论
  // operatesCommentComment = 'operates_comment_comment',

  // /// 公告评论点赞
  // operatesCommentLike = 'operates_comment_like',

  // /// 公告评论at
  // operatesCommentAt = 'operates_comment_at',

  // /// 公告评论回复AT
  // operatesCommentCommentAt = 'operates_comment_comment_at',

  // /// 公告评论删除
  // operatesCommentDel = 'operates_comment_del',
}

export function isUnSupport(interactiveMessageType: InteractiveMessageType): boolean {
  return !Object.values(InteractiveMessageType).includes(interactiveMessageType)
}

export function isStart(interactiveMessageType: InteractiveMessageType): boolean {
  return interactiveMessageType === InteractiveMessageType.start
}

/** 作为最后一条消息的格式 */
export interface InteractiveInfoStruct {
  type: string
  mid: string
  ctype: InteractiveMessageType
  title: string
  msg: string
  desc: string
  guild_id: string
}

export interface InteractiveMessageStruct {
  user_id: string
  bucket: number
  type: InteractiveType
  message_id: bigint
  channel_id: string
  circle_type: InteractiveMessageType
  create_at: number
  desc: string | null
  guild_id: string
  min_bucket: number
  post_id: string
  quote_l1?: string
  quote_l2?: string
  relacted_id?: string
  send_user_id: string
  cover_img: string
  width: number
  height: number
  post_content: string
  comment_status: SwitchType
  post_status: SwitchType
  guild_name: string
  title: string
  post_type: PostType
  content: string
  quote_id?: string
  quote_status: SwitchType
  quote_content_type: string
  quote_content: string
}

interface Author {
  nickname: string
  username: string
  avatar: string
  bot: boolean
}

interface Member {
  nickname: string
  username: string
  avatar: string
  bot: boolean
}

export interface InteractiveWsStruct {
  content: InteractiveMessageStruct
  time: number
  user_id: string
  channel_id: string
  message_id: string
  quote_l1: string
  quote_l2: string
  guild_id: string
  channel_type: number
  status: number
  nonce: number
  author: Author
  member: Member
  send_user_id: string
}
