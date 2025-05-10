import { Inline, INLINES } from '@contentful/rich-text-types'
import clsx from 'clsx'
import { formatCount } from 'fb-components/utils/common'
import { useContext, useMemo, useState } from 'react'
import HoverBox from '../components/HoverBox'
import CosImage from '../components/image/CosImage'
import LoadMore from '../components/LoadMore'
import { useMediaPreviewer } from '../components/previewer/MediaPreviewer'
import TenSizeTag from '../components/TenSizeTag'
import RichTextRenderer from '../rich_text/RichTextRenderer'
import { splitMediaAndBody } from '../rich_text/split'
import transformRichText from '../rich_text/transform_rich_text.ts'
import { EmbeddedAssetType, InlineEntryHyperlinkType } from '../rich_text/types'
import DateTimeUtils from '../utils/DateTimeUtils'
import AnswerContext from './AnswerContext'
import useMediaForTextMode from './hooks/useMediaForTextMode'
import QuestionContext from './QuestionContext'
import { QuestionAnswerContentType, QuestionAnswerStruct } from './types'

interface QuestionAnswerItemProps {
  data: QuestionAnswerStruct
  onLike?: () => void
  onReply?: () => void
}

export default function QuestionAnswerItem({ data, onLike, onReply }: QuestionAnswerItemProps) {
  const context = useContext(QuestionContext)
  const answerContext = useContext(AnswerContext)
  const { element: mediaElement, body } = useMediaForTextMode(data.answer.content, data.answer.content_type)
  const moreBtn = (
    <HoverBox size={24}>
      <iconpark-icon size={20} name="More" color={'var(--fg-b40)'} />
    </HoverBox>
  )

  const { answer } = data
  const { like_count, reply_count, share_count, is_liked, created_at, geo_region } = answer

  const btns = [
    {
      type: 'like',
      icon: is_liked ? 'Like-Fill' : 'Like',
      className: is_liked ? 'text-[var(--fg-blue-1)] cursor-pointer' : 'cursor-pointer',
      label: formatCount(like_count, '点赞'),
      onClick: onLike,
    },
    { type: 'review', icon: 'Review', label: formatCount(reply_count, '回复'), onClick: onReply },
    { type: 'share', icon: 'ShareArrow', label: formatCount(share_count, '分享') },
  ]

  // 最大行数为屏幕高度的 1/3
  const maxHeight = Math.floor(window.screen.height / 3)
  const maxLines = Math.floor(maxHeight / 26)
  const richText = data.answer.content_type === QuestionAnswerContentType.RichText
  return (
    <div className={'flex flex-col'}>
      {/*用户信息行*/}
      <div className={'mb-1 mt-4 flex h-10 gap-2'}>
        {data.author && context.buildAvatar(data.author, 40)}
        <div className={'flex flex-1 flex-col justify-between'}>
          <div className={'text-[14px] leading-[20px]'}>
            {data.author && context.buildName(data.author)}
            {data.author?.user_id === context.author?.user_id && <TenSizeTag color="gray" className="ml-[4px] flex-shrink-0" text="题主" />}
          </div>
          <div className={'text-xs text-[var(--fg-b40)]'}>
            <span>{DateTimeUtils.format(created_at * 1000)}</span>
            <span>&nbsp;{geo_region}</span>
          </div>
        </div>
        {answerContext.moreWrapper?.(moreBtn) ?? moreBtn}
      </div>

      <div className={clsx(['break-words pt-1 text-base', richText ? 'question-answer-rich message-rich-text' : 'question-answer-text'])}>
        <LoadMore
          textMode={richText ? undefined : { maxLines, lineHeight: 26 }}
          heightMode={richText ? { maxHeight } : undefined}
          className={'text-base'}
        >
          <RichTextRenderer data={body} guildId={data.answer.guild_id} />
        </LoadMore>
      </div>

      {/*图片展示*/}
      {mediaElement}

      <div className={'flex gap-1'}>
        {!!answer.is_choose && <TenSizeTag className="mt-2 flex-shrink-0" text="推荐答案" />}
        {!!answer.is_questioner_liked && <TenSizeTag color="gray" className="mt-2 flex-shrink-0" text="题主赞过" />}
      </div>

      {/*点赞、评论、分享*/}
      <div className={'flex select-none py-3 font-medium text-[var(--fg-b60)]'}>
        {btns.map(item => {
          const btn = (
            <div key={item.type} onClick={item.onClick} className={'inline-flex w-[96px] cursor-pointer flex-row gap-1'}>
              <iconpark-icon name={item.icon} size={14} class={item.className} />
              <span className={'text-xs'}>{item.label}</span>
            </div>
          )
          return answerContext.btnsWrapper?.(btn, item.type) ?? btn
        })}
      </div>
    </div>
  )
}

