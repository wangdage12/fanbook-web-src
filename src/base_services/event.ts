import EventEmitter from 'eventemitter3'
import { Descendant } from 'slate'

export enum GlobalEvent {
  Logout = 'logout',

  InsertMention = 'insertMention',
  UserRem = 'UserRem',

  SetCurrentChatInput = 'setCurrentChatInput',
  BotRemovedFromChannel = 'botRemovedFromChannel',

  CircleCreatedPost = 'circleCreatedPost',
}

interface EventTypes {
  [GlobalEvent.Logout]: () => void
  [GlobalEvent.UserRem]: ({ userId, guildId }: { userId: string; guildId: string }) => void
  [GlobalEvent.BotRemovedFromChannel]: ({
    botId,
    guildId,
    channelId,
  }: {
    botId: string
    guildId: string
    // `channelId` 为 `undefined` 表示从社区移除机器人
    channelId?: string
  }) => void
  [GlobalEvent.InsertMention]: ({ userId, channelId }: { userId: string; channelId?: string }) => void
  [GlobalEvent.SetCurrentChatInput]: (content: Descendant[]) => void
  [GlobalEvent.CircleCreatedPost]: () => void
}

export const globalEmitter = new EventEmitter<EventTypes>()
