import { Avatar, Button, List, Tabs, TabsProps } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import CosImageUtils from 'fb-components/utils/CosImageUtils'
import { HTMLAttributes } from 'react'
import GuildUtils from '../../features/guild_list/GuildUtils'
import EmptyData from '../EmptyData'
import { RealtimeUser } from '../realtime_components/realtime_nickname/RealtimeUserInfo'
import { UserStruct } from '../realtime_components/realtime_nickname/UserAPI'
import './OurAssociates.less'
import UserProfile from './UserProfile'
import { useUserAssociates, useUserCardHandle } from './hooks'
import UserMenuDropdown from './user_menu/UserMenuDropdown'

const Item = (props: HTMLAttributes<never>) => (
  <li
    {...props}
    className="
    flex
    h-[48px]
  cursor-pointer items-center justify-between border-[0px]
  border-b-[1px] border-solid border-gray-100 bg-[var(--fg-white-1)]
  px-3
  first-of-type:rounded-t-lg last-of-type:rounded-b-lg
  last-of-type:border-b-[0px]
"
  />
)

export default function OurAssociates({ guildId, onClose, user }: { guildId?: string; user: UserStruct; onClose: () => void }) {
  const { associates } = useUserAssociates(user.user_id, { guildId })
  const { relations: users, guilds } = associates
  const handleTabClick = (tab: DefaultTab) => {
    onClose()
    const { destroy: close } = showFbModal({
      width: 600,
      style: { height: 488 },
      className: 'our-associates-modal',
      closable: false,
      showCancelButton: false,
      showOkButton: false,
      content: (
        <AssociatesModal user={user} guildId={guildId} friends={users} guilds={guilds} onClose={() => close()} defaultTab={tab}></AssociatesModal>
      ),
    })
  }

  return (
    <div className={'our-associates'}>
      <div className="my-[8px] text-[12px] font-[var(--fg-b60)]">我们的关联</div>
      <ul>
        {
          <Item onClick={() => handleTabClick('guild')}>
            共同社区
            <div className={'flex items-center justify-center'}>
              <Avatar.Group maxPopoverTrigger={'click'} size={28} maxCount={3} className="square-group mr-[12px]">
                {guilds.map(guild => (
                  <Avatar
                    key={guild.guild_id}
                    src={CosImageUtils.thumbnailMin(guild.icon, 24)}
                    shape={'square'}
                    className={'square border-2'}
                  ></Avatar>
                ))}
              </Avatar.Group>
              <iconpark-icon name="Right" color="var(--fg-b60)"></iconpark-icon>
            </div>
          </Item>
        }
        {
          <Item onClick={() => handleTabClick('friend')}>
            共同好友
            <div className={'flex items-center justify-center'}>
              <Avatar.Group size={24} maxCount={3} className="mr-[12px]">
                {users.map(user => (
                  <Avatar key={user.user_id} src={user.avatar} shape={'circle'} className={'border-2'}></Avatar>
                ))}
              </Avatar.Group>
              <iconpark-icon name="Right" color="var(--fg-b60)"></iconpark-icon>
            </div>
          </Item>
        }
      </ul>
    </div>
  )
}

type DefaultTab = 'friend' | 'guild'

function EmptyUI({ title }: { title: string }) {
  return (
    <div className={'flex h-[272px] w-full items-center justify-center'}>
      <EmptyData message={title} />
    </div>
  )
}

function AssociatesModal({
  user,
  guildId,
  defaultTab,
  friends,
  guilds,
  onClose,
}: {
  user: RealtimeUser
  guildId?: string
  friends: UserStruct[]
  guilds: GuildStruct[]
  defaultTab?: DefaultTab
  onClose: () => void
}) {
  const { isCanDm, isCanAddFriend, isFriend, handleDMClick, handleAddFriendClick } = useUserCardHandle(user.user_id, guildId, onClose, true, true)
  const items: TabsProps['items'] = [
    {
      key: 'guild',
      label: '共同社区',
      children: (
        <List
          className={'w-full pb-[8px]'}
          dataSource={guilds}
          locale={{
            emptyText: <EmptyUI title={'暂时没有共同社区哦'}></EmptyUI>,
          }}
          renderItem={item => (
            <li
              className={' mx-[12px] flex h-[64px] cursor-pointer items-center justify-start rounded-[8px] px-[12px] hover:bg-[var(--fg-b5)]'}
              onClick={() => GuildUtils.selectGuild(item.guild_id)}
            >
              <FbAvatar src={item.icon} className={'rounded-[8px]'} fbSize={40}></FbAvatar>
              <div className={'ml-[12px] text-sm text-[var(--fg-b100)]'}>{item.name}</div>
            </li>
          )}
        />
      ),
    },
    {
      key: 'friend',
      label: '共同好友',
      children: (
        <List
          className={'w-full pb-[8px]'}
          dataSource={friends}
          locale={{
            emptyText: <EmptyUI title={'暂时没有共同好友哦'}></EmptyUI>,
          }}
          renderItem={item => (
            <div className={'f mx-[12px] flex h-[64px] cursor-pointer items-center justify-start rounded-[4px] px-[12px] hover:bg-[var(--fg-b5)]'}>
              <FbAvatar src={item.avatar} fbRadius={30} fbSize={40}></FbAvatar>
              <div className={'ml-[12px]'}>
                <div className={' text-sm text-[var(--fg-b100)]'}>{item.nickname}</div>
                {/*<div className={' mt-[2px] text-xs text-[var(--fg-b60)]'}>ID: {item.username}</div>*/}
              </div>
            </div>
          )}
        />
      ),
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between">
        <UserProfile
          avatar={user.avatar}
          nickname={user.nickname}
          gender={user.gender}
          username={user.username}
          bot={user.bot}
          remark={user.remark}
          className={'mt-[6px] p-[24px]'}
        ></UserProfile>
        <div className="mr-[16px] flex items-center justify-center gap-[16px]">
          {isFriend ?
            isCanDm && (
              <Button size={'large'} shape={'round'} type={'primary'} className="btn-middle" onClick={handleDMClick}>
                私信
              </Button>
            )
          : isCanAddFriend && (
              <Button size={'large'} shape={'round'} type={'primary'} className="btn-middle" onClick={handleAddFriendClick}>
                添加好友
              </Button>
            )
          }
          <UserMenuDropdown
            userId={user.user_id}
            guildId={guildId}
            isBot={user.bot}
            nickname={user.nickname}
            username={user.username}
            deletable={isFriend}
          >
            <HoverBox>
              <iconpark-icon name="More" class="cursor-pointer" size={18}></iconpark-icon>
            </HoverBox>
          </UserMenuDropdown>
        </div>
      </div>
      <Tabs
        className={'mb-4 h-[380px] w-[600px] overflow-hidden'}
        tabBarStyle={{ padding: '0 24px', marginBottom: 16 }}
        defaultActiveKey={defaultTab}
        items={items}
      />
    </>
  )
}
