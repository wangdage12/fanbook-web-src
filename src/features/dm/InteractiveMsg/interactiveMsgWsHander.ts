import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { matchPath } from 'react-router-dom'
import AppRoutes from '../../../app/AppRoutes'
import { store } from '../../../app/store'
import { latestMessageActions } from '../../latest_message/latestMessageSlice'
import { unreadActions } from '../../message_list/unreadSlice'
import { InteractiveMessageStruct, InteractiveWsStruct } from '../DMStruct'
import { dmActions, ensureChannelExists } from '../dmSlice'

const handleContent = (data: InteractiveWsStruct) => {
  data.content = safeJSONParse(data.content, {} as InteractiveMessageStruct)
  data.content.create_at = data.content.create_at ?? data.time.valueOf()
  data.content.message_id = data.content.message_id ?? data.message_id
  data.content.send_user_id = data.content.send_user_id ?? data.send_user_id
  data.content.user_id = data.content.user_id ?? data.user_id
}

export function handleInteractiveMessage({ data }: { data: InteractiveWsStruct }) {
  handleContent(data)
  ensureChannelExists(data)

  store.dispatch(
    latestMessageActions.update({
      timestamp: data.time.valueOf(),
      channelId: data.channel_id,
      messageId: data.message_id.toString(),
      desc: data.content.desc ?? '',
    })
  )

  const match = matchPath(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/:channelId`, location.pathname)

  const isCurrentChannel = match ? match.params.channelId === data.channel_id : false
  store.dispatch(
    unreadActions.increaseUnreadNum({
      channelId: data.channel_id,
      messageId: data.message_id.toString(),
      onlyShowDot: isCurrentChannel,
    })
  )

  if (isCurrentChannel) {
    // 新消息
    store.dispatch(dmActions.addInteractiveMsg(data.content))
  }
}
