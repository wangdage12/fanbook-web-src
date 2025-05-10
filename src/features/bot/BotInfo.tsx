import { ReactNode, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { BotStruct } from './BotAPI'
import { getBotFromNet, selectBot } from './botSlice'

export default function BotInfo({ botId, children }: { botId: string; children: (bot: BotStruct) => ReactNode }) {
  const dispatch = useAppDispatch()
  const botInfo = useAppSelector(selectBot(botId))
  useEffect(() => {
    if (!botInfo) dispatch(getBotFromNet(botId))
  })
  if (!botInfo) return null
  return children(botInfo)
}
