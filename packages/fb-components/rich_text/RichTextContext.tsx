import { Mark } from '@contentful/rich-text-types/dist/types/types'
import React, { createContext } from 'react'
import { QuestionStruct } from '../question/types'

export interface RichTextContextStruct {
  renderRole: (props: { id: string; marks: Mark[]; text: string; guildId?: string }) => React.ReactNode
  renderUser: (props: { id: string; marks: Mark[]; text: string; guildId?: string; colorful?: boolean }) => React.ReactNode
  /** 若无则默认调用 renderUser */
  renderUserName?: (props: { id: string; marks: Mark[]; text: string; guildId?: string }) => React.ReactNode
  renderChannel: (props: { id: string; text: string }) => React.ReactNode
  renderTopic: (props: { id: string; text: string; guildId?: string }) => React.ReactNode
  /** 用于拉取问答的问题详情，如果你的需求不可能出现问答，可以不实现 */
  fetchQuestion: (questionId: string) => Promise<QuestionStruct>
  /** 用于打开问答的问题详情，如果你的需求不可能出现问答，可以不实现 currentOpenedId 可以是问题 id 也可以是 回答 id */
  openQuestionLink: (guildId: string, channelId: string, questionId: string, currentOpenedId: string) => void

  handleUrl(uri: string, extra?: object): void
}

const defaultValue: RichTextContextStruct = {
  renderRole: () => {
    throw new Error('renderRole not implemented')
  },
  renderUser: () => {
    throw new Error('renderUser not implemented')
  },
  renderChannel: () => {
    throw new Error('renderChannel not implemented')
  },
  renderTopic: () => {
    throw new Error('renderChannel not implemented')
  },
  fetchQuestion: () => {
    throw new Error('fetchQuestion not implemented')
  },
  openQuestionLink: () => {
    throw new Error('openQuestionLink not implemented')
  },
  handleUrl: () => {
    throw new Error('handleUrl not implemented')
  },
}
const RichTextContext = createContext(defaultValue)
export default RichTextContext
