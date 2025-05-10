import { checkIsLocalURL } from '../../../utils/common'
import CosImageUtils from '../../../utils/CosImageUtils'
import { Size } from '../../type'
import FbVideo, { useVideoSize } from '../../video/FbVideo'
import { VideoWrapper } from '../../video/VideoWrapper'
import { MediaPreviewItem } from '../MediaPreviewer'

export function VideoMediaItem({ data, limitSize }: { data: MediaPreviewItem; limitSize?: { width?: number; height?: number } }) {
  const { size, handleLoadedMetadata } = useVideoSize({ width: data.width, height: data.height })
  const { width = 320, height = 320 } = limitSize ?? {}
  const isLocalPreview = checkIsLocalURL(data.preview)
  return (
    <VideoWrapper url={data.url} className="overflow-hidden rounded-lg" originSize={size} limitSize={{ width, height }}>
      {(size: Size) => (
        <FbVideo
          width={size.width}
          height={size.height}
          poster={isLocalPreview ? data.preview : data.preview && CosImageUtils.thumbnailMin(data.preview, size.width, size.height)}
          onLoadedMetadata={handleLoadedMetadata}
          src={data.url}
        />
      )}
    </VideoWrapper>
  )
}
