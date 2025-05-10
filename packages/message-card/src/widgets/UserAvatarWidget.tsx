import React, { CSSProperties, useContext } from 'react'
import { RealtimeAvatar } from '../../../../src/components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { KeyData } from '../key'
import { MessageCardContext } from '../MessageCardContext'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties } from './helpers'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export default class UserAvatarWidget extends Widget {
  public id!: string

  constructor(public size = 30) {
    super(WidgetTag.UserAvatar)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitUserAvatar(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_UserAvatarWidget widget={this} />
  }
}

function _UserAvatarWidget({ widget }: { widget: UserAvatarWidget }) {
  const { keys } = useContext(MessageCardContext)
  const style: CSSProperties = {
    ...parseCommonCssProperties(widget),
    width: widget.size,
    height: widget.size,
  }
  const userId = matchUserId(keys, widget.id)
  if (!userId) return undefined
  return <RealtimeAvatar userId={userId} size={widget.size} style={style} />
}

export function matchUserId(keys: KeyData | undefined, input: string) {
  if (!input.startsWith('${userId(')) return input

  const matchUser = /\$\{userId\((\w+)\)}/.exec(input)
  if (matchUser) {
    return keys?.[matchUser[1]]?.user_ids
  }
}
