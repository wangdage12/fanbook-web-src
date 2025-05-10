import { useSize } from 'ahooks'
import { HTMLProps, useLayoutEffect, useRef, useState } from 'react'

type LoadMoreProps = HTMLProps<HTMLDivElement> & {
  // 文字模式需要保证
  textMode?: {
    lineHeight: number
    maxLines: number
  }
  heightMode?: {
    maxHeight: number
  }
  expandBtnClassName?: string
}

export default function LoadMore({ children, style, textMode, heightMode, expandBtnClassName = 'text-base', ...props }: LoadMoreProps) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useSize(ref)
  const [canExpand, setCanExpand] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const maxHeight = heightMode?.maxHeight ?? textMode!.lineHeight * textMode!.maxLines

  useLayoutEffect(() => {
    if (expanded) return
    if (!size) return
    if (ref.current!.scrollHeight > maxHeight) {
      setCanExpand(true)
    } else {
      setCanExpand(false)
      setExpanded(true)
    }
  }, [size?.width, size?.height])

  if (textMode) {
    const { maxLines, lineHeight } = textMode
    return (
      <>
        <div
          ref={ref}
          {...props}
          style={{
            ...style,
            overflow: 'hidden',
            display: expanded ? 'block' : '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: maxLines,
            lineHeight: `${lineHeight}px`,
            maxHeight: expanded ? undefined : maxHeight,
            textOverflow: 'ellipsis',
          }}
        >
          {children}
        </div>
        {canExpand && (
          <div
            className={`cursor-pointer text-[var(--fg-blue-1)] ${expandBtnClassName}`}
            onClick={() => {
              setCanExpand(false)
              setExpanded(true)
            }}
          >
            展开
          </div>
        )}
      </>
    )
  } else {
    return (
      <>
        <div
          ref={ref}
          {...props}
          style={{
            ...style,
            position: 'relative',
            overflow: 'hidden',
            maxHeight: expanded ? undefined : heightMode?.maxHeight,
          }}
        >
          {children}
          {canExpand && (
            <div
              className={`absolute bottom-0 left-0 right-0 flex h-[76px] cursor-pointer justify-center text-base text-[var(--fg-blue-1)] ${expandBtnClassName}`}
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 98%)',
              }}
              onClick={() => {
                setCanExpand(false)
                setExpanded(true)
              }}
            >
              <div
                className={'mt-8 h-fit w-fit rounded-full bg-[var(--fg-white-1)] px-4 py-1.5 text-[var(--fg-blue-1)]'}
                style={{
                  boxShadow: '0px 2px 8px 0px rgba(26, 32, 51, 0.051)',
                }}
              >
                展开全文
              </div>
            </div>
          )}
        </div>
      </>
    )
  }
}
