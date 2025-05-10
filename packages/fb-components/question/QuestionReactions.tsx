import { useMemo } from 'react'
import EmojiIcon from '../components/EmojiIcon'
import { ReactionStruct } from '../struct/type'

interface QuestionReactionsProps {
  reactions: ReactionStruct[]
  onClick?: (name: string) => void
}

const reactionDisplayNames: Record<string, string> = {
  '%2B1': '同问',
  '%E5%8E%89%E5%AE%B3%E5%93%A6': ' 有用',
}

const initialReactions: ReactionStruct[] = [
  {
    name: '%2B1',
    count: 0,
    me: false,
  },
  {
    name: '%E5%8E%89%E5%AE%B3%E5%93%A6',
    count: 0,
    me: false,
  },
]

export default function QuestionReactions({ reactions, onClick }: QuestionReactionsProps) {
  // 保证展示顺序
  const _reactions = useMemo(() => {
    return initialReactions.map(reaction => {
      const _reaction = reactions.find(r => r.name === reaction.name)
      return _reaction ?? reaction
    })
  }, [reactions])
  return (
    <div className={'flex flex-shrink-0 select-none gap-2'}>
      {_reactions.map(reaction => (
        <div
          key={reaction.name}
          onClick={() => onClick?.(reaction.name)}
          className={'flex cursor-pointer items-center gap-2 rounded-full border-[0.5px] px-4 py-2'}
          style={{
            color: reaction.me ? 'var(--fg-blue-1)' : 'var(--fg-b60)',
            borderColor: reaction.me ? 'var(--fg-blue-2)' : 'transparent',
            backgroundColor: reaction.me ? 'var(--fg-blue-3)' : 'var(--fg-b5)',
          }}
        >
          <EmojiIcon name={decodeURIComponent(reaction.name)} size={16} />
          <div>
            {reactionDisplayNames[reaction.name] ?? ''}&nbsp;{reaction.count === 0 ? '' : reaction.count}
          </div>
        </div>
      ))}
    </div>
  )
}
