import { Button, Checkbox, Divider, Input, Space } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { useState } from 'react'
import { GlobalEvent, globalEmitter } from '../../../base_services/event.ts'
import GuildAPI from '../../../features/guild_container/guildAPI'
import LocalUserInfo from '../../../features/local_user/LocalUserInfo.ts'

export const TickForm: React.FC<{ userId: string; userName?: string; guildId?: string; onClose: () => void }> = ({
  userId,
  userName,
  guildId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const [reasonInfo, setReasonInfo] = useState('')
  const [operate, setOperate] = useState<(string | number | boolean)[]>([])
  const handleCancel = () => {
    onClose?.()
  }
  const handleOk = async () => {
    try {
      if (!guildId) return
      setLoading(true)
      await GuildAPI.removeUser({
        userId: LocalUserInfo.userId,
        memberId: userId,
        memberName: userName,
        guildId,
        ban: operate.includes('blacklist'),
        isDeleteRecord: operate.includes('clearMsg'),
        reason: reasonInfo,
      })
      setLoading(false)
      FbToast.open({ content: '移除成功', key: 'user-menu-remove' })
      globalEmitter.emit(GlobalEvent.UserRem, { userId, guildId: guildId })
      onClose?.()
    } catch (err) {
      FbToast.open({ content: '服务器繁忙，请稍候重试~', key: 'user-menu-remove' })
      setLoading(false)
      return
    }
  }
  return (
    <div className="w-full">
      <div className="flex h-[40px] items-center text-[12px] text-[var(--fg-b60)]">可选操作</div>
      <Checkbox.Group className="w-full" onChange={setOperate} value={operate}>
        <Space direction="vertical" size={0} className="w-full rounded-[8px] border px-[16px]">
          <Checkbox className="flex h-[40px] items-center" value="blacklist">
            移出社区，并加入黑名单
          </Checkbox>
          <Divider style={{ margin: 0, transform: 'translateX(16px)' }} />
          <Checkbox className="flex h-[40px] items-center" value="clearMsg">
            永久清空该成员7天内所有消息
          </Checkbox>
        </Space>
      </Checkbox.Group>
      <div className="flex h-[40px] items-center text-[12px] text-[var(--fg-b60)]">移出/拉黑原因</div>
      <Input.TextArea
        className="mb-[16px] w-full"
        value={reasonInfo}
        onChange={evt => {
          setReasonInfo(evt.target.value)
        }}
        rows={3}
        autoSize={false}
        placeholder={'请输入原因'}
        showCount
        maxLength={20}
      />
      <span className="text-[12px] text-[var(--fg-b60)]">移出/拉黑原因将会通知该成员。</span>
      <div className="flex justify-end pb-6 pt-6">
        <Button onClick={handleCancel} className="btn-middle mr-[16px]">
          取消
        </Button>
        <Button onClick={handleOk} className="btn-middle" type={'primary'} danger loading={loading ? { delay: 200 } : false}>
          移出社区
        </Button>
      </div>
    </div>
  )
}