type QuestionNestedAnswerItemProps = {
  data: QuestionAnswerStruct
  secondFloor?: boolean
  onReply?: () => void
  onLike?: (isLike: 0 | 1) => Promise<0 | 1>
  showReply?: boolean
  moreWrapper?: () => React.ReactNode
}
export const QuestionNestedAnswerItem = ({ data, secondFloor, onReply, onLike, showReply, moreWrapper }: QuestionNestedAnswerItemProps) => {
  const mediaPreviewer = useMediaPreviewer()
  const { body, images } = useMemo(() => {
    const res = splitMediaAndBody(data.answer.content)
    const body = transformRichText(res.body)
    // 在回复中插入回复的用户
    if (data.answer.reply_quote_l1 !== '0' && data.reply_user) {
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
            text: data.reply_user.nickname,
            id: data.reply_user.user_id,
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
    return {
      images: 'images' in res ? res.images : [],
      body,
    }
  }, [data])

  const filterImages = useMemo(() => {
    return images
      ?.filter(item => !!item.insert?.source)
      .map(item => {
        return {
          url: item.insert.source,
          type: EmbeddedAssetType.Image,
          width: item.insert.width,
          height: item.insert.height,
        }
      })
  }, [images])

  const context = useContext(QuestionContext)
  const [likeCount, setLikeCount] = useState<number>(data.answer.like_count)
  const [isLike, setIsLike] = useState<0 | 1>(data.answer.is_liked)

  return (
    <div className={clsx(['group mb-1 mt-2 flex gap-2', secondFloor && 'pl-10'])}>
      {data.author && context.buildAvatar(data.author, secondFloor ? 24 : 32)}
      <div className={'flex flex-1 flex-col'}>
        {/*名字行*/}
        <div className={'flex items-center gap-1.5'}>
          <div className={'text-[13px] leading-[18px] text-[var(--fg-b40)]'}>{data.author && context.buildName(data.author)}</div>
          {data.author?.user_id === context.author?.user_id && <TenSizeTag color="gray" className="ml-[4px] flex-shrink-0" text="题主" />}
          <div className={'ml-[auto] hidden group-hover:block'}>{moreWrapper?.()}</div>
        </div>

        <div
          className={clsx([
            'message-rich-text pt-1',
            secondFloor ? 'text-[14px]' : 'text-[15px]',
            data.answer.content_type === QuestionAnswerContentType.RichText ? 'question-nested-answer-rich' : 'question-nested-answer-text',
          ])}
        >
          <RichTextRenderer data={body} guildId={data.answer.guild_id} />
        </div>
        {filterImages.length > 0 && (
          <CosImage
            onClick={() => {
              mediaPreviewer?.open({
                medias: [filterImages[0]],
                initialIndex: 0,
              })
            }}
            className={'w-[200px] cursor-pointer rounded border-[0.5px] border-[var(--fg-b5)] object-cover'}
            src={filterImages[0].url}
            size={200}
          />
        )}

        <div className={'pt-1 text-xs text-[var(--fg-b40)]'}>
          <span>{DateTimeUtils.format(data.answer.created_at * 1000)}</span>
          <span>&nbsp;{data.answer.geo_region}</span>
        </div>

        {/*点赞、评论、分享*/}
        <div className={'flex select-none pb-2 pt-3 text-xs font-medium text-[var(--fg-b60)]'}>
          <div
            className={'flex cursor-pointer gap-1'}
            onClick={async () => {
              const res = await onLike?.(isLike)
              if (res === undefined) return
              setIsLike(res)
              setLikeCount(likeCount + (res === 1 ? 1 : -1))
            }}
          >
            <iconpark-icon name={isLike ? 'Like-Fill' : 'Like'} class={`${isLike ? 'text-[var(--fg-blue-1)]' : ''}`} />
            <span>{formatCount(likeCount, '点赞')}</span>
          </div>
          {showReply && (
            <div className={'cursor-pointer pl-3'} onClick={onReply}>
              回复
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
