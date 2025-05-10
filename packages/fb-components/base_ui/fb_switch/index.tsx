import { Switch, SwitchProps } from 'antd'
import { isNil } from 'lodash-es'

export interface FbSwitchProps extends Omit<SwitchProps, 'checked' | 'defaultChecked' | 'value' | 'defaultValue' | 'onChange' | 'onClick'> {
  checked?: boolean | number
  defaultChecked?: boolean | number
  value?: boolean | number
  defaultValue?: boolean | number
  onChange?: (checked: boolean | number, event: React.MouseEvent<HTMLButtonElement>) => void
  onClick?: (checked: boolean | number, event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * 是否反转开关
   */
  reverse?: boolean
  returnType?: 'boolean' | 'number'
}

function handleValue(value?: boolean | number, reverse?: boolean) {
  if (isNil(value)) {
    return value
  }
  const _value = typeof value === 'number' ? !!value : value
  return reverse ? !_value : _value
}

export default function FbSwitch({ returnType = 'boolean', reverse, checked, defaultChecked, value, defaultValue, ...props }: FbSwitchProps) {
  const _checked = handleValue(checked ?? value, reverse)
  const _defaultChecked = handleValue(defaultChecked ?? defaultValue, reverse)
  const handleChangeOrClick = (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    let _checked: boolean | number = checked
    if (reverse) {
      _checked = !_checked
    }
    if (returnType === 'number') {
      _checked = _checked ? 1 : 0
    }
    props.onChange?.(_checked, event)
  }
  return <Switch checked={_checked} defaultChecked={_defaultChecked} onChange={handleChangeOrClick} onClick={handleChangeOrClick} {...props} />
}
