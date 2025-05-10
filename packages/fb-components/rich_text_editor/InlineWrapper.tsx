import { ReactNode } from 'react'

// https://github.com/ianstormtaylor/slate/blob/07f59e36071bae2b9c09b787f1dd514c6bf859a4/site/examples/inlines.tsx#L232C1-L234C1
// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  // text-[0px] 会导致行高异常
  // <span contentEditable={false} className="text-[0px]">
  //   {String.fromCodePoint(160) /* Non-breaking space */}
  // </span>
  <span contentEditable={false}>&#xFEFF;</span>
)

function InlineWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </>
  )
}

export default InlineWrapper
