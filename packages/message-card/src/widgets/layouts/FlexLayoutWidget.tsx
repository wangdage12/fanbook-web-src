import React, { Fragment } from 'react'
import StringUtils from '../../StringUtils'
import WidgetTreeVisitor from '../../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties } from '../helpers'
import MultiChildrenWidget from '../Widget'
import WidgetTag from '../WidgetTag'

export default class FlexLayoutWidget extends MultiChildrenWidget {
  mainAxisAlignment?: 'start' | 'end' | 'center' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly'
  crossAxisAlignment?: 'start' | 'end' | 'center' | 'stretch'
  size?: 'min' | 'max'

  constructor(tag: WidgetTag | `${WidgetTag}`) {
    super(tag)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitFlexLayout(this)
  }

  toReactComponent(): React.JSX.Element {
    const size = this.size ?? 'max'
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: this.tag === WidgetTag.Row ? 'row' : 'column',
          justifyContent: this.mainAxisAlignment ? StringUtils.camel2kebab(this.mainAxisAlignment) : undefined,
          alignItems: StringUtils.camel2kebab(this.crossAxisAlignment ?? 'center'),
          ...parseCommonCssProperties(this),
          width:
            // 优先使用设置的宽度
            this.width ??
            ((size === 'max' && this.tag == WidgetTag.Row && this.flex !== 'tight') ||
            (this.crossAxisAlignment === 'stretch' && this.tag === WidgetTag.Column)
              ? '100%'
              : undefined),
          height:
            this.height ??
            ((size === 'max' && this.tag == WidgetTag.Column && this.flex !== 'tight') ||
            (this.crossAxisAlignment === 'stretch' && this.tag === WidgetTag.Row)
              ? '100%'
              : undefined),
        }}>
        {this.children.map((child, index) => {
          const widget = child.toReactComponent?.()
          if (!widget) return
          return (
            <Fragment key={index}>
              {React.cloneElement(widget, {
                style: { ...widget.props.style, flexShrink: 0 },
              })}
            </Fragment>
          )
        })}
      </div>
    )
  }
}
