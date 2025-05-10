import './message-menu.less'

import { Popover } from 'antd'
import dayjs from 'dayjs'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import { MessageCurrentStatus, MessageStruct, MessageType } from 'fb-components/components/messages/types.ts'
import { isEqual } from 'lodash-es'
import { HTMLAttributes, useState } from 'react'
import { useAppSelector } from '../../../app/hooks.ts'
import usePermissions, { useGuild } from '../../../base_services/permission/usePermissions'
import { ChannelPermission, PermissionService, SpecialPermission } from '../../../services/PermissionService'
import { copyText } from '../../../utils/clipboard'
import LocalUserInfo from '../../local_user/LocalUserInfo.ts'
import { topMessageSelectors } from '../../top_message/TopMessageSlice'
import MessageListAPI, { TopBehavior } from '../MessageListAPI'
import MessageUtils from '../MessageUtils'
import { ReactionPopOver } from './ReactionPopOver.tsx'

export default function MessageMenu({
  message,
  className,
  onReply,
  isDm,
  ...props
}: {
  message: MessageStruct
  isDm: boolean
  onReply: () => void
} & HTMLAttributes<never>) {
  const [showMore, setShowMore] = useState(false)

  const permissionVal = usePermissions({
    permission: ChannelPermission.React | ChannelPermission.SendMessage,
    channelId: message.channel_id,
  })
  // 如果 messageStatus 是 undefined，说明是服务端过来的数据，那么肯定是已成功的消息，只需要判断本地
  // 发送未成功的消息
  if (message.messageStatus !== undefined && message.messageStatus !== MessageCurrentStatus.normal) {
    return null
  }

  if (permissionVal.none()) return null

  return (
    <div {...props} className={`${className} button-group w-fit divide-x divide-[var(--fg-b5)] text-[var(--fg-b100)]`}>
      {permissionVal.has(ChannelPermission.React) && (
        <ReactionPopOver message={message}>
          <iconpark-icon class={'button-group-item'} size={13} name="EmojiAdd" />
        </ReactionPopOver>
      )}

      {permissionVal.has(ChannelPermission.SendMessage) && <iconpark-icon class={'button-group-item'} size={13} name="Reply" onClick={onReply} />}

      <Popover
        overlayInnerStyle={{
          borderColor: 'var(--fg-b10)',
          boxSizing: 'border-box',
          boxShadow: '0px 2px 8px 0px rgba(26, 32, 51, 0.05)',
          padding: 4,
        }}
        content={<More message={message} isDm={isDm} onClose={() => setShowMore(false)} />}
        open={showMore}
        onOpenChange={open => setShowMore(open)}
        arrow={false}
        placement={'rightTop'}
        trigger={'click'}
      >
        <iconpark-icon class={'button-group-item'} size={13} name="More" />
      </Popover>
    </div>
  )
}

function More({ message, isDm, onClose }: { message: MessageStruct; isDm: boolean; onClose: () => void }) {
  const topMessage = useAppSelector(topMessageSelectors.topMessage(message.channel_id), isEqual)
  const permission = usePermissions({ permission: SpecialPermission.Administrator | ChannelPermission.ManageMessages })
  const topped = topMessage?.message_id === message.message_id
  const pinned = !!message.pin && message.pin !== '0'
  const guild = useGuild()

  function canRecall() {
    // 自己 2 分钟内的消息肯定可以撤回
    if (message.user_id === LocalUserInfo.userId && message.time.add(dayjs.duration(2, 'minute')) > dayjs()) return true
    if (!isDm && guild) {
      // 社区拥有者肯定能撤回消息
      if (guild.owner_id === LocalUserInfo.userId) return true

      // 如果消息发送者是社区拥有者，那么其他人都不能撤回
      const senderIsOwner = guild.owner_id === message.user_id
      if (senderIsOwner) return false

      const senderPermission = PermissionService.computeGuildPermission(guild, message.user_id)
      const senderIsAdmin = senderPermission.has(SpecialPermission.Administrator)

      // 如果发送者是管理员，只有管理员能撤回
      if (senderIsAdmin) {
        return permission.has(SpecialPermission.Administrator)
      }

      // 其他场景取决于管理消息权限
      if (permission.has(ChannelPermission.ManageMessages)) return true
    }
    return false
  }

  const cid = message.channel_id
  const mid = message.message_id.toString()

  const confirm = (title: string, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      FbModal.error({
        title,
        content,
        type: 'error',
        onOk: () => resolve(),
        onCancel: () => reject('User cancelled'),
      })
    })
  }

  const menuItems = []
  if ([MessageType.RichText, MessageType.text].includes(message.content.type))
    menuItems.push({
      icon: 'Copy',
      label: '复制',
      async onClick() {
        copyText(MessageUtils.toText(message))
      },
    })

  if (permission.has(ChannelPermission.ManageMessages)) {
    menuItems.push({
      icon: topped ? 'TopMuted' : 'Top',
      label: topped ? '取消置顶' : '置顶',
      onClick: async () => {
        if (topped) {
          await confirm('取消置顶', '确定取消这条置顶吗？取消后，会话成员不会再看到这条置顶')
        }
        await MessageListAPI.topMessage(cid, mid, topped ? TopBehavior.UnTop : TopBehavior.Top)
      },
    })
    menuItems.push({
      icon: pinned ? 'UN-PIN' : 'PIN',
      label: pinned ? '取消精选' : '精选',
      async onClick() {
        if (pinned) {
          await confirm('取消精选', '确定取消精选？')
        }

        await MessageListAPI.pinMessage(cid, mid, pinned ? TopBehavior.UnTop : TopBehavior.Top)
      },
    })
  }

  if (canRecall())
    menuItems.push({
      icon: 'Recalled',
      label: '撤回',
      onClick: async () => {
        await confirm('撤回消息', '是否撤回该消息？')
        await MessageListAPI.recallMessage(cid, mid).catch(e => console.error('Failed to recall a message due to ', e))
      },
    })

  menuItems.push({
    icon: 'Link-Normal',
    label: '消息链接',
    async onClick() {
      if (!message.guild_id || message.guild_id === '0') {
        copyText(`https://fanbook.mobi/channels/@me/${message.channel_id}/${message.message_id}`)
      } else {
        copyText(`https://fanbook.mobi/channels/${message.guild_id}/${message.channel_id}/${message.message_id}`)
      }
    },
  })

  if (process.env.NODE_ENV === 'development') {
    menuItems.push({
      icon: 'Search',
      label: '打印消息',
      async onClick() {
        console.log({
          ...message,
          time: message.time.format('YYYY-MM-DD HH:mm:ss'),
          message_id: `${message.message_id}`,
        })
      },
    })
  }

  return (
    <>
      {menuItems.map(({ icon, label, onClick }) => (
        <div
          key={label}
          onClick={() => {
            onClose()
            onClick().catch((e: string | Error) => {
              if (e !== 'User cancelled') {
                console.error('Failed to handle message menu due to ', e)
              }
            })
          }}
          className={
            'flex h-7 min-w-[90px] cursor-pointer select-none items-center gap-2.5 rounded px-2 text-[var(--fg-b100)] hover:bg-[var(--fg-b5)]'
          }
        >
          <iconpark-icon size={16} name={icon} />
          <div>{label}</div>
        </div>
      ))}
    </>
  )
}
