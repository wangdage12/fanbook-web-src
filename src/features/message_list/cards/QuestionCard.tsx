import QuestionBaseCard from 'fb-components/question/card/QuestionBaseCard'
import { CSSProperties, useCallback, useContext } from 'react'
import { RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { GuildContext } from '../../home/GuildWrapper'
import { showQuestionDetailModal } from '../../question/QuestionModal'
import { QuestionParams, useQuestionDetail } from '../../question/hooks'
import { useNeedRender } from './hooks'

interface QuestionCardProp {
  share: string | QuestionParams
  style?: CSSProperties
  className?: string
}

function QuestionCard({ share, style, className = '' }: QuestionCardProp) {
  const { loading, detail } = useQuestionDetail(share, true)
  const currentGuild = useContext(GuildContext)
  const { guild, channel, no_permission } = detail || {}

  const needRender = useNeedRender(typeof share === 'string', !no_permission, currentGuild?.guild_id, guild, channel)

  const onClick = useCallback(() => {
    showQuestionDetailModal({ questionId: detail?.question.question_id })
  }, [detail])

  return needRender ?
      <QuestionBaseCard
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

export default QuestionCard
