import { Tabs, type TabsProps } from 'antd'
import FbBadge from 'fb-components/base_ui/fb_badge'
import { useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppRoutes from '../../app/AppRoutes'
import { useAppSelector } from '../../app/hooks'
import { unread } from './contact-list-slice'

import './contact-list.less'

interface ContactItemProps {
  name: string
  count?: number
}

const ContactItem = ({ name, count = 0 }: ContactItemProps) => {
  return (
    <FbBadge count={count} size={'small'} showZero={false} offset={[-12, 0]}>
      <div className="px-[12px]">{name}</div>
    </FbBadge>
  )
}

const ContactTabKey = {
  AllFriend: 'all-friend',
  FriendRequest: 'friend-request',
}

const ContactList = () => {
  const navigate = useNavigate()
  const unreadCount = useAppSelector(unread)
  const onChange = (key: string) => {
    switch (key) {
      case ContactTabKey.AllFriend:
        navigate(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${AppRoutes.CONTACT}`, { replace: true })
        break
      case ContactTabKey.FriendRequest:
        navigate(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/${AppRoutes.CONTACT}/${AppRoutes.CONTACT_APPLY}`, { replace: true })
        break
    }
  }

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: ContactTabKey.AllFriend,
        label: <ContactItem name="全部好友"></ContactItem>,
        children: <Outlet></Outlet>,
      },
      {
        key: ContactTabKey.FriendRequest,
        label: <ContactItem name="好友请求" count={unreadCount}></ContactItem>,
        children: <Outlet></Outlet>,
      },
    ],
    [unreadCount]
  )

  return (
    <Tabs
      defaultActiveKey={!location.pathname.includes(AppRoutes.CONTACT_APPLY) ? ContactTabKey.AllFriend : ContactTabKey.FriendRequest}
      size="large"
      tabBarGutter={0}
      className="contact-list h-full w-full"
      indicator={{ size: origin => origin - 40 }}
      renderTabBar={(props, DefaultTabBar) => {
        return <DefaultTabBar {...props} className="[&_.ant-tabs-ink-bar]:!bottom-3 h-[56px] before:!border-[var(--fg-b10)]"></DefaultTabBar>
      }}
      items={items}
      onChange={onChange}
      destroyInactiveTabPane
    />
  )
}

export default ContactList
