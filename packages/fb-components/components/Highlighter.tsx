import InnerHighlighter from 'react-highlight-words'
import { matchAndReplace } from '../utils/common'

function Highlighter({ keyword, text = '', prefixSize = 0 }: { keyword?: string; text?: string; prefixSize?: number }) {
  return (
    <InnerHighlighter
      highlightClassName="text-[var(--fg-blue-1)] bg-transparent"
      searchWords={keyword ? [keyword] : []}
      autoEscape={false}
      textToHighlight={prefixSize === 0 ? text : matchAndReplace(text, keyword ?? '', prefixSize)}
    />
  )
}

export default Highlighter
