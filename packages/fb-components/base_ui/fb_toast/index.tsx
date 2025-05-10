import { type MessageArgsProps } from 'antd'
import { message } from '../../base_component/entry'

import './index.css'

const FbToast = {
  open: (args: MessageArgsProps) => {
    args.type = args.type || 'info'
    message.open({
      ...args,
      className: `${args.className || ''} fb-toast fb-toast-${args.type}`,
    })
  },
}

export default FbToast
