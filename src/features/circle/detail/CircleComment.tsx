import { Divider } from 'antd'
import CircleCommentItem from 'fb-components/circle/CIrcleCommentItem.tsx'
import CircleDetailContext from 'fb-components/circle/CircleDetailContext.ts'
import { CircleActionType, CircleCommentItemStruct } from 'fb-components/circle/types.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { useContext } from 'react'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { CircleCommentMenuDropdown } from './CircleCommentMenuDropDown.tsx'
import CircleCommentReply from './CircleCommentReply.tsx'

export function CircleComment({
  data,
  authorId,
  highlightCommentId,
  onToggleLike,
  onReplyToggleLike,
  onDeleteReply,
  onDeleteComment,
  onCopy,
  onLoadReply,
}: {
  data: CircleCommentItemStruct
  authorId?: string
  highlightCommentId?: string
  onToggleLike?: () => void
  onReplyToggleLike?: (replyId: string, liked: SwitchType, likeId?: string) => void
  onDeleteReply?: (replyId: string) => void
  onDeleteComment?: () => void
  onCopy?: () => void
  onLoadReply?: () => void
}) {
  const currentGuildId = GuildUtils.getCurrentGuildId()
  const { comment } = data
  const { setReplyParams, buildAvatar, buildName } = useContext(CircleDetailContext)

  return (
    <div className={'mt-1 flex flex-col'} data-id={comment.comment_id}>
      <CircleCommentItem
        data={data}
        highlightCommentId={highlightCommentId}
        authorId={authorId}
        onReply={() => {
          setReplyParams({
            replying: data,
            replyType: CircleActionType.comment,
            commentId: comment.comment_id,
          })
        }}
        onToggleLike={onToggleLike}
        currentGuildId={currentGuildId}
        moreWrapper={children => (
          <CircleCommentMenuDropdown article={data} onDelete={onDeleteComment} onCopy={onCopy}>
            {children}
          </CircleCommentMenuDropdown>
        )}
        buildAvatar={buildAvatar}
        buildName={buildName}
      />
      {/*子评论*/}
      <CircleCommentReply
        data={data}
        authorId={authorId}
        highlightCommentId={highlightCommentId}
        onDeleteReply={replyId => onDeleteReply?.(replyId)}
        onLoadMore={onLoadReply}
        onReplyToggleLike={onReplyToggleLike}
      ></CircleCommentReply>
      {comment.reply_list && comment.reply_list.length < comment.comment_total && (
        <div
          className={'flex items-center cursor-pointer flex-row py-2 pl-[40px] text-[14px] text-sm font-medium leading-[20px] text-[var(--fg-b60)]'}
          onClick={() => {
            onLoadReply?.()
          }}
        >
          <div className={'w-6 h-[0.5px] overflow-hidden mr-2'}>
            <Divider className="my-0" />
          </div>
          展开{formatCount(comment.comment_total - comment.reply_list.length)}条回复
          <iconpark-icon name="Down" color={'var(--fg-b60)'}></iconpark-icon>
        </div>
      )}
      <div className={'ml-[40px] h-[0.5px] overflow-hidden'}>
        <Divider className="my-0" />
      </div>
    </div>
  )
}
