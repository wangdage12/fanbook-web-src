import { useLocalStorageState } from 'ahooks'
import { Button, Card, Form, Input } from 'antd'
import CryptoJS from 'crypto-js'
import fb_toast from 'fb-components/base_ui/fb_toast'
import Cookies from 'js-cookie'
import md5 from 'md5'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface FormData {
  account: string
  username: string
}

export default function LoginMockThirdParty() {
  const [inputs, setInputs] = useLocalStorageState<FormData>('login_mock_third_party')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Cookies.remove('user')
  }, [])

  const onFinish = async (values: FormData) => {
    setInputs(values)
    setLoading(true)

    const API_HOST = import.meta.env.FANBOOK_API_HOST
    // 开发环境的 app_id 和 app_secret
    const app_id = '4fdfc4e770d3998f87aae336c6e41f59'
    const app_secret = '1711f4a92b0f2a7d6932295e41026e5a'

    const timestamp = Math.floor(Date.now() / 1000)

    const userInfo = {
      user_id: values.account,
      mobile: '17500000001',
      nickname: values.username,
      avatar: 'https://fb-cdn.fanbook.cn/fanbook/app/files/chatroom/image/2aaea904b1ffd54c613df20b70f0408e.jpg',
      gender: 1,
    }

    const nonce = new Array(16)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join('')
    const { code } = await fetch(`${API_HOST}/openApi/third/code`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        app_id,
        app_secret,
        nonce,
        timestamp,
        sign: md5(`${app_id}${app_secret}${nonce}${timestamp}`),
      }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.code !== 1000) {
          fb_toast.open({ type: 'error', content: res.message })
        }
        return res.data
      })
    const sign = md5(`${app_id}${code}${nonce}${timestamp}`)
    const auth = CryptoJS.AES.encrypt(JSON.stringify(userInfo), CryptoJS.enc.Utf8.parse(app_secret.slice(0, 16)), {
      iv: CryptoJS.enc.Utf8.parse(nonce),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString()

    setLoading(false)

    navigate(
      `/login?type=third-party&type=third-party&code=${code}&nonce=${nonce}&sign=${sign}&timestamp=${timestamp}&app_id=${app_id}&auth=${encodeURIComponent(auth)}`
    )
  }

  return (
    <Card className={'m-auto w-96 mt-[40%]'}>
      <Form initialValues={inputs} onFinish={onFinish} className={'space-y-6'}>
        <strong>此页面用于模拟第三方登录，仅供开发/测试环境使用</strong>
        <Form.Item name={'account'} required rules={[{ required: true, message: '请输入账号' }]}>
          <Input placeholder={'账号'} />
        </Form.Item>
        <Form.Item name={'username'} help={'如果账号不存在，会用此名字注册'} required rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder={'用户名'} />
        </Form.Item>
        <Button type={'primary'} size={'large'} className={'w-full'} htmlType={'submit'} loading={loading}>
          跳转到登录
        </Button>
      </Form>
    </Card>
  )
}
