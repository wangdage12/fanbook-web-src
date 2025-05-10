import { object, ObjectSchema, string } from 'yup'
import { BehaviorParams } from '../../components/with/routeCheck.tsx'
import { AuthUtils } from '../auth/utils.tsx'
import { showCircleDetailModal } from '../circle/CircleModal.tsx'
import { showCircleTagDetailModal } from '../circle/tag/CircleTagDetail.tsx'
import { InviteUtils } from '../invite/utils.tsx'
import { showAnswerDetailModal } from '../question/AnswerModal.tsx'
import { showQuestionDetailModal } from '../question/QuestionModal.tsx' // 首页路由参数相关业务场景

// 首页路由参数相关业务场景
enum BusinessScene {
  circle = 'circle',
  question = 'question',
  answer = 'answer',
  invite = 'invite',
  oauth = 'oauth',
  tag = 'tag',
}

// 圈子话题场景
const tagBusinessSchema = object({
  scene: string().oneOf(['tag']),
  id: string().required(),
  type: string().required(),
  guild_id: string(),
}).meta({ id: BusinessScene.tag })

// 圈子场景
const circleBusinessSchema = object({
  scene: string().oneOf(['circle']),
  post_id: string().required(),
}).meta({ id: BusinessScene.circle })

// 问答场景
const questionBusinessSchema = object({
  scene: string().oneOf(['question']),
  question_id: string().required(),
}).meta({ id: BusinessScene.question })

// 问答-答案场景
const answerBusinessSchema = object({
  scene: string().oneOf(['answer']),
  question_id: string().required(),
  answer_id: string().required(),
}).meta({ id: BusinessScene.answer })

// 邀请码场景
const inviteBusinessSchema = object({
  c: string().required(),
}).meta({ id: BusinessScene.invite })

// https://idreamsky.feishu.cn/docx/J3gVdA0HvokBsNxTRAQceJJRnSh
// 授权场景
const oauthBusinessSchema = object({
  // 邀请码
  invite_code: string().nullable(),
  // fanbook 账号授权业务 client_id
  client_id: string().required(),
  // 账号授权业务授权后的回调 scheme
  scheme: string().nullable(),
  // 账号授权业务后的回调 host
  host: string().nullable(),
  // 账号授权业务的 state
  state: string().nullable(),
}).meta({ id: BusinessScene.oauth })

const schemeList: ObjectSchema<any, any, any, any>[] = [
  circleBusinessSchema,
  questionBusinessSchema,
  answerBusinessSchema,
  oauthBusinessSchema,
  inviteBusinessSchema,
  tagBusinessSchema,
]

export async function handleHomeBusiness(params: BehaviorParams, onComplete: (type: BusinessScene, fields: string[]) => void) {
  let matchScheme: ObjectSchema<any, any, any, any> | undefined
  for (const m of schemeList) {
    try {
      await m.validate(params)
      matchScheme = m
      break
    } catch (e) {
      /* empty */
    }
  }
  if (!matchScheme) return
  const { id: scene } = matchScheme.meta() || {}
  const fields = Object.keys(matchScheme.fields)

  switch (scene) {
    case BusinessScene.circle: {
      const postId = params['post_id']
      showCircleDetailModal({
        postId: postId,
        onClose: () => {
          onComplete(scene, fields)
        },
      })
      break
    }

    case BusinessScene.tag: {
      const tagId = params['id']
      const type = params['type']
      const guildId = params['guild_id']
      showCircleTagDetailModal({
        tagId,
        type,
        sourceGuildId: guildId,
        onClose: () => {
          onComplete(scene, fields)
        },
      })
      break
    }

    case BusinessScene.question: {
      const { question_id } = params
      showQuestionDetailModal({ questionId: question_id, onClose: () => onComplete(scene, fields) })
      break
    }
    case BusinessScene.answer: {
      const { question_id, answer_id } = params
      showAnswerDetailModal({
        questionId: question_id,
        answerId: answer_id,
        onClose: () => onComplete(scene, fields),
      })
      break
    }

    case BusinessScene.invite: {
      const { c: inviteCode } = params
      const isValid = await InviteUtils.checkInviteCode({ inviteCode, needToast: true })
      isValid && (await InviteUtils.showAcceptModal({ inviteCode }))
      onComplete(scene, fields)
      break
    }
    case BusinessScene.oauth: {
      const { invite_code: inviteCode, client_id: clientId, scheme, host, state } = params
      // 存在邀请码，弹出邀请码弹窗
      if (inviteCode) {
        try {
          const isValid = await InviteUtils.checkInviteCode({ inviteCode, needToast: true })
          isValid && (await InviteUtils.showAcceptModal({ inviteCode }))
        } catch (err) {
          console.log(err)
        }
      }
      // 存在clientId，弹出授权弹窗
      if (clientId) {
        try {
          await AuthUtils.showAuthModal({ clientId, scheme, host, state })
        } catch (err) {
          console.log(err)
        }
      }
      onComplete(scene, fields)
      break
    }
  }
}
