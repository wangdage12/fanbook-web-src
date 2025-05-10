import { MessageContentStruct, MessageType } from 'fb-components/components/messages/types'
import AnswerCard from '../cards/AnswerCard'
import QuestionCard from '../cards/QuestionCard'
import { MessageCommonProps } from './type'

export interface QuestionShareContentStruct extends MessageContentStruct {
  invitation_code: string | null
  guild_id: string
  question_id: string
  title: string
  author_id: string
  author_name: string
}

export interface AnswerShareContentStruct extends QuestionShareContentStruct {
  answer_id: string
}

export interface QuestionShareMessageProps extends MessageCommonProps {
  message: QuestionShareContentStruct | AnswerShareContentStruct
}

export default function QuestionShareMessage({ message, isAdjacentToPrev = false, isAdjacentToNext = false }: QuestionShareMessageProps) {
  const share = {
    guildId: message.guild_id,
    questionId: message.question_id,
    answerId: (message as AnswerShareContentStruct).answer_id,
  }
  return message.type === MessageType.AnswerShare ?
      <AnswerCard
        share={share}
        className={`!rounded-r-[8px] ${isAdjacentToPrev ? '!rounded-tl-[2px]' : '!rounded-tl-[8px]'} ${
          isAdjacentToNext ? '!rounded-bl-[2px]' : '!rounded-bl-[8px]'
        }`}
      ></AnswerCard>
    : <QuestionCard
        share={share}
        className={`!rounded-r-[8px] ${isAdjacentToPrev ? '!rounded-tl-[2px]' : '!rounded-tl-[8px]'} ${
          isAdjacentToNext ? '!rounded-bl-[2px]' : '!rounded-bl-[8px]'
        }`}
      ></QuestionCard>
}
