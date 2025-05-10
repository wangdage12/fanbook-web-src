import { Button, ButtonProps } from 'antd'
import clsx from 'clsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbTabs from 'fb-components/base_ui/fb_tabs'
import { TabLabel } from 'fb-components/base_ui/fb_tabs/TabLabel'
import FbToast from 'fb-components/base_ui/fb_toast'
import { TagStruct } from 'fb-components/circle/types'
import { useMemo, useState } from 'react'
import EmptyPage from '../../../components/EmptyPage'
import CircleApi from '../circle_api'

const LoadingButton = ({ onClick, children, ...restProps }: ButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleClick: React.MouseEventHandler<HTMLElement> = async evt => {
    try {
      setLoading(true)
      await onClick?.(evt)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button loading={loading} className="!h-[28px] flex-center" onClick={handleClick} {...restProps}>
      {children}
    </Button>
  )
}

interface CircleDetailTagManageProps {
  post_id: string
  validTags: TagStruct[]
  invalidTags: TagStruct[]
  onChange: (tags: TagStruct[]) => void
}

enum TabType {
  Valid = 'valid',
  Invalid = 'invalid',
}

function CircleDetailTagManage({ post_id, validTags, invalidTags, onChange }: CircleDetailTagManageProps) {
  const [innerValidTags, setInnerValidTags] = useState<TagStruct[]>(validTags)
  const [innerInvalidTags, setInnerInvalidTags] = useState<TagStruct[]>(invalidTags)
  const [selectedTab, setSelectedTab] = useState<TabType>(TabType.Valid)
  const items = useMemo(() => {
    return [
      {
        key: TabType.Valid,
        label: <TabLabel selected={selectedTab === TabType.Valid}>已生效话题</TabLabel>,
      },
      {
        key: TabType.Invalid,
        label: <TabLabel selected={selectedTab === TabType.Invalid}>已失效话题</TabLabel>,
      },
    ]
  }, [selectedTab])

  async function handleActivate(tag: TagStruct) {
    await CircleApi.deactivatedCircleTag(post_id, tag.tag_id)
    FbToast.open({ type: 'success', content: '话题已失效', key: 'tag-manage' })
    const _validTags = innerValidTags.filter(t => t.tag_id !== tag.tag_id)
    setInnerValidTags(_validTags)
    setInnerInvalidTags([...innerInvalidTags, tag])
    onChange(_validTags)
  }

  async function handleInactivate(tag: TagStruct) {
    await CircleApi.activateCircleTag(post_id, tag.tag_id)
    FbToast.open({ type: 'success', content: '话题已恢复', key: 'tag-manage' })
    setInnerInvalidTags(innerInvalidTags.filter(t => t.tag_id !== tag.tag_id))
    const _validTags = [...innerValidTags, tag]
    setInnerValidTags(_validTags)
    onChange(_validTags)
  }

  const isValid = selectedTab === TabType.Valid

  const message = isValid ? '当前动态暂无生效的话题' : '当前动态暂无失效的话题'
  const context = isValid ? '管理员可以将动态中的话题失效，让此动态\n不出现在对应话题中' : '管理员可以将已失效的话题恢复，成员即可\n正常查看此话题'

  const tags = isValid ? innerValidTags : innerInvalidTags

  return (
    <div className="flex flex-col h-[600px]">
      <FbTabs
        activeKey={selectedTab}
        onChange={key => setSelectedTab(key as TabType)}
        className={'[&_.ant-tabs-tab]:text-[14px] [&_.ant-tabs-tab]:pb-2 transition-all ease-in duration-500'}
        tabBarGutter={24}
        indicator={{ size: 24 }}
        tabBarClassName={clsx(['!mb-2 pb-2'])}
        items={items}
      />
      <div className="flex-1 overflow-auto mb-6">
        {tags.length > 0 ?
          tags.map(tag => (
            <div key={tag.tag_id} className="flex items-center justify-between py-[12px]">
              <div className="flex-1 truncate">#{tag.tag_name}#</div>
              <div>
                {isValid ?
                  <LoadingButton type="primary" onClick={async () => await handleActivate(tag)}>
                    失效
                  </LoadingButton>
                : <LoadingButton onClick={async () => await handleInactivate(tag)}>恢复</LoadingButton>}
              </div>
            </div>
          ))
        : <div className="mt-6">
            <EmptyPage message={message} context={context} />{' '}
          </div>
        }
      </div>
    </div>
  )
}

export function showCircleDetailTagManageModal(props: CircleDetailTagManageProps) {
  showFbModal({
    title: '话题管理',
    content: <CircleDetailTagManage {...props} />,
    width: 440,
    footer: null,
  })
}

export default CircleDetailTagManage
