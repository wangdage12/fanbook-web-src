import clsx from 'clsx'
import { HTMLAttributes, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './index.less'

interface ScrollViewProps extends HTMLAttributes<HTMLDivElement> {
  onScroll?: () => void
  onScrollEnd?: () => void
}

const IgnorePointerScroll = forwardRef<HTMLDivElement, ScrollViewProps>(({ onScroll, onScrollEnd, children, className, ...restProps }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolling, setScrolling] = useState(false)

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => scrollRef.current, [scrollRef.current])

  useEffect(() => {
    let isScrollingTimeout: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(isScrollingTimeout)

      isScrollingTimeout = setTimeout(() => {
        setScrolling(false)
        if (onScrollEnd) {
          onScrollEnd()
        }
      }, 100) // Adjust the timeout duration as needed

      setScrolling(true)
      if (onScroll) {
        onScroll()
      }
    }
    scrollRef.current?.addEventListener('scroll', handleScroll)

    return () => {
      scrollRef.current?.removeEventListener('scroll', handleScroll)
      clearTimeout(isScrollingTimeout)
    }
  }, [onScroll, onScrollEnd])

  return (
    <div ref={scrollRef} className={clsx(['ignore-pointer-scroll', className, scrolling && 'scrolling'])} {...restProps}>
      {children}
    </div>
  )
})

IgnorePointerScroll.displayName = 'IgnorePointerScroll'
export default IgnorePointerScroll
