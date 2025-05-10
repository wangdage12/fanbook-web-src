import './sound.css'

export default function FanSoundAnimation({ color = 'currentColor', play = false }: { color?: string; play?: boolean }) {
  return (
    <div className="relative h-[14px] w-[14px] overflow-hidden">
      <div
        className={`absolute left-[-4px] top-[-1px] h-[16px] w-[16px] ${play ? 'animate-[soundAnimation-three_2s_ease_infinite]' : ''} rounded-[50%] border-[1.5px] [clip-path:polygon(50%_50%,100%_0%,100%_100%)]`}
        style={{ borderColor: color }}
      ></div>
      <div
        className={`absolute left-[-3.5px] top-[1px] h-[12px] w-[12px] ${play ? 'animate-[soundAnimation-two_2s_ease_infinite]' : ''} rounded-[50%] border-[1.5px] [clip-path:polygon(50%_50%,100%_0%,100%_100%)]`}
        style={{ borderColor: color }}
      ></div>
      <div
        className={`absolute left-[2px] top-[4px] w-0 ${play ? 'animate-[soundAnimation-one_2s_ease_infinite]' : ''} rounded-[50%] border-b-[3px] border-r-[3px] border-t-[3px] border-b-transparent border-t-transparent`}
        style={{ borderRightColor: color }}
      ></div>
    </div>
  )
}
