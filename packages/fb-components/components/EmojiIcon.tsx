import { HTMLAttributes, useMemo } from 'react'
import { getEmojiClass } from '../emoji/emoji_config'

const isUrlEncoded = (str: string) => /%[0-9A-F]{2}/i.test(str)

export default function EmojiIcon({
  name,
  size,
  className = '',
  ...htmlProps
}: {
  size: number | string
  name: string
} & HTMLAttributes<never>) {
  const _name = useMemo(() => {
    return isUrlEncoded(name) ? decodeURIComponent(name) : name
  }, [name])
  return (
    <em
      {...htmlProps}
      className={`${className} ${getEmojiClass(_name)}`}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        fontSize: size,
      }}
    />
  )
}
