import { Button, Form, Input, Radio } from 'antd'
import { RcFile } from 'antd/es/upload'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType'
import { isEmpty } from 'lodash-es'
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import { useAppDispatch } from '../../app/hooks'
import AvatarUploader from '../../components/avatar_uploader/AvatarUploader'
import FormSection from '../../components/form/FormSection.tsx'
import { UserAPI } from '../../components/realtime_components/realtime_nickname/UserAPI'
import StateUtils from '../../utils/StateUtils'
import { setEncryptedCookie } from '../../utils/cookie'
import { Gender, UserStatus, updateLocalUser } from '../local_user/localUserSlice'
import LoginBgWrapper from './LoginBgWrapper'
import './ModifyInfo.less'
import LoginReturnButton from './ReturnButton'

interface FormValues {
  avatar: File | string
  nickname: string
  gender: Gender
}

const ModifyInfo: React.FC = () => {
  const user = { ...StateUtils.localUser, ...StateUtils.localUser.pre_data }

  const gender = user.gender && [Gender.FeMale, Gender.Male].includes(user.gender) ? user.gender : Gender.Unknown
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [newGender, setNewGender] = useState<Gender>(gender)
  const [username, setUsername] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const defaultAvatar: string = useMemo(() => {
    const randomInt = Math.ceil(Math.random() * 5)
    return `https://fb-cdn.fanbook.mobi/fanbook/app/files/app_image/avatar/default${randomInt}.png`
  }, [])

  const initialValues: FormValues = useMemo(
    () => ({
      avatar: isEmpty(user.avatar) ? defaultAvatar : user.avatar,
      gender,
      nickname: isEmpty(user.nickname) ? `用户${user.username}` : user.nickname,
    }),
    [user]
  )

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true)
      let avatar, tempAvatar
      if (typeof values.avatar != 'string') {
        const uploadCos = UploadCos.getInstance()
        const md5 = await uploadCos.calculateMD5(values.avatar)
        const file = {
          type: CosUploadFileType.headImage,
          file: values.avatar as RcFile,
          md5,
        }
        avatar = await uploadCos.uploadFile(file)
        tempAvatar = await uploadCos.getObjectUrl(file)
      } else {
        avatar = values.avatar
      }
      const { gender, nickname } = values
      const newUser = { ...user, avatar: tempAvatar ?? avatar, gender, nickname }
      await UserAPI.updateUserInfo(newUser.user_id, avatar, nickname, gender)

      dispatch(updateLocalUser({ userInfo: { ...newUser }, login: UserStatus.LoggedIn }))
      setEncryptedCookie('user', JSON.stringify(newUser), { expires: 30 })
      const searchParams = new URLSearchParams(location.search)
      const redirectUrl = searchParams.get('redirectUrl')
      const targetUrl = redirectUrl ?? AppRoutes.ROOT
      navigate(targetUrl, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginBgWrapper className={'modify-info-page flex items-center justify-center align-middle'}>
      <LoginReturnButton
        onClick={async () => {
          await StateUtils.logout()
          const searchParams = new URLSearchParams(location.search)
          navigate(`${AppRoutes.LOGIN}?${searchParams.toString()}`, { replace: true })
        }}
      ></LoginReturnButton>
      <div className={'mb-[32px] mt-[12px] text-center text-[24px] font-medium leading-[36px] text-[var(--fg-b100)]'}>设置你的个人信息</div>
      <Form form={form} onFinish={onFinish} initialValues={initialValues} className={'item-mb24'}>
        <FormSection>
          <Form.Item className={'mx-auto h-[96px] w-[96px]'} valuePropName="url" name="avatar">
            <AvatarUploader text={username?.trim().slice(0, 1)} />
          </Form.Item>
        </FormSection>
        <FormSection>
          <Form.Item name="nickname" rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}>
            <Input
              placeholder={'请输入用户名'}
              className={'h-[40px] rounded-full'}
              maxLength={12}
              showCount
              onChange={e => setUsername(e.target.value)}
            />
          </Form.Item>
        </FormSection>
        <FormSection>
          <Form.Item
            name="gender"
            rules={[
              {
                required: true,
                message: '请选择性别',
                validator: async (_, value: Gender) => {
                  if ([Gender.FeMale, Gender.Male].includes(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject()
                },
              },
            ]}
          >
            <Radio.Group
              buttonStyle="solid"
              disabled={!!(user.gender && [Gender.FeMale, Gender.Male].includes(user.gender))}
              className={'gender-radio w-full'}
              onChange={e => {
                setNewGender(e.target.value)
              }}
            >
              <Radio.Button value={Gender.Male} className={'inline-flex h-[40px] w-[161px]'}>
                <div
                  className={`absolute left-0 top-0 flex h-full w-full flex-row items-center justify-center ${
                    newGender == Gender.Male ? '!text-[var(--fg-blue-1)]' : '!text-[var(--fg-b40)]'
                  }`}
                >
                  <iconpark-icon name="Gender-Men"></iconpark-icon>
                  <div className={'gender-text ml-[8px]'}>男</div>
                </div>
              </Radio.Button>
              <div className={'inline-block w-[12px]'}></div>
              <Radio.Button value={Gender.FeMale} className={'inline-flex h-[40px] w-[161px] flex-row items-center justify-center align-top'}>
                <div
                  className={`absolute left-0 top-0 flex h-full w-full flex-row items-center justify-center ${
                    newGender == Gender.FeMale ? '!text-[var(--auxiliary-rose)]' : '!text-[var(--fg-b40)]'
                  }`}
                >
                  <iconpark-icon name="Gender-Woman"></iconpark-icon>
                  <div className={'gender-text ml-[8px]'}>女</div>
                </div>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </FormSection>
        <div className={'mb-[40px] text-center text-[12px] leading-[16px] text-[var(--fg-b40)]'}>选定性别后不可再修改哦~</div>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            完成
          </Button>
        </Form.Item>
      </Form>
    </LoginBgWrapper>
  )
}

export default ModifyInfo
