import React, { CSSProperties, useContext } from 'react'
import { RealtimeNickname } from '../../../../src/components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { MessageCardContext } from '../MessageCardContext'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties, textStyle2CssProperties } from './helpers'
import { TextStyleData } from './TextWidget'
import { matchUserId } from './UserAvatarWidget'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export default class UsernameWidget extends Widget {
  public id!: string
  public style?: TextStyleData

  constructor() {
    super(WidgetTag.Username)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitUsername(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_UsernameWidget widget={this} />
  }
}

function _UsernameWidget({ widget }: { widget: UsernameWidget }) {
  const { keys } = useContext(MessageCardContext)
  const style: CSSProperties = {
    ...parseCommonCssProperties(widget),
    ...textStyle2CssProperties(widget.style),
  }
  const userId = matchUserId(keys, widget.id)
  if (!userId) return undefined

  return <RealtimeNickname userId={userId} style={style} />
}
