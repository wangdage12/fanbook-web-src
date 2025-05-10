import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const Portal = ({ children, portalKey, container }: { children?: ReactNode; portalKey?: string; container?: Element | DocumentFragment }) => {
  return typeof document === 'object' ? createPortal(<>{children}</>, container ?? document.body, portalKey) : null
}
