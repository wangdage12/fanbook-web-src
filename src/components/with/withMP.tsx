import { ReactNode } from 'react'
import { initFbEvent } from '../../features/mp-inner/MP'

export default function WithMP({ children }: { children: ReactNode }) {
  initFbEvent()
  return children
}
