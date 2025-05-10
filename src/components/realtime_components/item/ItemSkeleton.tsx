export default function ItemSkeleton() {
  return (
    <div className={'flex flex-shrink-0 items-center gap-2.5 border-b-[0.5px] border-b-[var(--fg-b10)] px-[8px] py-[10px]'}>
      <div className={'h-10 w-10 rounded-full bg-[var(--fg-b5)]'} />
      <div className={'flex h-10 flex-grow flex-col justify-between pb-[3px] pr-2 pt-0.5'}>
        <div className={'h-[14px] w-[100px] rounded-[3px] bg-[var(--fg-b5)]'} />
        <div className={'h-[14px] w-[80%] rounded-[3px] bg-[var(--fg-b5)]'} />
      </div>
    </div>
  )
}
