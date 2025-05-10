import React from 'react'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { color2css, parseCommonCssProperties } from './helpers'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export default class DividerWidget extends Widget {
  thickness: number = 1
  vertical?: boolean
  color?: string

  constructor() {
    super(WidgetTag.Divider)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitDivider(this)
  }

  toReactComponent(): React.JSX.Element {
    return (
      <div
        style={{
          ...parseCommonCssProperties(this),
          width: this.vertical ? undefined : '100%',
          height: this.vertical ? '100%' : undefined,
        }}
      >
        <div
          style={{
            width: this.vertical ? this.thickness : '100%',
            height: this.vertical ? '100%' : this.thickness,
            backgroundColor: color2css(this.color) ?? 'var(--fg-b10)',
          }}
        />
      </div>
    )
  }
}
