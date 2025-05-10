import { Alert, AlertProps } from 'antd'

export default function FbAlert(props: AlertProps) {
  return <Alert closeIcon={<iconpark-icon name={'CloseCircleFill'} size={16} />} {...props} />
}
