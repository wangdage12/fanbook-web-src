import NotSupportImage from '@/assets/images/placeholder_notsupported_web_light.svg'
import { useRequest } from 'ahooks'
import { Button, Card, Checkbox, Dropdown, Form, Input, message } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { Rule } from 'rc-field-form/lib/interface'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import { useAppDispatch } from '../../app/hooks'
import EmptyPage from '../../components/EmptyPage.tsx'
import CityListSelect from '../../components/city_select/CityListSelect'
import FadeInOutSwitch from '../../components/fade_in_out_switch'
import CaptchaUtils from '../../utils/CaptchaUtils.tsx'
import { copyText } from '../../utils/clipboard.ts'
import { getDecryptedCookie } from '../../utils/cookie'
import { loginAsync } from '../local_user/localUserSlice'
import LoginBgWrapper from './LoginBgWrapper'
import LoginReturnButton from './ReturnButton'
import useCountdown from './count_down'
import LoginAPI, { LoginType, sendCaptcha } from './loginAPI'

interface FormValues {
  remember: boolean
  prefix: string
  phone: string
  agree: boolean
}

async function sendCaptchaWithManual(phone: string, prefix: string) {
  const { ticket, randstr } = await CaptchaUtils.newCaptcha()
  await sendCaptcha(phone, prefix, true, ticket, randstr)
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState<0 | 1>(0)
  const [mobileForm] = Form.useForm()

  const [search] = useSearchParams()
  const loginType = search.get('type') as 'third-party' | null

  const initialValues: FormValues = {
    remember: true,
    prefix: '86',
    phone: '',
    agree: false,
  }
  const [prefix, setPrefix] = useState(initialValues.prefix)
  const [sending, setSending] = useState(false)

  const [loginInDisabled, setLoginInDisabled] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const thirdPartyToken = useRef<string>()
  const { data: thirdPartyLoginData } = useRequest(
    () => {
      const code = search.get('code')
      const nonce = search.get('nonce')
      const sign = search.get('sign')
      const timestamp = search.get('timestamp')
      const app_id = search.get('app_id')
      const auth = search.get('auth')

      if (!code || !nonce || !sign || !timestamp || !app_id || !auth) return Promise.resolve(null)

      return LoginAPI.thirdPartyLogin({
        app_id,
        code,
        nonce,
        timestamp,
        sign,
        auth,
      })
    },
    {
      retryCount: -1,
      debounceWait: 'production' === process.env.NODE_ENV ? 0 : 10,
      manual: search.get('type') !== 'third-party',
    }
  )

  const toggleVisibility = () => {
    setActiveIdx(activeIdx == 0 ? 1 : 0)
  }

  // 第三方登陆获取账户信息和 token
  useLayoutEffect(() => {
    if (!thirdPartyLoginData) return
    if (thirdPartyLoginData.status) {
      const { token, account, password } = thirdPartyLoginData.data
      mobileForm.setFieldsValue({ phone: account, password })
      thirdPartyToken.current = token
    } else {
      setError(thirdPartyLoginData.desc)
    }
  }, [thirdPartyLoginData])

  const onFinish = async (values: FormValues) => {
    const agree = values.agree
    if (!agree) {
      message.destroy()
      FbToast.open({
        type: 'error',
        content: '阅读并同意隐私政策、用户协议才能登录',
      })
      return
    }
    try {
      setSending(true)
      if (loginType === 'third-party') {
        dispatch(
          loginAsync({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            token: thirdPartyToken.current!,
            type: LoginType.token,
          })
        ).then(res => {
          if ('error' in res && res.error.message?.startsWith('1158')) {
            setLoginInDisabled(true)
          } else if (res.payload) {
            const redirectUrl = search.get('redirectUrl')
            const targetUrl = redirectUrl ?? AppRoutes.ROOT
            navigate(targetUrl, { replace: true })
          }
        })
        return
      }
      await sendCaptchaWithManual(values.phone, values.prefix)
      toggleVisibility()
    } catch (e) {
      /* ignore */
    } finally {
      setSending(false)
    }
  }

  const MobileForm: React.FC = () => {
    const [search] = useSearchParams()
    const loginType = search.get('type') as 'third-party' | null

    const prefixSelector = (
      <Form.Item name="prefix" noStyle>
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          align={{ offset: [-15, 4] }}
          overlayStyle={{ padding: '4px 0', width: 200 }}
          dropdownRender={() => (
            <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
              <CityListSelect
                onPick={city => {
                  mobileForm.setFieldValue('prefix', city.phoneCode)
                  setPrefix(city.phoneCode)
                }}
              ></CityListSelect>
            </Card>
          )}
        >
          <div className={'inline-flex cursor-pointer items-center text-[14px] text-[var(--fg-b100)]'}>
            +{prefix}
            <iconpark-icon name="TriangleDown" class={'ml-[2px]'} size={17}></iconpark-icon>
            <div className={'mr-[8px] h-[18px] w-[12px] border-r-[0.5px] border-r-[var(--fg-b20)]'}></div>
          </div>
        </Dropdown>
      </Form.Item>
    )

    const getMobileRules = (): [Rule] => {
      const rules: [Rule] = [{ required: true, message: '请输入手机号码' }]
      if (prefix == '86') {
        rules.push({ pattern: /^[0-9]{11}$/, message: '请输入正确的手机号码' })
      } else {
        rules.push({
          pattern: /^[0-9]{0,40}$/,
          message: '请输入正确的手机号码',
        })
      }
      return rules
    }

    let subtitle: string | undefined
    if (loginType === 'third-party') {
      subtitle = '登录后Fanbook将获得你的公开信息（昵称、头像等）'
    } else {
      subtitle = '未注册的手机号验证后自动登录'
    }

    const passwordForm = loginType === 'third-party'

    return (
      <>
        <div className={'h-[32px]'}></div>
        <div className={'text-[24px] font-medium leading-[36px]'}>
          {loginType === 'third-party' ? '账号授权登录' : <>{!passwordForm && '手机号码'}登录</>}
        </div>
        <div className={'h-[8px]'}></div>
        {!!subtitle && <div className={' text-[12px] leading-[18px] text-[var(--fg-b40)]'}>{subtitle}</div>}
        <div className={'h-[32px]'}></div>
        {error ?
          <EmptyPage image={NotSupportImage} imageSize={120} message={''} context={error} className={'pt-3'} />
        : loginType === 'third-party' && !thirdPartyLoginData ?
          <div className={'flex items-center justify-center w-full h-[288px]'}>
            <CircularLoading />
          </div>
        : <Form
            name="basic"
            form={mobileForm}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 600 }}
            className={'flex flex-col gap-6'}
            initialValues={initialValues}
            onFinish={onFinish}
            autoComplete="off"
            validateTrigger="onSubmit"
          >
            {passwordForm ?
              <>
                <Form.Item name="phone" label="">
                  <Input
                    className={'rounded-full px-[12px] text-[14px]'}
                    size={'large'}
                    autoFocus
                    prefix={'账号'}
                    suffix={
                      <p
                        className={'anticon cursor-pointer text-xs text-fgBlue1 flex items-center gap-0.5'}
                        onClick={() => {
                          copyText(mobileForm.getFieldValue(['phone']), '账号复制成功')
                        }}
                      >
                        <iconpark-icon name="Copy-dc0b665k" />
                        复制账号
                      </p>
                    }
                    placeholder={'请输入账号'}
                    allowClear
                    readOnly={loginType === 'third-party'}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item name="password" label="">
                  <Input
                    type="password"
                    className={'rounded-full px-[12px] text-[14px]'}
                    size={'large'}
                    prefix={'密码'}
                    placeholder={'请输入密码'}
                    allowClear
                    readOnly={loginType === 'third-party'}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24 }}>
                  <Button
                    className={'!h-10'}
                    type="primary"
                    htmlType="submit"
                    style={{ fontSize: 14 }}
                    block
                    loading={sending}
                    disabled={loginInDisabled}
                  >
                    {loginType === 'third-party' ? '授权登录' : '登录'}
                  </Button>
                </Form.Item>
              </>
            : <>
                <Form.Item name="phone" label="" rules={getMobileRules()}>
                  <Input
                    className={'rounded-full px-[12px] text-[14px]'}
                    autoComplete={'tel'}
                    size={'large'}
                    autoFocus
                    placeholder={'请输入手机号'}
                    maxLength={prefix == '86' ? 11 : undefined}
                    prefix={prefixSelector}
                    allowClear
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item wrapperCol={{ span: 24 }}>
                  <Button className={'!h-10'} type="primary" htmlType="submit" style={{ fontSize: 14 }} block loading={sending}>
                    获取验证码
                  </Button>
                </Form.Item>
              </>
            }

            <Form.Item name="agree" valuePropName="checked" wrapperCol={{ span: 24 }}>
              {
                <Checkbox className={'text-[var(--fg-b60)]'}>
                  <span className={'text-[12px]'}>
                    请阅读并同意
                    {
                      <a href={`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/privacy/privacy.html`} target={'_blank'} rel={'noreferrer'}>
                        隐私政策
                      </a>
                    }
                    、
                    {
                      <a href={`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/terms/terms.html`} target={'_blank'} rel={'noreferrer'}>
                        用户协议
                      </a>
                    }
                    和
                    {
                      <a href={`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/convention/convention.html`} target={'_blank'} rel={'noreferrer'}>
                        社区公约
                      </a>
                    }
                  </span>
                </Checkbox>
              }
            </Form.Item>
          </Form>
        }
      </>
    )
  }

  const CaptchaForm = ({ visible }: { visible: boolean }) => {
    const { time, start, reset } = useCountdown({
      initialTime: 60000, // 60 秒
      interval: 1000,
    })
    useEffect(() => {
      if (visible) {
        start()
      }
    }, [visible])
    const reSend = async () => {
      await sendCaptchaWithManual(mobileForm.getFieldsValue().phone, mobileForm.getFieldsValue().prefix)
      reset()
    }
    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val.length === 6) {
        dispatch(
          loginAsync({
            mobile: mobileForm.getFieldsValue().phone,
            areaCode: mobileForm.getFieldsValue().prefix,
            captcha: val,
            type: LoginType.mobile,
          })
        ).then(res => {
          if (res.payload) {
            const searchParams = new URLSearchParams(location.search)
            const redirectUrl = searchParams.get('redirectUrl')
            const targetUrl = redirectUrl ?? AppRoutes.ROOT
            navigate(targetUrl, { replace: true })
          }
        })
      }
    }
    return (
      <Form>
        <LoginReturnButton onClick={() => toggleVisibility()}></LoginReturnButton>
        <div className={'mt-[12px] text-[24px] font-medium leading-[36px] text-[var(--fg-b100)]'}>输入验证码</div>
        <div className={'mb-[34px] mt-[8px] text-[12px] leading-[16px] text-[var(--fg-b40)]'}>
          验证码已发送至 +{prefix} {mobileForm.getFieldValue('phone')}
        </div>

        <Form.Item label="">
          <Input
            className={'h-[40px] rounded-full px-[12px]'}
            placeholder={'请输入验证码'}
            autoComplete={'one-time-code'}
            autoFocus
            maxLength={6}
            suffix={
              <button>
                {time > 0 ?
                  `${Math.round(time / 1000)}s`
                : <div className={'cursor-pointer text-[14px] text-[var(--fg-blue-1)]'} onClick={reSend}>
                    重新发送
                  </div>
                }
              </button>
            }
            style={{ width: '100%' }}
            onChange={onChange}
          />
        </Form.Item>
      </Form>
    )
  }

  return getDecryptedCookie('user') ?
      <AutoRedirectToHome />
    : <LoginBgWrapper className={'flex items-center justify-center'}>
        <FadeInOutSwitch index={activeIdx}>
          <MobileForm />
          <CaptchaForm visible={activeIdx == 1} />
        </FadeInOutSwitch>
      </LoginBgWrapper>
}

function AutoRedirectToHome() {
  const [URLSearchParams] = useSearchParams()
  const to = URLSearchParams.get('redirectUrl') ?? AppRoutes.ROOT
  return <Navigate to={to} replace></Navigate>
}

export default Login
