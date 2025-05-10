import React, { Fragment } from 'react'
import WidgetTreeVisitor from '../../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties } from '../helpers'
import MultiChildrenWidget, { SingleChildWidget } from '../Widget'
import WidgetTag from '../WidgetTag'

export default class AbsoluteLayoutWidget extends MultiChildrenWidget {
  alignment?: string

  constructor() {
    super(WidgetTag.Stack)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitAbsoluteLayout(this)
  }

  toReactComponent(): React.JSX.Element {
    return (
      <div className={'relative h-full w-full'} style={parseCommonCssProperties(this)}>
        {this.children.map((child, index) => {
          let widget = child?.toReactComponent?.()
          // 不能使用 absolute，因为 absolute 会脱离文档流，导致父元素高度为 0，其他绝对定位就会失效
          // 但如果不用 absolute，没法让多个子元素重叠，所以剩下的方案就是用 MutationObserver 和 ResizeObserver 监听父元素和子元素的变化，然后计算偏移量
          // 不过由于 `alignment` 能简单的用 `positioned` tag 替代，所以暂不在 web 实现此特性。
          // const { left, right, top, bottom } = child as PositionedWidget
          // if (child && left === undefined && right === undefined && top === undefined && bottom === undefined) {
          //   const w = child.tag === WidgetTag.Positioned ? (child as PositionedWidget).child?.toReactComponent?.() : child.toReactComponent()
          //   widget = <AlignWidget alignment={this.alignment}>{w}</AlignWidget>
          // }

          // 模拟居中对齐，实际上不仅要处理居中，但是其他的基本不会通过 alignment 实现，如果出现，这里的逻辑需要补全
          if (widget && child?.tag === WidgetTag.Positioned && (!this.alignment || this.alignment === '0')) {
            const p = child as PositionedWidget
            const h = p.left === undefined && p.right === undefined
            const v = p.top === undefined && p.bottom === undefined
            widget = React.cloneElement(widget, {
              style: {
                ...widget.props.style,
                left: h ? '50%' : p.left,
                top: v ? '50%' : p.top,
                transform: `translate(${h ? '-50%' : 0}, ${v ? '-50%' : 0})`,
              },
            })
          }
          return <Fragment key={index}>{widget}</Fragment>
        })}
      </div>
    )
  }
}

export class PositionedWidget extends SingleChildWidget {
  left?: number
  top?: number
  right?: number
  bottom?: number

  constructor() {
    super(WidgetTag.Positioned)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitPositioned(this)
  }

  toReactComponent(): React.JSX.Element {
    const { left, right, top, bottom } = this
    return (
      <div className={'absolute'} style={{ left, right, top, bottom, ...parseCommonCssProperties(this) }}>
        {this.child?.toReactComponent?.()}
      </div>
    )
  }
}
