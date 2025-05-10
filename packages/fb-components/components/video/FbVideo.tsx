import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import XGplayer from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import { Size } from '../type'
// import Mp4Plugin from 'xgplayer-mp4'

export interface FbVideoProps {
  src?: string
  width?: number
  height?: number
  poster?: string
  controls?: boolean
  muted?: boolean
  style?: CSSProperties
  className?: string
  onLoadedMetadata?: (ev: HTMLVideoElementEventMap['loadedmetadata']) => void
  onLoadedData?: (ev: HTMLVideoElementEventMap['loadeddata']) => void
}

export function useVideoSize(originSize: Size) {
  const [size, setSize] = useState(originSize)
  const handleLoadedMetadata = useCallback(
    (e: HTMLVideoElementEventMap['loadedmetadata']) => {
      const { videoWidth, videoHeight } = (e.currentTarget as HTMLVideoElement) ?? {}
      if ((videoWidth !== size.width || videoHeight !== size.height) && videoWidth > 0 && videoHeight > 0) {
        setSize({ width: videoWidth, height: videoHeight })
      }
    },
    [size]
  )
  return { size, handleLoadedMetadata }
}

function FbVideo({ src, poster, width, height, style, controls = true, muted, className = '', onLoadedMetadata, onLoadedData }: FbVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const player = useRef<XGplayer>()
  useEffect(() => {
    if (!videoRef.current || !src) {
      return
    }
    player.current = new XGplayer({
      el: videoRef.current,
      url: src,
      volume: 0.5,
      fluid: false,
      width: '100%',
      height: '100%',
      poster,
      controls,
      videoFillMode: 'auto',
      videoAttributes: {
        muted,
      },
      // plugins: [Mp4Plugin], // 传入需要组装的插件
      // mp4plugin: {
      //   maxBufferLength: 30,
      //   minBufferLength: 10,
      // },
    })
    if (player.current.media instanceof HTMLVideoElement) {
      onLoadedData && player.current.media.addEventListener('loadeddata', onLoadedData)
      onLoadedMetadata && player.current.media.addEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [src])

  const _style = useMemo(() => {
    return { width: width, height: height, ...style }
  }, [style, width, height])

  return (
    <div className={`${className} flex items-center justify-center`} style={_style}>
      <div ref={videoRef} />
    </div>
  )
}

export default FbVideo
