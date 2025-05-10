import { Input } from 'antd'
import FbBadge from 'fb-components/base_ui/fb_badge'
import { useCallback, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import { useAppSelector } from '../../app/hooks'
import { unread } from '../contact_list/contact-list-slice'
import DmList from '../dm/DmList'

const CONTACT_FULL_URL = `${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${AppRoutes.CONTACT}`

export function DmWrapper() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const unreadCount = useAppSelector(unread)
  const handleContactClick = useCallback(() => {
    if (location.pathname.startsWith(CONTACT_FULL_URL)) {
      return
    }
    navigate(CONTACT_FULL_URL, { replace: true })
  }, [navigate])

  return (
    <>
      <div className={'flex h-full w-[256px] flex-shrink-0 flex-col overflow-hidden rounded-tl-[10px] bg-[var(--bg-bg-3)]'}>
        <div className="w-full">
          <Input
            className="mx-[16px] my-[12px] w-[calc(100%-32px)]"
            placeholder="搜索"
            allowClear
            value={keyword}
            onChange={evt => {
              setKeyword(evt.target.value)
            }}
            prefix={<iconpark-icon name="Search" size={16} color="var(--fg-b40)"></iconpark-icon>}
          ></Input>
          <div
            className={`mx-[8px] flex h-[36px] cursor-pointer items-center rounded-[8px] px-[8px] text-[14px] text-[var(--fg-b100)] hover:bg-[var(--fg-b5)] ${
              location.pathname.startsWith(CONTACT_FULL_URL) ? 'bg-[var(--fg-b5)]' : ''
            }`}
            onClick={handleContactClick}
          >
            <iconpark-icon name="UserList" class="mr-[8px]" size={16} color="var(--fg-b100)"></iconpark-icon>
            <span className="flex-grow">通讯录</span>
            <FbBadge count={unreadCount} showZero={false} size={'small'}></FbBadge>
          </div>
        </div>
        <div className="mx-[16px] mt-[12px] h-[0.5px] w-[calc(100%-32px)] bg-[var(--fg-b10)]"></div>
        <DmList keyword={keyword} />
      </div>
      <div className="back h-full min-w-[475px] flex-grow select-text bg-[var(--bg-bg-2)]">
        <Outlet></Outlet>
      </div>
    </>
  )
}
