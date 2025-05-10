import { MutableRefObject, useEffect } from 'react'

interface ScrollIntoViewOptions {
  behavior?: 'auto' | 'smooth'
  block?: 'start' | 'center' | 'end' | 'nearest'
  inline?: 'start' | 'center' | 'end' | 'nearest'
}

const parentElementsMap = new WeakMap<HTMLElement, HTMLElement>()
const observerMap = new WeakMap<HTMLElement, IntersectionObserver>()
// 创建一个接口来定义设置对象
interface Settings {
  options?: ScrollIntoViewOptions
  parentLevel?: number
  extraScroll?: number
  edgeDistance?: number
}

function smoothScrollTo(scrollParent: HTMLElement, extraScroll: number, direction: number) {
  let scrollAmount = 0
  // 注意，10 是一个可以调整的参数，代表滚动完成所需的帧数，你可以根据需要调整
  const animationStep = (extraScroll * direction) / 8
  window.requestAnimationFrame(function smoothScroll() {
    if (!scrollParent) {
      return
    }
    scrollParent.scrollTop += animationStep
    scrollAmount += Math.abs(animationStep)
    if (scrollAmount < Math.abs(extraScroll * direction)) {
      window.requestAnimationFrame(smoothScroll)
    }
  })
}

function checkAndScrollIntoView(scrollParent: HTMLElement, child: HTMLElement) {
  const parentRect = scrollParent.getBoundingClientRect()
  const rect = child.getBoundingClientRect()
  const diff = rect.height * 0.2 // 20% 的高度在视口内
  const isWithinVerticalView = rect.top <= parentRect.bottom - diff && rect.bottom >= parentRect.top + diff
  const diffTop = Math.abs(rect.top - parentRect.top)
  const diffBottom = Math.abs(rect.bottom - parentRect.bottom)
  const direction = diffTop >= diffBottom ? 1 : -1
  !isWithinVerticalView && smoothScrollTo(scrollParent, Math.min(diffTop, diffBottom), direction)
}

function getScrollParent(node: HTMLElement | null, level = 1): HTMLElement | null {
  if (!node) {
    return null
  }
  let scrollParent = parentElementsMap.get(node) ?? null
  if (scrollParent) {
    return scrollParent
  }
  scrollParent = node.parentElement
  while (scrollParent) {
    if (scrollParent.scrollHeight > scrollParent.clientHeight && !['visible', 'hidden'].includes(getComputedStyle(scrollParent).overflowY)) {
      break
    }
    scrollParent = level === 0 ? null : scrollParent.parentElement
    level = level - 1
  }
  if (scrollParent) {
    parentElementsMap.set(node, scrollParent)
  }

  return scrollParent
}

function getObserver(
  scrollParent: HTMLElement,
  { extraScroll, edgeDistance }: { extraScroll?: number; edgeDistance?: number }
): IntersectionObserver {
  let observer = observerMap.get(scrollParent) ?? null
  if (observer) {
    return observer
  }
  observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        // 如果目标元素已经滚动到视口中
        if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
          if (!entry.target) {
            return
          }
          observer.unobserve(entry.target)
          if (extraScroll && edgeDistance) {
            // adjust the scrollbar position of that container
            if (scrollParent) {
              const rect = entry.target.getBoundingClientRect()
              const parentRect = scrollParent.getBoundingClientRect()
              const diffTop = Math.abs(rect.top - parentRect.top)
              const diffBottom = Math.abs(rect.bottom - parentRect.bottom)
              const distanceToEdge = Math.min(diffTop, diffBottom)
              if (distanceToEdge <= edgeDistance) {
                // 靠近顶部 向下滚动 滚动值增加, 靠近底部 向上滚动 滚动值减少
                const direction = diffTop >= diffBottom ? 1 : -1
                smoothScrollTo(scrollParent, extraScroll, direction)
              }
            }
          }
        }
      })
    },
    {
      root: scrollParent,
      rootMargin: '0px',
      threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    }
  )
  observerMap.set(scrollParent, observer)
  return observer
}
/**
 * 暂时仅支持垂直方向的补充滚动
 * @param ref
 * @param selected
 * @param settings
 */
const useScrollIntoView = (ref: MutableRefObject<HTMLElement | null>, selected?: boolean, settings: Settings = {}) => {
  const { options = { behavior: 'smooth', block: 'nearest', inline: 'nearest' }, extraScroll = 60, edgeDistance, parentLevel = 1 } = settings

  useEffect(() => {
    const scroll = () => {
      if (ref.current && selected) {
        const scrollParent = getScrollParent(ref.current, parentLevel)
        if (edgeDistance) {
          if (scrollParent) {
            const observer = getObserver(scrollParent, { extraScroll, edgeDistance })
            observer.unobserve(ref.current)
            observer.observe(ref.current)
          }
        }
        ref.current?.scrollIntoView(options)
        window.requestAnimationFrame(() => scrollParent && ref.current && checkAndScrollIntoView(scrollParent, ref.current))
      }
    }

    scroll()
  }, [selected])
}

export default useScrollIntoView
