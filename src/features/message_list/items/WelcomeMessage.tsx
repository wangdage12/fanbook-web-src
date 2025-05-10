import clsx from 'clsx'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { MessageContentStruct } from 'fb-components/components/messages/types.ts'
import { checkIsLocalURL } from 'fb-components/utils/common.ts'
import { Fragment } from 'react'
import reactStringReplace from 'react-string-replace'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../../components/user_card'
import RichTextMessage, { RichTextMessageContentStruct } from './RichTextMessage.tsx'

export const welcomeSentences = [
  '%% 来啦！',
  '%% 出现了！',
  '欢迎 %% 大驾光临~',
  '太棒了，%% 终于来了！',
  '欢迎你，%%！',
  '%% 加入我们了，欢迎！',
  'TA来了~TA来了~，欢迎 %%！',
  '终于等到你 %%！',
  '大家快来欢迎 %%！',
]

export interface WelcomeMessageContentStruct extends MessageContentStruct {
  order: number
  index: number
  content?: RichTextMessageContentStruct
  picture?: {
    customPicture?: string
    template: 0 | 1
  }
}

export default function WelcomeMessage({
  message,
  userId,
  guildId,
  className,
}: {
  message: WelcomeMessageContentStruct
  userId: string
  guildId?: string
  className?: string
}) {
  return (
    <div className={clsx(['flex items-start', className])}>
      <iconpark-icon size={20} name="Arrow-Right" class={'w-8 mr-4 text-[var(--fg-b40)]'} />
      {(() => {
        if (message?.content) {
          return message.content.parsed ?
              <div className={'welcome-card max-w-[360px] rounded-lg bg-[var(--fg-white-1)] px-3 py-1.5'}>
                <RichTextMessage message={message.content} limitSize={{ max: { width: 336, height: 320 } }} />
              </div>
            : null
        }
        if (message?.picture) {
          const { customPicture, template } = message.picture
          const pic = customPicture || (template === 0 ? '/images/welcome-pic-1.jpeg' : '/images/welcome-pic-2.jpeg')
          return (
            <div
              className={'flex flex-col rounded-lg bg-[var(--bg-bg-3)]'}
              style={{
                width: 228,
                height: 246,
                alignItems: template === 0 ? 'start' : 'center',
              }}
            >
              {/* 欢迎语设置页面会有本地的图片*/}
              {checkIsLocalURL(pic) ?
                <img src={pic} width={228} height={128} alt="" className={'rounded-t-lg'} />
              : <CosImage src={pic} size={{ width: 228, height: 128 }} className={'rounded-t-lg'} />}

              <RealtimeUserInfo userId={userId} guildId={guildId}>
                <UserCard userId={userId} guildId={guildId} placement={'rightBottom'}>
                  <RealtimeAvatar
                    size={50}
                    userId={userId}
                    guildId={guildId}
                    className={clsx(['z-10 mt-[-27px] cursor-pointer !border-2 !border-[var(--bg-bg-3)]', template === 0 && 'ml-3'])}
                  />
                </UserCard>
                <UserCard userId={userId} guildId={guildId} placement={'rightBottom'}>
                  <RealtimeNickname
                    prefix={'@ '}
                    userId={userId}
                    guildId={guildId}
                    className={'display w-full px-3 mt-2.5 truncate cursor-pointer text-base font-medium text-[var(--fg-b100)]'}
                  />
                </UserCard>
              </RealtimeUserInfo>
              <div className={'mx-3 mt-2 text-xs text-[var(--fg-b60)]'}>欢迎第 {message.order} 位成功加入我们的小伙伴，一起来畅聊吧~</div>
            </div>
          )
        }

        return (
          <p className={'text-[var(--fg-b40)]'}>
            {reactStringReplace(welcomeSentences[message.index % welcomeSentences.length], /(\s?%%\s?)/, (match, i) => {
              return (
                <Fragment key={i}>
                  {match[0] === ' ' && <span>&nbsp;</span>}
                  <UserCard userId={userId} guildId={guildId}>
                    <RealtimeNickname className={'cursor-pointer text-[var(--fg-blue-1)]'} userId={userId} />
                  </UserCard>
                  {match[match.length - 1] === ' ' && <span>&nbsp;</span>}
                </Fragment>
              )
            })}
          </p>
        )
      })()}
    </div>
  )
}
