import React from 'react'

const colorSchema = {
  blue: {
    bg: 'bg-[var(--fg-blue-3)]',
    text: 'text-[var(--fg-blue-1)]',
    border: 'border-[var(--fg-blue-1)]',
  },
  yellow: {
    bg: 'bg-[var(--function-yellow-3)]',
    text: 'text-[var(--function-yellow-1)]',
    border: 'border-[var(--function-yellow-1)]',
  },
  red: {
    bg: 'bg-[var(--function-red-3)]',
    text: 'text-[var(--function-red-1)]',
    border: 'border-[var(--function-red-1)]',
  },
  green: {
    bg: 'bg-[var(--function-green-3)]',
    text: 'text-[var(--function-green-1)]',
    border: 'border-[var(--function-green-1)]',
  },
  gray: {
    bg: 'bg-[var(--fg-b5)]',
    text: 'text-[var(--fg-b40)]',
    border: 'border-[var(--fg-b40)]',
  },
}

function TenSizeTag({
  text,
  color = 'blue',
  bordered,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { text: string; color?: keyof typeof colorSchema; bordered?: boolean }) {
  const colorMap = colorSchema[color] ?? colorSchema.blue
  return (
    <span
      className={`${className} ${colorMap.text} ${bordered ? colorMap.border : 'border-transparent'} ${
        bordered ? 'bg-transparent' : colorMap.bg
      } pointer-events-none inline-flex h-[16px] select-none items-center rounded-[4px] border-[0.5px] px-[4px] py-[1px] font-bold`}
      {...props}
    >
      <span className="m-[-3px] scale-[0.833] text-[12px]">{text}</span>
    </span>
  )
}

export default TenSizeTag
