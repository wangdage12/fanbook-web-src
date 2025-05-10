import axios from 'axios'
import { MessageExtraDataStruct, MessageStatus, MessageStruct } from 'fb-components/components/messages/types'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { Base64 } from 'js-base64'
import { pick, values } from 'lodash-es'
import Long from 'long'
import protobuf from 'protobufjs/minimal'
import { cachedAxios } from '../../base_services/http'
import { Protocols } from '../../proto/pb_boundle'
import { FbHttpResponse } from '../../types'
import StateUtils from '../../utils/StateUtils'
import { extractUserInfoFromMessages } from './MessageService'
import parseMessage from './transformer'

const MessageInfo = Protocols.Protobuf.PBClass.MessageInfo
protobuf.util.Long = Long
// 默认值也序列化
protobuf.util.toJSONOptions = { ...protobuf.util.toJSONOptions, defaults: true }
protobuf.configure()

export interface PullMessageStruct {
  message_id: string
  user_id: string
  mentions: string[]
  mention_roles: string[]
}

interface NonEntityMessageStruct {
  m_type: 'deleted' | 'RECALL'
  message_id: string
  user_id: string
  operation_message_id: string
}

export interface PullDataStruct {
  channel_data: Record<
    string,
    {
      entity: PullMessageStruct[]
      no_entity: NonEntityMessageStruct[]
    }
  >
  descs?: Record<string, string>
  reactions?: Record<string, { emojis: Record<string, number> }>
  // 服务端保存的未读起始 id，在客户端没有数据的情况下，可以信任此数据
  read_lists: Record<string, { channel_read_list: Record<string, string> }>
}

export enum TopBehavior {
  UnTop,
  Top,
}

export default class MessageListAPI {
  static async recallMessage(channel_id: string, message_id: string) {
    return axios.post<undefined, MessageStruct>('/api/message/recall', {
      channel_id,
      message_id,
    })
  }

  static async pinMessage(channel_id: string, message_id: string, behavior: TopBehavior) {
    return axios.post<undefined, MessageStruct>('/api/message/pinned', {
      channel_id,
      message_id,
      pin: behavior,
    })
  }

  static async topMessage(channel_id: string, message_id: string, behavior: TopBehavior) {
    return axios.post<undefined, MessageStruct>('/api/message/top', {
      channel_id,
      message_id,
      status: behavior,
    })
  }

  static async fetchMessages(channel_id: string, message_id?: bigint, before = true, pageSize = 50) {
    const data = await axios.post<undefined, MessageStruct[]>(
      '/api/message/getList',
      {
        size: pageSize,
        channel_id,
        message_id: message_id?.toString() ?? null,
        behavior: before ? 'before' : 'after',
      },
      {
        'axios-retry': {
          retries: Infinity,
        },
      }
    )
    extractUserInfoFromMessages(data)

    return data.map(parseMessage)
  }

  static async loadMessagesAround(channel_id: string, message_id: string) {
    const data = await axios.post<undefined, MessageStruct[]>('/api/msg/around', {
      channel_id,
      message_id,
    })
    extractUserInfoFromMessages(data)

    return data.map(parseMessage)
  }

  static async fetchMessage(channel_id: string, message_id: string) {
    return cachedAxios
      .post<undefined, MessageStruct>(
        '/api/msg/get',
        {
          channel_id,
          message_id,
        },
        {
          id: `/api/msg/get?${channel_id}&${message_id}`,
        }
      )
      .then(e => parseMessage(e))
  }

  static async sendMessage(message: MessageStruct, options?: { mentions?: string[]; mention_roles?: string[] }) {
    const messageId = message.message_id.toString()
    const serialized = {
      ...pick(message, 'channel_id', 'guild_id', 'quote_l1', 'quote_l2', 'content', 'desc'),
      ...pick(options, 'mentions', 'mention_roles'),
      nonce: messageId,
      content: JSON.stringify(message.content),
      token: StateUtils.localUser.sign,
    }

    if (!serialized.guild_id) {
      delete serialized.guild_id
    }
    if (!serialized.mentions?.length) {
      delete serialized.mentions
    }
    if (!serialized.mention_roles?.length) {
      delete serialized.mention_roles
    }

    return axios.post<
      FbHttpResponse<{
        time: number
        status: MessageStatus
        message_id: string
        extra_data: MessageExtraDataStruct
      }>
    >(`/api/message/clientSend/${message.guild_id || '0'}/${message.channel_id}`, serialized, {
      originResponse: true,
    })
  }

  static async pull(
    type: ChannelType,
    channels: Record<string, string | null>,
    channelsShouldReturnUnread?: Record<string, string[]>,
    guilds2channels?: Record<string, string[]>
  ): Promise<PullDataStruct> {
    const resp = await axios.post<FbHttpResponse<string>>(
      '/api/pullMsg/pullMessage',
      {
        channels,
        guilds: guilds2channels,
        read_channels: channelsShouldReturnUnread,
        t: type,
        encode: 'json',
      },
      {
        originResponse: true,
      }
    )

    const data = safeJSONParse(resp.data.data, {} as PullDataStruct)
    for (const v of values(data.channel_data)) {
      v.entity = (v.entity as unknown as string[])?.map((e: string) => MessageInfo.decode(Base64.toUint8Array(e)).toJSON() as PullMessageStruct)
      v.no_entity = (v.no_entity as unknown as string[])?.map(
        (e: string) => MessageInfo.decode(Base64.toUint8Array(e)).toJSON() as NonEntityMessageStruct
      )
    }
    return data
  }

  /**
   * 对消息发起表态
   * @param channel_id
   * @param message_id
   * @param emoji
   */
  static addReaction(channel_id: string, message_id: string, emoji: string) {
    return axios.post('/api/reaction/create', {
      channel_id,
      message_id,
      emoji: encodeURIComponent(emoji),
    })
  }

  /**
   * 对消息取消表态
   * @param channel_id
   * @param message_id
   * @param emoji
   */
  static deleteReaction(channel_id: string, message_id: string, emoji: string) {
    return axios.post('/api/reaction/del', {
      channel_id,
      message_id,
      emoji: encodeURIComponent(emoji),
    })
  }
}
