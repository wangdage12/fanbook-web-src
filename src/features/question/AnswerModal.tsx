import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import AnswerDetail from './AnswerDetail'

interface AnswerModalProps {
  guildId?: string
  questionId?: string
  answerId?: string
  onClose?: () => void
}

function AnswerModal({ questionId, answerId, onClose }: AnswerModalProps) {
  return (
    <div className="h-[600px]">
      <AnswerDetail guildVisible questionId={questionId} answerId={answerId} onClose={onClose} />
    </div>
  )
}

export default AnswerModal

export const showAnswerDetailModal = ({ questionId, answerId, onClose }: { questionId?: string; answerId?: string; onClose?: () => void }) => {
  const modal = showFbModal({
    className: 'rounded-[8px]',
    width: 800,
    title: null,
    closable: false,
    content: (
      <AnswerModal
        answerId={answerId}
        questionId={questionId}
        onClose={() => {
          modal.destroy()
          onClose?.()
        }}
      />
    ),
    footer: null,
    onCancel: onClose,
  })
}
