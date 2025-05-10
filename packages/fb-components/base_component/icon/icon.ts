import { LitElement, css, html } from 'lit'
import { customElement, property, queryAll } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'

function getColorArray(color: string, length = 0) {
  // 逗号分隔的颜色数组,但是忽略括号里的逗号, 例如: #000,#fff,rgb(11,11,11) 会被解析成 ['#000', '#fff', rgb(11,11,11)]
  const colorArray = (color ?? '').split(/,(?![^()]*\))/).filter(Boolean)
  if (colorArray.length > 0 && colorArray.length < length) {
    return [...colorArray, ...Array(length - colorArray.length).fill(colorArray[colorArray.length - 1])]
  }
  return colorArray
}

const PatchType = {
  STROKE: { trackAttr: 'data-follow-stroke', rawAttr: 'stroke' },
  FILL: { trackAttr: 'data-follow-fill', rawAttr: 'fill' },
}

@customElement('iconpark-icon')
export class IconparkIconElement extends LitElement {
  // 占位用, 如果都是 accessor 的话, 会解析失败
  #key = 'accessor'

  @property({ reflect: true })
  accessor name = ''

  @property({ reflect: true, attribute: 'icon-id' })
  accessor identifier = ''

  @property({ reflect: true })
  // 不能为 'currentColor', 否则会导致不可修改的图标异常
  accessor color: string = ''

  @property({ reflect: true })
  accessor stroke: string = ''

  @property({ reflect: true })
  accessor fill: string = ''

  @property({ reflect: true })
  accessor size = '1em'

  @property({ reflect: true })
  accessor width = ''

  @property({ reflect: true })
  accessor height = ''
  //
  @queryAll(`[${PatchType.STROKE.trackAttr}]`)
  accessor strokeAppliedNodes: NodeList = document.createDocumentFragment().childNodes

  @queryAll(`[${PatchType.FILL.trackAttr}]`)
  accessor fillAppliedNodes: NodeList = document.createDocumentFragment().childNodes

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :host([spin]) svg {
      animation: iconpark-spin 1s infinite linear;
    }

    :host([spin][rtl]) svg {
      animation: iconpark-spin-rtl 1s infinite linear;
    }

    :host([rtl]) svg {
      transform: scaleX(-1);
    }

    @keyframes iconpark-spin {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes iconpark-spin-rtl {
      0% {
        transform: scaleX(-1) rotate(0);
      }
      100% {
        transform: scaleX(-1) rotate(360deg);
      }
    }
  `

  get _width() {
    return this.width || this.size
  }

  get _height() {
    return this.height || this.size
  }

  get _stroke() {
    return this.stroke || this.color
  }

  get _fill() {
    return this.fill || this.color
  }

  get SVGConfig() {
    return (window.__iconpark__ || {})[this.identifier] || (window.__iconpark__ || {})[this.name] || { viewBox: '0 0 0 0', content: '' }
  }

  connectedCallback() {
    super.connectedCallback()
    requestAnimationFrame(() => {
      this.monkeyPatch('STROKE', true)
      this.monkeyPatch('FILL', true)
    })
  }

  monkeyPatch(type: keyof typeof PatchType, enabled = false) {
    switch (type) {
      case 'STROKE':
        this.updateDOMByHand(this.strokeAppliedNodes, 'STROKE', this._stroke, !!enabled)
        break
      case 'FILL':
        this.updateDOMByHand(this.fillAppliedNodes, 'FILL', this._fill, !!enabled)
        break
    }
  }

  updateDOMByHand(originNodes: NodeList, type: keyof typeof PatchType, value: string, enabled = false) {
    if (!value && enabled) {
      return
    }
    const nodes = Array.from(originNodes) as Element[]
    if (nodes && nodes.length > 0) {
      const colorArray = getColorArray(value, nodes.length)
      nodes.forEach((node, index) => {
        const color = colorArray[index] ?? ''
        if (value && value === node.getAttribute(PatchType[type].rawAttr)) {
          return
        }
        const trackAttr = node.getAttribute(PatchType[type].trackAttr)
        // 不可修改的图标 trackAttr 不为空, 且不为 currentColor
        const attr = trackAttr && trackAttr !== 'currentColor' ? trackAttr : color || trackAttr
        node.setAttribute(PatchType[type].rawAttr, attr ?? '')
      })
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue)

    if (name === 'name' || name === 'identifyer') {
      requestAnimationFrame(() => {
        this.monkeyPatch('STROKE')
        this.monkeyPatch('FILL')
      })
    } else if (name === 'color' || name === 'stroke' || name === 'fill') {
      this.monkeyPatch('STROKE')
      this.monkeyPatch('FILL')
    }
  }

  render() {
    return html`
      <svg
        width="${this._width}"
        height="${this._height}"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        fill="${this.SVGConfig.fill}"
        viewBox="${this.SVGConfig.viewBox}"
      >
        ${unsafeSVG(this.SVGConfig.content)}
      </svg>
    `
  }
}
