import FbImage from 'fb-components/components/image/FbImage.tsx'
import { Size } from 'react-easy-crop'

interface PreviewItemProps {
  url: string
  cropUrl?: string
  wrapSize?: Size
}

function PreviewItem({ url, cropUrl, wrapSize }: PreviewItemProps) {
  return <FbImage className="!bg-contain" src={cropUrl ?? url} {...wrapSize} />
}

export default PreviewItem
