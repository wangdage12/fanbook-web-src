import NotSupportImage from '../../assets/images/not_support_dark.png'

function AudiovisualNotSupport() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--fg-b100)]">
      <img src={NotSupportImage} draggable="false" className="w-[240px]" />
      <span className="my-[24px] text-[var(--fg-white-1)]">你的浏览器版本过低，请更新至最新版本</span>
    </div>
  )
}

export default AudiovisualNotSupport
