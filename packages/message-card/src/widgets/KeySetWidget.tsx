import React, { useContext } from 'react'
import WidgetFactory, { WidgetNodeType } from '../factory/WidgetFactory'
import { KeyUtils } from '../key'
import { MessageCardContext } from '../MessageCardContext'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties } from './helpers'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export default class KeySetWidget extends Widget {
  // 如果 key 没传，就检查是否有任何一个 key 是自己的
  key?: string
  anyone?: boolean
  yes?: WidgetNodeType
  no?: WidgetNodeType

  constructor() {
    super(WidgetTag.KeySet)
  }

  init(data: object) {
    super.init(data)
    if (this.yes) {
      this.yes = WidgetFactory.fromJson(this.yes)
    }
    if (this.no) {
      this.no = WidgetFactory.fromJson(this.no)
    }
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitKeySet(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_KeySetWidget widget={this} />
  }
}

function _KeySetWidget({ widget }: { widget: KeySetWidget }) {
  const { keys } = useContext(MessageCardContext)
  let yes: boolean
  // 如果没有传 key，就检查是否有任何一个 key 是自己的
  if (!widget.key) {
    yes = !!KeyUtils.hasAnyKeyMySelf(keys)
  } else {
    if (widget.anyone) {
      yes = KeyUtils.getKeyCount(keys, widget.key) > 0
    } else {
      yes = KeyUtils.hasKeyMyself(keys, widget.key)
    }
  }
  return <div style={parseCommonCssProperties(widget)}>{yes ? widget.yes?.toReactComponent?.() : widget.no?.toReactComponent?.()}</div>
}
