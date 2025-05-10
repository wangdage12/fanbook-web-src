import FbImage from 'fb-components/components/image/FbImage'
import { fromBase64 } from 'js-base64'
import React, { useContext } from 'react'
import { MessageCardContext } from '../MessageCardContext'
import StringUtils from '../StringUtils'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { imageAlignment2css, parseCommonCssProperties } from './helpers'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export enum BotFix {
  none = 'none',
  fill = 'fill',
  contain = 'contain',
  cover = 'cover',
  // fitWidth = 'fitWidth',
  // fitHeight = 'fitHeight',
  scaleDown = 'scaleDown',
}
export enum ImageRepeat {
  // noinspection JSUnusedGlobalSymbols
  noRepeat = 'noRepeat',
  repeat = 'repeat',
  repeatX = 'repeatX',
  repeatY = 'repeatY',
}

function parseImageSrc(src: string): string {
  if (!src) return ''
  if (src.startsWith('1::00::0::')) {
    return fromBase64(decodeURIComponent(src.slice(10)))
  }
  throw new Error('invalid image src')
}
export default class ImageWidget extends Widget {
  src!: string
  alignment?: string
  radius?: number

  constructor(
    public preview = false,
    public fit = BotFix.scaleDown,
    public repeat = ImageRepeat.noRepeat
  ) {
    super(WidgetTag.Image)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitImage(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_ImageWidget widget={this} />
  }
}

function _ImageWidget({ widget }: { widget: ImageWidget }) {
  const context = useContext(MessageCardContext)

  const src = parseImageSrc(widget.src)
  if (!src) return <></>

  const commonProps = parseCommonCssProperties(widget)
  // 为了避免 padding 对图片尺寸带来的影响，使用 margin 替代 padding
  commonProps.margin = commonProps.padding
  commonProps.padding = undefined

  function handleClick() {
    if (!widget.preview) return

    context.onPreview(src)
  }

  if (widget.repeat !== ImageRepeat.noRepeat) {
    return (
      <div
        style={{
          ...commonProps,
          objectFit: widget.fit ? (StringUtils.camel2kebab(widget.fit) as never) : undefined,
          objectPosition: 'left',
          backgroundImage: `url(${src})`,
          backgroundRepeat: StringUtils.camel2kebab(widget.repeat) as never,
          backgroundPosition: widget.alignment ? imageAlignment2css(widget.alignment) : 'center',
          borderRadius: widget.radius,
        }}
      />
    )
  } else {
    return (
      <img
        onClick={handleClick}
        style={{
          ...commonProps,
          cursor: widget.preview ? 'zoom-in' : undefined,
          borderRadius: widget.radius,
          objectPosition: 'left',
          objectFit: widget.fit ? (StringUtils.camel2kebab(widget.fit) as never) : undefined,
        }}
        src={src}
      />
    )
  }
}
