import { Dropdown, DropDownProps, MenuProps } from 'antd'
import { MenuItemType } from 'antd/es/menu/hooks/useItems'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast'
import usePermissions from '../../../base_services/permission/usePermissions.ts'
import MenuItemLabel from '../../../components/MenuItemLabel.tsx'
import { ChannelPermission } from '../../../services/PermissionService.ts'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import QuestionApi from '../../question/questionAPI.ts'

export enum AnswerReplyMenuItemKey {
  Copy = 'copy',
  Delete = 'delete',
}

interface AnswerReplyMenuDropdownProps extends Omit<DropDownProps, 'menu'> {
  authorId?: string
  guildId?: string
  channelId?: string
  questionId: string
  replyId: string
  onCopy?: () => void
  onDelete?: () => void
}

export function CircleCommentReplyMenuDropdown({
  authorId,
  guildId,
  channelId,
  children,
  questionId,
  replyId,
  onDelete,
  onCopy,
  ...props
}: AnswerReplyMenuDropdownProps) {
  const permission = usePermissions({
    permission: ChannelPermission.ChannelManager,
    guildId,
    channelId,
  })

  const items: MenuItemType[] = [
    {
      label: <MenuItemLabel label="复制" icon={<iconpark-icon name="Copy"></iconpark-icon>} />,
      key: AnswerReplyMenuItemKey.Copy,
    },
    ...(authorId === LocalUserInfo.userId || permission.has(ChannelPermission.ChannelManager) ?
      [
        {
          label: <MenuItemLabel label="删除" icon={<iconpark-icon name="Delete"></iconpark-icon>} type="danger" />,
          key: AnswerReplyMenuItemKey.Delete,
        },
      ]
    : []),
  ]

  const menu: MenuProps = {
    items,
    className: 'min-w-[160px]',
    onClick: async info => {
      const { key, domEvent } = info
      domEvent.stopPropagation()
      switch (key) {
        case AnswerReplyMenuItemKey.Copy: {
          handleCopy()
          break
        }
        case AnswerReplyMenuItemKey.Delete: {
          handleDelete()
          break
        }
        default:
          break
      }
    },
  }

  const handleCopy = () => {
    onCopy?.()
  }

  const handleDelete = () => {
    FbModal.error({
      title: '确定删除此评论吗？',
      okText: '删除',
      cancelText: '取消',
      closable: false,
      onOk: async () => {
        console.log(questionId, replyId)
        await QuestionApi.answerDelete({ questionId: questionId, answerId: replyId, channelId })
        FbToast.open({
          content: '已删除评论',
          key: AnswerReplyMenuItemKey.Delete,
        })
        onDelete?.()
      },
    })
  }

  return (
    <Dropdown trigger={['click']} menu={menu} {...props}>
      {children}
    </Dropdown>
  )
}
