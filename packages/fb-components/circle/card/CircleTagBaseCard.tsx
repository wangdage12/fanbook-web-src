import { isEmpty } from 'lodash-es'
import { CSSProperties } from 'react'
import FbImage from '../../components/image/FbImage'
import { LimitSize } from '../../components/type'
import { fullLimitSize } from '../../components/utils'
import { SwitchType } from '../../struct/type'
import CosImageUtils from '../../utils/CosImageUtils'
import { checkIsLocalURL, formatCount } from '../../utils/common'
import useCoverImage from '../hooks/useCoverImage'
import { CircleContentStruct, CircleTagDetailStruct, PostType } from '../types'
import CircleSkeleton from './skeleton/CircleSkeleton'

interface CircleValidContentProp {
  detail: CircleTagDetailStruct
  post: CircleContentStruct
  isOtherGuild?: boolean
  limitSize?: LimitSize
  displaySize?: LimitSize
  onClick?: (detail: CircleTagDetailStruct) => void
}

const ValidContent = ({
  detail,
  post: postDetail,
  limitSize = { max: { width: 708, height: 282 }, min: { width: 220, height: 40 } },
  displaySize = limitSize,
  onClick,
}: CircleValidContentProp) => {
  const { tag_name, view_count } = detail
  const { parse_post, post } = postDetail
  const { post_type } = post
  const { cover, title, content } = parse_post ?? {}
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
          {post_type === PostType.video ?
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
      <div className={'p-[12px] text-[14px] flex-col flex'}>
        <div className={'mb-1 font-medium line-clamp-2'}>#{tag_name}#</div>
        <span className={'flex-shrink-0 text-[12px] text-[var(--fg-b40)]'}>{formatCount(view_count)} 次浏览的热门话题</span>
      </div>
    </div>
  )
}

const InvalidContent = () => {
  return <div className={'p-[10px] text-[16px] leading-[24px] text-[var(--fg-b40)]'}>分享的话题已被删除</div>
}

interface CircleBaseCardProp extends Partial<CircleValidContentProp> {
  loading?: boolean
  style?: CSSProperties
  className?: string
}

function CircleTagBaseCard({ detail, post, loading = false, style, className, limitSize, displaySize, onClick }: CircleBaseCardProp) {
  return (
    <div style={style} className={`overflow-hidden rounded-lg bg-[var(--fg-white-1)] ${className}`}>
      {loading ?
        <CircleSkeleton />
      : !detail || detail?.status === SwitchType.No ?
        <InvalidContent />
      : post ?
        <ValidContent detail={detail} post={post} limitSize={limitSize} displaySize={displaySize} onClick={onClick} />
      : null}
    </div>
  )
}

export default CircleTagBaseCard
