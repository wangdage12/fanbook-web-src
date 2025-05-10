import FbBadge from 'fb-components/base_ui/fb_badge'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import UserCard from '../../components/user_card'
import { AudiovisualUserInfo } from './audiovisual-entity'

interface MemberItemProps extends AudiovisualUserInfo {
  onBanVideo?: () => void
  onBanAudio?: () => void
  guildId?: string
}

export default function AudiovisualMemberItem({
  userId,
  guildId,
  videoBan,
  enableCamera,
  platform,
  isPlayingScreenShare,
  muted,
  ban,
}: MemberItemProps) {
  const videoMuted = videoBan || (!videoBan && !enableCamera)
  const audioMuted = ban || (!ban && muted)
  return (
    <UserCard userId={userId} guildId={guildId}>
      <div
        className={'mb-[2px] flex h-[52px] cursor-pointer flex-row items-center justify-between px-[8px] hover:rounded-[8px] hover:bg-[var(--fg-b5)]'}
      >
        <div className="mr-[4px] flex items-center">
          <FbBadge
            showZero={false}
            offset={[-12, 25]}
            count={
              platform === 'Mobile' ?
                <div className="!flex h-[20px] w-[20px] items-center justify-center rounded-full border-[2px] border-[var(--bg-bg-1)] bg-[var(--fg-b40)]">
                  <iconpark-icon name="Mobile" size={10} color="var(--fg-white-1)"></iconpark-icon>
                </div>
              : 0
            }
          >
            <RealtimeAvatar userId={userId} size={32} className="mr-[8px] rounded-full" />
          </FbBadge>
          <div className="flex flex-col">
            <RealtimeNickname className="truncate" userId={userId} />
            {isPlayingScreenShare && <span className="text-[12px] text-[var(--auxiliary-green)]">共享屏幕中</span>}
          </div>
        </div>
        <div className="flex items-center">
          {videoBan ?
            <iconpark-icon name="VideoStop" class="mr-[8px]" color="var(--fg-b30)" size={14}></iconpark-icon>
          : !videoMuted ?
            <iconpark-icon name="Video" class="mr-[8px]" color="var(--fg-b30)" size={14}></iconpark-icon>
          : null}
          {ban ?
            <iconpark-icon name="AudioStop2" color="var(--fg-b30)" size={14}></iconpark-icon>
          : !audioMuted ?
            <iconpark-icon name="Audio2" color="var(--fg-b30)" size={14}></iconpark-icon>
          : <iconpark-icon name="AudioMuted2" color="var(--fg-b30)" size={14}></iconpark-icon>}
        </div>
      </div>
    </UserCard>
  )
}
