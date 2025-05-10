function CircleSkeleton() {
  return (
    <div className="flex w-full flex-col">
      <div className=" aspect-[3/4] w-full bg-[#e8eaec]"></div>
      <div className="flex h-[70px] w-full flex-col p-[10px]">
        <div className="float-left my-[3px] flex h-[22px] w-[164px] rounded-[3px] bg-[var(--fg-b5)] text-[16px]"></div>
        <div className="float-left mt-[8px] flex h-[22px] gap-[6px]">
          <div className="float-left flex h-[20px] w-[20px] rounded-full bg-[var(--fg-b5)]"></div>
          <div className="float-left my-[2px] flex h-[16px] w-[56px] rounded-[3px] bg-[var(--fg-b5)]"></div>
        </div>
      </div>
    </div>
  )
}

export default CircleSkeleton
