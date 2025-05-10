import React, { PropsWithChildren, ReactNode, useCallback, useEffect, useLayoutEffect } from 'react'

/**
 * Prevents Chrome hangups
 * See: https://stackoverflow.com/questions/47524205/random-high-content-download-time-in-chrome/47684257#47684257
 */
const mousewheelListener = (event: Event) => {
  if (event instanceof WheelEvent && event.deltaY === 1) {
    event.preventDefault()
  }
}

export type PaginatorProps = {
  /** callback to load the next page */
  loadNextPage: () => void
  /** indicates if there is a next page to load */
  hasNextPage?: boolean
  /** indicates if there is a previous page to load */
  hasPreviousPage?: boolean
  /** indicates whether a loading request is in progress */
  isLoading?: boolean
  /** The loading indicator to use */
  LoadingIndicator?: ReactNode
  /** callback to load the previous page */
  loadPreviousPage?: () => void
  /** display the items in opposite order */
  reverse?: boolean
  /** Offset from when to start the loadNextPage call */
  threshold?: number
}

export type InfiniteScrollProps = PaginatorProps & {
  className?: string
  /** Element to be rendered at the top of the thread message list. By default, Message and ThreadStart components */
  head?: React.ReactNode
  initialLoad?: boolean
  isLoading?: boolean
  listenToScroll?: (offset: number, reverseOffset: number, threshold: number) => void
  loader?: React.ReactNode
  useCapture?: boolean
  scrollElement: HTMLDivElement | null
}

export const InfiniteScroll = (props: PropsWithChildren<InfiniteScrollProps>) => {
  const {
    children,
    hasNextPage,
    hasPreviousPage,
    head,
    initialLoad = true,
    isLoading,
    listenToScroll,
    loader,
    loadNextPage,
    loadPreviousPage,
    threshold = 250,
    useCapture = false,
    scrollElement,
  } = props

  const scrollListener = useCallback(() => {
    if (!scrollElement) {
      return
    }

    const offset = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight
    const reverseOffset = scrollElement.scrollTop

    if (listenToScroll) {
      listenToScroll(offset, reverseOffset, threshold)
    }

    if (isLoading) return

    if (reverseOffset < Number(threshold) && typeof loadPreviousPage === 'function' && hasPreviousPage) {
      loadPreviousPage()
    }

    if (offset < Number(threshold) && typeof loadNextPage === 'function' && hasNextPage) {
      loadNextPage()
    }
  }, [scrollElement, hasPreviousPage, hasNextPage, isLoading, listenToScroll, loadPreviousPage, loadNextPage, threshold])

  useLayoutEffect(() => {
    if (!scrollElement) return

    scrollElement.addEventListener('scroll', scrollListener, useCapture)
    scrollElement.addEventListener('resize', scrollListener, useCapture)

    return () => {
      scrollElement.removeEventListener('scroll', scrollListener, useCapture)
      scrollElement.removeEventListener('resize', scrollListener, useCapture)
    }
  }, [initialLoad, scrollListener, useCapture])

  useEffect(() => {
    if (scrollElement) {
      scrollElement.addEventListener('wheel', mousewheelListener, { passive: false })
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('wheel', mousewheelListener, useCapture)
      }
    }
  }, [useCapture])

  // 用于在消息不满一屏的时候，触发一次加载历史
  useEffect(() => {
    if (!scrollElement) return
    if (scrollElement.scrollHeight <= scrollElement.clientHeight) {
      loadPreviousPage?.()
    }
  }, [scrollElement])

  useLayoutEffect(() => {
    setTimeout(() => {
      if (scrollElement) {
        // eslint-disable-next-line react-compiler/react-compiler
        scrollElement.scrollTop = scrollElement.scrollHeight + 1000
      }
    })
  }, [])

  const childrenArray = [loader, children]

  if (head) {
    childrenArray.unshift(head)
  }

  return <>{childrenArray}</>
}
