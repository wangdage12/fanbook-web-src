import { Button, Modal } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { useState } from 'react'
import AuthenticationIcon from '../../components/AuthenticationIcon'
import GuildUtils from '../guild_list/GuildUtils'
import QuestionnaireModal, { QuestionnaireType } from './QuestionnaireModal'
import './accept-modal.less'
import InviteApi, { InviteCodeInfo, Questionnaire, QuestionnaireQuestionWithAnswer } from './invite_api'

function showQuestionnaireModal({
  onTestConfirm,
  defaultAnswers,
  questionnaire,
  questionnaireHash = '',
  afterJoin,
}: {
  onTestConfirm: (params: {
    correctAnswer: number
    userAnswers: Record<number, string[]>
    questionnaire: Questionnaire
    questionnaireHash: string
    destroy: () => void
  }) => void
  afterJoin?: (isCancel?: boolean) => void
  defaultAnswers?: Record<number, string[]>
  questionnaire: Questionnaire
  questionnaireHash?: string
}) {
  // 开启测试题目
  const { destroy: close } = showFbModal({
    title: '加入申请',
    showCancelButton: false,
    showOkButton: false,
    onCancel: () => {
      close()
      afterJoin?.(true)
    },
    content: (
      <div style={{ minHeight: 440 - 66, maxHeight: 660 - 66 }} className={'flex flex-col'}>
        <QuestionnaireModal
          defaultAnswers={defaultAnswers}
          type={QuestionnaireType.Test}
          questionnaire={questionnaire}
          onConfirm={(correctAnswer, userAnswers) =>
            onTestConfirm({
              correctAnswer,
              userAnswers,
              questionnaire: questionnaire,
              questionnaireHash: questionnaireHash,
              destroy: close,
            })
          }
          destroy={() => {
            close()
            afterJoin?.()
          }}
        />
      </div>
    ),
  })
}

interface AcceptModalProps {
  inviteCode?: string
  guildInfo: GuildStruct
  destroy?: (joining?: boolean) => void
  afterJoin?: (isCancel?: boolean) => void
  // 可选参数，channel_id用来定位频道
  codeInfo?: InviteCodeInfo
  /**
   * 加入后是否自动跳转到社区
   */
  autoJumpToGuild?: boolean
}

export default function AcceptModal({ inviteCode, guildInfo, destroy, afterJoin, codeInfo, autoJumpToGuild = true }: AcceptModalProps) {
  const [confirmLoading, setConfirmLoading] = useState(false)
  const onCancel = () => {
    destroy?.()
    afterJoin?.(true)
  }
  const onConfirm = async () => {
    destroy?.(true)
    if (guildInfo.join) {
      // 已加入
      if (codeInfo?.channel_id && codeInfo?.channel_id != '0') {
        GuildUtils.gotoChannel(guildInfo.guild_id, codeInfo.channel_id).then()
      } else {
        GuildUtils.selectGuild(guildInfo.guild_id)
      }
      Modal.destroyAll()
      afterJoin?.()
      return
    }
    // 请求加入社区前的测试题
    setConfirmLoading(true)
    const veryInfoStruct = await InviteApi.getVerifyInfo(guildInfo.guild_id)
    const { test_questions_questionnaires, test_questions_questionnaires_hash } = veryInfoStruct.verify_info
    setConfirmLoading(false)
    if (test_questions_questionnaires && [1, 3].includes(guildInfo.verification_level)) {
      showQuestionnaireModal({
        onTestConfirm,
        afterJoin,
        questionnaire: test_questions_questionnaires,
        questionnaireHash: test_questions_questionnaires_hash,
      })
    } else {
      await GuildUtils.joinGuild(
        {
          guild_id: guildInfo.guild_id,
          channel_id: codeInfo?.channel_id == '0' ? undefined : codeInfo?.channel_id,
          c: inviteCode,
          toast: true,
        },
        autoJumpToGuild
      )
      afterJoin?.()
    }
  }

  async function onTestConfirm({
    questionnaire,
    userAnswers,
    questionnaireHash,
    destroy,
  }: {
    correctAnswer: number
    questionnaire: Questionnaire
    userAnswers: Record<number, string[]>
    questionnaireHash: string
    destroy: () => void
  }) {
    questionnaire.questions.map((e, i) => ((e as QuestionnaireQuestionWithAnswer).userAnswer = userAnswers[i]))
    const verifyRes = await InviteApi.verifyTest({
      guild_id: guildInfo.guild_id,
      test_questions_questionnaires: questionnaire,
      test_questions_questionnaires_hash: questionnaireHash,
      toast: true,
    })
    destroy()
    if (verifyRes.pass != 1) {
      const { destroy: close } = showFbModal({
        title: '加入申请',
        className: 'test-failed-modal',
        showCancelButton: false,
        showOkButton: false,
        onCancel: () => {
          close()
          afterJoin?.(true)
        },
        content: (
          <div className={'mb-4'}>
            <div className={'flex flex-col items-center justify-center pb-[68px] pt-[68px]'}>
              <iconpark-icon name="sad" size={48} color={'var(--fg-blue-1)'}></iconpark-icon>
              <div className={'mt-[24px] text-sm text-[var(--fg-b100)]'}>回答有误，请重新测试</div>
            </div>
            <div className="ant-modal-footer">
              <Button
                onClick={() => {
                  close()
                  afterJoin?.()
                }}
              >
                退出
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  close()
                  showQuestionnaireModal({
                    onTestConfirm,
                    afterJoin,
                    questionnaire,
                    questionnaireHash,
                    defaultAnswers: userAnswers,
                  })
                }}
              >
                重新测试
              </Button>
            </div>
          </div>
        ),
      })
    } else {
      await GuildUtils.joinGuild(
        {
          guild_id: guildInfo.guild_id,
          c: inviteCode,
          channel_id: codeInfo?.channel_id == '0' ? undefined : codeInfo?.channel_id,
          toast: true,
        },
        autoJumpToGuild
      )
      afterJoin?.()
    }
  }

  return (
    <>
      <div className={'flex rounded-[8px] bg-[var(--bg-bg-3)] p-[12px]'}>
        <FbAvatar fbRadius={8} width={40} src={guildInfo.icon} />
        <div className={'ml-[12px] flex flex-1 flex-col justify-center overflow-hidden'}>
          <div className={' flex items-center text-sm  text-[var(--fg-b100)]'}>
            <div className={'truncate'}> {guildInfo.name}</div>
            <AuthenticationIcon guild={guildInfo} className={'ml-1'} />
          </div>
          <div className={'mt-[4px] flex items-center text-xs text-[var(--fg-b60)]'}>{guildInfo.member_count} 位成员</div>
        </div>
      </div>
      <div className="ant-modal-footer my-5">
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={onConfirm} loading={confirmLoading}>
          {guildInfo.join ? '已加入该社区，点击进入' : '立即加入'}
        </Button>
      </div>
    </>
  )
}
