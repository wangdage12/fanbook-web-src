import { useCallback, useMemo, useState } from 'react'
import FanSoundAnimation from '../../animation/FanSoundAnimation'
import { MessageCommonProps, MessageContentStruct } from '../types'

export interface VoiceContentStruct extends MessageContentStruct {
  url: string
  path: string
  second: number
  isRead: boolean
}

export interface VoiceMessageProps extends MessageCommonProps {
  message: VoiceContentStruct
  className?: string
}

function VoiceMessage({ message, className = '' }: VoiceMessageProps) {
  const { url, second } = message
  const [isPlaying, setIsPlaying] = useState(false)
  const audioTarget = useMemo(() => new Audio(url), [url])

  const endedHandler = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const onToggle = () => {
    if (audioTarget.paused) {
      audioTarget.currentTime = 0
      audioTarget.play()
      setIsPlaying(true)
      audioTarget.addEventListener('ended', endedHandler, { once: true })
    } else {
      audioTarget.pause()
      audioTarget.removeEventListener('ended', endedHandler)
      setIsPlaying(false)
    }
  }

  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={onToggle}>
      <FanSoundAnimation color={isPlaying ? 'var(--fg-blue-1)' : 'currentColor'} play={isPlaying} />
      <span className="ml-2.5">{second}''</span>
    </div>
  )
}

export default VoiceMessage
