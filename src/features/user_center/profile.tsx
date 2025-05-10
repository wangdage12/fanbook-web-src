import { useUpdate } from 'ahooks'
import { Button, Card, Divider, Form, Input } from 'antd'
import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos.ts'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType.ts'
import { RcFile } from 'rc-upload/lib/interface'
import { useMemo, useRef } from 'react'
import { useAppDispatch } from '../../app/hooks.ts'
import AvatarUploader from '../../components/avatar_uploader/AvatarUploader.tsx'
import FbForm from '../../components/form/FbForm.tsx'
import { RealtimeAvatar } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { UserAPI } from '../../components/realtime_components/realtime_nickname/UserAPI.ts'
import StateUtils from '../../utils/StateUtils'
import { copyText } from '../../utils/clipboard'
import { setEncryptedCookie } from '../../utils/cookie.ts'
import { Gender, UserStatus, updateLocalUser } from '../local_user/localUserSlice.ts'

interface FormValues {
  avatar: File | string
  nickname: string
}

const UserCenterProfile = () => {
  const update = useUpdate()
  const curUser = useMemo(() => StateUtils.localUser, [])
  const dispatch = useAppDispatch()
  const avatarRef = useRef<string>('')
  const initialValues: FormValues = useMemo(
    () => ({
      avatar: curUser.avatar,
      nickname: curUser.nickname,
    }),
    [curUser]
  )

  const handleSubmit = async (values: FormValues) => {
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
    const { nickname } = values
    const newUser = { ...curUser, avatar: tempAvatar ?? avatar, nickname }
    await UserAPI.updateUserInfo(newUser.user_id, avatar, nickname)
    dispatch(updateLocalUser({ userInfo: { ...newUser }, login: UserStatus.LoggedIn }))
    setEncryptedCookie('user', JSON.stringify(newUser), { expires: 30 })
    update()
  }
  return (
    <Card className="h-[100%] overflow-hidden rounded-lg" styles={{ body: { height: '100%', padding: 0 } }}>
      <FbForm<FormValues> initialValue={initialValues} submit={handleSubmit} className={'item-mb24 flex flex-col h-full'}>
        {form => (
          <div className="flex gap-4 rounded bg-[var(--fg-white-1)] p-6">
            <div className="w-1/2">
              <div className="mb-[10px] font-bold">用户名</div>
              <Form.Item name="nickname">
                <Input
                  placeholder=""
                  maxLength={12}
                  className={'h-[40px] truncate'}
                  suffix={
                    <div className="h-[20px] border-0 border-l-[1px] border-solid border-l-[var(--fg-b10)] pl-3 text-[var(--fg-b30)]">
                      #{curUser?.username}
                    </div>
                  }
                />
              </Form.Item>
              <Divider />
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 font-bold">头像</div>
                  <div className="text-xs text-[var(--fg-b60)]">头像上传比例 1 : 1，请勿超过 8 M</div>
                </div>
                <Form.Item name="avatar">
                  <AvatarUploader
                    onAvatarChange={(url: string) => {
                      avatarRef.current = url
                    }}
                  >
                    {loading => (
                      <Button loading={loading} disabled={loading}>
                        更换头像
                      </Button>
                    )}
                  </AvatarUploader>
                </Form.Item>
              </div>
              <Divider />
            </div>
            <div className="w-1/2">
              <div className="mb-[10px] font-bold">预览</div>
              <div
                className=" rounded-[8px] border-[1px] border-solid border-[var(--fg-b10)] bg-[var(--fg-white-1)] p-4"
                style={{ boxShadow: '0px 2px 8px 0px rgba(26, 32, 51, 0.05)' }}
              >
                {form.getFieldValue('avatar') !== curUser.avatar ?
                  <FbAvatar fbSize={64} src={avatarRef.current} fbRadius={9999}></FbAvatar>
                : <RealtimeAvatar userId={curUser.user_id} size={64} />}
                <div className="mt-2 text-base font-bold text-[#1F2126]">
                  <div className="mr-1 inline-block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap align-sub">
                    {form.getFieldValue('nickname') || ''}
                  </div>
                  {curUser?.gender === Gender.Male && <iconpark-icon name="Gender-Men-Circle" size={16}></iconpark-icon>}
                  {curUser?.gender === Gender.FeMale && <iconpark-icon name="Gender-Woman-Circle" size={16}></iconpark-icon>}
                </div>
                <div className="text-xs text-[var(--fg-b30)]">
                  <span className="mr-1">ID：{curUser?.username}</span>
                  <iconpark-icon
                    name="Copy"
                    fill={'var(--fg-b30)'}
                    size={12}
                    class={'cursor-pointer'}
                    onClick={async () => {
                      copyText(curUser?.username ?? '')
                    }}
                  ></iconpark-icon>
                </div>
              </div>
            </div>
          </div>
        )}
      </FbForm>
    </Card>
  )
}

export default UserCenterProfile
