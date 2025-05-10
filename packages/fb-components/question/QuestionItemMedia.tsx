import React, { useEffect, useState } from 'react'
import CosImage from '../components/image/CosImage'
import { useCheckVideoStatus } from '../components/video/utils'
import { getFirstMediaFromOps } from '../rich_text/transform_rich_text'
import { EmbeddedAssetType } from '../rich_text/types'

function QuestionItemMedia(mediaInfo: Partial<ReturnType<typeof getFirstMediaFromOps>>) {
  const [src, setSrc] = useState<string>()
  const [imgLoading, setImgLoading] = useState(!!src)
  const [imgError, setImgError] = useState(false)
  const { isChecking, isPass } = useCheckVideoStatus(mediaInfo?._type === EmbeddedAssetType.Video ? mediaInfo?.source : undefined)

  const handleImgError = () => {
    setImgError(true)
    setImgLoading(false)
  }
  const handleImgLoad = () => {
    setImgLoading(false)
  }

  useEffect(() => {
    if (!mediaInfo) return
    const src = mediaInfo._type === EmbeddedAssetType.Image ? mediaInfo.source : mediaInfo.thumbUrl
    setSrc(src)
    setImgLoading(!!src)
    setImgError(false)
  }, [mediaInfo])

  const placeholder = (
    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[6px] border-[0.5px] border-[var(--fg-blue-2)] bg-[var(--fg-blue-3)] text-[var(--fg-blue-2)]">
      <iconpark-icon name="Question-Normal" size={22}></iconpark-icon>
    </div>
  )

  return (
    <div className="relative ml-[10px] h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[6px]">
      {isChecking || !isPass ?
        placeholder
      : <CosImage src={src} className="object-cover" onLoad={handleImgLoad} onError={handleImgError} fallback={placeholder} size={72} />}
      {!imgLoading && !imgError && !isChecking && isPass && src && mediaInfo?._type === EmbeddedAssetType.Video && (
        <em className="absolute left-[50%] top-[50%] ml-[-12px] mt-[-12px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[var(--fg-widget)]">
          <iconpark-icon size={10} class="text-[var(--fg-white-1)]" name="Pause"></iconpark-icon>
        </em>
      )}
    </div>
  )
}

// 不加 Memo 缓存，会导致这个图标重新走 useEffect 消失
export default React.memo(QuestionItemMedia)
