import { useRequest } from 'ahooks'
import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import HorizontalScrollWithButton from 'fb-components/components/HorizontalScrollWithButton.tsx'
import { ChannelStruct } from 'fb-components/struct/ChannelStruct.ts'
import { useEffect, useMemo, useState } from 'react'
import BotAPI from '../../bot/BotAPI.ts'
import BotCommandHandler from '../../bot/BotCommandHandler.ts'

interface ShortcutBarProps {
  channel: ChannelStruct | undefined
  dmBotId: string | undefined
}

export default function ShortcutBar({ channel, dmBotId }: ShortcutBarProps) {
  const [dmBotData, setDmBotData] = useState<Record<string, string>[] | undefined>()

  const bot_setting_list = useMemo(() => {
    // 如果有私聊机器人 ID
    if (dmBotData) {
      return dmBotData
    } else {
      return channel?.bot_setting_list
    }
  }, [channel, dmBotData])

  useEffect(() => {
    if (dmBotId) {
      BotAPI.getBot(dmBotId)
        .then(res => {
          const entriesData = res?.commands?.map(item => {
            return {
              [res.bot_id]: item.command,
            }
          })
          setDmBotData(entriesData)
        })
        .catch(error => {
          console.error('Failed to fetch bot data', error)
        })
    }
  }, [dmBotId])
  if (!bot_setting_list?.length) return null
  return (
    <HorizontalScrollWithButton listClassName={'gap-2 flex'} className={'mb-2'}>
      {bot_setting_list
        ?.map(e => Object.entries(e)[0])
        .map(([botId, commandName]) => <Command botId={botId} commandName={commandName} key={botId + commandName} />)}
    </HorizontalScrollWithButton>
  )
}

function Command({ botId, commandName }: { botId: string; commandName: string }) {
  const { data } = useRequest(BotAPI.getBot, {
    cacheKey: `/api/bot/getBot/${botId}`,
    staleTime: 5 * 60 * 1000,
    defaultParams: [botId],
  })

  const command = useMemo(() => {
    if (!data) return undefined
    return data.commands.find(command => command.command === commandName)
  }, [data])

  const handleClickCommand = () => {
    if (!command) return
    BotCommandHandler.exec(command, {
      bot: data,
    })
  }

  if (!data) return
  // 快捷指令和机器人不是同步的，可能会出现机器人已经删除了命令，但是快捷指令还在的情况
  if (!command) return

  return (
    <div
      className={'h-[30px] w-fit cursor-pointer flex justify-center items-center px-3 gap-1 bg-white/30 rounded-full border-[0.5px]'}
      onClick={handleClickCommand}
    >
      <FbAvatar src={data?.bot_avatar} fbSize={16} />
      <div className={'whitespace-nowrap'}>{commandName}</div>
    </div>
  )
}
