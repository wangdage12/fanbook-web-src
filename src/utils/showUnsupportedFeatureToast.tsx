import FbToast from 'fb-components/base_ui/fb_toast/index'
import { downloadModal } from '../features/download/Download.tsx'

export default function showUnsupportedFeatureToast() {
  FbToast.open({
    type: 'info',
    content: (
      <>
        当前版本不支持，请<a onClick={downloadModal}>点击下载</a>客户端体验
      </>
    ),
    key: 'not-support',
  })
}
