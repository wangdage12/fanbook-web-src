import dayjs from 'dayjs'
import EventEmitter from 'eventemitter3'
import { default as FbToast, default as fb_toast } from 'fb-components/base_ui/fb_toast/index'
import {
  FileType,
  MessageContentStruct,
  MessageCurrentStatus,
  MessageStatus,
  MessageStruct,
  MessageType,
} from 'fb-components/components/messages/types.ts'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import ImageUtils from 'fb-components/utils/ImageUtils.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse.ts'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos.ts'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType.ts'
import CosUtils from 'fb-components/utils/upload_cos/utils.ts'
import { debounce, get, isEmpty, isNil, keyBy, last, mapValues, merge, uniqBy } from 'lodash-es'
import SplayTree from 'splaytree'
import { store } from '../../app/store'
import { BusinessError } from '../../base_services/interceptors/response_interceptor'
import Ws, { WsAction } from '../../base_services/ws'
import { UserStruct } from '../../components/realtime_components/realtime_nickname/UserAPI'
import { userActions } from '../../components/realtime_components/realtime_nickname/userSlice'
import { globalMentionEveryLimit } from '../../components/rich_text_editor/mention/MentionUserList.tsx'
import ServeSideConfigService from '../../services/ServeSideConfigService.ts'
import { LoadStatus } from '../../types'
import { convertSnowflakeToDate } from '../../utils/snowflake_generator'
import { InteractiveInfoStruct } from '../dm/DMStruct.ts'
import { ensureChannelExists } from '../dm/dmSlice.ts'
import Benefit from '../guild_level/Benefit.ts'
import { GuildLevelHelper } from '../guild_level/guild-level-slice.ts'
import GuildUtils from '../guild_list/GuildUtils'
import { LatestMessageHelper, LatestMessageStruct, latestMessageActions } from '../latest_message/latestMessageSlice'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { GuildUserUtils, guildUserActions } from '../role/guildUserSlice'
import MessageListAPI from './MessageListAPI'
import MessageUtils from './MessageUtils'
import config from './config'
import { jumpToMessage } from './hooks/useScrollManager.tsx'
import { ImageContentStruct } from './items/ImageMessage'
import { TextMessageContentStruct } from './items/TextMessage'
import { VideoContentStruct } from './items/VideoMessage'
import { PinAction, ReactionMessageAction } from './message_actions'
import parseMessage from './transformer'
import { ChannelUnreadMention, DMChannels, UnreadHelper, UnreadState, unreadActions } from './unreadSlice'

const SIZE_PER_PAGE = 50
const DELAY_TIME_FOR_RELEASE = 20 * 60000

export function getFileType(file: File) {
  const mimeType = file.type
  if (!mimeType) {
    return FileType.Unknown
  }
  if (mimeType.startsWith('image/')) {
    return FileType.Picture
  }

  if (mimeType.startsWith('video/')) {
    return FileType.Video
  }

  if (mimeType.startsWith('audio/')) {
    return FileType.Audio
  }

  const ext = file.name.split('.').pop() ?? ''
  if (
    [
      'doc',
      'dot',
      'wps',
      'wpt',
      'docx',
      'dotx',
      'docm',
      'dotm',
      'xls',
      'xlt',
      'et',
      'ett',
      'xlsx',
      'xltx',
      'xlsb',
      'xlsm',
      'xltm',
      'ets',
      'exc',
      'pptx',
      'ppt',
      'pot',
      'potx',
      'pps',
      'ppsx',
      'dps',
      'dpt',
      'pptm',
      'potm',
      'ppsm',
      'pdf',
    ].includes(ext)
  ) {
    return FileType.document
  }

  if (['jar', 'rar', 'zip'].includes(ext)) {
    return FileType.Zip
  }
  if (['apk'].includes(ext)) {
    return FileType.Apk
  }
  return FileType.Unknown
}

export interface MessageFileItem {
  url: string
  messageIds: Map<bigint, string>
  lastTime?: number
}

export interface SyncUpdateDataToServerStruct {
  action: WsAction.UpLastRead
  guild_id?: string
  channel_id: string
  // 表示已读的最后一条消息 ID
  read_id: string

  // 从服务端接收数据时表示未读数
  un_read?: number
}

interface SendMessageOptions {
  channelType: ChannelType
  guildId?: string | null
  /**
   * 此消息回复的消息，实际上只用到 quote_l1 和 quote_l2 字段
   */
  reply?: MessageStruct
  mentions?: string[]
  mention_roles?: string[]
  /**
   * 消息分享描述，如果有此字段，会覆盖消息内容的描述
   */
  desc?: string
  /**
   * contentType 只有文字类型的消息才需要传，这个参数会自动赋值，开发者无需关心
   * */
  ctype?: number
}

export enum MessageServiceEvent {
  UpdateList = 'update_list',
  UpdateMessage = 'update_message',
  UpdateReaction = 'update_reaction',
  RequestScrollToBottom = 'request_scroll_to_bottom',
}

/**
 * `MessageService` 提供诸如发送、接受消息，以及其他周边相关服务，例如同步未读数。
 */
export default class MessageService extends EventEmitter {
  // 列表 UI 是否在底部，如果在，收到新消息会自动滚动，这时不能增加未读数，虽然加了不会有 bug，但是频道未读数会闪一下
  static currentChannel = { channelId: '', atBottom: false }
  static instance: MessageService = new MessageService()

  private localFileUrlMap: Map<string, MessageFileItem> = new Map()

