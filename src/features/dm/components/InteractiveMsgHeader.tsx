import { Tabs, TabsProps } from 'antd'
import { TabLabel } from 'fb-components/base_ui/fb_tabs/TabLabel'
import { useContext, useEffect, useMemo } from 'react'
import { ChannelContainerContext, ChannelContainerContextData } from '../../home/ChannelContainer'
import { InteractiveType } from '../DMStruct'

import './interactive-msg.less'

export interface InteractiveMsgExtraInfo {
  activeKey?: InteractiveType
}

function InteractiveMsgHeader() {
  const contextValue = useContext<ChannelContainerContextData<InteractiveMsgExtraInfo> | undefined>(ChannelContainerContext)
  if (!contextValue) throw Error('ChannelHeader 必须在 ChannelContainer 下使用')
  const { changeExtraInfo, extraInfo = {} } = contextValue

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: InteractiveType.All.toString(),
        label: <TabLabel selected={extraInfo.activeKey === InteractiveType.All}>全部</TabLabel>,
      },
      {
        key: InteractiveType.CommentAt.toString(),
        label: <TabLabel selected={extraInfo.activeKey === InteractiveType.CommentAt}>评论与@</TabLabel>,
      },
      {
        key: InteractiveType.LikeCollect.toString(),
        label: <TabLabel selected={extraInfo.activeKey === InteractiveType.LikeCollect}>赞与收藏</TabLabel>,
      },
      {
        key: InteractiveType.Reward.toString(),
        label: <TabLabel selected={extraInfo.activeKey === InteractiveType.Reward}>打赏</TabLabel>,
      },
    ],
    [extraInfo]
  )
  const handleChange = (key: string | number) => {
    const activeKey = Number(key) as InteractiveType
    changeExtraInfo({ activeKey })
  }

  useEffect(() => {
    if (!extraInfo.activeKey) {
      handleChange(InteractiveType.All)
    }
  }, [])

  return (
    <Tabs
      activeKey={extraInfo.activeKey?.toString()}
      size="large"
      tabBarGutter={48}
      className="h-full w-full"
      indicatorSize={20}
      renderTabBar={(props, DefaultTabBar) => {
        return <DefaultTabBar {...props} className="interactive-msg-tab-bar h-[56px] before:!content-[none]"></DefaultTabBar>
      }}
      items={items}
      onChange={handleChange}
      destroyInactiveTabPane
    />
  )
}

export default InteractiveMsgHeader
