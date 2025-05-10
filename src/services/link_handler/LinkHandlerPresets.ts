import AnswerLinkHandler from './AnswerLinkHandler.ts'
import BotLinkHandler from './BotLinkHandler.ts'
import CircleLinkHandler from './CircleLinkHandler.ts'
import CircleTagLinkHandler from './CircleTagLinkHandler.ts'
import DMLinkHandler from './DMLinkHandler.ts'
import MiniProgramLinkHandler from './MiniProgramLinkHandler.ts'
import QuestionLinkHandler from './QuestionLinkHandler.ts'
import WebsiteLinkHandler from './WebsiteLinkHandler.ts'

export default class LinkHandlerPresets {
  static #instance: LinkHandlerPresets

  private constructor() {}

  static get instance() {
    if (!this.#instance) this.#instance = new LinkHandlerPresets()
    return this.#instance
  }

  // common 预设为基本预设，app 所有链接处理都应该继承
  common = (() => {
    const handler = new MiniProgramLinkHandler()
    handler
      .setNext(new CircleLinkHandler())
      .setNext(new CircleTagLinkHandler())
      .setNext(new DMLinkHandler())
      .setNext(new QuestionLinkHandler())
      .setNext(new AnswerLinkHandler())
      .setNext(new WebsiteLinkHandler())
    return handler
  })()

  // bot 预设用于机器人相关链接处理
  bot = (() => {
    const handler = new BotLinkHandler()
    handler.setNext(this.common)
    return handler
  })()
}