  // 存放本地还未发送成功的消息 id
  private localMessages = new Set<string>()

  private state: Record<
    string,
    {
      // 消息进入临时列表后，此处存放备份数据，从临时列表恢复后，备份数据删除
      backupMessages?: SplayTree<bigint, MessageStruct>
      messages: SplayTree<bigint, MessageStruct>
      historyStatus: LoadStatus
      // 消息列表后面的消息状态，在例如通过置顶跳转到历史消息时，列表底部也可以加载消息，如果值为 null，表示底部关闭了加载功能
      next: LoadStatus | undefined
    }
  > = {}

  private getChannelState(channelId: string) {
    if (!this.state[channelId])
      this.state[channelId] = {
        messages: new SplayTree(),
        historyStatus: LoadStatus.idle,
        next: undefined,
      }
    return this.state[channelId]
  }

  hasMorePreviousMessages(channelId: string) {
    return (this.getChannelState(channelId).messages.minNode()?.data as MessageStruct)?.content?.type !== MessageType.start
  }

  hasMoreNextMessages(channelId: string) {
    return this.getChannelState(channelId).next !== undefined
  }

  addMessages(channelId: string, messages: MessageStruct[]) {
    if (messages.length === 0) return

    const channel = this.getChannelState(channelId)
    for (const m of messages) {
      // 如果数据源是未经过处理的网络原始数据，需要进行一些解析
      parseMessage(m)
      channel.messages.add(m.message_id, m)
    }
    // 其他频道接收到消息后，如果大于阈值则进行截断，保证低内存占用
    if (channelId !== MessageService.currentChannel.channelId) {
      this.tryTrimMessages(channelId)
    }
    this.emit(MessageServiceEvent.UpdateList, channelId)

    const message = messages[messages.length - 1]
    store.dispatch(
      latestMessageActions.update({
        timestamp: message.time.valueOf(),
        channelId: channelId,
        reactions: Object.fromEntries((message.reactions ?? [])?.map(e => [e.name, e.count])),
        messageId: message.message_id.toString(),
        desc: message.desc ?? '',
      })
    )
  }

  addMessage(message: MessageStruct, fromOnlinePush = false) {
    // 如果数据源是未经过处理的网络原始数据，需要进行一些解析
    parseMessage(message)
    const { channel_id } = message
    const state = this.getChannelState(channel_id)
    // 在线收到的消息优先存入备份列表
    const messages = fromOnlinePush ? state.backupMessages ?? state.messages : state.messages
    // 检查此消息是不是本机发送的消息，如果是的话，需要更新消息 id
    if (message.nonce && this.localMessages.has(message.nonce)) {
      this.localMessages.delete(message.nonce)
      messages.remove(BigInt(message.nonce))
      messages.add(message.message_id, message)
    } else {
      messages.add(message.message_id, message)
    }
    // 其他频道接收到消息后，如果大于阈值则进行截断，保证低内存占用
    if (message.channel_id !== MessageService.currentChannel.channelId) {
      this.tryTrimMessages(message.channel_id)
    }
    this.emit(MessageServiceEvent.UpdateList, channel_id)
    store.dispatch(
      latestMessageActions.update({
        timestamp: message.time.valueOf(),
        channelId: channel_id,
        reactions: Object.fromEntries((message.reactions ?? []).map(e => [e.name, e.count])),
        messageId: message.message_id.toString(),
        desc: message.desc ?? '',
      })
    )
  }

  /**
   * 像服务端同步未读数，成功后其他设备能够同步已读状态，并且 Web 页面刷新后也能同步已读状态
   * 该函数可以安全频繁调用，防抖/时间为 1s，最多等待 5s 会同步一次
   *
   * @param channel_id
   * @param read_id     已读的最后一条消息 ID
   * @param guild_id    如果是私信可以不传
   */
  syncUnreadDataToServer(channel_id: string, read_id?: string, guild_id?: string) {
    const debounced = debounce(
      () => {
        read_id ??= this.getMessages(channel_id)?.max()?.toString()
        if (!read_id) return

        // console.assert(read_id != null, 'To synchronize the read status of a channel, there must be a message in the channel.')

        Ws.instance.send({
          action: WsAction.UpLastRead,
          channel_id,
          read_id,
          guild_id: guild_id === '0' ? null : guild_id,
        } as SyncUpdateDataToServerStruct as never)
      },
      1000,
      { maxWait: 5000 }
    )
    debounced()
  }

  updateMessageStatus(channelId: string, messageId: bigint, status: MessageCurrentStatus) {
    this.modifyMessage(channelId, messageId, message => {
      message.messageStatus = status
    })
  }

  recallMessage(channelId: string, messageId: bigint, performer: string) {
    this.modifyMessage(channelId, messageId, message => {
      this.decreaseUnreadCountCausedByRecall(message.guild_id, channelId, messageId)
      message.recall = performer
    })
  }

  private decreaseUnreadCountCausedByRecall(guildId: string | undefined, channelId: string, messageId: bigint) {
    const unreadStart = UnreadHelper.getUnreadStartId(guildId, channelId)
    if (unreadStart) {
      const unreadStartBigint = BigInt(unreadStart)
      // 如果撤回的消息在未读消息中
      if (messageId >= unreadStartBigint) {
        let newStartId = BigInt(unreadStart)
        // 如果撤回的消息就是第一条未读消息，需要把未读起始 id 后移
        if (messageId === unreadStartBigint) {
          const messages = this.getChannelState(channelId).messages
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const node = messages.find(messageId)!
          const nextMessageId = messages.next(node)?.data?.message_id
          if (nextMessageId) newStartId = BigInt(nextMessageId)
        }
        store.dispatch(
          unreadActions.decreaseUnreadNumWithoutCheck({
            guildId,
            channelId,
            distance: 1,
            newStartId,
          })
        )
      }
    }
  }

