import { createContext } from 'react'

export interface AnswerProviderStruct {
  moreWrapper?: (children: React.ReactElement, type?: string) => React.ReactNode
  btnsWrapper?: (children: React.ReactElement, key: string) => React.ReactNode
}
const defaultAnswer: AnswerProviderStruct = {}

const AnswerContext = createContext<AnswerProviderStruct>(defaultAnswer)
export default AnswerContext
