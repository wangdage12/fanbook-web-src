import clsx from 'clsx'
import CircleDetailContext from 'fb-components/circle/CircleDetailContext.ts'
import { CircleTagType, TagStruct } from 'fb-components/circle/types.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { useContext, useEffect, useState } from 'react'
import { showCircleTagDetailModal } from './CircleTagDetail.tsx'

interface CircleTagProps {
  guildId?: string
  tag: Pick<TagStruct, 'tag_id' | 'tag_name'>
  className?: string
}

const useIsValidTag = (tag: Pick<TagStruct, 'tag_id' | 'tag_name'>) => {
  const [isValid, setIsValid] = useState(false)
  const [checkable, setCheckable] = useState(true)
  const circleContext = useContext(CircleDetailContext)
  useEffect(() => {
    if (!circleContext || !circleContext.circleTagList) {
      setCheckable(false)
      return
    }
    setCheckable(true)

    const _tag = circleContext.circleTagList.find(tag => tag.tag_id === tag.tag_id)
    // _tag.status == SwitchType.No 封禁的标签不可点击
    const isInvalid = !circleContext.circleTagIds.includes(tag.tag_id) || !_tag || _tag.status == SwitchType.No
    setIsValid(!isInvalid)
  }, [circleContext, tag])
  return { isValid, checkable }
}

/**
 * 仅用于圈子文章详情页的话题标签
 */
export default function CircleArticleTag({ tag, guildId, className }: CircleTagProps) {
  const { tag_id, tag_name } = tag
  const { isValid, checkable } = useIsValidTag(tag)
  return (
    <span
      className={`message-inline-embed ${clsx({
        'text-[var(--fg-blue-1)]': isValid || !checkable,
        'cursor-pointer': isValid,
      })} ${className}`}
      onClick={checkable && isValid ? () => showCircleTagDetailModal({ tagId: tag_id, sourceGuildId: guildId, type: CircleTagType.Tag }) : undefined}
    >
      {tag_name}
    </span>
  )
}
