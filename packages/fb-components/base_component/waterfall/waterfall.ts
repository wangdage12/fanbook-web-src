import './style.css'
import { WaterfallEventHandlersEventMap } from './type'

export function minIndex(arr: number[], gap: number) {
  let ii = 0
  // -gap/4 是为了高度相差不大时，尽量平均分配
  for (let i = 0; i < arr.length; i++) ii = arr[ii] - gap / 4 <= arr[i] ? ii : i
  return ii
}

type Props = {
  cols: number
  gap: number
  colWidth: number
}

type Ops<T extends Element> = {
  // w
  getW(el: T): number
  setW(el: T, v: number): void
  // h
  getH(el: T): number
  setH(el: T, v: number): void

  recordWH(el: T): void
  // padding
  getPad(el: T): { pt: number; pr: number; pb: number; pl: number }
  // xy
  setX(el: T, v: number): void
  setY(el: T, v: number): void
  // children
  getChildren(el: T): T[]
}

function waterfallRender<T extends Element>(
  container: T,
  { setW, getH, setH, recordWH, getPad, setX, setY, getChildren }: Ops<T>,
  { cols, gap, colWidth }: Props
) {
  const { pt, pb, pl } = getPad(container)
  const els = getChildren(container),
    len = els.length

  if (len) {
    // 获取每个 item 的高度
    els.forEach(el => setW(el, colWidth))
    const hs = els.map(el => {
      recordWH(el)
      return getH(el)
    }) as number[]

    // 计算位置
    const stack = Array(cols).fill(pt)

    for (let i = 0; i < len; i++) {
      const el = els[i]
      const col = minIndex(stack, gap)
      setY(el, stack[col])
      setX(el, pl + (colWidth + gap) * col)
      stack[col] += hs[i] + gap
    }

    // 设置容器高度
    setH(container, Math.max(...stack) - gap + pt + pb)
  } else {
    setH(container, pt + pb)
  }
}

export class WaterfallElement extends HTMLElement {
  _width?: number
  _height?: number
  _colWidth?: number

  constructor() {
    super()
  }

  static default_props = Object.freeze({
    cols: 2,
    gap: 4,
  })

  get gap() {
    return +(this.getAttribute('gap') || WaterfallElement.default_props.gap)
  }
  set gap(val) {
    this.setAttribute('gap', val + '')
  }

  get cols() {
    return +(this.getAttribute('cols') || WaterfallElement.default_props.cols)
  }
  set cols(val) {
    this.setAttribute('cols', val + '')
  }

  #sizeObs?: ResizeObserver
  #childObs?: MutationObserver
  #attrsObs?: MutationObserver

  connectedCallback() {
    this.#sizeObs = new ResizeObserver(
      es =>
        es.some(({ target }) => {
          const el = target as WaterfallElement
          return el._width != el.offsetWidth || el._height != el.offsetHeight
        }) && this.repaint()
    )
    this.#sizeObs.observe(this)
    ;[...this.children].forEach(el => this.#sizeObs?.observe(el))

    this.repaint()

    // 监听元素增删
    this.#childObs = new MutationObserver(ms => {
      ms.forEach(m => {
        m.addedNodes.forEach(el => el instanceof HTMLElement && this.#sizeObs?.observe(el))
        m.removedNodes.forEach(el => el instanceof HTMLElement && this.#sizeObs?.unobserve(el))
      })
      this.repaint()
    })
    this.#childObs.observe(this, { childList: true, attributes: false })

    // 监听属性变化
    this.#attrsObs = new MutationObserver(() => this.repaint())
    this.#attrsObs.observe(this, { childList: false, attributes: true })
  }

  disconnectedCallback() {
    this.#sizeObs?.disconnect()
    this.#childObs?.disconnect()
    this.#attrsObs?.disconnect()
  }

  #painting = false

  // 重排布局
  repaint() {
    if (this.#painting) return
    this.#painting = true
    requestAnimationFrame(() => {
      this.#repaint()
      this.#painting = false
    })
  }

  // 重排布局
  #repaint() {
    // console.log('repaint')
    const ops: Ops<this> = {
      getW: el => el.offsetWidth,
      setW: (el, v) => (el.style.width = v + 'px'),
      getH: el => el.offsetHeight,
      setH: (el, v) => (el.style.height = v + 'px'),
      recordWH: el => {
        el._width = el.offsetWidth
        el._height = el.offsetHeight
      },
      getPad: el => {
        const pad = getComputedStyle(el)
        return { pt: parseInt(pad.paddingTop), pr: parseInt(pad.paddingRight), pb: parseInt(pad.paddingBottom), pl: parseInt(pad.paddingLeft) }
      },
      setX: (el, v) => (el.style.left = v + 'px'),
      setY: (el, v) => (el.style.top = v + 'px'),
      getChildren: el => [...el.children] as (typeof this)[],
    }
    const { pr, pl } = ops.getPad(this)
    const colWidth = (ops.getW(this) - this.gap * (this.cols - 1) - (pl + pr)) / this.cols
    waterfallRender(this, ops, {
      cols: this.cols,
      gap: this.gap,
      colWidth: colWidth,
    })

    this._width = this.offsetWidth
    this._height = this.offsetHeight
    if (this._colWidth !== colWidth) {
      this.emit('colwidthchange', { colWidth })
    }
    this._colWidth = colWidth

    this.#attrsObs?.takeRecords()
  }

  emit<K extends keyof WaterfallEventHandlersEventMap>(event: K, detail: WaterfallEventHandlersEventMap[K]['detail']) {
    const customEvent = new CustomEvent(event, {
      bubbles: true, // 事件是否冒泡
      cancelable: true, // 事件是否可取消
      composed: true,
      detail,
    })
    // 触发自定义事件
    this.dispatchEvent(customEvent)
  }
}
// 避免重复定义
customElements.get('fb-waterfall') || customElements.define('fb-waterfall', WaterfallElement)
