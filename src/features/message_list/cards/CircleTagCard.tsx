import CircleTagBaseCard from 'fb-components/circle/card/CircleTagBaseCard'
import { CircleTagDetailStruct, CircleTagType } from 'fb-components/circle/types.ts'
import { CSSProperties, useContext, useMemo } from 'react'
import useCircleTagDetail from '../../circle/hooks/useCircleTagDetail.ts'
import { showCircleTagDetailModal } from '../../circle/tag/CircleTagDetail.tsx'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { GuildContext } from '../../home/GuildWrapper.tsx'

interface CircleTagCardProp {
  share: string
  style?: CSSProperties
  className?: string
}

const CARD_MIN_WIDTH = 220
const CARD_MIN_HEIGHT = 100
const CARD_MAX_HEIGHT = (220 / 3) * 4
const CARD_MAX_WIDTH = (CARD_MAX_HEIGHT / 3) * 4

/**
 * 圈子卡片
 *
 * @param share 圈子参数，支持传圈子id、圈子链接、圈子结构体
 * @param style 样式
 */
export default function CircleTagCard({ share, style, className = '' }: CircleTagCardProp) {
  const { loading, error, detail } = useCircleTagDetail(share)
  const currentGuild = useContext(GuildContext)
  const { isEmpty, post: postDetail } = detail ?? {}
  const { guild, parse_post, post } = postDetail ?? {}

  const needRender = useMemo(() => {
    // if (typeof share !== 'string') return true
    if (isEmpty || error) return false
    if (guild?.guild_circle_view == 1) return true
    if (!guild) return false
    const guildId = guild?.guild_id ?? post?.guild_id
    return guildId ? GuildUtils.isInGuild(guildId) : false
  }, [share, detail, error])

  const onClick = (detail: CircleTagDetailStruct) => {
    const { tag_id, type = CircleTagType.Tag, guildId = currentGuild?.guild_id } = detail
    if (!tag_id) return
    showCircleTagDetailModal({ tagId: tag_id, sourceGuildId: guildId, type })
  }

  const limitSize = useMemo(() => {
    const { cover } = parse_post ?? {}
    if (!cover) {
      return
    }
    const maxWidth = cover.width >= cover.height ? CARD_MIN_WIDTH : CARD_MAX_WIDTH
    return { max: { width: maxWidth, height: CARD_MAX_HEIGHT }, min: { width: CARD_MIN_WIDTH, height: CARD_MIN_HEIGHT } }
  }, [detail])

  return needRender ?
      <CircleTagBaseCard
        style={style}
        className={`w-[220px] ${className}`}
        limitSize={limitSize}
        detail={detail}
        post={postDetail}
        loading={loading}
        onClick={onClick}
      />
    : null
}
