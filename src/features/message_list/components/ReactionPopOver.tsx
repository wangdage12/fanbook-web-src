import { EmojiPopOver } from 'fb-components/components/EmojiPanel'
import { MessageStruct } from 'fb-components/components/messages/types'
import MessageService from '../MessageService'

export function ReactionPopOver({ message, children }: { message: MessageStruct; children: React.ReactNode }) {
  function toggleReaction(name: string) {
    const reacted = message.reactions?.find(reaction => reaction.name === name)?.me
    MessageService.instance.userReactMessage(message.channel_id, message.message_id, reacted ? 'del' : 'add', name).then()
  }

  return (
    <EmojiPopOver rootClassName="reaction-popover" placement="top" onClick={toggleReaction}>
      {children}
    </EmojiPopOver>
  )
}