  // 删除消息会直接从内存里删掉，而不是通过标记位判断
  // 如果在内存里依然存在，而不是从数据中删除，有个问题是，消息的时间分割线是在上一条消息 UI 中显示的
  // 如果下一条消息删除了，不会更新上一条消息，导致了额外的时间分割线显示
  deleteMessage(guildId: string | undefined, channelId: string, messageId: bigint) {
    const { messages } = this.getChannelState(channelId)
    const message = messages.find(messageId)?.data as MessageStruct | undefined
    // 消息没被撤回，才需要减少未读数
    if (message) {
      if (!message.recall) {
        this.decreaseUnreadCountCausedByRecall(guildId, channelId, messageId)
      }
      messages.remove(messageId)
      this.emit(MessageServiceEvent.UpdateList, channelId)
    }
  }

  /**
   * 与 `reactMessage` 的区别是，这个函数是用户主动对消息进行表态，会进行网络请求，而 `reactMessage` 是纯数据层的操作，不会发起请求
   */
  async userReactMessage(channelId: string, messageId: bigint, action: 'add' | 'del', emojiName: string) {
    this.reactMessage({ action, channelId, targetMessageId: messageId, name: emojiName, me: true })
    try {
      if (action === 'add') {
        await MessageListAPI.addReaction(channelId, messageId.toString(), emojiName)
      } else {
        await MessageListAPI.deleteReaction(channelId, messageId.toString(), emojiName)
      }
    } catch (e) {
      if (e instanceof BusinessError) {
        const ALREADY_DELETED = 1059
        const ALREADY_REACTED = 5001

        const { code } = e
        // 如果是重复表态或者重复删除，不需要撤销更新
        if (code === ALREADY_DELETED || code === ALREADY_REACTED) return
        this.reactMessage({
          action: action === 'add' ? 'del' : 'add',
          channelId,
          targetMessageId: messageId,
          name: emojiName,
          me: true,
        })
      }
    }
  }

  reactMessage({ action, channelId, targetMessageId, name, me }: Omit<ReactionMessageAction, 'performer'>) {
    const { messages } = this.getChannelState(channelId)
    const message = messages.find(targetMessageId)?.data as MessageStruct | undefined
    if (!message) return
    if (!message.reactions) message.reactions = []
    if (action === 'add') {
      const item = message.reactions.find(e => e.name === name)
      if (item) {
        // 如果自己已经表态过了，再次表态无效，这种情况主要发生在本地用户主动发起表态时，
        // 客户端会立即更新数据，但是服务端会通过 ws 再次推送数据，导致重复触发此处代码
        if (!(item.me && me)) {
          item.count++
          item.me ||= me
        }
      } else {
        message.reactions.push({
          count: 1,
          me,
          name: name,
        })
      }
      this.emit(MessageServiceEvent.UpdateReaction, message, message)
    } else {
      const index = message.reactions.findIndex(e => e.name === name)
      if (index !== -1) {
        const item = message.reactions[index]
        // 如果之前就没有表态，现在又去取消表态，不需要处理。这种情况主要发生在本地用户主动发起表态时，
        // 客户端会立即更新数据，但是服务端会通过 ws 再次推送数据，导致重复触发此处代码
        if (!item.me && me) return

        item.count--
        // 如果 `me` 为 true，说明是自己取消表态，那么 `item.me` 就是 false
        item.me = !me
        if (item.count <= 0) {
          message.reactions.splice(index, 1)
        }
        this.emit(MessageServiceEvent.UpdateReaction, message, message)
      }
    }

    // 如果表态的是最后一条消息，需要更新最新消息描述
    if (
      message.message_id === messages.max() &&
      message.message_id.toString() === LatestMessageHelper.getLatestMessage(message.channel_id)?.messageId
    ) {
      store.dispatch(
        latestMessageActions.update({
          channelId: message.channel_id,
          messageId: message.message_id.toString(),
          reactions: Object.fromEntries(message.reactions.map(e => [e.name, e.count])),
        })
      )
    }
  }

  togglePin({ action, channelId, targetMessageId, performer }: PinAction) {
    this.modifyMessage(channelId, targetMessageId, message => {
      if (action === 'pin') {
        message.pin = performer
      } else {
        message.pin = undefined
      }
    })
  }

  modifyMessage(channelId: string, messageId: bigint, modifier: (message: MessageStruct) => void) {
    const { messages } = this.getChannelState(channelId)
    const message = messages.find(messageId)
    if (message) {
      modifier(message.data)
      this.emit(MessageServiceEvent.UpdateMessage, message.data)
    }
  }

