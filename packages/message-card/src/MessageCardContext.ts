import { createContext } from 'react'
import { KeyData } from './key'

interface MessageCardKeyContextType {
  keys?: KeyData
  onClickButton: (href?: string) => void
  onPreview: (src: string) => void
}
export const MessageCardContext = createContext<MessageCardKeyContextType>({
  onClickButton: () => {},
  onPreview: () => {},
})
