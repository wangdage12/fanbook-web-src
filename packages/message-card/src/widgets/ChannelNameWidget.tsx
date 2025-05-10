import React, { CSSProperties } from 'react'
import ImChannelLink from '../../../../src/features/message_list/components/ImChannelLink'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties, textStyle2CssProperties } from './helpers'
import { TextStyleData } from './TextWidget'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export default class ChannelNameWidget extends Widget {
  public id!: string
  public style?: TextStyleData
  // 表示是否能点击跳转到频道
  clickToJumpToChannel?: boolean

  constructor() {
    super(WidgetTag.ChannelName)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitChannelName(this)
  }

  toReactComponent(): React.JSX.Element {
    const style: CSSProperties = {
      ...parseCommonCssProperties(this),
      ...textStyle2CssProperties(this.style),
      pointerEvents: this.clickToJumpToChannel ? 'auto' : 'none',
    }
    return <ImChannelLink id={this.id} style={style} withIcon={false} />
  }
}
