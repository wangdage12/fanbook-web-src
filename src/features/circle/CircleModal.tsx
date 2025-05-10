import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { CircleContentStruct } from 'fb-components/circle/types.ts'
import CircleDetail from './detail/CircleDetail.tsx'
import { CircleActions } from './detail/CircleMenuDropdown.tsx'

export const showCircleDetailModal = ({
  guildId,
  groupKey,
  postId,
  targetCommentId,
  originDetail,
  onClose,
  ...props
}: {
  guildId?: string
  postId: string
  targetCommentId?: string
  originDetail?: CircleContentStruct
  groupKey?: string
  onClose?: () => void
} & CircleActions) => {
  const { destroy: close } = showFbModal({
    groupKey,
    uniqueKey: `${postId}-${targetCommentId ?? ''}`,
    className: 'rounded-[8px] !w-auto',
    title: null,
    closable: false,
    content: (
      <CircleDetail
        guildId={guildId}
        postId={postId}
        targetCommentId={targetCommentId}
        onClose={() => {
          close()
          onClose?.()
        }}
        {...props}
      ></CircleDetail>
    ),
    showCancelButton: false,
    showOkButton: false,
    onCancel: onClose,
  })
}
