import AnswerBaseCard from 'fb-components/question/card/AnswerBaseCard'
import { CSSProperties, useContext } from 'react'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { GuildContext } from '../../home/GuildWrapper'
import { showAnswerDetailModal } from '../../question/AnswerModal'
import { AnswerParams, useAnswerDetail } from '../../question/hooks'
import { useNeedRender } from './hooks'

interface AnswerCardProp {
  share: string | AnswerParams
  style?: CSSProperties
  className?: string
}

function AnswerCard({ share, style, className = '' }: AnswerCardProp) {
  const { loading, detail } = useAnswerDetail(share, true)
  const currentGuild = useContext(GuildContext)
  const { guild, channel, no_permission } = detail || {}

  const needRender = useNeedRender(typeof share === 'string', !no_permission, currentGuild?.guild_id, guild, channel)

  const onClick = () => {
    showAnswerDetailModal({ questionId: detail?.answer.question_id, answerId: detail?.answer.answer_id })
  }

  return needRender ?
      <AnswerBaseCard
        style={style}
        className={className}
        loading={loading}
        detail={detail}
        currentGuildId={currentGuild?.guild_id}
        onClick={onClick}
        authorName={<RealtimeNickname userId={detail?.author?.user_id || ''} guildId={currentGuild?.guild_id}></RealtimeNickname>}
      />
    : null
}

export default AnswerCard
