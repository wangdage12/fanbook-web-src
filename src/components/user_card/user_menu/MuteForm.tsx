import { Button, Input, Radio, RadioChangeEvent, Space } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast'
import { useState } from 'react'
import { addMuteList } from '../../../features/guild_list/muteListAPI'
import TimeSelector from '../../time_selector/TimeSelector'

export const MuteForm: React.FC<{ userId: string; guildId?: string; onClose: () => void }> = ({ userId, guildId, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [reasonInfo, setReasonInfo] = useState('')
  const [endTime, setEndTime] = useState(0)
  const [rangeSelected, setRangeSelected] = useState()
  const [customEndTime, setCustomEndTime] = useState<number | undefined>(undefined)
  const handleRangeEndTimeChange = (evt: RadioChangeEvent) => {
    setRangeSelected(evt.target.value)
    if (isNaN(evt.target.value)) {
      setEndTime(customEndTime ?? 0)
    } else {
      setEndTime(evt.target.value)
    }
  }
  const handleCustomEndTimeChange = (time: number) => {
    setCustomEndTime(time)
    setEndTime(time)
  }
  const handleCancel = () => {
    onClose?.()
  }
  const handleOk = async () => {
    setLoading(true)
    guildId && (await addMuteList(userId, guildId, `${endTime}`, reasonInfo))
    setLoading(false)
    FbToast.open({ content: '已将用户禁言', key: 'user-menu-silence' })
    onClose?.()
  }
  return (
    <div className="mb-4 w-full">
      <div className="flex h-[40px] items-center text-[12px] text-[var(--fg-b60)]">
        禁言时长<span className="text-[var(--function-red-1)]">*</span>
      </div>
      <Radio.Group className="w-full" onChange={handleRangeEndTimeChange} value={rangeSelected}>
        <Space direction="vertical" size={0} className="w-full">
          <Radio className="flex h-[40px] items-center" value={10 * 60}>
            10 分钟
          </Radio>
          <Radio className="flex h-[40px] items-center" value={60 * 60}>
            1 小时
          </Radio>
          <Radio className="flex h-[40px] items-center" value={12 * 60 * 60}>
            12 小时
          </Radio>
          <Radio className="flex h-[40px] items-center" value={24 * 60 * 60}>
            1 天
          </Radio>
          <div className="flex h-[40px] w-full items-center justify-between">
            <Radio value="custom">自定义</Radio>
            <TimeSelector
              className="!w-[200px]"
              onChange={handleCustomEndTimeChange}
              value={customEndTime}
              disabled={rangeSelected !== 'custom'}
            ></TimeSelector>
          </div>
        </Space>
      </Radio.Group>
      <div className="flex h-[40px] items-center text-[12px] text-[var(--fg-b60)]">禁言原因</div>
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
      <span className="text-[12px] text-[var(--fg-b60)]">禁言原因将会通知该成员。</span>
      <div className="flex justify-end pt-[24px]">
        <Button onClick={handleCancel} className="btn-middle mr-[16px]">
          取消
        </Button>
        <Button type={'primary'} onClick={handleOk} className="btn-middle" loading={loading ? { delay: 200 } : false} disabled={endTime === 0}>
          禁言
        </Button>
      </div>
    </div>
  )
}
