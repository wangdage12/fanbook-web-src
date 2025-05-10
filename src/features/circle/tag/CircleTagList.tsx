import { CircleTagType, TagStruct } from 'fb-components/circle/types'
import HoverBox from 'fb-components/components/HoverBox'
import { GuildStruct } from 'fb-components/struct/GuildStruct'
import { isEqual } from 'lodash-es'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { circleActions, circleSelectors } from '../circleSlice'
import useHorizontalScroll from '../hooks/useHorizontalScroll'
import { showCircleTagDetailModal } from './CircleTagDetail'

function CircleTag({ tag, guildId }: { tag: TagStruct; guildId: string }) {
  const { tag_id, tag_name } = tag
  return (
    <span
      className="cursor-pointer text-sm py-1.5 px-3 bg-fgWhite1/60 rounded-full hover:bg-fgWhite1 active:bg-fgB5 border-[0.5px] border-fgB5"
      onClick={() => showCircleTagDetailModal({ tagId: tag_id, sourceGuildId: guildId, type: CircleTagType.Tag })}
    >
      #{tag_name}#
    </span>
  )
}

export function CircleTagList({ guild, className }: { guild: GuildStruct; className?: string }) {
  const dispatch = useAppDispatch()
  const listRef = useRef<HTMLDivElement>(null)
  const { isEndEdge, isStartEdge, canScroll, scrollToNext, scrollToPrev } = useHorizontalScroll(listRef)
  const recommendedTags = useAppSelector(circleSelectors.recommendTagList, isEqual)
  useEffect(() => {
    dispatch(circleActions.fetchCircleRecommendTagList({ guildId: guild.guild_id }))
  }, [])

  if (!recommendedTags || recommendedTags.length === 0) {
    return null
  }
  return (
    <div className={`w-full relative ${className} `}>
      <div ref={listRef} className={`flex gap-2 items-center overflow-auto whitespace-nowrap hide-scroll-bar ${canScroll ? 'mr-16' : ''}`}>
        {recommendedTags?.map(tag => <CircleTag key={tag.tag_id} tag={tag} guildId={guild.guild_id}></CircleTag>)}
      </div>
      <div
        className={`absolute h-full w-[50px] bg-[linear-gradient(90deg,#F3F4F5_0%,rgba(243,244,245,0)_100%)] left-0 bottom-0 ${
          isStartEdge ? 'hidden' : ''
        }`}
      ></div>
      <div
        className={`absolute h-full w-[50px] bg-[linear-gradient(90deg,rgba(243,244,245,0)_0%,#F3F4F5_100%)] right-14 bottom-0 ${
          isEndEdge ? 'hidden' : ''
        }`}
      ></div>
      <div className="absolute h-full bg-bgBg2 flex bottom-0 right-0 items-center justify-center">
        {canScroll ?
          <>
            <HoverBox size={28} disabled={isStartEdge} onClick={scrollToPrev}>
              <iconpark-icon name="Left" size={14}></iconpark-icon>
            </HoverBox>
            <HoverBox size={28} disabled={isEndEdge} onClick={scrollToNext}>
              <iconpark-icon name="Right" size={14}></iconpark-icon>
            </HoverBox>
          </>
        : null}
      </div>
    </div>
  )
}
