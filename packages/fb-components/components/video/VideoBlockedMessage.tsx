import { CSSProperties } from 'react'

function VideoBlockedMessage({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center bg-[var(--fg-white-1)]`} style={style}>
      <iconpark-icon size={24} class="mb-[8px] text-[var(--function-red-1)]" name="ExclamationCircle"></iconpark-icon>
      <span className="text-[12px] text-[var(--fg-b60)]">视频包含违规内容</span>
    </div>
  )
}

export default VideoBlockedMessage
