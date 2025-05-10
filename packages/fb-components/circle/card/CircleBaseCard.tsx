import { isEmpty } from 'lodash-es'
import { CSSProperties, ReactNode, useMemo } from 'react'
import GuildFooterMark from '../../components/GuildFooterMark'
import Highlighter from '../../components/Highlighter'
import FbImage from '../../components/image/FbImage'
import { LimitSize } from '../../components/type'
import { fullLimitSize } from '../../components/utils'
import CosImageUtils from '../../utils/CosImageUtils'
import { checkIsLocalURL, formatCount } from '../../utils/common'
import useCoverImage from '../hooks/useCoverImage'
import { CircleContentStruct, PostType } from '../types'
import CircleSkeleton from './skeleton/CircleSkeleton'

interface CircleValidContentProp {
  detail: CircleContentStruct
  isOtherGuild?: boolean
  isPined?: boolean
  limitSize?: LimitSize
  displaySize?: LimitSize
  keyword?: string
  authorAvatar?: ReactNode
  authorName?: ReactNode
  onClick?: (detail: CircleContentStruct) => void
}

const ValidContent = ({
  detail,
  isPined = false,
  isOtherGuild = false,
  authorAvatar,
  authorName,
  limitSize = { max: { width: 708, height: 282 }, min: { width: 220, height: 40 } },
  displaySize = limitSize,
  keyword,
  onClick,
}: CircleValidContentProp) => {
  const { parse_post, user, guild, sub_info, post } = detail
  const { post_type } = post

  const { cover, title, content } = parse_post ?? {}
  const _title = isEmpty(title) ? content : title
  const _content = isEmpty(content) ? title : content
  const { align, ratio } = useCoverImage(cover)
  const normalizedLimitSize = fullLimitSize(limitSize, 0, Infinity)
  const normalizedDisplaySizeSize = fullLimitSize(displaySize, 0, Infinity)

  function getThumbnailUrl() {
    if (!cover?.source) return ''
    if (checkIsLocalURL(cover.source)) return cover.source
    const { width: limitWidth, height: limitHeight } = normalizedLimitSize.max
    const isLongImage = align === 'top'
    if (isLongImage) {
      const { width } = cover
      // 严格的说，这里还差一个缩小，不过需要同时做这两种操作的情况比较罕见，先不管
      return CosImageUtils.cut(cover.source, width, width / ratio, 0, 0)
    } else {
      return CosImageUtils.thumbnailMin(cover.source, limitWidth, limitHeight)
    }
  }

  return (
    <div className={'cursor-pointer'} onClick={() => onClick?.(detail)}>
      {cover?.source ?
        <div className="relative flex w-full items-center justify-center">
          {isPined ?
            <span className="absolute right-[8px] top-[8px] z-10 flex rounded-full bg-[var(--fg-widget)] px-[6px] py-[1px] text-[12px] font-bold text-[var(--fg-white-1)]">
              置顶
            </span>
          : null}
          {!isPined && post_type === PostType.video ?
            <div className={'absolute right-[8px] top-[8px] flex h-6 w-6 items-center justify-center rounded-full bg-[var(--fg-widget)]'}>
              <iconpark-icon name="Pause" size={10} color={'var(--fg-white-1)'} />
            </div>
          : null}
          <FbImage
            blurFadeIn={true}
            src={getThumbnailUrl()}
            fallback={
              <div className="line-clamp-3 flex h-full w-full items-center justify-center bg-[var(--bg-bg-1)] px-[24px] py-[40px] text-[var(--fg-b60)]"></div>
            }
            style={{
              maxWidth: normalizedDisplaySizeSize.max.width,
              maxHeight: normalizedDisplaySizeSize.max.height,
              minWidth: normalizedDisplaySizeSize.min.width,
              minHeight: normalizedDisplaySizeSize.min.height,
              aspectRatio: ratio,
              backgroundPosition: align,
            }}
          />
        </div>
      : <div className="line-clamp-3 flex aspect-[4/3] w-full items-center justify-center bg-[var(--bg-bg-1)] px-[24px] py-[40px] text-[var(--fg-b60)]">
          {_content}
        </div>
      }
      <div className={'p-[12px] text-[14px] leading-[22px]'}>
        {_title && (
          <div className={'mb-[12px] line-clamp-2 font-medium'}>
            {keyword ?
              <Highlighter keyword={keyword} text={_title} prefixSize={10} />
            : _title}
          </div>
        )}
        <div className={'flex flex-row items-center'}>
          {authorAvatar}
          <span className={'ml-[4px] mr-[8px] flex-1 truncate text-xs text-[var(--fg-b60)]'}>{authorName ?? user?.nickname}</span>
          <iconpark-icon name="Heart" size={12} color="var(--fg-b40)" class="anticon"></iconpark-icon>
          {!!sub_info?.like_total && (
            <span className={'ml-[4px] flex-shrink-0 text-[12px] text-[var(--fg-b40)]'}>{formatCount(sub_info.like_total)}</span>
          )}
        </div>
        {isOtherGuild && guild && <GuildFooterMark data={guild}></GuildFooterMark>}
      </div>
    </div>
  )
}

const InvalidContent = () => {
  return <div className={'p-[10px] text-[16px] leading-[24px] text-[var(--fg-b40)]'}>分享的动态已被删除</div>
}

interface CircleBaseCardProp extends Partial<Omit<CircleValidContentProp, 'isOtherGuild'>> {
  loading?: boolean
  style?: CSSProperties
  className?: string
  currentGuildId?: string
  /** 是否隐藏服务器来源标识 */
  hiddenGuildOrigin?: boolean
}

function CircleBaseCard({
  detail,
  loading = false,
  style,
  className,
  limitSize,
  displaySize,
  currentGuildId,
  isPined = false,
  hiddenGuildOrigin = false,
  authorAvatar,
  authorName,
  keyword,
  onClick,
}: CircleBaseCardProp) {
  const isOtherGuild = useMemo(() => {
    return currentGuildId ? currentGuildId !== detail?.guild?.guild_id : false
  }, [currentGuildId, detail])
  return (
    <div style={style} className={`overflow-hidden rounded-lg bg-[var(--fg-white-1)] ${className}`}>
      {loading ?
        <CircleSkeleton />
      : !detail || detail?.deleted ?
        <InvalidContent />
      : <ValidContent
          detail={detail}
          limitSize={limitSize}
          displaySize={displaySize}
          isPined={isPined}
          isOtherGuild={hiddenGuildOrigin ? false : isOtherGuild}
          authorAvatar={authorAvatar}
          authorName={authorName}
          keyword={keyword}
          onClick={onClick}
        />
      }
    </div>
  )
}

export default CircleBaseCard
