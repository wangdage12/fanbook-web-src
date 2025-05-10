import React from 'react'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { SingleChildWidget } from './Widget'
import WidgetTag from './WidgetTag'

export default class AspectRatioWidget extends SingleChildWidget {
  ratio!: number

  constructor() {
    super(WidgetTag.AspectRatio)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitAspectRatio(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_AspectRatioWidget widget={this} />
  }
}
function _AspectRatioWidget({ widget }: { widget: AspectRatioWidget }) {
  const ref = React.useRef<HTMLDivElement>(null)

  // aspect ratio 组件会尽可能填充父容器，所以它的父容器不能是 inline
  // 如果父容器有 alignment，就会出现这种情况，此时应该将父容器改为 block
  React.useEffect(() => {
    const parent = ref.current?.parentElement
    if (parent) {
      parent.style.display = 'block'
    }
  }, [ref.current])

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: widget.ratio,
      }}
    >
      {widget.child?.toReactComponent?.()}
    </div>
  )
}
