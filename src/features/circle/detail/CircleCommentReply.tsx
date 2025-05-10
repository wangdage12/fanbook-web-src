import CircleCommentItem from 'fb-components/circle/CIrcleCommentItem.tsx'
import CircleDetailContext from 'fb-components/circle/CircleDetailContext.ts'
import { CircleActionType, CircleCommentItemStruct } from 'fb-components/circle/types.ts'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import { Op } from 'quill-delta'
import { useContext } from 'react'
import { copyText } from '../../../utils/clipboard.ts'
import { CircleCommentMenuDropdown } from './CircleCommentMenuDropDown.tsx'

interface CircleCommentReplyProps {
  data: CircleCommentItemStruct
  highlightCommentId?: string
  authorId?: string
  onDeleteReply?: (replyId: string) => void
  onReplyToggleLike?: (replyId: string, liked: SwitchType, likeId?: string) => void
  onLoadMore?: () => void
}

export default function CircleCommentReply({ data, highlightCommentId, authorId, onDeleteReply, onReplyToggleLike }: CircleCommentReplyProps) {
  const { comment } = data
  const { reply_list } = comment
  const { setReplyParams, buildName, buildAvatar } = useContext(CircleDetailContext)

  const onCopy = (content: Op[]) => {
    const text = richText2PlainText(transformRichText(content))
    copyText(text).then()
  }

  return (
    <>
      {reply_list?.map(reply => (
        <div key={reply.comment.comment_id} className={'flex flex-col'} data-reply-id={reply.comment.comment_id}>
          <CircleCommentItem
            data={reply}
            highlightCommentId={highlightCommentId}
            secondFloor
            authorId={authorId}
            onReply={() => {
              setReplyParams({
                replying: reply,
                replyType: CircleActionType.reply,
                commentId: comment.comment_id,
                replyId: reply.comment.comment_id,
              })
            }}
            onToggleLike={() => {
              const { comment_id, liked, like_id } = reply.comment
              onReplyToggleLike?.(comment_id, liked, like_id)
            }}
            moreWrapper={children => (
              <CircleCommentMenuDropdown
                article={data}
                onDelete={() => onDeleteReply?.(reply.comment.comment_id)}
                onCopy={() => onCopy(reply.comment.content)}
              >
                {children}
              </CircleCommentMenuDropdown>
            )}
            buildName={buildName}
            buildAvatar={buildAvatar}
          />
        </div>
      ))}
    </>
  )
}
