import FbToast from 'fb-components/base_ui/fb_toast/index'
import { SwitchType } from 'fb-components/struct/type'
import QuestionApi from './questionAPI.ts'

interface toggleLikeAttr {
  answerId?: string
  replyId: string
  questionId: string
  channelId: string
  isLike: SwitchType
}

export default class QuestionUtils {
  static async postLike(question_id: string, likeAnswerId: string, channel_id: string, isLiked: SwitchType): Promise<SwitchType> {
    isLiked === SwitchType.Yes ?
      await QuestionApi.forumLikeCancel({
        questionId: question_id,
        answerId: likeAnswerId,
        channelId: channel_id,
      })
    : await QuestionApi.forumLikeAdd({
        questionId: question_id,
        answerId: likeAnswerId,
        channelId: channel_id,
      })
    return isLiked === SwitchType.Yes ? SwitchType.No : SwitchType.Yes
  }

  static async toggleLike({ replyId, isLike, questionId, channelId }: toggleLikeAttr): Promise<0 | 1> {
    const updateIsLike = await this.postLike(questionId, replyId, channelId, isLike)
    const content = updateIsLike === SwitchType.Yes ? '已点赞' : '已取消点赞'
    FbToast.open({ content, key: 'like' })
    return updateIsLike
  }
}
