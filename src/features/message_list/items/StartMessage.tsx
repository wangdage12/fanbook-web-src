import { Avatar } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { MessageStruct } from 'fb-components/components/messages/types.ts'
import CosImageUtils from 'fb-components/utils/CosImageUtils'
import { isEqual } from 'lodash-es'
import { useAppSelector } from '../../../app/hooks'
import RealtimeChannelName from '../../../components/realtime_components/RealtimeChannel'
import { RealtimeAvatar, RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { selectUser } from '../../../components/realtime_components/realtime_nickname/userSlice'
import UserCard from '../../../components/user_card'
import MutualGuilds from '../../../components/user_card/MutualGuilds'
import { useUserAssociates } from '../../../components/user_card/hooks'
import { DmHelper } from '../../dm/dmSlice'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'

export default function StartMessage({ message }: { message: MessageStruct }) {
  const dmChannel = DmHelper.getChannel(message.channel_id)
  const recipient = useAppSelector(selectUser(dmChannel?.recipient_id ?? ''), isEqual)
  const { associates } = useUserAssociates(dmChannel?.recipient_id ?? '', { cache: false })
  const { guilds } = associates
  const isSameUser = dmChannel?.recipient_id === LocalUserInfo.userId

  function handleOpenMutualGuilds() {
    showFbModal({
      width: 440,
      title: `${guilds.length}个共同社区`,
      showCancelButton: false,
      showOkButton: false,
      content: <MutualGuilds guilds={guilds} />,
    })
  }

  if (dmChannel && dmChannel.recipient_id) {
    return (
      <div className={'flex w-full flex-col items-center gap-3 py-4'}>
        <div className={'flex h-[64px]'}>
          {!isSameUser && (
            <UserCard userId={dmChannel.recipient_id} placement={'leftTop'}>
              <RealtimeAvatar userId={dmChannel.recipient_id} size={64} />
            </UserCard>
          )}
          <UserCard userId={LocalUserInfo.userId} placement={'rightTop'}>
            <RealtimeAvatar
              className={'ml-[-8px] mt-[-4px] !box-content rounded-full !border-4 !border-[var(--bg-bg-2)] !bg-[var(--bg-bg-2)]'}
              userId={LocalUserInfo.userId}
              size={64}
            />
          </UserCard>
        </div>

        <div className={'text-[15px] font-medium text-[var(--fg-b40)]'}>
          你和
          <RealtimeNickname userId={dmChannel.recipient_id} />
          的对话从这里开始
        </div>

        {/* 共同社区，即使没有也要预留高度，防止列表跳动 */}
        <div className={'h-5'}>
          {!isSameUser && recipient && !recipient.bot && (
            <div className={'flex cursor-pointer items-center justify-center text-[13px] text-[var(--fg-b40)]'} onClick={handleOpenMutualGuilds}>
              <Avatar.Group maxPopoverTrigger={'click'} size={26} maxCount={3} className={'square-group mt-[-8px] h-[18px]'}>
                {guilds.slice(0, 3).map(guild => (
                  <Avatar
                    key={guild.guild_id}
                    src={CosImageUtils.thumbnailMin(guild.icon, 24)}
                    className={'rounded-lg border-4 !border-[var(--bg-bg-2)]'}
                  ></Avatar>
                ))}
              </Avatar.Group>
              <span className={'ml-1.5 mr-[1px]'}>{guilds.length}个共同社区</span>
              <iconpark-icon color={'currentColor'} size={10} name="Right" />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={'flex flex-col'}>
      <div className={'center flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fg-white-1)]'}>
        <iconpark-icon color={'var(--fg-b100)'} name="Channel-Normal" size={32} />
      </div>
      <div className={'pt-5 text-xl font-medium text-[var(--fg-b100)]'}>
        欢迎来到
        <RealtimeChannelName />
      </div>
      <div className={'pt-1.5 text-[13px] text-[var(--fg-b60)]'}>这是该频道的开始。</div>
    </div>
  )
}
