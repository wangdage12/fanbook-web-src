import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import { isNil } from 'lodash-es'
import { HTMLAttributes } from 'react'
import { Gender } from '../../features/local_user/localUserSlice'
import { copyText } from '../../utils/clipboard'
import { RealtimeUser } from '../realtime_components/realtime_nickname/RealtimeUserInfo'

type UserProfileProps = Pick<RealtimeUser, 'avatar' | 'nickname' | 'gender' | 'username' | 'remark' | 'guildNickname' | 'bot'> & HTMLAttributes<never>

export default function UserProfile({ avatar, bot, nickname, gender, username, remark, className, guildNickname, ...props }: UserProfileProps) {
  const baseClass = 'flex gap-[12px]'
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      <FbAvatar fbSize={60} fbRadius={60} src={avatar} />
      <div className="flex-1 overflow-hidden text-base font-medium">
        {/* 高度用于占位 */}
        <div className="leading-[22px]">
          {remark || guildNickname || nickname}
          {[Gender.FeMale, Gender.Male].includes(gender) && (
            <div className="ml-[6px] inline-block">
              {gender === Gender.FeMale && (
                <iconpark-icon name="Gender-Woman-Circle" color={'var(--auxiliary-rose)'} size={16} class={'mt-[-3px] align-middle'}></iconpark-icon>
              )}
              {gender === Gender.Male && (
                <iconpark-icon name="Gender-Men-Circle" color={'var(--fg-blue-1)'} size={16} class={'mt-[-3px] align-middle'}></iconpark-icon>
              )}
            </div>
          )}
        </div>
        {!isNil(remark) || !isNil(guildNickname) ?
          <div className="mt-[4px] text-[12px] leading-[16px] text-[var(--fg-b40)]">昵称：{nickname}</div>
        : null}
        <div className="mt-[4px] flex items-center gap-[4px] text-[12px] leading-[16px] text-[var(--fg-b40)]">
          {bot && <TenSizeTag text="机器人" />}
          <div className={'truncate'}>ID：{username}</div>
          {username && (
            <iconpark-icon
              class="cursor-pointer"
              size={12}
              name="Copy"
              onClick={async () => {
                copyText(username)
              }}
            ></iconpark-icon>
          )}
        </div>
      </div>
    </div>
  )
}
