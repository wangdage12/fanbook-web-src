import { BasicTarget, getTargetElement } from 'ahooks/lib/utils/domTarget'
import useIsomorphicLayoutEffectWithTarget from 'ahooks/lib/utils/useIsomorphicLayoutEffectWithTarget'
import { Divider, Tabs, TabsProps } from 'antd'
import HoverBox from 'fb-components/components/HoverBox'
import { ReactNode, useCallback, useRef, useState } from 'react'

/**
 * 点击模拟滚动
 *
 * https://github.com/react-component/tabs/blob/b919db3844f10712fbdcc9a2e2fd38159b8e2068/src/hooks/useTouchMove.ts#L82
 *
 * 只使用了 deltaX deltaY 这两个属性，先模拟这两个属性
 */
const dispatchWheelEvent = (deltaY: number = 0, elem: Element) => {
  const customEvent = new CustomEvent('wheel', {
    bubbles: true, // 事件是否冒泡
    cancelable: true, // 事件是否可取消
    composed: true,
  })
  //
  //
  // @ts-expect-error 模拟 wheel 赋值
  customEvent.deltaX = 0 // x轴滚动距离
  // @ts-expect-error 模拟 wheel 赋值
  customEvent.deltaY = deltaY // y轴滚动距离
  elem.dispatchEvent(customEvent)
}

//按钮组 宽度
const EXTRA_BTN_BOX_WIDTH = 72

function useControl(
  target: BasicTarget<HTMLElement> | null,
  options: {
    wrapperSelector: string
    listSelector: string
  }
) {
  const [hasControl, setHasControl] = useState(false)
  const [isStartEdge, setStartEdge] = useState(true)
  const [isEndEdge, setEndEdge] = useState(false)
  const wrapperElemRef = useRef<Element | null>()
  const listElemRef = useRef<Element | null>()

  const handleControl = useCallback(() => {
    if (!wrapperElemRef.current || !listElemRef.current) {
      return
    }
    const wrapperWidth = (wrapperElemRef.current as HTMLDivElement).offsetWidth
    const listWidth = (listElemRef.current as HTMLDivElement).offsetWidth
    setHasControl(_hasControl => {
      if (_hasControl) {
        // 如果有按钮组 则加上按钮组占用的宽度再比较, +2 避免极限值问题
        _hasControl = wrapperWidth + EXTRA_BTN_BOX_WIDTH + 2 < listWidth
      } else {
        // 如果没有按钮组 则直接比较, +2 避免极限值问题
        _hasControl = wrapperWidth + 2 < listWidth
      }
      return _hasControl
    })
  }, [])

  const handleEdge = useCallback(() => {
    if (!wrapperElemRef.current) {
      return
    }
    const classList = Array.from(wrapperElemRef.current.classList)
    setStartEdge(() => {
      return classList.every(item => !item.endsWith('ping-left'))
    })
    setEndEdge(() => {
      return classList.every(item => !item.endsWith('ping-right'))
    })
  }, [])

  const onStartClick = useCallback(() => {
    if (!wrapperElemRef.current || !listElemRef.current || isStartEdge) {
      return
    }
    dispatchWheelEvent(-(wrapperElemRef.current as HTMLDivElement).offsetWidth, wrapperElemRef.current)
  }, [isStartEdge])

  const onEndClick = useCallback(() => {
    if (!wrapperElemRef.current || !listElemRef.current || isEndEdge) {
      return
    }
    dispatchWheelEvent((wrapperElemRef.current as HTMLDivElement).offsetWidth, wrapperElemRef.current)
  }, [isEndEdge])

  useIsomorphicLayoutEffectWithTarget(
    () => {
      const elem = getTargetElement(target)
      wrapperElemRef.current = elem?.querySelector(options.wrapperSelector)
      listElemRef.current = elem?.querySelector(options.listSelector)
      const wrapperResizeObs = new ResizeObserver(() => handleControl())
      const wrapperMutationObs = new MutationObserver(mutations => {
        const [mutation] = mutations
        if (!mutation) {
          return
        }
        switch (mutation.type) {
          case 'attributes':
            handleEdge()
            break
          case 'childList':
            handleControl()
            break
          default:
            break
        }
      })
      handleControl()
      handleEdge()
      if (wrapperElemRef.current) {
        wrapperMutationObs.observe(wrapperElemRef.current, {
          childList: false,
          attributes: true,
          attributeFilter: ['class'],
          attributeOldValue: true,
        })
        wrapperResizeObs.observe(wrapperElemRef.current)
      }
      if (listElemRef.current) {
        wrapperResizeObs.observe(listElemRef.current)
      }
      return () => {
        wrapperMutationObs.disconnect()
        wrapperResizeObs.disconnect()
      }
    },
    [],
    target
  )
  return { hasControl, isStartEdge, isEndEdge, onStartClick, onEndClick }
}

interface FbTabsProps extends Omit<TabsProps, 'renderTabBar'> {
  tabBarClassName?: string
}

function FbTabs({ tabBarExtraContent, tabBarClassName = '', ...props }: FbTabsProps) {
  const tabBarRef = useRef()
  const { hasControl, isStartEdge, isEndEdge, onStartClick, onEndClick } = useControl(tabBarRef, {
    wrapperSelector: '.ant-tabs-nav-wrap',
    listSelector: '.ant-tabs-nav-list',
  })

  const handleExtraContent = () => {
    let _tabBarExtraContent = tabBarExtraContent
    if (_tabBarExtraContent) {
      if (!(typeof _tabBarExtraContent === 'object' && ('left' in _tabBarExtraContent || 'right' in _tabBarExtraContent))) {
        _tabBarExtraContent = { right: _tabBarExtraContent } as NonNullable<TabsProps['tabBarExtraContent']>
      }
    }

    const right = ((_tabBarExtraContent ?? {}) as { right?: ReactNode }).right
    if (right || hasControl) {
      // eslint-disable-next-line no-extra-semi
      ;((_tabBarExtraContent ?? {}) as { right?: ReactNode }).right = (
        <div className="ml-[8px] flex h-full items-center justify-center">
          {hasControl ?
            <>
              <HoverBox size={28} disabled={isStartEdge} onClick={onStartClick}>
                <iconpark-icon name="Left" size={14}></iconpark-icon>
              </HoverBox>
              <HoverBox size={28} disabled={isEndEdge} onClick={onEndClick}>
                <iconpark-icon name="Right" size={14}></iconpark-icon>
              </HoverBox>
            </>
          : null}
          {right && hasControl ?
            <Divider type="vertical" className="top-[2px] ml-[16px] mr-[8px] h-[22px]" />
          : null}
          {right}
        </div>
      )
    }
    return _tabBarExtraContent
  }

  const _tabBarExtraContent = handleExtraContent()
  return (
    <Tabs
      tabBarExtraContent={_tabBarExtraContent}
      renderTabBar={(props, DefaultTabBar) => {
        return (
          //@ts-expect-error 实际是存在 ref
          <DefaultTabBar ref={tabBarRef} {...props} className={tabBarClassName}></DefaultTabBar>
        )
      }}
      {...props}
    />
  )
}

export default FbTabs
