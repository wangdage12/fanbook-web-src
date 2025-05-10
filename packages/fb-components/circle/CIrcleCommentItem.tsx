import { Inline, INLINES } from '@contentful/rich-text-types'
import { TopLevelBlock } from '@contentful/rich-text-types/dist/types/types'
import clsx from 'clsx'
import { useMemo } from 'react'
import HoverBox from '../components/HoverBox'
import FbImage from '../components/image/FbImage'
import LoadMore from '../components/LoadMore'
import { MediaPreviewItem, useMediaPreviewer } from '../components/previewer/MediaPreviewer'
import TenSizeTag from '../components/TenSizeTag'
import RichTextRenderer from '../rich_text/RichTextRenderer'
import { splitMediaAndBody } from '../rich_text/split'
import transformRichText from '../rich_text/transform_rich_text.ts'
import { EmbeddedAssetType, InlineEntryHyperlinkType } from '../rich_text/types'
import { formatCount } from '../utils/common'
import DateTimeUtils from '../utils/DateTimeUtils'
import { CircleCommentItemStruct, CircleComponentConfig } from './types'

type CircleCommentItemProps = {
  data: CircleCommentItemStruct
  highlightCommentId?: string
  secondFloor?: boolean
  authorId?: string
  /** 展示位置所在的服务器 id */
  currentGuildId?: string
  onToggleLike?: () => void
  onReply?: () => void
  moreWrapper?: (children: React.ReactElement, type?: string) => React.ReactNode
} & CircleComponentConfig

export default function CircleCommentItem({
  data,
  highlightCommentId,
  secondFloor,
  authorId,
  currentGuildId,
  onToggleLike,
  onReply,
  moreWrapper,
  buildName,
  buildAvatar,
}: CircleCommentItemProps) {
  const { comment, user } = data
  // images, video,
  const { body, images } = useMemo<{ body: TopLevelBlock[]; images: MediaPreviewItem[] }>(() => {
    const res = splitMediaAndBody(comment.content)
    const body = transformRichText(res.body)
    const newImages =
      'images' in res ?
        res.images.map<MediaPreviewItem>(e => {
          return {
            type: EmbeddedAssetType.Image,
            // 临时修复评论图片加载出裂图
            url: e.insert.source + '?123',
            width: e.insert.width,
            height: e.insert.height,
          }
        })
      : []
    // 在回复中插入回复的用户
    if (comment.quote_l2 && comment.reply_user_info) {
      const replyUser = comment.reply_user_info
      replyUser &&
        body[0].content.unshift(
          {
            nodeType: 'text',
            value: '回复',
            data: {},
            marks: [],
          },
          {
            nodeType: INLINES.ENTRY_HYPERLINK,
            value: '',
            marks: [{ type: 'remove_at_mark' }, { type: 'color', color: 'var(--fg-b40)' }],
            content: [],
            data: {
              type: InlineEntryHyperlinkType.MentionUser,
              text: replyUser.nickname,
              id: replyUser.user_id,
            },
          } as Inline,
          {
            nodeType: 'text',
            value: '：',
            data: {},
            marks: [],
          }
        )
    }

    return { body, images: newImages }
  }, [data])

  const mediaPreviewer = useMediaPreviewer()

  const moreBtn = (
    <HoverBox size={24} className={'hidden group-hover:block'} style={{ padding: 2 }}>
      <iconpark-icon size={20} name="More" color={'var(--fg-b40)'} />
    </HoverBox>
  )

  const { like_total, liked, created_at, geo_region, comment_id } = comment
  // 最大行数为屏幕高度的 1/3
  const maxLines = 5

  function onPreview() {
    mediaPreviewer?.open({ medias: images ?? [] })
  }

  return (
    <div
      className={clsx([
        'circle-comment-item group flex gap-2 py-2',
        secondFloor ? 'pl-10' : 'pl-0',
        highlightCommentId === comment_id && 'highlight',
      ])}
    >
      {user && buildAvatar(user, secondFloor ? 24 : 32)}
      <div className={' flex flex-1 flex-col'}>
        {/*用户信息行*/}
        <div className={'flex h-5 gap-2'}>
          <div className={'flex flex-1 flex-col justify-between'}>
            <div className={'text-[14px] leading-[20px] text-[var(--fg-b60)]'}>
              {user && buildName(user)}
              {user?.user_id === authorId && <TenSizeTag color="gray" className="ml-[4px] flex-shrink-0" text="作者" />}
            </div>
          </div>
          {moreWrapper?.(moreBtn) ?? moreBtn}
        </div>

        <div className={clsx(['question-answer-text mt-1 break-words text-sm'])}>
          <LoadMore textMode={{ maxLines, lineHeight: 22 }} className={'text-sm'} expandBtnClassName={'text-sm'}>
            <RichTextRenderer data={body} guildId={currentGuildId} />
          </LoadMore>
        </div>

        {/*图片展示*/}
        {(images ?? []).length > 0 && (
          <div className={'mt-1'}>
            {(images ?? []).map((e, i) => (
              <FbImage
                key={i}
                className={
                  'aspect-square !h-auto max-h-[124px] !w-auto max-w-[124px] cursor-zoom-in rounded-lg border-[0.5px] border-[var(--fg-b10)] object-cover'
                }
                src={e.url}
                onClick={onPreview}
              />
            ))}
          </div>
        )}

        <div className={'mt-1 text-xs text-[var(--fg-b40)]'}>
          <span>{DateTimeUtils.format(created_at)}</span>
          <span>&nbsp;{geo_region}</span>
        </div>

        {/*点赞、回复*/}
        <div className={'mt-3 flex select-none gap-4 py-0.5 text-xs font-medium text-[var(--fg-b60)]'}>
          <div className={'flex cursor-pointer items-center justify-center gap-[6px]'} onClick={onToggleLike}>
            <iconpark-icon name={liked ? 'HeartFill' : 'Heart'} color={liked ? 'var(--function-red-1)' : 'var(--fg-b60)'} size={14}></iconpark-icon>
            <span className={''}>{like_total > 0 ? formatCount(like_total) : '点赞'}</span>
          </div>
          <div className={'cursor-pointer'} onClick={onReply}>
            回复
          </div>
        </div>
      </div>
    </div>
  )
}
