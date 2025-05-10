import { Input } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { useState } from 'react'
import DiscoveryPlaceholder from '../../assets/images/discovery-placeholder.png'
import FadeInOutSwitch from '../../components/fade_in_out_switch'
import { InviteUtils } from '../invite/utils'

export default function Discovery() {
  const [enabled, setEnabled] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const onConfirm = async () => {
    if (value.length == 0) return
    const inviteCode = InviteUtils.parseCodeFromLink(value)
    if (!inviteCode) {
      FbToast.open({
        content: '请输入正确的邀请码',
        key: 'inviteCode',
        type: 'warning',
      })
      return
    }
    try {
      setLoading(true)
      const isValid = await InviteUtils.checkInviteCode({ inviteCode, needToast: true })
      if (!isValid) return
      await InviteUtils.showAcceptModal({ inviteCode })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={'flex h-full w-full flex-col items-center justify-center rounded-tl-[10px] bg-[var(--bg-bg-2)]'}>
      <div className={' mb-[8px] text-[28px] font-medium leading-[40px] text-[var(--fg-b100)]'}>Hello 新朋友</div>
      <div className={' mb-[32px] text-[18px] leading-[24px] text-[var(--fg-b40)]'}>你参与的 才是爆款</div>
      <img src={DiscoveryPlaceholder} alt="discovery" className={'mb-[72px] h-[173px] w-[130px]'} />
      <Input
        styles={{ input: { textAlign: 'center' } }}
        placeholder={'请输入社区邀请码'}
        className={'mb-[16px] h-[52px] w-[240px] text-[17px] font-medium leading-[24px]'}
        onPressEnter={onConfirm}
        onChange={e => {
          setEnabled(e.target.value.trim().length > 0)
          setValue(e.target.value)
        }}
        autoFocus
        suffix={
          <FadeInOutSwitch index={loading ? 0 : 1} className={'inline-block h-[28px] w-[28px]'}>
            <div className={'flex-center h-[28px] w-[28px]'}>
              <CircularLoading />
            </div>
            <div
              onClick={onConfirm}
              className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full ${
                enabled ? 'bg-[var(--fg-blue-1)]' : 'bg-[var(--fg-b20)] transition-all'
              }`}
            >
              <iconpark-icon name="Arrow-Right" color={'white'}></iconpark-icon>
            </div>
          </FadeInOutSwitch>
        }
      />
      <div className={'mb-[32px] text-[14px] leading-[20px] text-[var(--fg-b40)]'}>
        社区邀请码示例：SVgd7FZ3 或<br /> https://in.fanbook.cn/SVgd7FZ3
      </div>
    </div>
  )
}
