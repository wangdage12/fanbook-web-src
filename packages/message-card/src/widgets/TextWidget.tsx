import React, { CSSProperties, useContext } from 'react'
import { MessageCardContext } from '../MessageCardContext'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties, textStyle2CssProperties } from './helpers'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export interface TextStyleData {
  color?: string
  backgroundColor?: string
  fontSize?: number
  fontWeight?: 'normal' | 'medium' | '500'
}

export enum TextOverflow {
  clip = 'clip',
  // fade = 'fade', // Web 不做支持
  ellipsis = 'ellipsis',
  visible = 'visible',
}

export default class TextWidget extends Widget {
  public data!: string
  public style?: TextStyleData
  public textAlign?: 'left' | 'center' | 'right' | 'justify' | 'start' | 'end'
  public softWrap = true
  public overflow?: TextOverflow
  public maxLines?: number

  constructor() {
    super(WidgetTag.Text)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitText(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_TextWidget widget={this} />
  }
}

function _TextWidget({ widget }: { widget: TextWidget }) {
  const { keys } = useContext(MessageCardContext)

  // noinspection JSDeprecatedSymbols
  const style: CSSProperties = {
    ...textStyle2CssProperties(widget.style),
    ...parseCommonCssProperties(widget),
    textAlign: widget.textAlign,
    textOverflow: widget.overflow,
    whiteSpace: widget.softWrap ? 'pre-line' : 'nowrap',
    width: widget.width,
  }

  if (widget.maxLines) {
    style.maxWidth = '100%'
    if (widget.maxLines === 1) {
      style.whiteSpace = 'nowrap'
    } else if (widget.maxLines > 1) {
      style.maxHeight = style.height
      // 如果有 maxLines 还是优先使用 maxLines，覆盖掉 height 设置
      style.height = 'auto'
      style.display = '-webkit-box'
      style.WebkitLineClamp = widget.maxLines
      // noinspection JSDeprecatedSymbols
      style.WebkitBoxOrient = 'vertical'
    }
    style.overflow = 'hidden'
  } else {
    style.overflow = TextOverflow.visible ? 'visible' : 'hidden'
  }
  const text = widget.data.replace(/\$\{keyCount\((?:count_)?(\d+)\)}/g, (_, id) => (keys?.[id]?.count ?? 0).toString())
  return <div style={style}>{text}</div>
}
