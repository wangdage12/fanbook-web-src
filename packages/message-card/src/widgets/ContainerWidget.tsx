import React from 'react'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import AlignWidget from './AlignWidget'
import { color2css, constraints2css, gradient2css, GradientData, parseCommonCssProperties, parseEdgeInsets } from './helpers'
import { SingleChildWidget, Widget } from './Widget'
import WidgetTag from './WidgetTag'

/**
 * 文档：https://idreamsky.feishu.cn/docx/G86Cdsdzbokxm4xc5Lqcn9Glngh
 */
export default class ContainerWidget extends SingleChildWidget {
  // 尺寸约束，最多四个参数，例如只设置最小尺寸 100,100，或者是同时设置最大尺寸 100,100,200,200
  constraints?: string
  // 文本背景颜色，ARGB 字符串，例如红色可以写成 "#FFFF0000" 或者 "#FF0000" 或者 "FFFF0000" 或者 "FF0000"
  backgroundColor?: string
  border?: BorderData
  // 子节点的对齐方式，x 和 y 的 取值范围是 0~1，例如左上角对齐是 0,0，居中对齐是 0.5,0.5；右下角对齐是 1,1。
  // 如果 x 等于 y，可以简写成 x，例如居中可以写成 0.5。
  alignment?: string
  margin?: string
  gradient?: GradientData

  constructor() {
    super(WidgetTag.Container)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitContainer(this)
  }

  toReactComponent(): React.JSX.Element {
    let child = this.child?.toReactComponent?.()
    if (child && this.alignment) {
      child = <AlignWidget alignment={this.alignment}>{child}</AlignWidget>
    }

    // https://api.flutter.dev/flutter/widgets/Container-class.html
    // flutter 的规则比这复杂得多，这里只是简单实现
    let width: number | string | undefined = this.width,
      height: number | string | undefined = this.height
    width ??= getAncestorConstrained(this, 'width') ? '100%' : undefined
    height ??= getAncestorConstrained(this, 'height') ? '100%' : undefined

    return (
      <div
        style={{
          ...parseCommonCssProperties(this),
          ...constraints2css(this.constraints),
          margin: parseEdgeInsets(this.margin),
          width,
          height,
          background: gradient2css(this.gradient) ?? color2css(this.backgroundColor),
          borderWidth: this.border?.color && (this.border?.width ?? 1),
          borderRadius: this.border?.radius,
          borderColor: color2css(this.border?.color),
        }}
      >
        {child}
      </div>
    )
  }
}

interface BorderData {
  width?: number
  radius?: number
  color?: string
}

/**
 * 模拟 flutter 的约束系统
 */
function getAncestorConstrained(widget: Widget, prop: 'width' | 'height'): boolean {
  while (widget.parent) {
    widget = widget.parent
    if (widget.tag === WidgetTag.Column || widget.tag === WidgetTag.Row) {
      return false
    }
    if (widget[prop] || widget.tag === WidgetTag.AspectRatio) {
      return true
    } else if (widget.tag === WidgetTag.Container) {
      // 如果容器没设置尺寸，继续向上找
    } else {
      return false
    }
  }
  return false
}
