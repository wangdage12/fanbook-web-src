import { ReactNode } from 'react'

export function TabLabel({ children, selected }: { children: ReactNode; selected: boolean }) {
  return <span className={`${selected ? 'font-bold text-[var(--fg-b100)]' : 'text-[var(--fg-b60)]'}`}>{children}</span>
}
