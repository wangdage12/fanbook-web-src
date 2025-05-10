import { BasicTarget, getTargetElement } from 'ahooks/lib/utils/domTarget'
import useIsomorphicLayoutEffectWithTarget from 'ahooks/lib/utils/useIsomorphicLayoutEffectWithTarget'
import { isNil } from 'lodash-es'
import { MouseEventHandler, useCallback, useRef, useState } from 'react'
import { TouchLike, clamp, coordChange, midpoint, roundToDecimalPlaces, touchDistance, touchPt } from './geometry'
import makePassiveEventOption from './makePassiveEventOption'

interface Point {
  x: number
  y: number
}

const clampTranslation = (
  desiredTranslation: Point,
  translationBounds?: {
    xMax: number
    xMin: number
    yMax: number
    yMin: number
  }
) => {
  const { x, y } = desiredTranslation

  let { xMax, xMin, yMax, yMin } = translationBounds || {}
  xMin = !isNil(xMin) ? xMin : -Infinity
  yMin = !isNil(yMin) ? yMin : -Infinity
  xMax = !isNil(xMax) ? xMax : Infinity
  yMax = !isNil(yMax) ? yMax : Infinity
  return {
    x: clamp(xMin, x, xMax),
    y: clamp(yMin, y, yMax),
  }
}

export interface ImageHandleOption {
  maxScale?: number
  minScale?: number
  disablePan?: boolean
  disableZoom?: boolean
  translationBounds?: {
    xMax: number
    xMin: number
    yMax: number
    yMin: number
  }
  /** 单纯点击遮罩层 */
  onMaskClick?: MouseEventHandler<HTMLDivElement>
}

