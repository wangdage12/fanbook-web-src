import { Dropdown, DropDownProps, MenuProps } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import { CircleCommentItemStruct } from 'fb-components/circle/types.ts'
import usePermissions from '../../../base_services/permission/usePermissions.ts'
import MenuItemLabel from '../../../components/MenuItemLabel.tsx'
import { ChannelPermission } from '../../../services/PermissionService.ts'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'

export enum CircleCommentMenuItemKey {
  Copy = 'copy',
  Delete = 'delete',
}

interface CircleCommentMenuDropDownProps extends Omit<DropDownProps, 'menu'> {
  article: CircleCommentItemStruct
  beforeHandler?: () => void
  onDelete?: () => void
  onCopy?: () => void
}

export function CircleCommentMenuDropdown({ children, beforeHandler, article, onDelete, onCopy, ...props }: CircleCommentMenuDropDownProps) {
  const { user, comment } = article
  const authorId = user?.user_id
  const { guild_id: guildId, channel_id: channelId } = comment
  const permission = usePermissions({
    permission: ChannelPermission.ChannelManager,
    guildId,
    channelId,
  })

  const items: MenuProps['items'] = (
    [
      [
        {
          label: <MenuItemLabel label="复制" icon={<iconpark-icon name="Copy"></iconpark-icon>} />,
          key: CircleCommentMenuItemKey.Copy,
        },
        ...(authorId === LocalUserInfo.userId || permission.has(ChannelPermission.ChannelManager) ?
          [
            {
              label: <MenuItemLabel label="删除" icon={<iconpark-icon name="Delete"></iconpark-icon>} type="danger" />,
              key: CircleCommentMenuItemKey.Delete,
            },
          ]
        : []),
      ],
    ] as MenuProps['items'][]
  )
    .reduce<Required<MenuProps>['items']>((flattened, subList) => {
      // 忽略空数组
      if (subList && subList.length > 0) {
        flattened.push(...subList, { type: 'divider' as const })
      }
      return flattened
    }, [])
    .slice(0, -1)

  const menu: MenuProps = {
    items,
    className: 'min-w-[160px]',
    onClick: async info => {
      const { key, domEvent } = info
      domEvent.stopPropagation()
      beforeHandler?.()

      switch (key) {
        case CircleCommentMenuItemKey.Copy: {
          onCopy?.()
          break
        }
        case CircleCommentMenuItemKey.Delete: {
          FbModal.error({
            title: '确定删除此评论吗？',
            okText: '删除',
            cancelText: '取消',
            closable: false,
            okButtonProps: {
              danger: true,
            },
            onOk: onDelete,
          })

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
