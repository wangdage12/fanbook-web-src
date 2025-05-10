import { Button, Divider } from 'antd'
import CosImage from 'fb-components/components/image/CosImage'
import FbImage from 'fb-components/components/image/FbImage'
import { useMemo, useState } from 'react'
import LogoImage from '../../assets/images/logo.svg'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import AuthApi, { AppInfo } from './authApi'

import './auth-modal.less'

interface AuthModalProps {
  appInfo: AppInfo
  scheme?: string
  host?: string
  state?: string
  onClose: () => void
}

function AuthModal({ appInfo, scheme, host, state, onClose }: AuthModalProps) {
  const { icon, client_id, name, desc } = appInfo.app ?? {}
  const [status, setStatus] = useState<'waiting' | 'success' | 'error'>('waiting')
  // const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const descArr = useMemo(() => {
    const descArr = Object.values(desc ?? {})
    // 如果没有 desc，使用默认的
    if (descArr.length === 0) {
      descArr.push('申请使用您的用户名和头像', '申请您使用 Fanbook 绑定的手机')
    }
    return descArr
  }, [desc])

  function handleRedirect(status: string, code = '') {
    if (scheme && host) {
      const searchParams = new URLSearchParams()
      searchParams.set('status', status)
      searchParams.set('code', status === '200' ? code : '0')
      state && searchParams.set('state', state)
      window.open(`${scheme}://${host}?${searchParams.toString()}`, '_self')
    }
  }

  async function handleAuth() {
    setLoading(true)
    try {
      const res = await AuthApi.authorize({ clientId: client_id, state })
      const { data } = res
      const locationUrl = new URL(data.location)
      const code = locationUrl.searchParams.get('code')
      if (code) {
        // setCode(code)
      } else {
        throw new Error('code get failed')
      }
      setStatus('success')
      // 授权成功，立刻跳转
      handleRedirect('200', code)
    } catch (err) {
      setStatus('error')
    }
    setLoading(false)
  }

  const linkRender = useMemo(() => {
    switch (status) {
      case 'success':
      case 'error':
        return (
          <div className="flex items-center justify-center">
            <iconpark-icon name="More" size={24} class="text-[var(--fg-b30)]"></iconpark-icon>
            <iconpark-icon
              name={status === 'success' ? 'CheckCircleFill' : 'CloseCircleFill'}
              size={24}
              class={status === 'success' ? 'text-[var(--auxiliary-green)]' : 'text-[var(--auxiliary-red)]'}
            ></iconpark-icon>
            <iconpark-icon name="More" size={24} class="text-[var(--fg-b30)]"></iconpark-icon>
          </div>
        )
      case 'waiting':
      default:
        return <iconpark-icon name="More" size={24} class="mx-[24px] text-[var(--fg-b30)]"></iconpark-icon>
    }
  }, [status])

  const statusRender = useMemo(() => {
    switch (status) {
      case 'success':
        return <p className="text-center text-[24px] font-bold text-[var(--auxiliary-green)]">授权成功</p>
      case 'error':
        return <p className="text-center text-[24px] font-bold text-[var(--auxiliary-red)]">授权失败，请重试</p>
      case 'waiting':
      default:
        return (
          <div className="w-full text-center text-[var(--fg-b60)]">
            <p>{name}账号即将与 Fanbook 账号</p>
            <p>进行授权绑定</p>
          </div>
        )
    }
  }, [status])

  const btnRender = useMemo(() => {
    switch (status) {
      case 'success':
        return (
          <div className="mt-[32px] flex justify-center gap-[20px] ">
            <Button type={'primary'} className="min-w-[180px]" onClick={onClose}>
              我知道了
            </Button>
          </div>
        )
      case 'error':
      case 'waiting':
      default:
        return (
          <div className="mt-[32px] flex justify-center gap-[20px]">
            <Button
              className="btn-middle"
              onClick={() => {
                onClose()
                handleRedirect('-200')
              }}
            >
              取消
            </Button>
            <Button type="primary" className="min-w-[180px]" onClick={handleAuth} loading={loading}>
              {status === 'waiting' ? '同意授权' : '重新绑定'}
            </Button>
          </div>
        )
    }
  }, [status, loading])

  return (
    <div className="flex flex-col px-7 pb-6 pt-[18px]">
      <div className="w-full text-center text-[20px]">授权访问您的账号</div>
      <div className="my-[24px] flex items-center justify-center">
        <CosImage src={icon} size={60} className="rounded-full border-[1px] border-[var(--fg-b10)]" />
        {linkRender}
        <FbImage src={LogoImage} width={60} height={60} className="rounded-full border-[1px] border-[var(--fg-b10)]" />
      </div>
      {statusRender}
      <Divider className="my-[16px]" />
      <div className="mb-[16px] flex items-center gap-[8px]">
        <RealtimeUserInfo userId={LocalUserInfo.userId}>
          <RealtimeAvatar userId={LocalUserInfo.userId} />
          <RealtimeNickname userId={LocalUserInfo.userId} />
        </RealtimeUserInfo>
      </div>
      <p className="font-bold">授权后“{name}”将获取以下权限</p>
      <div className="flex flex-col">
        {descArr.map((desc, index) => {
          return (
            <div key={index} className="mt-[16px] flex items-center gap-[8px]">
              <em className="h-[4px] w-[4px] rounded-full bg-[var(--fg-b95)]"></em>
              <span className="text-[var(--fg-b95)] ">{desc}</span>
            </div>
          )
        })}
      </div>
      {btnRender}
    </div>
  )
}

export default AuthModal
