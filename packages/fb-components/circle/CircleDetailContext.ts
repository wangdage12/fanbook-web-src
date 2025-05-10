import { createContext } from 'react'
import { CircleActionType, CircleCommentItemStruct, CircleComponentConfig, TagStruct } from './types'

export interface ReplyParams {
  replying?: CircleCommentItemStruct
  // 正在回复的评论id
  commentId?: string
  // 正在回复的评论的回复id
  replyId?: string
  replyType: CircleActionType
}

export type CircleDetailProviderStruct = {
  replyParams: ReplyParams
  circleTagIds: string[]
  circleTagList?: TagStruct[]
  setReplyParams: (params: ReplyParams) => void
} & CircleComponentConfig

const CircleDetailContext = createContext<CircleDetailProviderStruct>({
  replyParams: { replyType: CircleActionType.post },
  setReplyParams: () => {},
  circleTagIds: [],
  buildAvatar: () => {
    throw new Error('buildAvatar not implemented')
  },
  buildName: () => {
    throw new Error('buildName not implemented')
  },
})
export default CircleDetailContext
