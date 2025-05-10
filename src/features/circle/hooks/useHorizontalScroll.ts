import { useSize } from 'ahooks'
import { BasicTarget, getTargetElement } from 'ahooks/lib/utils/domTarget'
import useIsomorphicLayoutEffectWithTarget from 'ahooks/lib/utils/useIsomorphicLayoutEffectWithTarget'
import { useCallback, useEffect, useState } from 'react'

const useHorizontalScroll = (target: BasicTarget) => {
  const [canScroll, setCanScroll] = useState(false)
  const [isStartEdge, setIsStartEdge] = useState(true)
  const [isEndEdge, setIsEndEdge] = useState(false)
  const size = useSize(target)

  const checkScrollEdges = useCallback(() => {
    const el = getTargetElement(target)
    if (el) {
      const { scrollWidth, scrollLeft, clientWidth } = el
      const isAtStart = scrollLeft === 0
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth

      setIsStartEdge(isAtStart)
      setIsEndEdge(isAtEnd)
      setCanScroll(scrollWidth > clientWidth + 1)
    }
  }, [target])

  const scrollToPrev = useCallback(() => {
    const el = getTargetElement(target)
    if (el) {
      const { clientWidth } = el
      el.scrollBy({ left: -clientWidth, behavior: 'smooth' })
    }
  }, [target])

  const scrollToNext = useCallback(() => {
    const el = getTargetElement(target)
    if (el) {
      const { clientWidth } = el
      el.scrollBy({ left: clientWidth, behavior: 'smooth' })
    }
  }, [target])

  useEffect(() => {
    checkScrollEdges()
  }, [size, target])

  useIsomorphicLayoutEffectWithTarget(
    () => {
      const el = getTargetElement(target)

      if (el) {
        checkScrollEdges()
        el.addEventListener('scroll', checkScrollEdges)
      }

      return () => {
        el && el.removeEventListener('scroll', checkScrollEdges)
      }
    },
    [checkScrollEdges],
    target
  )

  return { canScroll, isStartEdge, isEndEdge, scrollToPrev, scrollToNext }
}

export default useHorizontalScroll
