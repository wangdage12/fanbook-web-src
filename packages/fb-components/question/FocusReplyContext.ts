import { createContext } from 'react'

export interface FocusReplyProviderStruct {
  focusedReply?: string
  setFocusedReply: (replyId: string) => void
}

const defaultFocusReplyProviderStruct = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setFocusedReply: () => {},
}
const FocusReplyContext = createContext<FocusReplyProviderStruct>(defaultFocusReplyProviderStruct)
export default FocusReplyContext
