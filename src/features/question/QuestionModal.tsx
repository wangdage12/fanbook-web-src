import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import { QuestionDetailFromCard } from './QuestionDetailFromCard.tsx'

interface QuestionModalProps {
  questionId?: string
  onClose?: () => void
}

function QuestionModal({ questionId, onClose }: QuestionModalProps) {
  return (
    <div className="h-[600px]">
      <QuestionDetailFromCard guildVisible questionId={questionId} onClose={onClose} />
    </div>
  )
}

export const showQuestionDetailModal = ({ questionId, onClose }: { questionId?: string; onClose?: () => void }) => {
  const modal = showFbModal({
    className: 'rounded-[8px]',
    width: 800,
    title: null,
    closable: false,
    content: (
      <QuestionModal
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
