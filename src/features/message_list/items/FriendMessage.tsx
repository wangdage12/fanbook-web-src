export default function FriendMessage() {
  return (
    <div className={'flex w-full flex-col text-center text-xs text-[var(--fg-b40)]'}>
      <p>你和对方已经成为好友，开始聊天吧~</p>
      <p className={'mt-4'}>
        与对方发生资金往来可能存在风险。请注意核实身份,谨防诈骗，
        <a
          target={'_blank'}
          href={'https://fanbook.idreamsky.com/fraud_prevention_guidelines/fraud_prevention_guidelines.html'}
          className={'text-[var(--fg-blue-1)]'}
          rel="noreferrer"
        >
          点击了解更多
        </a>
      </p>
    </div>
  )
}
