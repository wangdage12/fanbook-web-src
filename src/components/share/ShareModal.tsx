import { Button } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { ChannelStruct, ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { useMemo } from 'react'
import PermissionBuilder from '../../base_services/permission/PermissionBuilder'
import GuildUtils from '../../features/guild_list/GuildUtils'
import { ChannelPermission, PermissionService } from '../../services/PermissionService'
import ChannelIcon from '../ChannelIcon'
import EmptyData from '../EmptyData'

export function ShareContent({ onOk }: { onOk: (guildId: string, channelId: string, channelType: ChannelType) => void }) {
  const channels = useMemo(() => {
    const currentGuild = GuildUtils.getCurrentGuild()
    if (!currentGuild) {
      return []
    }
    const channels = GuildUtils.getAccessibleChannels(currentGuild.guild_id)
    return channels.filter(channel => channel.type === ChannelType.guildText)
  }, [])
  const handleClick = (selectChannel: ChannelStruct) => {
    // showFbModal({
    //   title: '分享',
    //   content: (
    //     <span className="inline-flex items-center">
    //       <span>确定分享到</span>
    //       <iconpark-icon class="px-[8px] text-[var(--fg-b40)]" name="Channel-Normal"></iconpark-icon>
    //       <span>{selectChannel.name}</span> <span>？</span>
    //     </span>
    //   ),
    //   onOk: () => {
    //     onOk(selectChannel.guild_id, selectChannel.channel_id)
    //   },
    // })
    onOk(selectChannel.guild_id, selectChannel.channel_id, selectChannel.type)
  }
  return (
    <div className="h-[450px] w-full overflow-auto p-[8px] mb-4">
      {channels.length ?
        <ul className="w-full">
          {channels.map(channel => {
            return (
              <PermissionBuilder
                key={channel.channel_id}
                permission={ChannelPermission.SendMessage}
                guildId={channel.guild_id}
                channelId={channel.channel_id}
              >
                {allow =>
                  allow && (
                    <li
                      className="group/share-channel flex items-center gap-[8px] rounded-[10px] -mx-2 px-[8px] py-[6px] hover:bg-[var(--fg-b5)]"
                      key={channel.channel_id}
                    >
                      <ChannelIcon
                        size={16}
                        type={channel.type}
                        isPrivate={PermissionService.isPrivateChannel(channel.guild_id, channel.channel_id)}
                        isAnnouncement={channel.announcement_mode}
                      />
                      <span className="truncate my-1 flex-1">{channel.name}</span>
                      <Button
                        type="primary"
                        className="h-[28px] flex-center group-hover/share-channel:flex hidden"
                        onClick={() => handleClick(channel)}
                      >
                        发送
                      </Button>
                    </li>
                  )
                }
              </PermissionBuilder>
            )
          })}
        </ul>
      : <div className="flex h-full w-full items-center justify-center">
          <EmptyData type="channel" message="暂无可分享频道" />
        </div>
      }
    </div>
  )
}

const showShareModal = ({ title = '分享至频道' }: { title?: string } = { title: '分享至频道' }) => {
  return new Promise<{ guildId: string; channelId: string; channelType: ChannelType }>((resolve, reject) => {
    const { destroy: close } = showFbModal({
      className: 'rounded-[8px]',
      width: 440,
      title,
      content: (
        <ShareContent
          onOk={(guildId: string, channelId: string, channelType: ChannelType) => {
            close()
            resolve({ guildId, channelId, channelType })
          }}
        />
      ),
      onCancel: () => {
        close()
        reject()
      },
      showCancelButton: false,
      showOkButton: false,
    })
  })
}

export default showShareModal
