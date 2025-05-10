import FbToast from 'fb-components/base_ui/fb_toast/index'
import { MessageStruct } from 'fb-components/components/messages/types.ts'
import { TextMentionSign } from 'fb-components/rich_text/types.ts'
import { CustomInline } from 'fb-components/rich_text_editor/custom-editor'
import { mapValues } from 'lodash-es'
import { KeyUtils } from 'message-card/src/key.ts'
import queryString, { ParsedQuery, ParsedUrl } from 'query-string'
import { matchPath } from 'react-router-dom'
import { Descendant } from 'slate'
import AppRoutes from '../../app/AppRoutes.ts'
import { GlobalEvent, globalEmitter } from '../../base_services/event.ts'
import { showInviteModal } from '../../components/invite_modal/InviteModal.tsx'
import showShareModal from '../../components/share/ShareModal.tsx'
import BotAPI from '../../features/bot/BotAPI.ts'
import LocalUserInfo from '../../features/local_user/LocalUserInfo.ts'
import MessageService from '../../features/message_list/MessageService.ts'
import { MessageCardMessageContentStruct } from '../../features/message_list/items/MessageCardMessage.tsx'
import { LinkHandler } from './LinkHandler.ts'
import MessageCardApi from './MessageCardApi.ts'

export interface BotLinkHandlerExtra {
  channelId: string
  botId: string
  message: MessageStruct<MessageCardMessageContentStruct>
}

export default class BotLinkHandler extends LinkHandler {
  canHandle(urlString: string): boolean {
    return urlString.startsWith('fanbook://')
  }

  handle({ url, query }: ParsedUrl, extra: BotLinkHandlerExtra) {
    if (url.startsWith('fanbook://key')) {
      this.processKey(extra, url.slice(14).split('/') as never, query)
    } else {
      switch (url) {
        case 'fanbook://bot/callback':
          this.botCallback(query.data as string, extra)
          break
        case 'fanbook://external/open':
          this.openScheme(queryString.parseUrl(query.url as string), extra)
          break
        case 'fanbook://switch_inline_query/current_chat':
          this.switchInlineQueryCurrentChat(query, extra)
          break
        case 'fanbook://guild/share':
          this.openGuildShareDialog()
          break
        case 'fanbook://share':
          this.share(query).catch(e => console.warn(`[Bot Share] Failed to share due to ${e}`))
          break
      }
    }
  }

  private async share({ image }: ParsedQuery) {
    if (!image) return
    const { channelId, guildId, channelType } = await showShareModal()
    if (image) {
      return MessageService.instance.sendExternalImage(channelId, image as string, { guildId, channelType })
    }
  }

  private openGuildShareDialog() {
    const match = matchPath(
      {
        path: `${AppRoutes.CHANNELS}/:guildId/:channelId`,
      },
      location.pathname
    )
    if (!match) return

    const { channelId, guildId } = match.params
    if (!guildId) return
    // 私信不能打开分享社区对话框
    if (guildId === AppRoutes.AT_ME) return

    showInviteModal(guildId, channelId)
  }

  // 例如 fanbook://external/open?url=fanbook%3A%2F%2Fsomething%3Fuser%3D%24user_id%26msg%3D%24message
  private openScheme({ url, query }: ParsedUrl, { message }: BotLinkHandlerExtra) {
    const convertedQuery = mapValues(query, (variable: string) => {
      switch (variable) {
        case '$user_id':
          return LocalUserInfo.userId
        case '$message':
          if (!message) return variable
          return JSON.stringify({
            sender_id: message.user_id,
            message_id: message.message_id.toString(),
            channel_id: message.channel_id,
            guildId: message.guild_id,
          })
        default:
          return variable
      }
    })

    const appUrl = url + '?' + queryString.stringify(convertedQuery)
    if (appUrl.startsWith('http://') || appUrl.startsWith('https://')) {
      // 不允许打开 http(s) 链接
      return
    }
    console.log(JSON.stringify(appUrl))
    location.href = appUrl
  }

  // example: fanbook://bot/callback?data=confirm
  private botCallback(data: string, { message, channelId, botId }: BotLinkHandlerExtra) {
    // TODO 这个应该是判断访客
    // if (ChatTargetsModel.instance
    //   .checkVisitorGuild(data?.message?.guildId)) {
    //   return;
    // }
    BotAPI.invokeRemoteCallback({
      id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      channelId,
      botId,
      userId: LocalUserInfo.userId,
      data,
      message,
    }).catch(e => console.log(`failed to invoke remote callback due to ${e}`))
  }

  private processKey({ message }: BotLinkHandlerExtra, [op, key]: ['set' | 'clear' | 'toggle', string | 'auto' | undefined], query: ParsedQuery) {
    // 正常情况下是有 id 的，只有消息卡片编辑器没有
    const channelId = message.channel_id ?? ''
    const messageId = message.message_id.toString() ?? ''
    const { message_card: keys, content } = message

    if (key == 'auto') {
      key = KeyUtils.hasAnyKeyMySelf(keys)
      // 将操作从 toggle 转成具体的 set/clear
      if (op == 'toggle') {
        op = key != null ? 'clear' : 'set'
      }

      if (op == 'set') {
        const max = parseInt(query['max'] as string) || 5
        if (key != null) {
          // 已经有 key 了，就不能再设置了
          return
        } else {
          // 寻找一个合适的 key
          key = KeyUtils.getEmptyKey(keys, max)
          if (!key) {
            if (content.noSeatToast) {
              FbToast.open({ content: content.noSeatToast })
            }
            return
          }
        }

        /// 为了防止数据竞争，服务端提供了自动设置的接口。自动清除暂时没有服务端接口，如果有必要再说。
        MessageCardApi.autoSetKey(channelId, messageId, max).catch(e => console.log(`failed to set key due to ${e}`))

        /// 由于自动设置的特殊性（特殊接口），不走后面的逻辑
        return
      }
      //  此时 op == 'clear'
      else if (key == null) {
        // 本就没有 key，不需要清除了
        return
      }
    } else {
      /// 把 toggle 转换成其他两种状态，后续就只需要处理两种情况
      if (op == 'toggle') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (KeyUtils.hasKeyMyself(keys, key!)) {
          op = 'clear'
        } else {
          op = 'set'
        }
      }
    }

    /// 用户操作只需要发起 http 请求，UI 更新将由 ws 通知触发
    switch (op) {
      case 'set':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        MessageCardApi.setKey(channelId, messageId, key!).catch(e => {
          console.log(`failed to set key due to ${e}`)
          return null
        })
        break
      case 'clear':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        MessageCardApi.clearKey(channelId, messageId, key!).catch(e => {
          console.log(`failed to clear key due to ${e}`)
          return null
        })
        break
    }
  }

  // 例如 fanbook://switch_inline_query/current_chat?text=hello
  private switchInlineQueryCurrentChat({ text }: ParsedQuery, extra: BotLinkHandlerExtra) {
    const isDm = !!matchPath({ path: `${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}/:channelId` }, location.pathname)
    const botId = extra.message?.user_id ?? extra.botId
    const content: Descendant[] = [
      {
        'type': 'paragraph',
        'children': [
          ...(isDm ?
            []
          : [
              {
                type: 'mention',
                id: botId,
                name: '',
                sign: TextMentionSign.User,
                children: [],
              } as CustomInline,
            ]),
          {
            text: text as string,
          },
        ],
      },
    ]

    globalEmitter.emit(GlobalEvent.SetCurrentChatInput, content)
  }
}
