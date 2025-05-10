import { Modal, ModalProps } from 'antd'
import './index.css'
import showFbModal, { FbModalFuncProps } from './use_fb_modal'

export default function FbModal({
  className = '',
  closeIcon = <iconpark-icon name="Close" fill="var(--fg-b100)" size={18}></iconpark-icon>,
  ...props
}: ModalProps) {
  className = `${className} fb-modal`
  return <Modal className={className} closeIcon={closeIcon} {...props}></Modal>
}

FbModal.info = function (props: FbModalFuncProps) {
  return showFbModal({
    title: '提示',
    ...props,
    icon: <iconpark-icon name="ExclamationCircle" color={'var(--fg-blue-1)'} size={22} />,
    content: <div className={'py-3'}>{props.content}</div>,
    type: 'info',
  })
}

FbModal.error = function (props: FbModalFuncProps) {
  return showFbModal({
    title: '错误',
    ...props,
    icon: <iconpark-icon name="ExclamationCircle" color={'var(--function-red-1)'} size={22} />,
    content: <div className={'py-3'}>{props.content}</div>,
    okButtonProps: {
      danger: true,
      ...props.okButtonProps,
    },
    type: 'error',
  })
}
