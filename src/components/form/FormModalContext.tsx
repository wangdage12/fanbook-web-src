import { createContext } from 'react'

interface FormModalContextProps {
  setBeforeClose: (beforeClose: (() => Promise<boolean>) | null) => void
}

export const FormModalContext = createContext<FormModalContextProps>({
  setBeforeClose: () => {},
})
