import { Popover, PopoverProps, Tooltip } from 'antd'
import React, { useState } from 'react'
import { orderedEmojisZh } from '../emoji/emoji_config'
import EmojiIcon from './EmojiIcon.tsx'

interface ReactionPanelProps {
  onClick: (emoji: string) => void
}

function EmojiPanel({ onClick }: ReactionPanelProps) {
  return (
    <div className={'grid grid-cols-10 gap-3.5'}>
      {orderedEmojisZh.map(name => (
        <Tooltip
          key={name}
          overlayInnerStyle={{
            textAlign: 'center',
          }}
          title={<span className="text-center">{name}</span>}
        >
          <EmojiIcon onClick={() => onClick(name)} name={name} size={24} className={'cursor-pointer transition-transform hover:scale-125'} />
        </Tooltip>
      ))}
    </div>
  )
}

export function EmojiPopOver({
  onClick,
  children,
  placement = 'bottomRight',
  rootClassName = 'reaction-popover',
  trigger = 'click',
  ...props
}: {
  onClick: (name: string) => void
  children: React.ReactNode
} & Omit<PopoverProps, 'open' | 'onOpenChange'>) {
  const [open, setOpen] = useState(false)

  function handleClick(name: string) {
    setOpen(false)
    onClick(name)
  }

  return (
    <Popover
      {...props}
      open={open}
      arrow={false}
      rootClassName={rootClassName}
      content={<EmojiPanel onClick={handleClick} />}
      trigger={trigger}
      onOpenChange={setOpen}
      placement={placement}
    >
      {children}
    </Popover>
  )
}
