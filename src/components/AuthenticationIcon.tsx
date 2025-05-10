import { Timeout } from 'ahooks/es/useRequest/src/types'
import { Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { HTMLAttributes, useState } from 'react'

export default function AuthenticationIcon({
  guild,
  className,
  canHover = false,
  ...props
}: {
  guild: GuildStruct
  canHover?: boolean
} & HTMLAttributes<never>) {
  const [open, setOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<Timeout | undefined>()
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      if (closeTimeout) {
        clearTimeout(closeTimeout)
        setCloseTimeout(undefined)
      }
      const timeout = setTimeout(() => {
        setOpen(false)
        setCloseTimeout(undefined)
      }, 1500)
      setCloseTimeout(timeout)
    }
  }
  let child
  switch (guild.authenticate) {
    case 2:
    case 6:
    case 4:
      child = (
        <Tag
          color="var(--auxiliary-green)"
          className={`m-0 rounded border-0 px-1 text-[11px] font-medium leading-4 text-[var(--fg-white-1)] ${className}`}
          {...props}
        >
          官方
        </Tag>
      )
      break
    default:
  }
  if (!child) return null
  if (!canHover) return child
  return (
    <Tooltip
      trigger={'click'}
      open={open}
      onOpenChange={handleOpenChange}
      className={clsx(['cursor-pointer'])}
      openClassName={'cursor-pointer'}
      placement="top"
      overlayInnerStyle={{ fontSize: 12 }}
      title={
        <div>
          <AuthenticationIcon guild={guild} className={'!mr-1'} />
          <span>{getAuthenticationText(guild)}</span>
        </div>
      }
    >
      {child}
    </Tooltip>
  )
}

export function getAuthenticationText(guild: GuildStruct) {
  let text = ''
  switch (guild.authenticate) {
    case 2:
    case 6:
      text = '官方认证社区'
      break
    case 4:
      text = '官方合作社区'
      break
    default:
  }
  return text
}
