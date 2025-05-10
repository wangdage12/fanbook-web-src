import { ReactNode } from 'react'
import { RealtimeAvatar, RealtimeNickname, RealtimeUser, RealtimeUserInfo } from '../realtime_nickname/RealtimeUserInfo'

export function UserItem({
  value,
  guildId,
  prefix,
  suffix,
  className = '',
  bordered = true,
  onClick,
}: {
  // 使用 value 作为 userId 是为了兼容 Form.Item
  value?: string
  className?: string
  guildId?: string
  bordered?: boolean
  prefix?: ReactNode | ((user: RealtimeUser) => ReactNode)
  suffix?: ReactNode | ((user: RealtimeUser) => ReactNode)
  onClick?: (userId: string) => void
}) {
  if (!value) {
    return null
  }
  return (
    <div
      className={`${className} h-[60px] flex flex-shrink-0 items-center hover:bg-[var(--bg-bg-1)] cursor-pointer rounded-lg px-2 -mx-2`}
      onClick={() => onClick?.(value)}
    >
      <RealtimeUserInfo userId={value} guildId={guildId}>
        {user => {
          return (
            <div className={`flex w-full items-center justify-start gap-2 h-full ${bordered ? 'border-b-[0.5px] border-b-[var(--fg-b10)]' : ''}`}>
              {typeof prefix === 'function' ? prefix(user) : prefix}
              <div className="flex w-0 flex-1 items-center">
                <RealtimeAvatar userId={value} size={40} className="mr-[12px] border" />
                <div className="flex w-0 flex-1 flex-col">
                  <RealtimeNickname userId={value} botTag className="text-[14px] truncate text-[var(--fg-b100)]"></RealtimeNickname>
                  <span className="text-[12px] text-[var(--fg-b40)] mt-1">ID：{user.username}</span>
                </div>
              </div>
              {typeof suffix === 'function' ? suffix(user) : suffix}
            </div>
          )
        }}
      </RealtimeUserInfo>
    </div>
  )
}

export default UserItem
