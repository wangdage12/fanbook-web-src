import { useThrottle } from 'ahooks'
import { Input } from 'antd'
import clsx from 'clsx'
import { CircleChannelStruct, CircleSortType } from 'fb-components/circle/types.ts'
import { isNil } from 'lodash-es'
import { useContext } from 'react'
import PermissionBuilder from '../../../base_services/permission/PermissionBuilder.tsx'
import { ChannelPermission, GuildPermission, PostPermission } from '../../../services/PermissionService.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import openChannelSettings, { ChannelSettingType } from '../../guild_setting/sub_pages/index.tsx'
import { ChannelContainerContext, ChannelContainerContextData } from '../../home/ChannelContainer.tsx'
import { HeaderItem } from '../../home/ChannelHeader.tsx'
import { CircleExtraInfo } from '../circleEntity'
import { CircleTab } from './CircleTab.tsx'
import { PublishDropDownButton } from './PublishDropDownButton.tsx'
import './circle-tabs.less'

interface CircleTabsProps {
  channel?: CircleChannelStruct
  sortType?: CircleSortType
  onTabClick?: (key: string) => void
}

export default function CircleHeader({ sortType, channel, onTabClick }: CircleTabsProps) {
  const contextValue = useContext<ChannelContainerContextData<CircleExtraInfo> | undefined>(ChannelContainerContext)
  if (!contextValue) throw Error('缺少ChannelContainerContextData')
  const { extraInfo = { keyword: '' }, changeExtraInfo } = contextValue
  const throttledKeyword = useThrottle(extraInfo?.keyword ?? '', { wait: 500 })
  const guild = GuildUtils.getCurrentGuild()

  return (
    <div className={'flex flex-row w-full h-[56px] px-[16px] items-center border-b-[0.5px] border-solid border-b-[var(--fg-b10)]'}>
      {
        <div className={clsx(['flex-1 overflow-hidden'])}>
          <div className={clsx(['inline-flex flex-row transition-all duration-500 ease-out', throttledKeyword && 'translate-x-[-140px]'])}>
            <CircleTab
              sortType={sortType}
              onChange={onTabClick}
              className={clsx(['w-[140px] [&_.ant-tabs-tab]:py-4', isNil(throttledKeyword) && 'opacity-0'])}
            />
            <div
              className={clsx([
                'text-[16px] leading-[26px] text-[var(--fg-b40)] inline-flex items-center whitespace-nowrap transition-all duration-500 ease-in',
                !throttledKeyword && 'opacity-0',
              ])}
            >
              <span>圈子列表</span>
              <span className={'mx-1'}>/</span>
              <span className={'text-[var(--fg-b100)] font-bold'}>“{throttledKeyword}“</span>
            </div>
          </div>
        </div>
      }
      <div className={'flex gap-4'}>
        <Input
          className=" w-[240px] rounded-full"
          placeholder="搜索圈子动态"
          onChange={evt => changeExtraInfo({ keyword: evt.target.value })}
          allowClear
          prefix={<iconpark-icon name="Search" size={16} color="var(--fg-b40)"></iconpark-icon>}
        ></Input>
        {channel ?
          <>
            <PermissionBuilder
              permission={ChannelPermission.ChannelManager | PostPermission.CreatePost}
              guildId={channel.guild_id}
              channelId={channel.channel_id}
            >
              {allow => allow && guild && <PublishDropDownButton channelId={channel.channel_id} guild={guild} />}
            </PermissionBuilder>
            <PermissionBuilder
              permission={ChannelPermission.ChannelManager | GuildPermission.ManageCircle}
              guildId={channel.guild_id}
              channelId={channel.channel_id}
            >
              {allow =>
                allow && (
                  <HeaderItem
                    name={'设置'}
                    icon={'Setting'}
                    onClick={evt => {
                      evt.stopPropagation()
                      openChannelSettings({ channelId: channel.channel_id, type: ChannelSettingType.Circle })
                    }}
                  />
                )
              }
            </PermissionBuilder>
          </>
        : null}
      </div>
    </div>
  )
}
