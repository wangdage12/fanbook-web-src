import MallCard, { MALL_LINK_PATTERN } from 'fb-components/link_cards/MallCard.tsx'
import { CSSProperties } from 'react'
import AnswerLinkHandler from '../../../services/link_handler/AnswerLinkHandler.ts'
import CircleLinkHandler from '../../../services/link_handler/CircleLinkHandler.ts'
import CircleTagLinkHandler from '../../../services/link_handler/CircleTagLinkHandler.ts'
import LinkHandlerPresets from '../../../services/link_handler/LinkHandlerPresets.ts'
import QuestionLinkHandler from '../../../services/link_handler/QuestionLinkHandler.ts'
import { INVITE_LINK_PATTERN } from '../../invite/utils'
import AnswerCard from '../cards/AnswerCard'
import CircleCard from '../cards/CircleCard'
import CircleTagCard from '../cards/CircleTagCard.tsx'
import InviteCard from '../cards/InviteCard'
import QuestionCard from '../cards/QuestionCard'

export enum LinkType {
  // 邀请卡片
  invite,
  // 商城分享卡片
  mall,
  // 圈子
  circle,
  // 圈子标签
  circleTag,
  // 问题
  question,
  // 回答
  answer,
  // 未支持
  unsupported,
}

export function parseLinkType(url: string) {
  if (INVITE_LINK_PATTERN.test(url)) {
    return LinkType.invite
  }
  if (MALL_LINK_PATTERN.test(url)) {
    return LinkType.mall
  }
  if (new CircleLinkHandler().canHandle(url)) {
    return LinkType.circle
  }
  if (new QuestionLinkHandler().canHandle(url)) {
    return LinkType.question
  }
  if (new AnswerLinkHandler().canHandle(url)) {
    return LinkType.answer
  }
  if (new CircleTagLinkHandler().canHandle(url)) {
    return LinkType.circleTag
  }
  return LinkType.unsupported
}

export default function LinkParser({ links, style = {} }: { links: string[]; style?: CSSProperties }) {
  if (links.length == 0) return null
  const linkType = parseLinkType(links[0])

  // 卡片基础样式
  const baseStyle: CSSProperties = {
    padding: [LinkType.circle, LinkType.circleTag].includes(linkType) ? 0 : 10,
    marginTop: 10,
    border: '0.5px solid rgba(26, 32, 51, 0.1)',
  }

  const url = links[0]
  switch (linkType) {
    case LinkType.invite:
      return <InviteCard url={url} style={{ ...baseStyle, ...style }} />
    case LinkType.mall:
      return (
        <MallCard
          url={url}
          style={{ ...baseStyle, ...style }}
          onClick={() => {
            LinkHandlerPresets.instance.common.handleUrl(url)
          }}
        />
      )
    case LinkType.circle:
      return <CircleCard share={url} style={{ ...baseStyle, ...style }} />
    case LinkType.circleTag:
      return <CircleTagCard share={url} style={{ ...baseStyle, ...style }} />
    case LinkType.question:
      return <QuestionCard share={url} style={{ ...baseStyle, ...style }} />
    case LinkType.answer:
      return <AnswerCard share={url} style={{ ...baseStyle, ...style }} />
    case LinkType.unsupported:
      return null
  }
}
