import { Button, Input } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { BusinessError } from '../../base_services/interceptors/response_interceptor'
import GuildUtils from '../../features/guild_list/GuildUtils'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import { remarkFriend, remarkSelectors } from '../../features/remark/remarkSlice'
import { guildUserSelectors } from '../../features/role/guildUserSlice'
import StateUtils from '../../utils/StateUtils'
import { agree, apply } from './RelationAPI'

export interface AddFriendModalProps {
  userId: string
  nickname?: string
  guildId?: string
  onClose?: () => void
}

function AddFriendModal({ userId, nickname, guildId, onClose }: AddFriendModalProps) {
  const guildNickname = useAppSelector(guildUserSelectors.nickname(guildId ?? '', userId))
  const dispatch = useAppDispatch()
  const remark = useAppSelector(remarkSelectors.remark(userId))
  const [validationInfo, setValidationInfo] = useState('')
  const [remarkName, setRemarkName] = useState(remark ?? '')
  const guildName = useMemo(() => {
    const guild = guildId ? GuildUtils.getGuildById(guildId) : null
    return guild?.name
  }, [guildId])

  const createValidationInfo = () => {
    return `我是${guildName ? `来自“${guildName}”的` : ''}${StateUtils.localUser.nickname}`
  }
  const [clicked, setClicked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setValidationInfo(createValidationInfo())
  }, [guildName])

  const handleCancel = () => {
    onClose?.()
  }
  const handleOk = async () => {
    const _remarkName = remarkName.trim()
    let _validationInfo = validationInfo.trim()
    if (!_validationInfo) {
      _validationInfo = createValidationInfo()
    }
    setLoading(true)
    await dispatch(remarkFriend({ userId: LocalUserInfo.userId, friendId: userId, name: _remarkName }))
    try {
      await apply(LocalUserInfo.userId, userId, _validationInfo, guildId)
      FbToast.open({ content: '已发送好友请求', key: 'can-add-friend-tips' })
      setLoading(false)
      onClose?.()
    } catch (err) {
      setLoading(false)
      if (err instanceof BusinessError) {
        if (err.code === 1032) {
          await agree(LocalUserInfo.userId, userId)
          FbToast.open({ content: '同意请求', key: 'can-add-friend-tips' })
          onClose?.()
          return
        }
        err.desc && FbToast.open({ content: err.desc || '发送好友请求失败', key: 'can-add-friend-tips' })
        onClose?.()
        return
      }
      FbToast.open({ content: '发送好友请求失败', key: 'can-add-friend-tips' })
    }
  }
  return (
    <div className="w-full pb-4">
      <span className="mb-[8px] block text-[14px] font-bold text-[var(--fg-b60)]">填写验证消息</span>
      <Input.TextArea
        className="validation-textarea w-full"
        value={validationInfo}
        onChange={evt => {
          setValidationInfo(evt.target.value)
        }}
        rows={3}
        autoSize={false}
        placeholder={'输入备注消息'}
        showCount
        maxLength={50}
      />
      <span className="mb-[8px] mt-[16px] block  text-[14px] font-bold text-[var(--fg-b60)]">设置备注名</span>
      <Input
        className="mb-[8px] w-full"
        value={remarkName}
        onChange={evt => {
          setRemarkName(evt.target.value)
        }}
        placeholder={nickname}
        showCount
        maxLength={12}
      />
      {guildNickname && !clicked && (
        <>
          <span className="mx-[12px] text-[var(--fg-b60)]">对方社区昵称：{guildNickname}</span>
          <Button
            className={'p-0'}
            type={'link'}
            onClick={() => {
              setClicked(true)
              setRemarkName(guildNickname)
            }}
          >
            填入
          </Button>
        </>
      )}
      <div className="flex justify-end pt-[24px]">
        <Button onClick={handleCancel} className="btn-middle mr-[16px]">
          取消
        </Button>
        <Button type={'primary'} onClick={handleOk} className="btn-middle" loading={loading ? { delay: 200 } : false} disabled={loading}>
          发送
        </Button>
      </div>
    </div>
  )
}

export default AddFriendModal
