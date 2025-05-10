import { downloadModal } from '../../download/Download.tsx'
import { MessageCommonProps } from './type.ts'

export default function UnsupportedMessage({ isAdjacentToNext = false, isAdjacentToPrev = false }: MessageCommonProps) {
  return (
    <div
      className={`flex select-none flex-col  rounded-r-[8px] bg-[var(--fg-white-1)] ${isAdjacentToPrev ? 'rounded-tl-[2px]' : 'rounded-tl-[8px]'} ${
        isAdjacentToNext ? 'rounded-bl-[2px]' : 'rounded-bl-[8px]'
      }`}
    >
      <div className={'flex gap-1 px-3 py-2.5'}>
        <iconpark-icon color={'var(--auxiliary-orange)'} size={16} name="ExclamationCircle" />
        当前版本暂不支持查看此消息类型
      </div>
      <div
        className={
          'box-border flex cursor-pointer flex-row gap-1 border-0 border-t border-solid border-[var(--fg-b5)] px-3 py-2.5 text-[var(--fg-blue-1)]'
        }
        onClick={downloadModal}
      >
        <iconpark-icon size={16} name="Download" />
        <span>点击下载客户端查看消息</span>
      </div>
    </div>
  )
}
