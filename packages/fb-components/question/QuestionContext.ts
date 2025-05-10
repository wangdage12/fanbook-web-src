import React, { createContext } from 'react'
import { SimpleUserStruct } from '../struct/type'

/**
 * 由于圈子的大部分渲染组件都需要支持第三方使用，因此对于一些差异化配置可以放到 context 中。
 */
export interface QuestionProviderStruct {
  questionUniqueId?: string
  questionId: string
  // 当前打开的详情的回答或问题的 id
  openedArticleId?: string
  // 表示问题的作者
  author?: SimpleUserStruct
  // 用来构建用户头像
  buildAvatar: (user: SimpleUserStruct, size: number) => React.ReactElement
  // 用来构建用户名称
  buildName: (user: SimpleUserStruct) => React.ReactElement

  // 是否显示服务器信息
  guildVisible?: boolean
  onGuildClick?: () => void
}

const defaultQuestion: QuestionProviderStruct = {
  questionId: '',
  openedArticleId: '',
  buildAvatar: () => {
    throw new Error('buildAvatar not implemented')
  },
  buildName: () => {
    throw new Error('buildName not implemented')
  },
}

const QuestionContext = createContext<QuestionProviderStruct>(defaultQuestion)
export default QuestionContext
