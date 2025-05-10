import { Button, Modal, ModalProps } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { isEqual } from 'lodash-es'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import AudioWelcomeImage from '../../assets/images/audio_welcome.png'
import usePermissions from '../../base_services/permission/usePermissions'
import RealtimeChannelName from '../../components/realtime_components/RealtimeChannel'
import { useLocationConsumer } from '../../components/with/WithLocation'
import { ChannelPermission, GuildPermission } from '../../services/PermissionService'
import GuildUtils from '../guild_list/GuildUtils'
import AudiovisualMemberList from './AudiovisualMemberList'
import { AudiovisualContext, useManager } from './audiovisual-hook'
import { AudiovisualManagerEvent } from './audiovisual-manager'
import { afterConfirm, isRoomConnecting, joinRoom, needConfirm, nextRoomInfo, switchRoom } from './audiovisual-slice'

import './audiovisual-confirm-dialog.less'

type AudiovisualConfirmDialogProps = ModalProps

const AudiovisualConfirmDialog = ({ ...props }: AudiovisualConfirmDialogProps) => {
  const { channelId, guildId } = useParams()
  const dispatch = useAppDispatch()
  const [innerOpen, setInnerOpen] = useState(false)
  const isConnecting = useAppSelector(isRoomConnecting)
  const open = useAppSelector(needConfirm)
  const currentManager = useContext(AudiovisualContext)
  const { channelId: nextChannelId, guildId: nextGuildId } = useAppSelector(nextRoomInfo, (prev, next) => isEqual(prev, next))
  const permission = usePermissions({
    guildId: nextGuildId,
    channelId: nextChannelId,
    permission: GuildPermission.ManageChannels | ChannelPermission.ViewChannel,
  })
  const nextGuild = GuildUtils.getGuildById(nextGuildId)
  const nextChannel = GuildUtils.getChannelById(nextGuildId, nextChannelId)
  const selected = nextChannel ? channelId === nextChannel.channel_id : false
  const manager = useManager(nextGuildId, nextChannelId)
  const [outLimit, setOutLimit] = useState(false)
  const navigate = useNavigate()
  const locationTrans = useLocationConsumer()

  const handleCancel = () => {
    if (selected && !isConnecting && guildId) {
      const { from, to } = locationTrans?.locationTrans.current ?? {}
      // 不进入音视频频道，回到上个页面或跳转到第一个可见的文本频道
      if (from?.pathname && from?.pathname !== to?.pathname) {
        navigate(from?.pathname + from?.search)
      } else {
        const firstChannel = GuildUtils.getFirstAccessibleTextChannel(guildId)
        firstChannel && GuildUtils.selectChannel(firstChannel)
      }
    }
    dispatch(afterConfirm())
  }
  const handleOk = () => {
    nextChannel && GuildUtils.selectChannel(nextChannel)
    dispatch(afterConfirm())
  }
  const handleClick = () => {
    if (isConnecting) {
      setInnerOpen(false)
      showFbModal({
        title: '您正在另一个音视频频道，是否要切换',
        closable: false,
        onOk: async () => {
          await currentManager?.destroy()
          dispatch(switchRoom())
          handleOk()
        },
        onCancel: () => {
          handleCancel()
        },
      })
    } else {
      dispatch(joinRoom())
      handleOk()
    }
  }

  useEffect(() => {
    setInnerOpen(open ?? false)
  }, [open])

  const memberChangeHandler = useCallback(() => {
    if (manager?.detailMembers) {
      const userLimit = nextChannel?.user_limit ?? 0
      setOutLimit(userLimit < 0 ? false : manager.detailMembers.length >= userLimit)
    }
  }, [manager])

  useEffect(() => {
    manager?.on(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
    return () => {
      manager?.off(AudiovisualManagerEvent.MemberChange, memberChangeHandler)
    }
  }, [manager])

  return (
    <Modal
      width={300}
      className="audiovisual-confirm-dialog left-[336px] top-[50%] m-0 mt-[-247px]"
      maskClosable
      styles={{
        body: { borderRadius: '8px' },
        mask: { background: 'transparent' },
      }}
      closeIcon={false}
      title={
        <div className="flex min-h-[60px] w-full items-center rounded-t-[8px] bg-[var(--bg-bg-2)] py-[8px] ">
          <iconpark-icon size={24} name="Sound" class="mx-[12px]" />
          <div className="flex flex-col ">
            <RealtimeChannelName className="line-clamp-2 w-full" ellipsis={false} guildId={nextGuildId} channelId={nextChannelId} />
            <span className="block w-[240px] truncate text-[12px] font-normal text-[var(--fg-b60)]">来自：{nextGuild?.name}</span>
          </div>
        </div>
      }
      footer={
        <div className="rounded-b-[8px] bg-[var(--bg-bg-2)] px-[32px] pt-[8px] text-center text-[12px] text-[var(--fg-b60)]">
          <span className="">进入频道后麦克风默认静音</span>
          <Button
            block={true}
            disabled={
              !(
                permission.any(GuildPermission.ManageChannels | ChannelPermission.ChannelManager) ||
                (!outLimit && permission.has(ChannelPermission.ViewChannel))
              )
            }
            type={'primary'}
            onClick={handleClick}
            className={'mb-[16px] mt-[8px] justify-center'}
          >
            {(
              permission.any(GuildPermission.ManageChannels | ChannelPermission.ChannelManager) ||
              (!outLimit && permission.has(ChannelPermission.ViewChannel))
            ) ?
              '加入音视频频道'
            : permission.none() ?
              '暂无权限加入频道'
            : '此频道已满'}
          </Button>
        </div>
      }
      open={innerOpen}
      onCancel={handleCancel}
      {...props}
    >
      <div className="h-[280px] w-full">
        <AudiovisualContext.Provider value={manager}>
          <AudiovisualMemberList
            emptyContext={
              <div className="flex h-[280px] w-full flex-col items-center justify-center">
                <img className="w-[87px]" src={AudioWelcomeImage} draggable={false} />
                <span className="mt-[8px] text-[var(--fg-b60)]">快约上小伙伴一起来聊天吧</span>
              </div>
            }
          />
        </AudiovisualContext.Provider>
      </div>
    </Modal>
  )
}

export default AudiovisualConfirmDialog
