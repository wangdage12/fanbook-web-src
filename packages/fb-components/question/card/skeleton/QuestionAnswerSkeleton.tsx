function QuestionAnswerSkeleton() {
  return (
    <div className="flex w-[340px] flex-col">
      <div className="float-left mb-[11px] mt-[3px] flex h-[16px] w-full rounded-[3px] bg-[var(--fg-b5)] text-[16px]"></div>
      <div className="flex w-full">
        <div className="w-full flex-1">
          <div className="w-full">
            <div className="float-left my-[3px] flex h-[14px] w-full rounded-[3px] bg-[var(--fg-b5)] text-[16px]"></div>
            <div className="float-left my-[3px] flex h-[14px] w-full rounded-[3px] bg-[var(--fg-b5)] text-[16px]"></div>
          </div>
          <div className="float-left mt-[10px] flex gap-[12px] text-[12px] text-[var(--fg-b40)]">
            <div className="my-[2px] h-[12px] w-[80px] rounded-[4px] bg-[var(--fg-b5)]"></div>
          </div>
        </div>
        <div className="ml-[10px] h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[6px]  bg-[var(--fg-b5)]"></div>
      </div>
    </div>
  )
}

export default QuestionAnswerSkeleton
