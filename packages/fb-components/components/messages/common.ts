import { MessageCommonProps } from './types'

export const CIRCLE_LINK_PATTERN = /https?:\/\/([a-zA-Z0-9-]+\.)?fanbook\.(cn|cc|mobi)\/circle\/([a-zA-Z0-9_]{2,20})(\?.*)?$/

export const QUESTION_LINK_PATTERN =
  /https?:\/\/([a-zA-Z0-9-]+\.)?fanbook\.(cn|cc|mobi)\/question\/([a-zA-Z0-9_]{2,20})\/([a-zA-Z0-9_]{2,20})(\?.*)?$/

export const ANSWER_LINK_PATTERN =
  /https?:\/\/([a-zA-Z0-9-]+\.)?fanbook\.(cn|cc|mobi)\/answer\/([a-zA-Z0-9_]{2,20})\/([a-zA-Z0-9_]{2,20})\/([a-zA-Z0-9_]{2,20})(\?.*)?$/

/**
 * 获取消息流的风格的样式
 */
export function getStreamStyle({ isAdjacentToPrev, isAdjacentToNext }: Pick<MessageCommonProps, 'isAdjacentToNext' | 'isAdjacentToPrev'>) {
  return `rounded-r-[12px] ${isAdjacentToPrev ? 'rounded-tl-[6px]' : 'rounded-tl-[12px]'} ${isAdjacentToNext ? 'rounded-bl-[6px]' : 'rounded-bl-[12px]'}`
}