export function useInteraction(target: BasicTarget<HTMLElement> | null, options?: ImageHandleOption) {
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const startPointerInfo = useRef<{ pointers: TouchLike[]; scale: number; translationX: number; translationY: number } | undefined>()
  const refScale = useRef(1)
  const refTranslateX = useRef(0)
  const refTranslateY = useRef(0)
  const shouldPreventTouchEndDefault = useRef(false)
  const { maxScale = 3, minScale = 0.5, disablePan = false, disableZoom = false, translationBounds, onMaskClick } = options ?? {}

  const update = () => {
    refScale.current = roundToDecimalPlaces(refScale.current, 5)
    refTranslateX.current = roundToDecimalPlaces(refTranslateX.current, 5)
    refTranslateY.current = roundToDecimalPlaces(refTranslateY.current, 5)
    setScale(refScale.current)
    setTranslateX(refTranslateX.current)
    setTranslateY(refTranslateY.current)
  }

  const setPointerState = (pointers?: TouchLike[]) => {
    if (!pointers || pointers.length === 0) {
      startPointerInfo.current = undefined
      return
    }

    startPointerInfo.current = {
      pointers,
      scale: refScale.current,
      translationX: refTranslateX.current,
      translationY: refTranslateY.current,
    }
  }

  const onMouseDown = (evt: MouseEvent) => {
    evt.preventDefault()
    setPointerState([evt])
  }

  const onTouchStart = (evt: TouchEvent) => {
    // evt.preventDefault() 取消默认事件会导致触屏点击失效
    setPointerState(evt.touches as unknown as TouchLike[])
  }

  const onMouseUp = (evt: MouseEvent) => {
    evt.preventDefault()
    setPointerState()
  }

  const onContextMenu = (evt: MouseEvent) => {
    setPointerState()
  }

  const onTouchEnd = (evt: TouchEvent) => {
    // evt.preventDefault() 取消默认事件会导致触屏点击失效
    setPointerState(evt.touches as unknown as TouchLike[])
  }

  // handles both touch and mouse drags
  const onDrag = (pointer: TouchLike) => {
    const { translationX = 0, translationY = 0, pointers = [] } = startPointerInfo.current ?? {}
    const startPointer = pointers[0]
    if (!startPointer) {
      return
    }
    const dragX = pointer.clientX - startPointer.clientX
    const dragY = pointer.clientY - startPointer.clientY
    const desiredTranslation = {
      x: translationX + dragX,
      y: translationY + dragY,
    }
    shouldPreventTouchEndDefault.current = Math.abs(dragX) > 1 || Math.abs(dragY) > 1
    const { x, y } = clampTranslation(desiredTranslation, translationBounds)
    refTranslateX.current = x
    refTranslateY.current = y
    update()
  }

  const scaleFromPoint = (newScale: number, focalPt: Point) => {
    const scaleRatio = newScale / (refScale.current !== 0 ? refScale.current : 1)

    const focalPtDelta = {
      x: coordChange(focalPt.x, scaleRatio),
      y: coordChange(focalPt.y, scaleRatio),
    }

    const desiredTranslation = {
      x: refTranslateX.current - focalPtDelta.x,
      y: refTranslateY.current - focalPtDelta.y,
    }
    const { x, y } = clampTranslation(desiredTranslation, translationBounds)
    refScale.current = newScale
    refTranslateX.current = x
    refTranslateY.current = y
    update()
  }
  // Done like this so it is mockable
  const getContainerNode = () => {
    const elem = getTargetElement(target)
    return elem?.parentElement
  }
  const getContainerBoundingClientRect = () => {
    return getContainerNode()?.getBoundingClientRect()
  }
  const translatedOrigin = (translation: Point) => {
    const { left = 0, top = 0 } = getContainerBoundingClientRect() ?? {}
    return {
      x: left + translation.x,
      y: top + translation.y,
    }
  }

  // From a given screen point return it as a point
  // in the coordinate system of the given translation
  const clientPosToTranslatedPos = ({ x, y }: Point, translation: Point = { x: refTranslateX.current, y: refTranslateY.current }) => {
    const origin = translatedOrigin(translation)
    return {
      x: x - origin.x,
      y: y - origin.y,
    }
  }

  // Given the start touches and new e.touches, scale and translate
  // such that the initial midpoint remains as the new midpoint. This is
  // to achieve the effect of keeping the content that was directly
  // in the middle of the two fingers as the focal point throughout the zoom.
  const scaleFromMultiTouch = (evt: TouchEvent) => {
    if (!startPointerInfo.current) {
      return
    }
    const startTouches = startPointerInfo.current.pointers
    const newTouches = evt.touches

    // calculate new scale
    const dist0 = touchDistance(startTouches[0], startTouches[1])
    const dist1 = touchDistance(newTouches[0], newTouches[1])
    const scaleChange = dist1 / dist0

    const startScale = startPointerInfo.current.scale
    const targetScale = startScale + (scaleChange - 1) * startScale
    refScale.current = clamp(minScale, targetScale, maxScale)

    // calculate mid points
    const startMidpoint = midpoint(touchPt(startTouches[0]), touchPt(startTouches[1]))
    const newMidPoint = midpoint(touchPt(newTouches[0]), touchPt(newTouches[1]))

    // The amount we need to translate by in order for
    // the mid point to stay in the middle (before thinking about scaling factor)
    const dragDelta = {
      x: newMidPoint.x - startMidpoint.x,
      y: newMidPoint.y - startMidpoint.y,
    }

    const scaleRatio = refScale.current / startScale

    // The point originally in the middle of the fingers on the initial zoom start
    const focalPt = clientPosToTranslatedPos(startMidpoint, { x: startPointerInfo.current.translationX, y: startPointerInfo.current.translationY })

    // The amount that the middle point has changed from this scaling
    const focalPtDelta = {
      x: coordChange(focalPt.x, scaleRatio),
      y: coordChange(focalPt.y, scaleRatio),
    }

    // Translation is the original translation, plus the amount we dragged,
    // minus what the scaling will do to the focal point. Subtracting the
    // scaling factor keeps the midpoint in the middle of the touch points.
    const desiredTranslation = {
      x: startPointerInfo.current.translationX - focalPtDelta.x + dragDelta.x,
      y: startPointerInfo.current.translationY - focalPtDelta.y + dragDelta.y,
    }
    const { x, y } = clampTranslation(desiredTranslation, translationBounds)
    refTranslateX.current = x
    refTranslateY.current = y
    update()
  }

  const onMouseMove = (evt: MouseEvent) => {
    if (!startPointerInfo.current || disablePan) {
      return
    }
    evt.preventDefault()
    onDrag(evt)
  }

  const onTouchMove = (evt: TouchEvent) => {
    if (!startPointerInfo.current) {
      return
    }

    evt.preventDefault()

    const isPinchAction = evt.touches.length === 2 && startPointerInfo.current.pointers.length > 1
    if (isPinchAction && !disableZoom) {
      scaleFromMultiTouch(evt)
    } else if (evt.touches.length === 1 && startPointerInfo.current.pointers && !disablePan) {
      onDrag(evt.touches[0])
    }
  }

  const onWheel = (evt: WheelEvent) => {
    if (disableZoom) {
      return
    }

    evt.preventDefault()
    evt.stopPropagation()

    // const scaleChange = -(1 - 2 ** (evt.deltaY * 0.002))
    const scaleChange = (evt.deltaY / Math.abs(evt.deltaY === 0 ? 1 : evt.deltaY)) * 0.2

    const newScale = clamp(minScale, refScale.current - scaleChange, maxScale)

    const mousePos = clientPosToTranslatedPos({ x: evt.clientX, y: evt.clientY })

    scaleFromPoint(newScale, mousePos)
  }

  /*
      This is a little trick to allow the following ux: We want the parent of this
      component to decide if elements inside the map are clickable. Normally, you wouldn't
      want to trigger a click event when the user *drags* on an element (only if they click
      and then release w/o dragging at all). However we don't want to assume this
      behavior here, so we call `preventDefault` and then let the parent check
      `e.defaultPrevented`. That value being true means that we are signalling that
      a drag event ended, not a click.
    */
  const handleEventCapture = (evt: Event) => {
    if (shouldPreventTouchEndDefault.current) {
      evt.preventDefault()
      shouldPreventTouchEndDefault.current = false
    }
  }

  const onInnerClick = (evt: MouseEvent) => {
    if (!shouldPreventTouchEndDefault.current) {
      const elemParent = getContainerNode()
      if (evt.target === elemParent) {
        onMaskClick?.(evt as any)
      }
    }
    handleEventCapture(evt)
  }

  useIsomorphicLayoutEffectWithTarget(
    () => {
      const elemParent = getContainerNode()

      if (!elemParent) {
        return
      }

      const passiveOption = makePassiveEventOption(false)
      const touchAndMouseEndOptions = { capture: true, ...(typeof passiveOption === 'boolean' ? {} : passiveOption) }

      elemParent.addEventListener('wheel', onWheel, passiveOption)
      elemParent.addEventListener('click', onInnerClick, touchAndMouseEndOptions)
      elemParent.addEventListener('touchend', handleEventCapture, touchAndMouseEndOptions)
      elemParent.addEventListener('contextmenu', onContextMenu, passiveOption)

      /*
        Setup events for the gesture lifecycle: start, move, end touch
      */

      // start gesture
      elemParent.addEventListener('touchstart', onTouchStart, passiveOption)
      elemParent.addEventListener('mousedown', onMouseDown, passiveOption)

      // move gesture
      elemParent.addEventListener('touchmove', onTouchMove, passiveOption)
      elemParent.addEventListener('mousemove', onMouseMove, passiveOption)

      // end gesture
      window.addEventListener('touchend', onTouchEnd, touchAndMouseEndOptions)
      window.addEventListener('mouseup', onMouseUp, touchAndMouseEndOptions)

      return () => {
        if (!elemParent) {
          return
        }
        elemParent.removeEventListener('wheel', onWheel, passiveOption)
        elemParent.removeEventListener('click', onInnerClick, touchAndMouseEndOptions)
        elemParent.removeEventListener('touchend', handleEventCapture, touchAndMouseEndOptions)
        elemParent.removeEventListener('contextmenu', onContextMenu, passiveOption)

        // Remove touch events
        elemParent.removeEventListener('touchstart', onTouchStart, passiveOption)
        elemParent.removeEventListener('touchmove', onTouchMove, passiveOption)
        window.removeEventListener('touchend', onTouchEnd, touchAndMouseEndOptions)

        // Remove mouse events
        elemParent.removeEventListener('mousedown', onMouseDown, passiveOption)
        elemParent.removeEventListener('mousemove', onMouseMove, passiveOption)
        window.removeEventListener('mouseup', onMouseUp, touchAndMouseEndOptions)
      }
    },
    [options],
    target
  )

  const reset = useCallback(
    (center = false) => {
      let translateX = 0
      let translateY = 0
      if (center) {
        const elem = getTargetElement(target)
        const elemParent = getContainerNode()
        if (elem && elemParent) {
          const { clientWidth, clientHeight } = elem
          const { clientWidth: clientParentWidth, clientHeight: clientParentHeight } = elemParent
          translateX = (clientParentWidth - clientWidth) / 2
          translateY = (clientParentHeight - clientHeight) / 2
        }
      }
      setScale(1)
      setTranslateX(translateX)
      setTranslateY(translateY)
      refScale.current = 1
      refTranslateX.current = translateX
      refTranslateY.current = translateY
      shouldPreventTouchEndDefault.current = false
    },
    [target]
  )
  // transform 内容顺序由特定要求 Translate first and then scale. Otherwise, the scale would affect the translation.
  return { scale, translateX, translateY, reset, transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }
}
