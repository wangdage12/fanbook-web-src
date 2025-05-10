import clsx from 'clsx'
import FbTabs from 'fb-components/base_ui/fb_tabs'
import { TabLabel } from 'fb-components/base_ui/fb_tabs/TabLabel.tsx'
import { CircleSortType } from 'fb-components/circle/types'
import { useMemo } from 'react'

export function CircleTab({
  sortType,
  borderBottom = false,
  onChange,
  className,
}: {
  sortType: CircleSortType | undefined
  borderBottom?: boolean
  onChange: ((selectedTopicId: string) => void) | undefined
  className?: string
}) {
  const items = useMemo(() => {
    return [
      {
        key: CircleSortType.Recommend,
        label: <TabLabel selected={sortType === CircleSortType.Recommend}>推荐</TabLabel>,
      },
      {
        key: CircleSortType.Latest,
        label: <TabLabel selected={sortType === CircleSortType.Latest}>最新</TabLabel>,
      },
    ]
  }, [sortType])

  return (
    <FbTabs
      activeKey={sortType}
      onChange={onChange}
      className={clsx(['text-[16px] [&_.ant-tabs-tab]:text-base transition-all ease-in duration-500', borderBottom && 'border-b-[0.5px]', className])}
      tabBarGutter={24}
      tabBarClassName={clsx(['circle-tabs-tab-bar !mb-0 before:!content-none'])}
      items={items}
    />
  )
}
