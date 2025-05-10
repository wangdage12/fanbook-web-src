import { Button, Input, Tag } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { QuestionTagStruct } from 'fb-components/question/types.ts'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import EmptyPage from '../../../../components/EmptyPage.tsx'
import FormSection from '../../../../components/form/FormSection.tsx'
import LoadingScaffold from '../../../../components/form/LoadingScaffold.tsx'
import StringUtils from '../../../../utils/StringUtils.ts'
import QuestionApi from '../../../question/questionAPI.ts'
import { questionActions } from '../../../question/questionSlice.ts'
import { ChannelSettingsSubPageProps } from '../ChannelSettings.tsx'

export default function QuestionTagSettings({ value: channel }: ChannelSettingsSubPageProps) {
  const dispatch = useDispatch()
  const [userInput, setUserInput] = useState('')
  const [tags, setTags] = useState<QuestionTagStruct[]>([])
  const [createLoading, setCreateLoading] = useState(false)

  const MAX_TAG_LENGTH = 10

  async function fetch() {
    const tags = await QuestionApi.getQuestionTags(channel.channel_id)
    dispatch(questionActions.setTags(tags))
    return tags
  }
  async function handleCreate() {
    if (tags.length >= 20) {
      return FbToast.open({ type: 'warning', content: '最多只能创建20个标签哦' })
    }

    const name = userInput.trim()
    if (StringUtils.getVisualLength(name) > MAX_TAG_LENGTH) {
      return FbToast.open({ type: 'warning', content: '标签长度不能超过10个字符哦' })
    }

    setCreateLoading(true)
    const newTagId = await QuestionApi.createQuestionTag(channel.channel_id, name).finally(() => setCreateLoading(false))
    setTags(tags => {
      const newTags = [...tags, { tag_id: newTagId, name }]
      dispatch(questionActions.setTags(newTags))
      return newTags
    })
    setUserInput('')
  }
  function handleDelete(tag: QuestionTagStruct) {
    FbModal.error({
      title: '删除标签',
      content: '确定删除标签吗？删除后相关问题将解除与该标签的关联。',
      async onOk() {
        const remainingTags = tags.filter(t => t !== tag)
        await QuestionApi.deleteQuestionTag(channel.channel_id, tag.tag_id)
        FbToast.open({ type: 'success', content: '已删除标签' })
        setTags(remainingTags)
        dispatch(questionActions.setTags(remainingTags))
      },
    })
  }

  return (
    <LoadingScaffold fetch={fetch} onLoad={setTags}>
      <div className={'flex h-full flex-col gap-6 px-6 py-4'}>
        <div className={'flex gap-2 py-2'}>
          <Input
            value={userInput}
            count={{
              max: MAX_TAG_LENGTH,
              strategy: StringUtils.getVisualLength,
            }}
            maxLength={MAX_TAG_LENGTH}
            showCount={true}
            onChange={e => setUserInput(e.target.value)}
            onPressEnter={handleCreate}
            placeholder={'请输入问题标签'}
            className={'w-[240px] rounded-full'}
          />
          <Button disabled={!userInput.trim().length} type={'primary'} onClick={handleCreate} loading={createLoading}>
            创建
          </Button>
        </div>
        <FormSection className={'flex-1'} title={`当前标签（${tags.length}/20）`}>
          {tags.length ?
            <div className={'flex flex-wrap gap-y-2'}>
              {tags.map(tag => (
                <Tag
                  key={tag.tag_id}
                  closable={true}
                  bordered={false}
                  className={'px-4 py-1.5'}
                  closeIcon={<iconpark-icon name={'Close'} size={14} class={'translate-y-0.5'} />}
                  onClose={e => {
                    e.preventDefault()
                    handleDelete(tag)
                  }}
                >
                  {tag.name}
                </Tag>
              ))}
            </div>
          : <EmptyPage className={'pt-[120px]'} message={''} context={'暂无问题标签'} />}
        </FormSection>
      </div>
    </LoadingScaffold>
  )
}
