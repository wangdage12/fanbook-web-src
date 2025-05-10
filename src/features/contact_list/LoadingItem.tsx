import { ScrollSeekPlaceholderProps } from 'react-virtuoso'

export default function LoadingItem({ type }: ScrollSeekPlaceholderProps) {
  return type === 'item' ?
      <div className={'flex h-[60px] flex-shrink-0 items-center gap-2.5 pl-[16px]'}>
        <div className={'h-10 w-10 rounded-full bg-[var(--fg-b5)]'} />
        <div className={'flex h-10 flex-grow flex-col justify-between pb-[3px] pr-2 pt-0.5'}>
          <div className={'h-[14px] w-[100px] rounded-[3px] bg-[var(--fg-b5)]'} />
          <div className={'h-[14px] w-full rounded-[3px] bg-[var(--fg-b5)]'} />
        </div>
      </div>
    : null
}
