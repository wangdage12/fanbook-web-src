import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { useEffect, useState } from 'react'
import { store } from '../../app/store'
import { guildListActions } from '../guild_list/guildListSlice'
import QuestionnaireModal, { QuestionnaireType } from './QuestionnaireModal'
import InviteApi, { Questionnaire, QuestionnaireQuestionWithAnswer, VerifyInfo } from './invite_api'

export function RoleQuestionnaireModal({ guildId, destroy }: { guildId: string; destroy: () => void }) {
  const [verifyInfo, setVerifyInfo] = useState<VerifyInfo | undefined>()
  useEffect(() => {
    InviteApi.getVerifyInfo(guildId).then(res => setVerifyInfo(res.verify_info))
  }, [])

  async function onRoleConfirm({
    questionnaire,
    destroy,
    userAnswers,
  }: {
    questionnaire: Questionnaire
    userAnswers: Record<number, string[]>
    destroy: () => void
  }) {
    questionnaire.questions.map((e, i) => ((e as QuestionnaireQuestionWithAnswer).userAnswer = userAnswers[i]))
    await InviteApi.verifyRole({
      guild_id: guildId,
      questionnaire_verification: questionnaire,
      toast: true,
    })
    store.dispatch(guildListActions.mergeGuild({ guild_id: guildId, user_pending: false }))
    destroy()
  }

  return (
    <div style={{ minHeight: 440 - 66, maxHeight: 660 - 66 }} className={'flex flex-col'}>
      {(() => {
        if (!verifyInfo)
          return (
            <div className={'flex min-h-[inherit] w-full items-center justify-center'}>
              <CircularLoading />
            </div>
          )
        return (
          <QuestionnaireModal
            type={QuestionnaireType.Role}
            questionnaire={verifyInfo.questionnaire_verification!}
            onConfirm={(correctAnswerNum, userAnswers) =>
              onRoleConfirm({
                questionnaire: verifyInfo.questionnaire_verification!,
                userAnswers,
                destroy,
              })
            }
            destroy={() => destroy()}
          />
        )
      })()}
    </div>
  )
}
