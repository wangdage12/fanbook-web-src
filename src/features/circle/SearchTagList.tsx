import clsx from 'clsx'
import FbTabs from 'fb-components/base_ui/fb_tabs'
import { TabLabel } from 'fb-components/base_ui/fb_tabs/TabLabel'
import { TagStruct } from 'fb-components/circle/types.ts'
import { isEmpty } from 'lodash-es'
import { useMemo } from 'react'

interface SearchTagListProps {
  tags: Pick<TagStruct, 'tag_id' | 'tag_name'>[]
  // 选择的tagId，-1:全部
  value: string | 'all'
  onChange: (tagId: string | 'all') => void
}

export function SearchTagList({ tags, value, onChange }: SearchTagListProps) {
  if (isEmpty(tags)) return null

  const items = useMemo(() => {
    return [
      {
        key: 'all',
        label: <TabLabel selected={value == 'all'}>全部</TabLabel>,
      },
      ...tags.map(tag => ({
        key: tag.tag_id,
        label: <TabLabel selected={value == tag.tag_id}>#{tag.tag_name}#</TabLabel>,
      })),
    ]
  }, [tags, value])

  return (
    <FbTabs
      activeKey={value}
      onChange={onChange}
      className={clsx([
        'w-full px-4 py-2 text-[16px] [&_.ant-tabs-tab]:text-[16px] [&_.ant-tabs-tab]:leading-[22px] transition-all ease-in duration-500',
      ])}
      tabBarGutter={24}
      indicator={{ size: 24 }}
      tabBarClassName={clsx(['[&_.ant-tabs-ink-bar]:!bottom-1 !mb-2 before:!content-none'])}
      items={items}
    />
  )
}
