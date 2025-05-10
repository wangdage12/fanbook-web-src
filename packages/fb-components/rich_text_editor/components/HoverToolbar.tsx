import { useHover } from 'ahooks'
import { ReactNode, useRef } from 'react'
import { useFocused } from 'slate-react'
import { Portal } from '../../components/Portal'
import { usePosition } from './hooks'

function HoverToolbar({ children, triggerTarget, active }: { children: ReactNode; triggerTarget?: HTMLElement | null; active?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inFocus = useFocused()
  const isHover = useHover(ref)
  usePosition(ref, triggerTarget, inFocus && (isHover || active))
  return (
    <Portal>
      <div
        ref={ref}
        className="absolute z-[3001] transition-opacity p-2"
        onMouseDown={e => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault()
        }}
      >
        {children}
      </div>
    </Portal>
  )
}

export default HoverToolbar