  async sendMessage<T extends MessageContentStruct>(
    channelId: string,
    content: T,
    options: SendMessageOptions,
    asyncTaskBeforeSend?: (message: MessageStruct<T>) => Promise<void>,
    asyncTaskAfterSend?: (message: MessageStruct<T>, tempMessageId: bigint) => Promise<void>
  ) {
    const { channelType, guildId = '', reply, desc, ...rest } = options ?? {}
    const message = MessageUtils.createMessage<T>(channelId, channelType, content, guildId)
    message.messageStatus = MessageCurrentStatus.sending
    // 分享的描述跟消息外露描述有区别
    message.desc = desc ?? MessageUtils.toText(message)
    this.localMessages.add(message.message_id.toString())
    this.addMessage(message)
    this.emit(MessageServiceEvent.RequestScrollToBottom, channelId, true, 50)

    if (!isNil(reply)) {
      if (reply.quote_l1 == null && reply.quote_l2 == null) {
        message.quote_l1 = reply.message_id.toString()
      } else {
        message.quote_l1 = reply.quote_l1
        message.quote_l2 = reply.message_id.toString()
      }
    }

    try {
      await asyncTaskBeforeSend?.(message)
      const {
        data: {
          data: { message_id, status, time, extra_data },
          status: success,
        },
      } = await MessageListAPI.sendMessage(message, rest)

      if (!success) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Failed to send message')
      }

      store.dispatch(
        latestMessageActions.update({
          channelId,
          messageId: message_id,
          timestamp: time,
          desc: message.desc ?? '',
        })
      )

      store.dispatch(
        unreadActions.updateReceivedId({
          guildId,
          channelId,
          receivedId: message_id,
        })
      )

      const tempMessageId = message.message_id
      message.message_id = BigInt(message_id)

      message.time = dayjs(time)
      message.messageStatus = undefined
      message.extra_data = extra_data
      message.status = status

      const isDmMessage = message.channel_type && DMChannels.includes(message.channel_type)
      if (isDmMessage) {
        await ensureChannelExists(message)
      }

      await asyncTaskAfterSend?.(message, tempMessageId)
      // 如果消息有 extra_data 要展示，需要手动滚动一下，不然看不见
      if (extra_data) {
        this.emit(MessageServiceEvent.RequestScrollToBottom, channelId)
      }
      // status 为特殊值时，消息底部会有提示，这里直接使用 extra_data.type == custom 的情况去实现
      // 这两个功能实际上是有重合区域的，没必要实现两套逻辑
      if (!extra_data && status !== MessageStatus.normal) {
        generateExtraDataByStatus(message)
      }

      // 下面的代码用来测试 extra_data
      // message.extra_data = {
      //   type: 'stranger',
      //   data: {
      //     status: 0,
      //     from_user_id: '406375908358754304',
      //     send_msg_count: 1,
      //     msg_count: 1,
      //     max_msg_count: 3,
      //   },
      // }

      const { messages } = this.getChannelState(channelId)
      messages.remove(tempMessageId)
      messages.add(message.message_id, message)
      this.emit(MessageServiceEvent.UpdateMessage, message)
    } catch (e) {
      this.updateMessageStatus(message.channel_id, message.message_id, MessageCurrentStatus.failed)
      throw e
    }
  }

  async sendFile(channelId: string, file: File, options: SendMessageOptions) {
    let sizeLimit = ServeSideConfigService.upload_setting.size
    if (file.size > sizeLimit * 1024 * 1024) {
      fb_toast.open({ content: `最大支持${sizeLimit}MB` })
      return Promise.reject('Exceed the maximum size limit')
    }

    if (options.guildId) {
      const uploadMaxSize = Benefit.getUploadMaxSize(GuildLevelHelper.getLevel(options.guildId))
      // 优先使用社区的权益限制
      if (uploadMaxSize?.value) {
        sizeLimit = uploadMaxSize.value
      }
      if (file.size > (uploadMaxSize?.value ?? sizeLimit) * 1024 * 1024) {
        fb_toast.open({ content: `当前最高可上传${sizeLimit}M的文件` })
        return Promise.reject('Exceed the maximum size limit')
      }
    }

    const url = await UploadCos.getInstance().uploadFile({
      file,
      fileName: file.name,
      // 走 `fileType`，忽略 `type` 字段
      type: CosUploadFileType.unKnow,
      fileType: file.type.split('/')[0],
    })

    const md5 = last(url.split('/'))?.split('.')[0]

    return MessageService.instance.sendMessage(
      channelId,
      {
        type: MessageType.File,
        file_id: file.lastModified.toString(),
        file_name: file.name,
        file_url: url,
        file_type: getFileType(file) + 1,
        // file_ext: file.
        file_size: file.size,
        file_hash: md5,
        cloudsvr: 1,
        file_desc: '',
        updated: file.lastModified,
        client: 3, // web
      },
      {
        ...options,
        desc: `[文件] ${file.name}`,
      }
    )
  }

  async sendText(channelId: string, text: string, contentType = 0, options: SendMessageOptions) {
    text = text.trim()
    if (!text) return Promise.reject('invalid content')

    // 减少内存中记录的 @everyone 次数限制
    if (options?.guildId && options?.mention_roles?.includes(options?.guildId)) {
      if (options.guildId in globalMentionEveryLimit) {
        globalMentionEveryLimit[options.guildId].remain--
      }
    }

    return MessageService.instance.sendMessage(
      channelId,
      {
        type: MessageType.text,
        text,
        contentType,
      } as TextMessageContentStruct,
      { ctype: contentType, ...options }
    )
  }

  async sendImageOrVideo(channelId: string, files: File[], options: SendMessageOptions): Promise<void> {
    await Promise.all(
      files.map(file => {
        const fileType = file.type
        const category = fileType.split('/')[0]
        switch (category) {
          case 'image':
            this.sendImage(channelId, file, options)
            break
          case 'video':
            this.sendVideo(channelId, file, options)
            break
          default:
            FbToast.open({ content: '暂不支持该文件类型', key: 'send-image-or-video' })
            console.error(`Types are not supported ${fileType}`)
            break
        }
      })
    )
  }

  async sendExternalImage(channelId: string, src: string, options: SendMessageOptions): Promise<void> {
    const size = await ImageUtils.resolveNetworkImageSize(src)
    return MessageService.instance.sendMessage(
      channelId,
      {
        type: MessageType.image,
        fileType: MessageType.image,
        url: src,
        thumb: false,
        ...size,
      },
      options
    )
  }

  sendImage(channelId: string, file: File, options: SendMessageOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const uploadCos = UploadCos.getInstance()
      const currentUrl = URL.createObjectURL(file)
      CosUtils.verifyImageFile(file, currentUrl, { toast: true })
        .then(res => {
          let messageFileItem: MessageFileItem | undefined

          const imageContent: ImageContentStruct = {
            type: MessageType.image,
            fileType: MessageType.image,
            url: currentUrl,
            thumb: false,
            width: res.width ?? 0,
            height: res.height ?? 0,
            size: res.size,
            localFilePath: '',
            localIdentify: res.imageName,
            // 本地才有的属性
            localUrl: currentUrl,
          }
          // cdn加载可能有缓存导致加载失败，优先显示本地图片 本地才有的属性 设置为不可枚举 发送消息时转 json 字符串不会发送
          Object.defineProperty(imageContent, 'localUrl', {
            enumerable: false,
          })
          MessageService.instance
            .sendMessage(
              channelId,
              imageContent,
              options,
              async (message: MessageStruct<ImageContentStruct>) => {
                const md5 = await uploadCos.calculateMD5(file)
                messageFileItem = this.localFileUrlMap.get(md5)
                if (!messageFileItem) {
                  messageFileItem = { url: currentUrl, messageIds: new Map() }
                  this.localFileUrlMap.set(md5, messageFileItem)
                } else {
                  // 置换之前的文件路径
                  message.content.url = messageFileItem.url
                  message.content.localUrl = messageFileItem.url
                  URL.revokeObjectURL(currentUrl)
                }

                messageFileItem.lastTime = Date.now()
                messageFileItem.messageIds.set(message.message_id, message.channel_id)

                message.content.url = await UploadCos.getInstance().uploadFile({
                  type: CosUploadFileType.image,
                  file,
                  md5,
                })
              },
              async (message: MessageStruct<VideoContentStruct>, tempMessageId: bigint) => {
                if (messageFileItem) {
                  messageFileItem.lastTime = Date.now()
                  messageFileItem.messageIds.delete(tempMessageId)
                  messageFileItem.messageIds.set(message.message_id, message.channel_id)
                }
                this.startRevokeFileURL()
              }
            )
            .then(resolve)
            .catch(reject)
        })
        .catch(() => {
          // 验证不过释放掉
          URL.revokeObjectURL(currentUrl)
          reject()
        })
    })
  }

  sendVideo(channelId: string, file: File, options: SendMessageOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const uploadCos = UploadCos.getInstance()
      const currentUrl = URL.createObjectURL(file)
      CosUtils.verifyVideoFile(file, currentUrl, { toast: true })
        .then(res => {
          let messageFileItem: MessageFileItem | undefined
          const videoContent: VideoContentStruct = {
            type: MessageType.video,
            // 兼容
            filetype: MessageType.video,
            duration: res.duration,
            url: currentUrl,
            videoName: res.videoName,
            width: res.width ?? 0,
            height: res.height ?? 0,
            thumbUrl: res.localThumbUrl,
            thumbWidth: res.width,
            thumbHeight: res.height,
            /** web 获取不到本地地址 */
            // localPath: '',
            /** web 获取不到本地地址 */
            // localThumbPath: '',
            localIdentify: res.videoName,
            // 本地才有的属性
            localUrl: currentUrl,
            localThumbUrl: res.localThumbUrl,
          }
          // 本地才有的属性 设置为不可枚举 发送消息时转 json 字符串不会发送
          Object.defineProperty(videoContent, 'localUrl', {
            enumerable: false,
          })
          Object.defineProperty(videoContent, 'localThumbUrl', {
            enumerable: false,
          })
          Object.defineProperty(videoContent, 'localTime', {
            enumerable: false,
          })
          MessageService.instance
            .sendMessage(
              channelId,
              videoContent,
              options,
              async (message: MessageStruct<VideoContentStruct>) => {
                const md5 = await uploadCos.calculateMD5(file)
                messageFileItem = this.localFileUrlMap.get(md5)
                if (!messageFileItem) {
                  messageFileItem = { url: currentUrl, messageIds: new Map() }
                  this.localFileUrlMap.set(md5, messageFileItem)
                } else {
                  // 置换之前的文件路径
                  message.content.url = messageFileItem.url
                  message.content.localUrl = messageFileItem.url
                  URL.revokeObjectURL(currentUrl)
                }

                messageFileItem.lastTime = Date.now()
                messageFileItem.messageIds.set(message.message_id, message.channel_id)

                // cdn加载可能有缓存导致加载失败，优先显示本地图片
                message.content.url = await uploadCos.uploadFile({
                  type: CosUploadFileType.video,
                  file,
                  md5,
                })
                if (res.thumbFile) {
                  message.content.thumbUrl = await uploadCos.uploadFile({
                    type: CosUploadFileType.image,
                    file: res.thumbFile,
                    md5, // 复用视频的 md5 减少重复上传文件
                  })
                }
              },
              async (message: MessageStruct<VideoContentStruct>, tempMessageId: bigint) => {
                if (messageFileItem) {
                  messageFileItem.lastTime = Date.now()
                  messageFileItem.messageIds.delete(tempMessageId)
                  messageFileItem.messageIds.set(message.message_id, message.channel_id)
                }
                this.startRevokeFileURL()
              }
            )
            .then(resolve)
            .catch(reject)
        })
        .catch(() => {
          // 验证不过释放掉
          URL.revokeObjectURL(currentUrl)
          reject()
        })
    })
  }

  private revokeFileURLTimer: null | number = null

  /** 间隔 10 分钟 释放本地文件 URL */
  private startRevokeFileURL() {
    if (this.revokeFileURLTimer) {
      return
    }
    this.revokeFileURLTimer = window.setTimeout(() => {
      this.revokeFileURL()
    }, DELAY_TIME_FOR_RELEASE)
  }

  /** 释放本地文件 URL */
  private revokeFileURL() {
    const currentDate = Date.now()
    this.localFileUrlMap.forEach((messageFileItem, key) => {
      const { url, lastTime, messageIds } = messageFileItem
      // 未上传
      if (!lastTime) {
        return
      }
      // 已经距离发送消息成功已经过去 10 分钟
      if (currentDate - lastTime >= DELAY_TIME_FOR_RELEASE) {
        messageIds.forEach((channelId, messageId) => {
          const { messages } = this.getChannelState(channelId)
          const node = messages.find(messageId)
          if (!node) {
            return
          }
          const message = node.data as MessageStruct<VideoContentStruct>
          message.content.localUrl = undefined
          this.emit(MessageServiceEvent.UpdateMessage, message)
        })
        URL.revokeObjectURL(url)
        this.localFileUrlMap.delete(key)
      }
    })
    if (this.localFileUrlMap.size > 0) {
      this.startRevokeFileURL()
    }
  }

  async pullOfflineData(
    channelType: ChannelType,
    lastIdList: Record<string, { id: string | null; type: ChannelType }>,
    channelsShouldReturnUnread: Record<string, string[]>,
    guilds2channels?: Record<string, string[]>
  ) {
    const pullData = await MessageListAPI.pull(
      channelType,
      mapValues(lastIdList, e => e.id),
      channelsShouldReturnUnread,
      guilds2channels
    )
    console.debug('Pull data from server', pullData)

    const channelToGuild: Record<string, string> = mapValues(
      keyBy(merge({}, ...store.getState().guild.list.map(e => e.channels)), 'channel_id'),
      e => e.guild_id
    )
    const state: UnreadState = {}
    if (pullData?.channel_data) {
      for (const [channelId, messages] of Object.entries(pullData.channel_data)) {
        const guildId = channelToGuild[channelId] || '0'
        state[guildId] ??= {}

        // 有本地第一条已读消息的 ID 对比，如果有些数据在本地已经是已读了，那么未读数不应改重复累加
        let lastReadId = UnreadHelper.getLocalUnread(channelId, guildId)?.latestReadId
        const remoteLastReadId = get(pullData.read_lists, [guildId, 'channel_read_list', channelId])
        if (remoteLastReadId) {
          const remoteLastReadIdBigInt = BigInt(remoteLastReadId)
          // 如果本地已读消息 ID 比服务器的小，那么以服务器为准
          if (lastReadId && remoteLastReadIdBigInt > lastReadId) {
            lastReadId = remoteLastReadIdBigInt
          } else if (!lastReadId) {
            lastReadId = BigInt(remoteLastReadId)
          }
        }

        // 大于 lastReadId 的才是未处理过的消息
        if (lastReadId) {
          messages.entity = messages.entity?.filter(item => BigInt(item.message_id) > lastReadId)
          // 问答频道的未读数计算要排除自己的消息
          if (lastIdList[channelId].type === ChannelType.GuildQuestion) {
            messages.entity = messages.entity?.filter(item => item.user_id !== LocalUserInfo.userId)
          }

          messages.no_entity = messages.no_entity?.filter(
            // 非实体消息还需要多一个判断：如果他操作的消息是未处理过的消息才需要保留，这个主要是用来计算未读数的，已经处理的的没必要再计算未读
            // 否则数量会错。如果有 RESET 消息的操作，在有本地缓存的情况下是要处理的，但是 web 没有消息缓存，所以这里的非实体消息只处理了 RECALL 和 delete
            item => !isNil(item.operation_message_id) && BigInt(item.message_id) > lastReadId && BigInt(item.operation_message_id) >= lastReadId
          )
        }

        const recalledMessages = new Set()
        let numDecreased = 0
        // 为了让早操作的消息先被遍历到，需要倒序遍历，以便 recall 比 delete 早触发
        for (let i = (messages.no_entity?.length ?? 0) - 1; i >= 0; i--) {
          const item = messages.no_entity[i]
          if (item.m_type === 'RECALL') {
            recalledMessages.add(item.operation_message_id)
            numDecreased++
          }

          // 如果删除的消息已经被撤回了，就不需要计数了
          if (item.m_type === 'deleted' && !recalledMessages.has(item.operation_message_id)) {
            numDecreased++
          }
        }
        // 查找出 @ 自己的消息
        const mentions: ChannelUnreadMention[] =
          messages?.entity
            ?.filter(item => {
              const usersContainsMe = item.mentions?.includes(LocalUserInfo.userId)
              const rolesContainsMe: boolean =
                !!guildId &&
                item.mention_roles?.some(
                  role =>
                    // 角色 id 等于社区 id 就是 @所有人
                    role === guildId ||
                    // 检查角色 id 是否在用户的角色列表中
                    GuildUserUtils.getRoleIds(guildId, item.user_id).includes(role)
                )
              return usersContainsMe || rolesContainsMe
            })
            ?.map(item => {
              const mention: ChannelUnreadMention = {
                userId: item.user_id,
                messageId: item.message_id,
              }
              return mention
            }) ?? []

        const num = messages.entity?.length ?? 0

        if (num !== 0) console.debug(`Increased ${num} messages in channel ${channelId}`)
        if (numDecreased !== 0) console.debug(`Decreased ${numDecreased} messages in channel ${channelId}`)

        // 最新的消息 id 要从实体和非实体消息中取最大的，因为不确定最新的消息是实体消息还是非实体消息，否则会导致未读数错误
        const biggestEntityMessageId = BigInt(messages.entity?.[0]?.message_id ?? '0')
        const biggestNoEntityMessageId = BigInt(messages.no_entity?.[0]?.message_id ?? '0')
        const biggestMessageId = biggestEntityMessageId > biggestNoEntityMessageId ? biggestEntityMessageId : biggestNoEntityMessageId

        state[guildId][channelId] = {
          num: num - numDecreased,
          startId: num ? messages.entity[0].message_id : undefined,
          latestReadId: biggestMessageId === 0n ? undefined : biggestMessageId.toString(),
          mentions,
        }
      }
    }

    const parseLastMessageDesc = () => {
      if (!pullData.descs) return
      const result: Array<LatestMessageStruct & { channelId: string }> = []
      for (const [channelId, desc] of Object.entries(pullData.descs)) {
        try {
          const data: InteractiveInfoStruct = safeJSONParse(desc, {} as InteractiveInfoStruct)
          result.push({
            channelId,
            desc: data.desc,
            messageId: data.mid,
            reactions: {},
            timestamp: convertSnowflakeToDate(BigInt(data.mid)),
          })
        } catch (e) {
          const [messageId, message, ...rest] = desc.split('\t')
          if (!message) {
            // 曾经出现过 desc 内容为 '[呼叫]'，这种错误的格式是语音呼叫产生的，此消息已
            // 废弃，跳过即可
            continue
          }
          if (!isEmpty(rest)) continue

          const parts = message.split('::')
          // parts 的长度为 3 是群里，但是现在 web 不需要群里，其他长度 app 没有处理
          if (parts.length !== 1) continue
          // 旧格式
          result.push({
            channelId,
            desc: message,
            messageId,
            reactions: get(pullData.reactions, [channelId, 'emojis'], {}),
            timestamp: convertSnowflakeToDate(BigInt(messageId)),
          })
        }
      }

      store.dispatch(latestMessageActions.batchUpdate(result))
    }

    parseLastMessageDesc()

    store.dispatch(
      unreadActions.mergeUnreadData({
        merge: state,
        existingGuildsAndChannels:
          channelType === ChannelType.DirectMessage ?
            // 私信直接从 store 中取，因为它不存在不可见的频道，而且有些特殊的频道不需要拉未读数，比如社区通知频道，但是它是存在未读数的
            { '0': new Set(Object.values(store.getState().dm.channels).map(e => e.channel_id)) }
          : mapValues(channelsShouldReturnUnread, e => new Set(e)),
      })
    )
    Ws.instance.emit('pullFinished')
  }

  async loadBefore(channelId: string, loadLastPage?: boolean) {
    const channel = this.getChannelState(channelId)

    if (channel.historyStatus === LoadStatus.loading) return
    if (!this.hasMorePreviousMessages(channelId)) return

    const messageId = loadLastPage ? undefined : channel.messages?.min()
    console.info(`Load messages for channel ${channelId} before message id ${messageId}`)
    channel.historyStatus = LoadStatus.loading
    try {
      const newMessages = await MessageListAPI.fetchMessages(channelId, messageId as never, true, SIZE_PER_PAGE)
      channel.historyStatus = LoadStatus.idle
      this.addMessages(channelId, newMessages)
      return newMessages
    } catch (e) {
      channel.historyStatus = LoadStatus.idle
      return []
    }
  }

  async loadAfter(channelId: string) {
    const channel = this.getChannelState(channelId)

    if (channel.next === undefined) return
    if (channel.next === LoadStatus.loading) return

    const messageId = channel.messages?.max()
    console.info(`Load messages for channel ${channelId} after message id ${messageId}`)
    channel.next = LoadStatus.loading
    try {
      const newMessages = await MessageListAPI.fetchMessages(channelId, messageId as never, false, SIZE_PER_PAGE)
      if (newMessages.length) {
        channel.next = LoadStatus.idle
        this.addMessages(channelId, newMessages)
        this.tryMergeTemporaryMessages(channelId)
      } else {
        // 如果没有数据可以加载了，需要退出临时列表，并关闭加载下一页的能力
        console.info('[MessageService] No more messages to load, exit temporary list and disable load more.')
        channel.backupMessages = undefined
        channel.next = undefined
      }
      return newMessages
    } catch (e) {
      channel.next = LoadStatus.idle
      return []
    }
  }

  private tryMergeTemporaryMessages(channelId: string) {
    const channelState = this.getChannelState(channelId)
    if (!channelState.backupMessages) return
    const minInBackupList = channelState.backupMessages.min()
    if (!minInBackupList) return
    const maxInTempList = channelState.messages.max()
    if (!maxInTempList) return

    if (maxInTempList > minInBackupList) {
      console.info('[MessageService] Merge temporary list to current list.')
      channelState.backupMessages.forEach(message => {
        channelState.messages.add(message.key, message.data)
      })
      channelState.backupMessages = undefined
      channelState.next = undefined
      this.emit(MessageServiceEvent.UpdateList, channelId)
    }
  }

  /**
   * 进入临时列表态，调用此方法后当前的列表数据会被备份，新的列表将会包含指定的消息 id 前后的一部分消息
   * 并且列表其实同时拥有 loadBefore 和 loadAfter 能力，一旦列表能够从临时列表中恢复，就会自动退出临时列表
   */
  async loadMiddleSection(channel_id: string, message_id: string) {
    console.info('[MessageService] Load the middle part of the message, the previous messages are backed up.')
    const messages = await MessageListAPI.loadMessagesAround(channel_id, message_id)
    messages.sort((a, b) => Number(b.message_id - a.message_id))
    const channelState = this.getChannelState(channel_id)
    channelState.backupMessages = channelState.messages
    channelState.messages = new SplayTree()
    channelState.next = LoadStatus.idle
    jumpToMessage.id = message_id
    this.addMessages(channel_id, messages)
  }

  /**
   * 调用 `loadMiddleSection` 会进入临时列表，使用此方法可以从备份列表中恢复到进入临时列表前的状态
   * 可能会发生在：
   * 1. 离开频道
   * 2. 跳转到消息底部
   */
  recoverTemporaryMessageList(channelId: string, notifyUi = false) {
    const channelState = this.getChannelState(channelId)
    if (channelState.backupMessages) {
      console.info('[MessageService] Discard temporary list and recover to the previous list.')
      channelState.messages = channelState.backupMessages
      channelState.backupMessages = undefined
      channelState.next = undefined

      if (notifyUi) {
        this.emit(MessageServiceEvent.UpdateList, channelId)
      }
    }
  }

  toggleReaction(message: MessageStruct, name: string) {
    const reacted = message.reactions?.find(reaction => reaction.name === name)?.me
    this.userReactMessage(message.channel_id, message.message_id, reacted ? 'del' : 'add', name).catch(e => console.debug('toggleReaction error', e))
  }

  getMessages(channelId: string) {
    return this.getChannelState(channelId).messages
  }

  /**
   * 消息数量大于阈值时，减少内存中的消息数量以减少内存开销和渲染压力。
   * 相关配置在 `config.ts` 中
   * @param channel_id
   */
  tryTrimMessages(channel_id: string) {
    const { messages } = this.getChannelState(channel_id)
    if (messages.size < config.trimMessagesThreshold) return

    while (messages.size > config.trimMessageCountTo) {
      const min = messages.min()
      !isNil(min) && messages.remove(min)
    }
    console.info(`Message count exceeds the threshold of ${config.trimMessagesThreshold}, trimming down to ${config.trimMessageCountTo}.`)
    this.emit(MessageServiceEvent.UpdateList, channel_id)
  }

  getLatestMessage(channelId: string): MessageStruct | undefined {
    return this.getChannelState(channelId).messages.maxNode()?.data
  }

  clear() {
    this.state = {}
    this.localMessages.clear()
    MessageService.currentChannel.atBottom = true
  }

  // 清除社区下所有频道的消息
  clearGuildMessage(guildId: string): void {
    const guild = GuildUtils.getGuildById(guildId)
    if (!guild) return
    for (const channelId of Object.keys(guild.channels)) {
      delete this.state[channelId]
    }
  }
}

