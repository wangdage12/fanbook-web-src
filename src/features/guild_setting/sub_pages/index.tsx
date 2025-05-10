import { Divider } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { CircleTagType } from 'fb-components/circle/types'
import HoverBox from 'fb-components/components/HoverBox'
import { ChannelType } from 'fb-components/struct/ChannelStruct'
import { GuildStruct } from 'fb-components/struct/GuildStruct'
import { store } from '../../../app/store'
import NoPermissionImage from '../../../assets/images/placeholder_nopermission_light.svg'
import EmptyPage from '../../../components/EmptyPage'
import { ChannelPermission } from '../../../services/PermissionService'
import CircleTagLinkHandler from '../../../services/link_handler/CircleTagLinkHandler'
import CircleApi from '../../circle/circle_api'
import ChannelAPI from '../../guild_container/ChannelAPI'
import GuildUtils from '../../guild_list/GuildUtils'
import { guildListActions } from '../../guild_list/guildListSlice'
import { ChannelSettings } from './ChannelSettings'
import { CircleChannelSettings } from './CircleChannelSettings'

const ErrorInfo = ({ handleClose }: { handleClose?: () => void }) => {
  return (
    <div className="flex h-[calc(100vh-80px)] w-[960px] flex-col">
      <div className="flex h-14 w-full items-center justify-between pl-6 pr-[18px]">
        <span className="mr-4 truncate text-[18px] font-medium">设置</span>
        <HoverBox onClick={handleClose} className="h-8 w-8 !p-1.5">
          <iconpark-icon name="Close" fill="var(--fg-b100)" size={20}></iconpark-icon>
        </HoverBox>
      </div>
      <Divider className={'m-0 w-full'}></Divider>
      <EmptyPage image={NoPermissionImage} message="暂不支持修改该设置" />
    </div>
  )
}

async function checkMigrateCircleTopic(channelId: string) {
  const guild = GuildUtils.getCurrentGuild() as GuildStruct
  const channel = guild.channels[channelId]
  if (channel.type !== ChannelType.CircleTopic) return channelId

  const topic = (await CircleApi.getTopics(guild.guild_id)).find(t => t.topic_id === channelId)
  const overwrites = (topic?.overwrite ?? [])
    .map(o => ({
      ...o,
      // 仅保留查看频道和频道管理员权限，其他权限位都属于冗余数据
      allows: o.allows & (ChannelPermission.ViewChannel | ChannelPermission.ChannelManager),
      // 转成链接频道后就没有可以被拒绝的权限了
      deny: 0,
    }))
    .filter(o => o.allows !== 0)

  const link = CircleTagLinkHandler.getShareLink({ tagId: channelId, guildId: channel.guild_id, type: CircleTagType.Topic })
  const newChannel = await ChannelAPI.migrateCircleTopic({
    topic_id: channelId,
    guild_id: channel.guild_id,
    permission_overwrites: overwrites,
    link,
  })
  // 在此之前，此 action 应用时，频道列表会有个闪烁，猜测是由于 key 变化加上可能有异步 UI 的原因
  // 由于这种情况是版本过渡会发生的，因此不去解决。
  store.dispatch(
    guildListActions.replaceChannelInPosition({
      from: channelId,
      channel: newChannel,
    })
  )
  // return channelId
  return newChannel.channel_id
}

export enum ChannelSettingType {
  Normal = 'normal',
  Circle = 'circle',
}

export default async function openChannelSettings({
  channelId,
  type = ChannelSettingType.Normal,
  onClose,
}: {
  channelId?: string
  type?: ChannelSettingType
  onClose?: () => void
}) {
  let content: React.ReactNode = null
  switch (type) {
    case ChannelSettingType.Circle: {
      content =
        channelId ?
          <CircleChannelSettings
            channelId={channelId}
            closeWindow={() => {
              onClose?.()
              destroy()
            }}
          />
        : <ErrorInfo
            handleClose={() => {
              destroy()
            }}
          />
      break
    }
    case ChannelSettingType.Normal:
    default: {
      const _channelId = channelId ? await checkMigrateCircleTopic(channelId) : channelId
      content =
        _channelId ?
          <ChannelSettings
            channelId={_channelId}
            closeWindow={() => {
              onClose?.()
              destroy()
            }}
          />
        : <ErrorInfo
            handleClose={() => {
              destroy()
            }}
          />
      break
    }
  }

  const { destroy } = showFbModal({
    width: 960,
    closable: false,
    keyboard: false,
    maskClosable: false,
    footer: null,
    onCancel: () => {
      onClose?.()
      destroy()
    },
    content,
  })
}
