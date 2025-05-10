import { Button, Input } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast'
import { useState } from 'react'
import { InviteUtils } from './utils'

export default function SearchInviteCodeModal({ destroy }: { destroy: () => void }) {
  const [val, setVal] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <div className={'mb-4'}>
      <div className={'my-[10px] text-sm text-[var(--fg-b100)]'}>社区邀请码示例：SVgd7FZ3 或 https://in.fanbook.cn/SVgd7FZ3</div>
      <Input
        className={'h-[40px]'}
        placeholder={'请输入邀请链接或邀请码'}
        maxLength={300}
        showCount
        onChange={e => {
          const val = e.target.value.trim()
          setVal(val)
        }}
      ></Input>
      <div className="ant-modal-footer">
        <Button
          type="primary"
          disabled={val.trim().length == 0}
          loading={loading}
          onClick={async () => {
            const inviteCode = InviteUtils.parseCodeFromLink(val.trim())
            if (!inviteCode) {
              FbToast.open({ content: '请输入正确的邀请码', key: 'inviteCode', type: 'warning' })
              return
            }
            try {
              setLoading(true)
              const isValid = await InviteUtils.checkInviteCode({ inviteCode, needToast: true })
              if (!isValid) return
              destroy()
              await InviteUtils.showAcceptModal({ inviteCode })
            } finally {
              setLoading(false)
            }
          }}
        >
          加入社区
        </Button>
      </div>
    </div>
  )
}
