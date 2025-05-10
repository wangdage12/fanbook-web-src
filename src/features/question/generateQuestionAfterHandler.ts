import FbToast from 'fb-components/base_ui/fb_toast/index'
import { MessageType } from 'fb-components/components/messages/types.ts'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { ShareType } from '../../components/share/type'
import AnswerLinkHandler from '../../services/link_handler/AnswerLinkHandler.ts'
import QuestionLinkHandler from '../../services/link_handler/QuestionLinkHandler.ts'
import StateUtils from '../../utils/StateUtils'
import { copyText } from '../../utils/clipboard'
import MessageService from '../message_list/MessageService'
import { QuestionShareContentStruct } from '../message_list/items/QuestionShareMessage'
import QuestionApi from './questionAPI.ts'

export function generateQuestionAfterHandler({
  guildId: articleGuildId,
  questionId,
  answerId,
  authorId,
  authorName,
  content,
}: {
  guildId?: string
  questionId: string
  answerId?: string
  authorId: string
  authorName: string
  content: string
}) {
  return async (control: ShareType, extraParams?: { channelId: string; guildId: string; channelType: ChannelType }) => {
    switch (control) {
      case ShareType.Link: {
        try {
          const link =
            answerId ?
              AnswerLinkHandler.getShareLink({ guildId: articleGuildId, questionId, answerId })
            : QuestionLinkHandler.getShareLink({ guildId: articleGuildId, questionId })
          await copyText(link, '分享链接已复制，快去分享给好友吧。')
        } catch (err) {
          FbToast.open({ type: 'error', content: '分享链接复制失败，请重试。', key: 'share-link-failed' })
          console.error(err)
        }
        break
      }
      case ShareType.Channel: {
        const { channelId, guildId, channelType } = extraParams || {}
        if (!channelId || !guildId || channelType === undefined) {
          FbToast.open({ type: 'error', content: '分享至频道失败，请重试。', key: 'share-link-failed' })
          console.error(new Error('share channelId or guildId is empty'))
          break
        }
        try {
          const isShareAnswer = !!answerId
          await MessageService.instance.sendMessage(
            channelId,
            {
              type: isShareAnswer ? MessageType.AnswerShare : MessageType.QuestionShare,
              guild_id: articleGuildId,
              question_id: questionId,
              ...(isShareAnswer ? { answer_id: answerId } : {}),
              author_id: authorId,
              author_name: authorName,
              title: content,
              invitation_code: null,
            } as QuestionShareContentStruct,
            {
              guildId,
              channelType,
              desc: `${StateUtils.localUser.nickname}：分享了[${authorName}的${isShareAnswer ? '回答' : '问题'}]`,
            }
          )
          QuestionApi.increaseAnswerShareCount(answerId as string).catch(() => {
            /* ignore */
          })
          FbToast.open({ type: 'success', content: '分享至频道成功。', key: 'share-link-success' })
        } catch (err) {
          // 空值为取消分享
          if (!err) {
            return
          }
          FbToast.open({ type: 'error', content: '分享至频道失败，请重试。', key: 'share-link-failed' })
          console.error(err)
        }
        break
      }
      default:
        break
    }
  }
}
