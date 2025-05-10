import { Button, Card, Divider, Switch } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { difference, isEqual, union } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import EmptyData from '../../components/EmptyData'
import { RealtimeAvatar, RealtimeNickname, RealtimeUserInfo } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { addBlacklist, blacklist, removeBlacklist } from '../blacklist/blacklistSlice'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { localUserSetting, updateSetting } from '../local_user/localUserSlice'
import SettingAPI from './SettingAPI'

const BanList = () => {
  const dispatch = useAppDispatch()
  const banList = useAppSelector(blacklist, isEqual)
  const [tempBanList, setTempBanList] = useState<string[]>([])
  const unBanList = useMemo(() => difference(tempBanList, banList), [banList, tempBanList])
  const handleClick = async (userId: string, isBan: boolean) => {
    if (isBan) {
      await dispatch(removeBlacklist({ userId: LocalUserInfo.userId, friendId: userId }))
      FbToast.open({ content: '已解除屏蔽', key: 'privacy-ban-list' })
    } else {
      await dispatch(addBlacklist({ userId: LocalUserInfo.userId, friendId: userId }))
      FbToast.open({ content: '已被你屏蔽', key: 'privacy-ban-list' })
    }
  }
  useEffect(() => {
    setTempBanList(tempBanList => union(tempBanList, banList))
  }, [banList])
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center">
      {tempBanList.length > 0 ?
        <div className="h-full w-full overflow-auto">
          {tempBanList.map(userId => {
            const isBan = !unBanList.includes(userId)
            return (
              <div
                key={userId}
                className="flex h-[64px] items-center justify-between rounded-[8px] bg-transparent px-[8px] py-[12px] hover:bg-[var(--fg-b5)]"
              >
                <div className="flex items-center">
                  <RealtimeUserInfo userId={userId}>
                    {user => {
                      return (
                        <>
                          <RealtimeAvatar userId={userId} size={40} className="mr-[12px] border" />
                          <div className="flex flex-grow flex-col">
                            <RealtimeNickname userId={userId} botTag className="text-[14px] text-[var(--fg-b100)]"></RealtimeNickname>
                            <span className="text-[12px] text-[var(--fg-b40)]">ID：{user.username}</span>
                          </div>
                        </>
                      )
                    }}
                  </RealtimeUserInfo>
                </div>
                <Button onClick={() => handleClick(userId, isBan)}>{isBan ? '解除屏蔽' : '已解除'}</Button>
              </div>
            )
          })}
        </div>
      : <EmptyData message="暂无已屏蔽的用户"></EmptyData>}
    </div>
  )
}

const UserCenterProfile = () => {
  const setting = useAppSelector(localUserSetting, isEqual)
  const dispatch = useAppDispatch()
  const handleBanListClick = useCallback(() => {
    showFbModal({ title: '已屏蔽的用户', width: 640, showCancelButton: false, showOkButton: false, content: <BanList /> })
  }, [])
  const handleDMChange = useCallback(async (toggle: boolean) => {
    await SettingAPI.setUserSetting(LocalUserInfo.userId, { receive_stranger_message: toggle })
    dispatch(updateSetting({ receive_stranger_message: toggle }))
  }, [])
  const handleAddFriendChange = useCallback(async (toggle: boolean) => {
    await SettingAPI.setUserSetting(LocalUserInfo.userId, { receive_friend_request: toggle })
    dispatch(updateSetting({ receive_friend_request: toggle }))
  }, [])

  return (
    <Card className="h-full overflow-hidden rounded-[8px]" styles={{ body: { height: 'calc(100% - 56px)' } }}>
      <div>
        <div className="mb-[20px] text-xs font-medium text-[var(--fg-b60)]">这里可以更改你对个人隐私的设置</div>
        <div className="flex cursor-pointer justify-between text-base font-medium" onClick={handleBanListClick}>
          <span>已屏蔽的用户</span>
          <iconpark-icon name="Right" class="text-[var(--fg-b40)]"></iconpark-icon>
        </div>
      </div>
      <Divider />
      <div>
        <div className="mb-[20px] text-xs font-medium text-[var(--fg-b60)]">私信</div>
        <div className="flex justify-between text-base font-medium">
          <span>接收陌生人私信消息</span>
          <Switch checked={setting?.receive_stranger_message} onChange={handleDMChange} />
        </div>
      </div>
      <Divider />
      <div>
        <div className="mb-[20px] text-xs font-medium text-[var(--fg-b60)]">加好友</div>
        <div className="flex justify-between text-base font-medium">
          <span>允许加我为好友</span>
          <Switch checked={setting?.receive_friend_request} onChange={handleAddFriendChange} />
        </div>
      </div>
      <Divider />
    </Card>
  )
}

export default UserCenterProfile
