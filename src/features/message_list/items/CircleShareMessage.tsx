import { CircleContentStruct } from 'fb-components/circle/types.ts'
import { MessageContentStruct } from 'fb-components/components/messages/types.ts'
import CircleCard from '../cards/CircleCard'
import { MessageCommonProps } from './type.ts'

export interface CircleShareContentStruct extends MessageContentStruct {
  invitation_code: string | null
  data: CircleContentStruct
}

export interface CircleShareMessageProps extends MessageCommonProps {
  message: CircleShareContentStruct
}

export default function CircleShareMessage({ message, isAdjacentToNext = false, isAdjacentToPrev = false }: CircleShareMessageProps) {
  return (
    <CircleCard
      share={message.data}
      className={`!rounded-r-[8px] ${isAdjacentToPrev ? '!rounded-tl-[2px]' : '!rounded-tl-[8px]'} ${
        isAdjacentToNext ? '!rounded-bl-[2px]' : '!rounded-bl-[8px]'
      }`}
    ></CircleCard>
  )
}
