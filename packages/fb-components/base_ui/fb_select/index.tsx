import { Select, SelectProps } from 'antd'
import clsx from 'clsx'

export default function FbSelect({
  suffixIcon = <iconpark-icon color={'var(--fg-b40)'} size={16} name="Down" />,
  popupClassName,
  ...props
}: SelectProps) {
  const lgPopupClassName = props.size === 'large' ? 'select-lg-popup' : undefined
  return <Select suffixIcon={suffixIcon} {...props} popupClassName={clsx([popupClassName, lgPopupClassName])} />
}
