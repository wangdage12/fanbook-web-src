import { Button, Checkbox, Popover, Space } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import ExpandAnimation from 'fb-components/components/animation/ExpandAnimation.tsx'
import { QuestionTagStruct } from 'fb-components/question/types.ts'
import { intersectionWith } from 'lodash-es'
import { useEffect, useState } from 'react'
import { QuestionPostSort } from '../questionEntity'

function QuestionFilterItem({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex h-[28px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border px-[12px] py-[4px] ${
        active ?
          ' border-[rgba(25,140,254,0.3)] bg-[rgba(25,140,254,0.1)] text-[var(--fg-blue-1)]'
        : 'border-[transparent] bg-[rgba(26,32,51,0.05)] text-[var(--fg-b60)]'
      }`}
    >
      {children}
    </div>
  )
}

export enum QuestionPostStatus {
  All = 'all',
  Resolved = 'resolved',
  Unresolved = 'unresolved',
}

function QuestionTagPopover({
  tags,
  selected,
  onChange,
}: {
  tags: QuestionTagStruct[]
  selected: string[]
  onChange?: (selected: string[]) => void
}) {
  const [tempSelected, setTempSelected] = useState<string[]>(selected)
  const checkAll = tags.length === tempSelected.length
  const indeterminate = tempSelected.length > 0 && tempSelected.length < tags.length
  const [open, setOpen] = useState(false)
  const handleChange = (list: CheckboxValueType[]) => {
    setTempSelected?.(list as string[])
  }

  const onCheckAllChange = (evt: CheckboxChangeEvent) => {
    setTempSelected?.(evt.target.checked ? tags.map(tag => tag.tag_id) : [])
  }

  const handleConfirm = () => {
    onChange?.(tempSelected)
    setOpen(false)
  }
  const handleCancel = () => {
    setTempSelected?.(selected)
    setOpen(false)
  }

  useEffect(() => {
    setTempSelected(selected)
  }, [selected])

  const label = intersectionWith(tags, selected, (tag, id) => tag.tag_id === id)
    .map(tag => tag.name)
    .join('、')

  return (
    <Popover
      trigger={['click']}
      placement="bottomLeft"
      destroyTooltipOnHide
      open={open}
      onOpenChange={open => {
        setOpen(open)
        open && setTempSelected?.(selected)
      }}
      arrow={false}
      content={
        <div className="w-[240px]">
          <Space direction="vertical" className="max-h-[340px] w-full overflow-auto">
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
              全选
            </Checkbox>
            <Checkbox.Group value={tempSelected} onChange={handleChange}>
              <Space direction="vertical">
                {tags.map(tag => (
                  <Checkbox key={tag.tag_id} value={tag.tag_id}>
                    {tag.name}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Space>
          <div className="mt-[8px] flex items-center justify-end">
            <Button className="mr-[8px] min-w-[56px]" onClick={handleCancel}>
              取消
            </Button>
            <Button className="min-w-[56px]" type={'primary'} disabled={tempSelected.length === 0} onClick={handleConfirm}>
              确认
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex max-w-[calc(100%-52px)] cursor-pointer select-none items-center px-[8px] text-[var(--fg-b60)]">
        <span className="mr-[4px] inline-block max-w-[calc(100%-12px)] truncate">{selected.length > 0 ? label : '全部'}</span>
        <iconpark-icon name="Down"></iconpark-icon>
      </div>
    </Popover>
  )
}

export function QuestionFilter({
  className,
  sort = QuestionPostSort.Latest,
  status = QuestionPostStatus.All,
  selectedTags = [],
  tags = [],
  visible = false,
  onChange,
}: {
  className?: string
  sort?: QuestionPostSort
  status?: QuestionPostStatus
  selectedTags?: string[]
  tags?: QuestionTagStruct[]
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  onChange?: (sort: QuestionPostSort, status: QuestionPostStatus, selectedTags: string[]) => void
}) {
  const handleChange = (sort: QuestionPostSort, status: QuestionPostStatus, selectedTags: string[] = []) => {
    onChange?.(sort, status, selectedTags)
  }
  const handleReset = () => {
    handleChange(QuestionPostSort.Latest, QuestionPostStatus.All, [])
  }
  return (
    <ExpandAnimation condition={visible} transitionDuration={300}>
      <div className={`${className} overflow-hidden ${tags.length > 0 ? 'h-[184px]' : 'h-[144px]'}`}>
        <div className={'mx-[16px] mt-[10px] flex flex-col items-center rounded-[8px] bg-[var(--fg-white-1)] px-[12px] py-[4px]'}>
          {/* <div className="h-0 w-0 translate-x-[160px] translate-y-[-12px] border-b-[10px] border-l-[10px] border-r-[10px] border-b-[var(--fg-white-1)] border-l-transparent border-r-transparent"></div> */}
          <div className="my-[8px] flex h-[28px] w-full items-center gap-[8px]">
            <span className="flex-shrink-0 font-bold">排序：</span>
            <QuestionFilterItem active={sort === QuestionPostSort.Latest} onClick={() => handleChange(QuestionPostSort.Latest, status, selectedTags)}>
              最新发布
            </QuestionFilterItem>
            <QuestionFilterItem
              active={sort === QuestionPostSort.Earliest}
              onClick={() => handleChange(QuestionPostSort.Earliest, status, selectedTags)}
            >
              最早发布
            </QuestionFilterItem>
            <QuestionFilterItem active={sort === QuestionPostSort.Upvote} onClick={() => handleChange(QuestionPostSort.Upvote, status, selectedTags)}>
              最多同问
            </QuestionFilterItem>
          </div>
          <div className="my-[8px] flex h-[28px] w-full items-center gap-[8px]">
            <span className="font-bold">状态：</span>
            <QuestionFilterItem active={status === QuestionPostStatus.All} onClick={() => handleChange(sort, QuestionPostStatus.All, selectedTags)}>
              全部
            </QuestionFilterItem>
            <QuestionFilterItem
              active={status === QuestionPostStatus.Resolved}
              onClick={() => handleChange(sort, QuestionPostStatus.Resolved, selectedTags)}
            >
              已解决
            </QuestionFilterItem>
            <QuestionFilterItem
              active={status === QuestionPostStatus.Unresolved}
              onClick={() => handleChange(sort, QuestionPostStatus.Unresolved, selectedTags)}
            >
              未解决
            </QuestionFilterItem>
          </div>
          {tags.length > 0 ?
            <div className="my-[8px] flex h-[28px] w-full items-center gap-[8px]">
              <span className="font-bold">标签：</span>
              <QuestionTagPopover selected={selectedTags} tags={tags} onChange={selected => handleChange(sort, status, selected)} />
            </div>
          : null}
          <Button type={'link'} className="my-[8px] !h-5 self-end !p-0" onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>
    </ExpandAnimation>
  )
}
