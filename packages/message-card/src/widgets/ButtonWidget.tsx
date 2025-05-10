import { Button } from 'antd'
import { ButtonType } from 'antd/es/button'
import { ButtonSize } from 'antd/lib/button'
import React, { useContext } from 'react'
import { copyText } from '../../../../src/utils/clipboard'
import { MessageCardContext } from '../MessageCardContext'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import TextWidget from './TextWidget'
import { SingleChildWidget } from './Widget'
import WidgetTag from './WidgetTag'
import { parseCommonCssProperties } from './helpers'

export default class ButtonWidget extends SingleChildWidget {
  category: 'filled' | 'outlined' | 'text' = 'filled'
  style: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'dangerous' = 'primary'
  size: 'mini' | 'small' | 'medium' | 'large' = 'large'
  href?: string
  type?: 'copy' | 'raw'
  label!: string
  widthUnlimited = false
  color?: string
  borderRadius?: number

  constructor() {
    super(WidgetTag.Button)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitButton(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_ButtonWidget widget={this} />
  }
}

function _ButtonWidget({ widget }: { widget: ButtonWidget }) {
  const context = useContext(MessageCardContext)

  function handleClick() {
    if (widget.type === 'copy') {
      if (!widget.href) return
      copyText(widget.href).catch(() => {})
    } else {
      context.onClickButton?.(widget.href)
    }
  }

  const commonProps = parseCommonCssProperties(widget)
  commonProps.margin = commonProps.padding
  commonProps.padding = undefined

  if (widget.type === 'raw') {
    const child = widget.child?.toReactComponent?.()
    if (!child) return <></>
    return (
      <div className={'flex-center cursor-pointer min-w-20'} onClick={handleClick}>
        {child}
      </div>
    )
  }

  let type: ButtonType
  let ghost = false
  switch (widget.category) {
    case 'filled':
      type = 'primary'
      break
    case 'outlined':
      if (widget.style === 'primary') {
        ghost = true
        type = 'primary'
      } else {
        type = 'default'
      }
      break
    case 'text':
      type = 'text'
      break
  }

  // 有 child 字段说明是旧版本的按钮，让按钮可用就行
  if (widget.child) {
    widget.widthUnlimited = true
    type = 'default'
    widget.label = (widget.child as TextWidget).data ?? ''
  }
  let size: ButtonSize
  switch (widget.size) {
    case 'mini':
      size = 'small'
      break
    case 'small':
      size = 'small'
      break
    case 'medium':
      size = 'middle'
      break
    case 'large':
      size = 'large'
      break
  }
  return (
    <Button
      ghost={ghost}
      onClick={handleClick}
      disabled={!widget.href}
      size={size}
      style={{
        ...commonProps,
        borderRadius: widget.borderRadius,
        backgroundColor: widget.color,
        width: widget.widthUnlimited && widget.flex !== 'tight' ? '100%' : undefined,
      }}
      danger={widget.style === 'dangerous'}
      type={type}
    >
      {widget.label}
    </Button>
  )
}
