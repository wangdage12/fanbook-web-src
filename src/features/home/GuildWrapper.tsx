import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { GuildBanLevelType, GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { isEqual } from 'lodash-es'
import React, { createContext, useMemo } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import EmptyPage from '../../components/EmptyPage'
import { ChannelPermission, PermissionService } from '../../services/PermissionService'
import AudiovisualControl from '../audiovisual/AudiovisualControl'
import AudiovisualMemberList from '../audiovisual/AudiovisualMemberList'
import AudiovisualNotSupport from '../audiovisual/AudiovisualNotSupport'
import AudiovisualRoom from '../audiovisual/AudiovisualRoom'
import { isRoomConnecting } from '../audiovisual/audiovisual-slice'
import { isMediaSupport } from '../audiovisual/audiovisual-util'
import { downloadModal } from '../download/Download'
import GuildBanContainer from '../guild_container/GuildBanContainer'
import GuildContainer from '../guild_container/GuildContainer'
import GuildUtils from '../guild_list/GuildUtils'
import { guildListSelectors } from '../guild_list/guildListSlice'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import BotList from '../member_list/BotList'
import MessageList from '../message_list/MessageList'
import AccessBlockedPrompt from '../message_list/components/AccessBlockedPrompt'
import QuestionWrapper from '../question/QuestionWrapper'
import ChannelContainer, { SidebarMenu } from './ChannelContainer'
import { AudiovisualHeader, AudiovisualMemberFooter, AudiovisualMemberHeader, ChatHeader, QuestionHeader } from './ChannelHeader'
import MemberList from './MemberList'

export const GuildContext = createContext<GuildStruct | undefined>(undefined)
//只应该在频道的上下文中使用，用于获取当前频道的信息，不应该溢出频道范围，否则可能会出现隐晦的 bug
export const ChannelContext = createContext<ChannelStruct | undefined>(undefined)

function ChannelWrapper({ guildId, channelId, isAudiovisualConnecting }: { guildId: string; channelId?: string; isAudiovisualConnecting: boolean }) {
  let channel: ChannelStruct | undefined
  if (channelId && guildId) {
    channel = GuildUtils.getChannelById(guildId, channelId)
  }
  const sidebarConfig = useMemo<Partial<Record<SidebarMenu, React.ReactNode>>>(() => {
    switch (channel?.type) {
      case ChannelType.guildVideo:
      case ChannelType.guildVoice:
        return {
          [SidebarMenu.MemberList]: (
            <AudiovisualMemberList
              needLoading
              headerRender={manager => {
                return <AudiovisualMemberHeader count={manager?.detailMembers.length ?? 0}></AudiovisualMemberHeader>
              }}
              footerRender={manager => {
                return <AudiovisualMemberFooter manager={manager}></AudiovisualMemberFooter>
              }}
            ></AudiovisualMemberList>
          ),
        }
      default:
        return {
          [SidebarMenu.MemberList]: <MemberList></MemberList>,
          [SidebarMenu.Bot]: <BotList></BotList>,
        }
    }
  }, [guildId, channelId])

  const sidebarRender = (sidebarMenu?: SidebarMenu) => {
    if (!sidebarMenu) return null
    return sidebarConfig[sidebarMenu]
  }

  const guild = useAppSelector(guildListSelectors.guild(guildId), isEqual)
  // 判断是否有查看权限
  const hasViewPermission = () =>
    channel ? PermissionService.computeChannelPermissions(guild, channel.channel_id, LocalUserInfo.userId).has(ChannelPermission.ViewChannel) : true

  return (
    <ChannelContext.Provider value={channel}>
      {(() => {
        if (!channel) return <EmptyPage />
        if (!hasViewPermission()) return <AccessBlockedPrompt />
        switch (channel.type) {
          case ChannelType.guildText:
            return (
              <ChannelContainer header={<ChatHeader channel={channel} />} sidebarRender={sidebarRender} key={channelId}>
                <MessageList channel={channel} key={channelId} />
              </ChannelContainer>
            )
          case ChannelType.GuildQuestion:
            return (
              <ChannelContainer header={<QuestionHeader channel={channel} />} key={channelId}>
                <QuestionWrapper />
              </ChannelContainer>
            )
          case ChannelType.guildVideo:
          case ChannelType.guildVoice:
            return (
              <ChannelContainer
                className="min-h-[300px]"
                header={<AudiovisualHeader channel={channel} />}
                sidebarRender={sidebarRender}
                key={channelId}
              >
                {isAudiovisualConnecting ?
                  isMediaSupport() ?
                    <AudiovisualRoom key={channelId} />
                  : <AudiovisualNotSupport />
                : <div className="h-full w-full bg-[var(--fg-b100)]"></div>}
              </ChannelContainer>
            )
          default:
            return (
              <EmptyPage
                message={
                  <>
                    当前版本不支持，请<a onClick={downloadModal}>点击下载</a>客户端体验
                  </>
                }
              />
            )
        }
      })()}
    </ChannelContext.Provider>
  )
}

export default function GuildWrapper() {
  const { guildId, channelId } = useParams()
  const isAudiovisualConnecting = useAppSelector(isRoomConnecting)
  const guild = useAppSelector(guildListSelectors.guild(guildId), isEqual)

  if (!guildId || !guild || guild.banned_level === GuildBanLevelType.Dismiss) return <EmptyPage />

  const isGuildBan = guild.banned_level === GuildBanLevelType.Ban
  return (
    <GuildContext.Provider value={guild}>
      <div className={'flex w-[256px] flex-shrink-0 flex-col rounded-tl-[10px] bg-[var(--fg-white-1)]'}>
        {isGuildBan ?
          <GuildBanContainer guild={guild}></GuildBanContainer>
        : <>
            <GuildContainer key={guildId} />
            {isAudiovisualConnecting && <AudiovisualControl />}
          </>
        }
      </div>
      {!isGuildBan ?
        <div className="h-full min-w-[475px] flex-grow select-text overflow-hidden bg-[var(--bg-bg-2)]">
          {channelId ?
            <ChannelWrapper guildId={guildId} channelId={channelId} isAudiovisualConnecting={isAudiovisualConnecting}></ChannelWrapper>
          : <Outlet />}
        </div>
      : null}
    </GuildContext.Provider>
  )
}
