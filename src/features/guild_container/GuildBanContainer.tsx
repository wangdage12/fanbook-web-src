import { Button } from 'antd'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { showGuildExitModal } from '../../components/guild_card/GuildExitModal'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'

function GuildBanContainer({ guild }: { guild: GuildStruct }) {
  const isOwner = guild.owner_id === LocalUserInfo.userId
  return (
    <div className="flex h-full flex-col p-[16px]">
      <span className="block truncate">{guild.name}</span>
      <div className="flex flex-grow flex-col items-center justify-center">
        <iconpark-icon size={32} class="mb-[8px] text-[var(--function-red-1)]" name="Exclamation"></iconpark-icon>
        <span className="mb-[24px] text-[var(--fg-b95)]">本社区已被封禁，暂时无法浏览</span>
        {!isOwner && <Button onClick={() => showGuildExitModal(guild.name)}>退出社区</Button>}
      </div>
    </div>
  )
}

export default GuildBanContainer