/**
 * 服务端返回的消息中，member 字段保存了用户的社区属性，需要用来更新本地数据
 * @param messages
 */
export function extractUserInfoFromMessages(messages: MessageStruct[]) {
  const guildUsers = uniqBy(
    messages
      .map(message => {
        if (message.guild_id && message.guild_id != '0' && message.member) {
          return {
            guildId: message.guild_id,
            userId: message.user_id,
            roles: message.member.roles,
            nickname: message.member.nick,
          }
        }
      })
      .filter(e => !!e),
    e => e?.userId
  )
  if (guildUsers.length) store.dispatch(guildUserActions.batchUpdate(guildUsers as never))

  const users = messages.map(message => ({ user_id: message.user_id, ...message.author })).filter(e => !!e?.user_id) as UserStruct[]
  store.dispatch(userActions.updateUsers(users))
}

function generateExtraDataByStatus(message: MessageStruct) {
  let tips: string | null = null

  switch (message.status) {
    case undefined:
    case MessageStatus.normal:
      break
    case MessageStatus.noMutualGuilds:
      tips = '发送失败，对方不接收陌生人消息'
      break
    case MessageStatus.strangerLimit:
    case MessageStatus.noMutualFriends:
    case MessageStatus.mentionEveryoneLimit:
    case MessageStatus.customBlockedTips:
      tips = '消息已发出，但被对方拒收了'
      break
    case MessageStatus.noOfflineNotice:
      break
    case MessageStatus.noInChannel:
      break
    case MessageStatus.slowMode:
      break
    case MessageStatus.isBan:
      tips = '你因涉嫌违规被举报，暂时无法使用私信'
      break
    case MessageStatus.Ephemeral:
      break
  }

  if (tips) {
    message.extra_data = {
      type: 'custom',
      data: {
        tips,
      },
    }
  }
}
