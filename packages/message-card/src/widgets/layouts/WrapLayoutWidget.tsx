import React, { Fragment } from 'react'
import StringUtils from '../../StringUtils'
import WidgetTreeVisitor from '../../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties } from '../helpers'
import MultiChildrenWidget from '../Widget'
import WidgetTag from '../WidgetTag'

export default class WrapLayoutWidget extends MultiChildrenWidget {
  direction: 'horizontal' | 'vertical' = 'horizontal'
  alignment?: 'start' | 'end' | 'center' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly'
  runAlignment?: 'start' | 'end' | 'center' | 'stretch'
  spacing?: number
  runSpacing?: number

  // noinspection JSUnusedGlobalSymbols Web 不支持此属性
  verticalDirection: 'up' | 'down' = 'down'

  constructor() {
    super(WidgetTag.Wrap)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitWrapLayout(this)
  }

  toReactComponent(): React.JSX.Element {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',

          flexDirection: this.direction === 'horizontal' ? 'row' : 'column',
          justifyContent: this.alignment ? StringUtils.camel2kebab(this.alignment) : undefined,
          alignItems: this.runAlignment ? StringUtils.camel2kebab(this.runAlignment) : undefined,
          rowGap: this.direction === 'horizontal' ? this.runSpacing : this.spacing,
          columnGap: this.direction === 'horizontal' ? this.spacing : this.runSpacing,
          ...parseCommonCssProperties(this),
          width: this.width ?? '100%',
          height: this.height ?? '100%',
        }}>
        {this.children.map((child, index) => (
          <Fragment key={index}>{child.toReactComponent?.()}</Fragment>
        ))}
      </div>
    )
  }
}
