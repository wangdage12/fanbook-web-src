import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'

/**
 * 在指定的延迟后，根据条件显示组件
 *
 * @param condition 如果返回 true，则显示组件
 * @param delay     延迟时间，单位毫秒
 * @param children  要显示的组件
 */
export default function AppearDelayed({ condition, delay, children }: { delay: number; condition: () => boolean } & HTMLAttributes<never>) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (condition()) {
        setShouldRender(true)
      }
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [condition, delay])

  return shouldRender ? children : null
}

export function DisappearDelayed(props: { start: boolean; delay: number; children: ReactNode }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!props.start) return

    const timer = setTimeout(() => {
      setHidden(true)
    }, props.delay)

    return () => {
      clearTimeout(timer)
    }
  }, [props.start, props.delay])

  return hidden ? null : props.children
}
