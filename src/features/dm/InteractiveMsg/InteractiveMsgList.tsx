import FbToast from 'fb-components/base_ui/fb_toast/index'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import FbPlainText from 'fb-components/rich_text/FbPlainText.tsx'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type.ts'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils.ts'
import { isEmpty, isEqual } from 'lodash-es'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useAppDispatch, useAppSelector } from '../../../app/hooks.ts'
import EmptyData from '../../../components/EmptyData.tsx'
import { RealtimeAvatar, RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { showCircleDetailModal } from '../../circle/CircleModal.tsx'
import GuildAPI from '../../guild_container/guildAPI.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import { ChannelContainerContext, ChannelContainerContextData } from '../../home/ChannelContainer.tsx'
import { UnreadHelper, unreadActions } from '../../message_list/unreadSlice.ts'
import { showAnswerDetailModal } from '../../question/AnswerModal.tsx'
import { showQuestionDetailModal } from '../../question/QuestionModal.tsx'
import { InteractiveMessageStruct, InteractiveMessageType, InteractiveType, isStart, isUnSupport } from '../DMStruct.ts'
import { getInteractiveMsg } from '../DmAPI.ts'
import { InteractiveMsgExtraInfo } from '../components/InteractiveMsgHeader.tsx'
import { DmChannelStruct, dmActions, dmSelectors } from '../dmSlice.ts'

interface InteractiveMsgListProps {
  channel: DmChannelStruct
}

const InteractiveMsgCommentDeleteArr = [
  InteractiveMessageType.commentDel,
  InteractiveMessageType.questionAnswerCancel,
  InteractiveMessageType.answerAnswerCancel,
  InteractiveMessageType.replyCommentCancel,
  InteractiveMessageType.postDel, // 有专门的机器人推送消息
  InteractiveMessageType.questionCancel, // 有专门的机器人推送消息
]

const replyType = [
  InteractiveMessageType.postAt,
  InteractiveMessageType.postComment,
  InteractiveMessageType.postCommentAt,
  InteractiveMessageType.commentComment,
  InteractiveMessageType.commentCommentAt,
  InteractiveMessageType.questionAnswer,
  InteractiveMessageType.answerAnswer,
  InteractiveMessageType.replyComment,
  InteractiveMessageType.questionAt,
  InteractiveMessageType.questionAnswerAt,
  InteractiveMessageType.answerAnswerAt,

  ...InteractiveMsgCommentDeleteArr,
]

const questionNonReplyType = [InteractiveMessageType.questionFollow, InteractiveMessageType.answerLike, InteractiveMessageType.answerCommentLike]

const InteractiveMsgDeleteMap: Partial<Record<InteractiveMessageType, string>> = {
  [InteractiveMessageType.postDel]: '该动态已被删除',
  [InteractiveMessageType.postAt]: '该动态已被删除',
  // [InteractiveMessageType.postFollow]: '该动态已被删除',
  // [InteractiveMessageType.postLike]: '该动态已被删除',
  [InteractiveMessageType.postReward]: '该动态已被删除',
  [InteractiveMessageType.commentDel]: '该评论已被删除',
  // [InteractiveMessageType.commentLike]: '该评论已被删除',
  [InteractiveMessageType.postComment]: '该评论已被删除',
  [InteractiveMessageType.postCommentAt]: '该评论已被删除',
  [InteractiveMessageType.commentComment]: '该评论已被删除',
  [InteractiveMessageType.commentCommentAt]: '该评论已被删除',

  [InteractiveMessageType.questionCancel]: '该问题已被删除',
  [InteractiveMessageType.questionFollow]: '该问题已被删除',
  [InteractiveMessageType.questionAt]: '该问题已被删除',

  [InteractiveMessageType.questionAnswerCancel]: '该回答已被删除',
  [InteractiveMessageType.questionAnswer]: '该回答已被删除',
  [InteractiveMessageType.questionAnswerAt]: '该回答已被删除',
  [InteractiveMessageType.answerLike]: '该回答已被删除',

  [InteractiveMessageType.answerAnswerCancel]: '该评论已被删除',
  [InteractiveMessageType.answerAnswer]: '该评论已被删除',
  [InteractiveMessageType.answerAnswerAt]: '该评论已被删除',
  [InteractiveMessageType.answerCommentLike]: '该评论已被删除',
  [InteractiveMessageType.replyCommentCancel]: '该评论已被删除',
  [InteractiveMessageType.replyComment]: '该评论已被删除',
}

const InteractiveMsgCoverMap: Partial<Record<InteractiveMessageType, string>> = {
  [InteractiveMessageType.postDel]: '动态已被删除',
  [InteractiveMessageType.postAt]: '动态已被删除',
  [InteractiveMessageType.postFollow]: '动态已被删除',
  [InteractiveMessageType.postLike]: '动态已被删除',
  [InteractiveMessageType.postReward]: '动态已被删除',
  [InteractiveMessageType.commentDel]: '动态已被删除',
  [InteractiveMessageType.commentLike]: '动态已被删除',
  [InteractiveMessageType.postComment]: '动态已被删除',
  [InteractiveMessageType.postCommentAt]: '动态已被删除',
  [InteractiveMessageType.commentComment]: '动态已被删除',
  [InteractiveMessageType.commentCommentAt]: '动态已被删除',

  [InteractiveMessageType.questionCancel]: '问题已被删除',
  [InteractiveMessageType.questionAt]: '问题已被删除',
  [InteractiveMessageType.questionFollow]: '问题已被删除',
  [InteractiveMessageType.questionAnswerCancel]: '问题已被删除',
  [InteractiveMessageType.questionAnswer]: '问题已被删除',
  [InteractiveMessageType.questionAnswerAt]: '问题已被删除',
  [InteractiveMessageType.answerLike]: '问题已被删除',
  [InteractiveMessageType.answerAnswerCancel]: '问题已被删除',
  [InteractiveMessageType.answerAnswer]: '问题已被删除',
  [InteractiveMessageType.answerAnswerAt]: '问题已被删除',
  [InteractiveMessageType.answerCommentLike]: '问题已被删除',
  [InteractiveMessageType.replyCommentCancel]: '问题已被删除',
  [InteractiveMessageType.replyComment]: '问题已被删除',
}

const InteractiveMsgActionMap: Partial<Record<InteractiveMessageType, string>> = {
  [InteractiveMessageType.postDel]: '删除动态',
  [InteractiveMessageType.commentDel]: '回复了你的动态',
  [InteractiveMessageType.questionCancel]: '删除问题',
  [InteractiveMessageType.questionAnswerCancel]: '回答了你的问题',
  [InteractiveMessageType.answerAnswerCancel]: '评论了你的回答',
  [InteractiveMessageType.replyCommentCancel]: '评论了你的回答',
}

function MsgItem(message: InteractiveMessageStruct) {
  const {
    send_user_id,
    create_at,
    desc,
    title,
    post_content = '',
    post_status,
    content = '',
    comment_status,
    quote_content = '',
    quote_status,
    cover_img,
    circle_type,
    post_id,
    quote_id,
    quote_l1,
    quote_l2,
    relacted_id,
    guild_id,
  } = message

  const [guild, setGuild] = useState<GuildStruct | undefined>(() => GuildUtils.getGuildById(guild_id))

  useEffect(() => {
    if (!guild) {
      GuildAPI.getGuildInfo(guild_id)
        .then(res => {
          setGuild(res)
        })
        .catch(() => {
          /* ignore */
        })
    }
  }, [guild])

  const postDeleted = post_status === SwitchType.No
  const commitDeleted = relacted_id ? comment_status === SwitchType.No : false
  const quoteDeleted = quote_id || quote_l1 || quote_l2 ? quote_status === SwitchType.No : false
  // 先替换掉 ${@!send_user_id}，再替换掉 content
  let _desc = (desc || '').replace(`\${@!${send_user_id}}`, '').replace(content, '')

  const [firstText /*, replyText = ''*/] = _desc.split(':')

  const _content = commitDeleted ? InteractiveMsgDeleteMap[circle_type] ?? '' : (content || post_content).replace(/@(?=\${@[!&]\d+})/g, '')
  // _content = isEmpty(_content) ? InteractiveMsgDeleteMap[circle_type] ?? (replyType.includes(circle_type) ? replyText : '') : _content
  _desc = `${isEmpty(firstText) ? InteractiveMsgActionMap[circle_type] : firstText}${replyType.includes(circle_type) && _content ? '：' : ''}`

  const coverImgPlaceholder = (
    <div className="flex h-[64px] w-[64px] items-center justify-center break-all rounded-[12px] border-[1px] border-[var(--fg-b10)] bg-[var(--fg-b5)] p-[12px] text-xs text-[var(--fg-b40)]">
      <FbPlainText
        data={postDeleted ? InteractiveMsgCoverMap[circle_type] ?? '' : title ?? _content}
        className={'line-clamp-2 flex-grow break-all [line-break:anywhere] [word-wrap:break-word]'}
      />
    </div>
  )

  const _title =
    quote_l1 || quote_id || quote_l2 ?
      !quoteDeleted ? quote_content
      : InteractiveMsgDeleteMap[circle_type] ?? ''
    : !postDeleted ? title
    : ''

  const handleClick = () => {
    switch (circle_type) {
      // 圈子详情
      case InteractiveMessageType.postLike:
      case InteractiveMessageType.postAt:
      case InteractiveMessageType.postReward:
      case InteractiveMessageType.postFollow:
      case InteractiveMessageType.postComment:
      case InteractiveMessageType.commentLike:
      case InteractiveMessageType.postCommentAt:
      case InteractiveMessageType.commentComment:
      case InteractiveMessageType.commentCommentAt: {
        if (postDeleted) {
          FbToast.open({ content: '该动态已被删除', type: 'warning', key: 'postDel' })
          break
        }
        const commentId = commitDeleted ? quote_l1 ?? quote_id : relacted_id
        showCircleDetailModal({
          guildId: guild_id,
          postId: post_id,
          targetCommentId: commentId,
        })
        break
      }

      case InteractiveMessageType.postDel:
        FbToast.open({ content: '该动态已被删除', type: 'warning', key: 'postDel' })
        break
      case InteractiveMessageType.commentDel:
        FbToast.open({ content: '该动态评论已被删除', type: 'warning', key: 'commentDel' })
        break

      // 问题详情
      case InteractiveMessageType.questionAt:
      case InteractiveMessageType.questionFollow:
        if (postDeleted) {
          FbToast.open({ content: '该问题已被删除', type: 'warning', key: 'questionCancel' })
          break
        }
        showQuestionDetailModal({ questionId: post_id })
        break

      // 回答详情
      case InteractiveMessageType.questionAnswer:
      case InteractiveMessageType.answerAnswer:
      case InteractiveMessageType.questionAnswerAt:
      case InteractiveMessageType.answerAnswerAt:
      case InteractiveMessageType.answerLike:
      case InteractiveMessageType.replyComment:
      case InteractiveMessageType.answerCommentLike:
        if (postDeleted) {
          FbToast.open({ content: '该问题已被删除', type: 'warning', key: 'questionCancel' })
          break
        }
        showAnswerDetailModal({
          questionId: post_id,
          answerId: quote_l1 ?? relacted_id,
        })
        // TODO: 跳转到回答详情
        break
      case InteractiveMessageType.questionCancel:
        FbToast.open({ content: '该问题已被删除', type: 'warning', key: 'questionCancel' })
        break
      case InteractiveMessageType.questionAnswerCancel:
        FbToast.open({ content: '该回答已被删除', type: 'warning', key: 'questionAnswerCancel' })
        break
      case InteractiveMessageType.answerAnswerCancel:
      case InteractiveMessageType.replyCommentCancel:
        FbToast.open({ content: '该评论已被删除', type: 'warning', key: 'answerAnswerCancel-replyCommentCancel' })
        break
      case InteractiveMessageType.start:
        break
      default:
        console.error('未知的消息类型', circle_type)
        break
    }
  }

  return (
    <div className={'flex min-h-[64px] w-full cursor-pointer items-start gap-[12px] pl-[16px] pt-[12px]'} onClick={handleClick}>
      <RealtimeAvatar userId={send_user_id} className="flex-shrink-0"></RealtimeAvatar>
      <div className={'flex w-[calc(100%-42px)] flex-grow flex-col border-b-[0.5px] border-b-[var(--fg-b10)] pb-[16px] pr-[16px]'}>
        <div className={'flex w-full gap-[10px]'}>
          <div className={'flex w-[calc(100%-84px)] flex-col'}>
            <RealtimeNickname className="mb-[4px] text-[12px] leading-[14px]" userId={send_user_id} />
            <div className="mb-[6px] w-full flex-grow truncate break-all text-xs leading-[16px] text-[var(--fg-b60)]">{_desc}</div>
            {(replyType.includes(circle_type) || questionNonReplyType.includes(circle_type)) && (
              <div className={'mb-[6px] flex flex-col gap-[4px]'}>
                {_content && (
                  <FbPlainText
                    data={_content}
                    className={`break-all leading-[16px] ${
                      commitDeleted ?
                        'w-auto self-start rounded-[4px] bg-[var(--fg-b5)] px-[8px] text-[var(--fg-b40)]'
                      : 'line-clamp-2 flex-grow text-[var(--fg-b100)]'
                    }`}
                  />
                )}
                {_title && (
                  <article className='flex items-center truncate break-all leading-[16px] text-[var(--fg-b60)] before:mr-1 before:inline-block before:h-[16px] before:w-0.5 before:rounded-[1px] before:bg-[var(--fg-b100)] before:align-middle before:opacity-[.15] before:content-[""]'>
                    <FbPlainText
                      data={_title}
                      className={`${quoteDeleted ? 'w-auto self-start rounded-[4px] bg-[var(--fg-b5)] px-[8px] text-[var(--fg-b40)]' : ''}`}
                    />
                  </article>
                )}
              </div>
            )}

            <div className={'text-xs text-[var(--fg-b30)]'}>
              <span>{DateTimeUtils.format(create_at, { showTimeBeyondOneDay: false })}</span>
              <span className="ml-[8px]">{`来自${guild?.name}`}</span>
            </div>
          </div>
          {cover_img ?
            <CosImage
              src={cover_img}
              size={64}
              fallback={coverImgPlaceholder}
              className="rounded-[12px] border-[1px] border-[var(--fg-b10)] object-cover"
            />
          : coverImgPlaceholder}
        </div>
      </div>
    </div>
  )
}

export default function InteractiveMsgList({ channel }: InteractiveMsgListProps) {
  const contextValue = useContext<ChannelContainerContextData<InteractiveMsgExtraInfo> | undefined>(ChannelContainerContext)
  const { extraInfo = {} } = contextValue ?? {}
  const { activeKey = InteractiveType.All } = extraInfo
  const [messages, setMessages] = useState<InteractiveMessageStruct[]>([])
  const messagesFromWs = useAppSelector(dmSelectors.interactiveMsgList, isEqual)
  const hasMoreRef = useRef(true)
  const loadingRef = useRef(false)
  const dispatch = useAppDispatch()

  function handleAtBottomStateChange(atBottom: boolean) {
    if ((!atBottom && !hasMoreRef.current) || loadingRef.current) {
      return
    }
    const lastMessage = messages.at(-1)
    getInteractiveMsgList(lastMessage?.message_id.toString())
  }

  const getInteractiveMsgList = async (messageId?: string, behavior: string = 'before') => {
    if (loadingRef.current || (!hasMoreRef.current && behavior === 'before')) {
      return
    }
    loadingRef.current = true
    let list: InteractiveMessageStruct[] = []
    try {
      list = await getInteractiveMsg({ channelId: channel.channel_id, messageId, type: activeKey, behavior })
      // 非 全部 tab 页下 不会返回 start 消息, 通过判断 list是否为空控制
      if (list.find(item => item.circle_type === InteractiveMessageType.start) || list.length === 0) {
        hasMoreRef.current = false
      }
      // 存在历史数据没有 post_id || circle_type 的情况, 删除的类型不展示,由原来的消息显示, 隐藏还未支持的消息类型
      const _list = list.filter(
        item => !(!item.post_id || !item.circle_type || InteractiveMsgCommentDeleteArr.includes(item.circle_type) || isUnSupport(item.circle_type))
      )

      setMessages(messages => (behavior === 'before' ? [...messages, ..._list] : [..._list, ...messages]))
    } catch (err) {
      console.error(err)
    } finally {
      loadingRef.current = false
    }
    if (list.length < 20) {
      const lastMessage = list.at(-1)
      getInteractiveMsgList(lastMessage?.message_id.toString())
    }
  }

  const unreadStartId = useMemo(() => {
    return UnreadHelper.getLocalUnread(channel.channel_id).startId
  }, [])

  useEffect(() => {
    async function asyncFunc() {
      hasMoreRef.current = true

      setMessages([])
      dispatch(dmActions.clearInteractiveMsg())
      await getInteractiveMsgList()
      dispatch(
        unreadActions.clearUnread({
          channelId: channel.channel_id,
          type: channel.type,
        })
      )
    }

    asyncFunc().then()
  }, [extraInfo.activeKey])

  useEffect(() => {
    const firstMessage = messages[0]
    if (!firstMessage) {
      return
    }

    async function asyncFunc() {
      dispatch(dmActions.clearInteractiveMsg())
      await getInteractiveMsgList(firstMessage.message_id.toString(), 'after')
    }

    if (messagesFromWs.length > 0) {
      asyncFunc().then()
    }
  }, [messagesFromWs, messages])

  return (
    messages.length === 0 ?
      !loadingRef.current ?
        <EmptyData type="message" message="暂无消息" />
      : <div className="flex-center h-full w-full">
          <CircularLoading size={24} />
        </div>
    : <Virtuoso
        style={{
          width: '100%',
          height: '100%',
        }}
        defaultItemHeight={90}
        totalCount={messages.length}
        overscan={200}
        increaseViewportBy={200}
        atBottomStateChange={handleAtBottomStateChange}
        itemContent={index => {
          const message = messages[index]

          if (isStart(message.circle_type)) {
            return (
              <div className={'flex h-[64px] items-center justify-center gap-[6px] text-xs text-[var(--fg-b30)]'}>
                <div className={'h-[1px] w-[6px] bg-[var(--fg-b10)]'} />
                暂无更多消息
                <div className={'h-[1px] w-[6px] bg-[var(--fg-b10)]'} />
              </div>
            )
          }

          let child = <MsgItem {...message} />

          // 历史通知 UI，如果最后一条就是已读的就没必要显示了 仅在 全部 tab页展示
          if (unreadStartId === message.message_id && index !== 0 && activeKey === InteractiveType.All) {
            child = (
              <div className={'flex flex-col'}>
                {child}
                <div className={'flex h-[30px] items-center justify-center bg-[var(--fg-b5)] bg-opacity-[0.03] text-xs text-[var(--fg-b40)]'}>
                  以下是更早消息
                </div>
              </div>
            )
          }
          return child
        }}
      />
  )
}
