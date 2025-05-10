import CircleBaseCard from 'fb-components/circle/card/CircleBaseCard'
import { CircleContentStruct } from 'fb-components/circle/types.ts'
import { CSSProperties, useContext, useMemo } from 'react'
import { RealtimeAvatar, RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { showCircleDetailModal } from '../../circle/CircleModal.tsx'
import usePostDetail from '../../circle/hooks/usePostDetail'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { GuildContext } from '../../home/GuildWrapper'

interface CircleCardProp {
  share: string | CircleContentStruct
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
export default function CircleCard({ share, style, className = '' }: CircleCardProp) {
  const { loading, detail } = usePostDetail(share)
  const currentGuild = useContext(GuildContext)
  const { user, guild, parse_post, post } = detail ?? {}

  const needRender = useMemo(() => {
    if (typeof share !== 'string') return true
    if (guild?.guild_circle_view == 1) return true
    if (!guild) return false
    const guildId = guild?.guild_id ?? post?.guild_id
    return guildId ? GuildUtils.isInGuild(guildId) : false
  }, [share, detail])

  const onClick = (detail: CircleContentStruct) => {
    const postId = detail?.post.post_id
    if (!postId) return
    showCircleDetailModal({ postId, originDetail: detail })
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
      <CircleBaseCard
        style={style}
        className={`w-[220px] ${className}`}
        limitSize={limitSize}
        currentGuildId={currentGuild?.guild_id}
        detail={detail}
        loading={loading}
        onClick={onClick}
        authorAvatar={<RealtimeAvatar userId={user?.user_id || ''} size={16}></RealtimeAvatar>}
        authorName={<RealtimeNickname userId={user?.user_id || ''} guildId={currentGuild?.guild_id}></RealtimeNickname>}
      />
    : null
}
