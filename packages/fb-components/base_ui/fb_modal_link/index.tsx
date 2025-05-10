import { ModalProps } from 'antd'
import FbModal from '../fb_modal'
import './index.css'

interface FbModalLinkProps extends Omit<ModalProps, ''> {
  [x: string]: unknown
  src: string
  fbTitle?: string
}

const FbModalLink = ({ ...props }: FbModalLinkProps) => {
  const className = 'fb-modal-link'
  props.width = props.width || 800

  return (
    <FbModal classNames={{ content: '!p-4' }} className={className} {...props}>
      <div className="absolute top-[10px] w-[100%] text-center text-[16px] font-bold">{props.fbTitle}</div>
      <iframe src={props.src}></iframe>
    </FbModal>
  )
}

export default FbModalLink
