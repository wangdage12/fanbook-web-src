import clsx from 'clsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { CSSProperties, useState } from 'react'
import AuthenticationIcon from '../../../components/AuthenticationIcon.tsx'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { InviteCodeInfo } from '../../invite/invite_api.ts'
import useInviteLink from '../../invite/useInviteLink.ts'
import { INVITE_CODE_INVALID_TEXT, InviteUtils } from '../../invite/utils.tsx'

interface InviteCardProp {
  url: string
  style?: CSSProperties
}

export default function InviteCard({ url, style }: InviteCardProp) {
  const { loading, codeInfo, guildInfo } = useInviteLink(url, true)
  const isValid = codeInfo && !InviteUtils.isInvalid(codeInfo) && guildInfo
  const [confirmLoading, setConfirmLoading] = useState(false)

  async function handleJoin() {
    if (!isValid) {
      FbToast.open({
        type: 'info',
        content: INVITE_CODE_INVALID_TEXT,
      })
      return
    }
    const guild = GuildUtils.getGuildById(guildInfo.guild_id)
    if (guild) {
      FbToast.open({
        type: 'info',
        content: '已加入社区',
      })
      if (GuildUtils.getCurrentGuildId() != guild.guild_id) {
        GuildUtils.gotoChannel(guild.guild_id, codeInfo?.channel_id).then()
      }
    } else {
      const inviteCode = InviteUtils.parseCodeFromLink(url)
      if (!inviteCode) {
        return
      }
      try {
        if (confirmLoading) return
        setConfirmLoading(true)
        const isValid = await InviteUtils.checkInviteCode({ inviteCode, needToast: true })
        if (!isValid) return
        await InviteUtils.showAcceptModal({ inviteCode })
      } finally {
        setConfirmLoading(false)
      }
    }
  }

  return (
    <div style={style} className={'w-[360px] cursor-pointer rounded-lg bg-[var(--fg-white-1)] p-[10px]'} onClick={handleJoin}>
      {loading ?
        <div className={'flex h-[124px] items-center justify-center'}>
          <CircularLoading />
        </div>
      : codeInfo && !InviteUtils.isInvalid(codeInfo) && guildInfo ?
        <ValidContent confirmLoading={confirmLoading} guildInfo={guildInfo} />
      : <InvalidContent codeInfo={codeInfo} />}
    </div>
  )
}

function ValidContent({ guildInfo, confirmLoading }: { guildInfo: GuildStruct; confirmLoading: boolean }) {
  return (
    <>
      <div className={'text-sm text-[var(--fg-b60)]'}>给你推荐一个宝藏社区</div>
      <div className={'mt-[10px] flex rounded-[8px] bg-[var(--bg-bg-3)]'}>
        <FbAvatar fbRadius={8} width={40} src={guildInfo.icon} />
        <div className={'ml-[10px] flex flex-1 flex-col justify-center overflow-hidden'}>
          <div className={' flex items-center text-sm  text-[var(--fg-b100)]'}>
            <div className={'truncate text-base font-bold text-[var(--fg-b100)]'}> {guildInfo.name}</div>
            {[2, 4, 6].includes(guildInfo.authenticate) && <AuthenticationIcon guild={guildInfo} className={'ml-[4px]'} />}
          </div>
          <div className={'mt-[2px] flex  items-center text-xs text-[var(--fg-b60)]'}>
            <span className={'mr-[6px] inline-block h-[8px] w-[8px] rounded-full bg-[var(--fg-b100)] opacity-[0.2]'}></span>
            <span>{guildInfo.member_count} 位成员</span>
          </div>
        </div>
      </div>
      <div
        className={clsx([
          'mt-[10px] flex h-[36px] items-center justify-center rounded-lg border-[1px] border-solid border-[var(--fg-b20)] text-sm',
          guildInfo.join ? 'text-[var(--fg-b30)]' : 'text-[var(--fg-b100)]',
        ])}
      >
        {confirmLoading && <CircularLoading size={14} className={'mr-2'} />}
        {guildInfo.join ? '已加入该社区' : '加入该社区'}
      </div>
    </>
  )
}

function InvalidContent({ codeInfo }: { codeInfo: InviteCodeInfo | undefined }) {
  return (
    <div className={'flex rounded-[8px] bg-[var(--bg-bg-3)]'}>
      <div className={'flex-center h-[40px] w-[40px] rounded-lg bg-[var(--fg-b5)]'}>
        <iconpark-icon name="Link-Normal" class={'cent text-[var(--fg-b40)]'} size={20}></iconpark-icon>
      </div>
      <div className={'ml-[10px] flex flex-1 flex-col justify-center overflow-hidden'}>
        <div className={' flex items-center text-sm  text-[var(--fg-b100)]'}>
          <div className={'truncate text-base font-bold text-[var(--fg-b100)]'}>邀请链接已失效</div>
        </div>
        {codeInfo && codeInfo.inviter_id && (
          <div className={'mt-[2px] flex  items-center text-xs text-[var(--fg-b60)]'}>
            向&nbsp;
            <RealtimeNickname userId={codeInfo.inviter_id}></RealtimeNickname>
            &nbsp;申请新的邀请链接
          </div>
        )}
      </div>
    </div>
  )
}
