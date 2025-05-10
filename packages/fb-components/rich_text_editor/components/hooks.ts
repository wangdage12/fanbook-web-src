import { MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 *  find the container of the popoverTarget while scrolling, and trigger the scroll event
 * @param active
 * @returns
 */
function useScrollContainer(active: boolean, onScroll: () => void) {
  // the flag of the parent nodes cache
  const [hasParents, setHasParents] = useState(false)
  const [parentList, setParentList] = useState<Array<Element>>([])

  const scroll = useCallback(() => onScroll(), [])

  const watchScroll = () => {
    if (parentList.length) {
      parentList.forEach(element => {
        element.addEventListener('scroll', scroll)
      })
    }
  }

  const unWatchScroll = () => {
    if (parentList.length) {
      parentList.forEach(element => {
        element.removeEventListener('scroll', scroll)
      })
    }
  }

  const findScrollContainerParents = (node: Element) => {
    if (!node) return

    const parent = node.parentElement
    if (parent) {
      if (parent.scrollHeight > parent.clientHeight) {
        setParentList(prev => [...prev, parent])
      } else {
        findScrollContainerParents(parent)
      }
    }
  }

  useEffect(() => {
    if (active) {
      watchScroll()
    } else {
      unWatchScroll()
    }
    return () => unWatchScroll()
  }, [parentList, active])

  return {
    hasParents,
    parentList,
    setHasParents,
    findScrollContainerParents,
  }
}

function adjustPosition(el?: HTMLDivElement | null, triggerTarget?: HTMLElement | null, active?: boolean) {
  if (!el) {
    return
  }

  if (!active || !triggerTarget) {
    el.removeAttribute('style')
    return
  }

  const targetPos = triggerTarget.getBoundingClientRect()
  const { x: targetX, y: targetY, width: targetW } = targetPos //, height: targetH

  // size of Popover
  let sourceW = 0,
    sourceH = 0
  if (el) {
    const { width, height } = el.getBoundingClientRect()
    ;[sourceW, sourceH] = [width, height]
  }
  // position of Popover
  let left = targetX + (targetW - sourceW) / 2
  let top = targetY - sourceH

  // 屏幕边缘情况处理
  // Check if element is outside the viewport
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight

  if (left < 0) {
    left = 0
  } else if (left + sourceW > viewportWidth) {
    left = viewportWidth - sourceW
  }

  if (top < 0) {
    top = 0
  } else if (top + sourceH > viewportHeight) {
    top = viewportHeight - sourceH
  }

  const style = `opacity: 1; top: ${top}px; left: ${left}px;`

  window.requestAnimationFrame(() => {
    el.setAttribute('style', style)
  })
}

function usePosition(popover: MutableRefObject<HTMLDivElement | null>, triggerTarget?: HTMLElement | null, active: boolean = false) {
  const firstScrollFlag = useRef(false)

  const onScroll = () => {
    adjustPosition(popover.current, triggerTarget, active)
  }

  const { hasParents, setHasParents, findScrollContainerParents } = useScrollContainer(active, onScroll)

  useLayoutEffect(() => {
    if (active && triggerTarget && !hasParents) {
      findScrollContainerParents(triggerTarget)
      setHasParents(true)
    }
  }, [triggerTarget, active])

  useEffect(() => {
    if (active) {
      firstScrollFlag.current = false
    }
  }, [active])

  useEffect(() => {
    adjustPosition(popover.current, triggerTarget, active)
  }, [active, triggerTarget])
}

export { usePosition }
