import { Dropdown, DropDownProps, MenuProps } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import GuildUtils from '../../features/guild_list/GuildUtils'
import MenuItemLabel from '../MenuItemLabel'
import showShareModal from './ShareModal'
import { ShareType } from './type'

interface ShareMenuDropdownProps extends Omit<DropDownProps, 'menu'> {
  guildId?: string
  channelId?: string
  beforeHandler?: () => void
  afterHandler?: (
    control: ShareType,
    extraParams?: {
      channelId: string
      guildId: string
      channelType: ChannelType
    }
  ) => void | Promise<void>
}

function ShareMenuDropdown({ children, beforeHandler, afterHandler, ...props }: ShareMenuDropdownProps) {
  const items: MenuProps['items'] = [
    {
      label: <MenuItemLabel label="复制链接" icon={<iconpark-icon name="Copy"></iconpark-icon>} />,
      key: ShareType.Link,
    },
    {
      label: <MenuItemLabel label="分享至频道" icon={<iconpark-icon name="Channel-Normal"></iconpark-icon>} />,
      key: ShareType.Channel,
    },
  ]

  const menu: MenuProps = {
    items,
    className: 'min-w-[160px]',
    onClick: async info => {
      const { key, domEvent } = info
      domEvent.stopPropagation()
      beforeHandler?.()
      // 使用 switch 进行匹配
      switch (key) {
        case ShareType.Link:
          await afterHandler?.(ShareType.Link)
          break
        case ShareType.Channel: {
          const guild = GuildUtils.getCurrentGuild()
          if (guild && GuildUtils.isMuted(guild)) {
            FbToast.open({ content: '你已被禁言，无法操作', type: 'warning' })
            return
          }
          const { channelId, guildId, channelType } = await showShareModal()
          // 打开频道选择弹窗
          await afterHandler?.(ShareType.Channel, { channelId, guildId, channelType })
          break
        }
        default:
          break
      }
    },
  }

  return (
    <Dropdown trigger={['click']} menu={menu} {...props}>
      {children}
    </Dropdown>
  )
}

export default ShareMenuDropdown
