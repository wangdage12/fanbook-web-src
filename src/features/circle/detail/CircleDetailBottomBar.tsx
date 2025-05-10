import clsx from 'clsx'
import CircleDetailContext, { ReplyParams } from 'fb-components/circle/CircleDetailContext.ts'
import { CircleActionType, CircleCommentStruct, CircleContentStruct } from 'fb-components/circle/types.ts'
import FocusReplyContext from 'fb-components/question/FocusReplyContext.ts'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import { RichTextStruct } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { useContext, useEffect, useRef, useState } from 'react'
import FadeInOutSwitch from '../../../components/fade_in_out_switch'
import { UserHelper } from '../../../components/realtime_components/realtime_nickname/userSlice.ts'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import ReplyEditor, { ReplyEditorHandler } from '../../question/components/ReplyEditor.tsx'
import CircleApi from '../circle_api.ts'

const jsonStringify = (obj: unknown) => {
  return JSON.stringify(obj, (key, value) => {
    if ((key === 'width' || key === 'height') && typeof value === 'number') {
      // 避免app报错
      return value + 0.1
    }
    return value
  })
}

interface CircleDetailBottomBarProps {
  detail: CircleContentStruct
  onToggleLike: () => void
  onToggleFollow: () => void
  onComment: (comment: CircleCommentStruct, replyParams: ReplyParams) => void
  onScrollToComment: () => void
}

export default function CircleDetailBottomBar({ detail, onToggleLike, onToggleFollow, onComment, onScrollToComment }: CircleDetailBottomBarProps) {
  const [focusedReply, setFocusedReply] = useState<string | undefined>()
  const editorRef = useRef<ReplyEditorHandler>(null)
  const { like_total, comment_total, follow_total, liked, is_follow } = detail.sub_info ?? {}
  const focused = focusedReply !== undefined
  const { replyParams, setReplyParams } = useContext(CircleDetailContext)
  const { guild_id, channel_id, post_id, topic_id } = detail.post ?? {}
  const guildFromList = GuildUtils.getGuildById(guild_id)
  const guild = { ...(guildFromList ?? {}), ...detail.guild } as GuildStruct

  const onComplete = async (richText: RichTextStruct) => {
    let quote1, quote2
    switch (replyParams.replyType) {
      case CircleActionType.comment:
        quote1 = replyParams.replying?.comment.comment_id
        break
      case CircleActionType.reply:
        quote1 = replyParams.commentId
        quote2 = replyParams.replying?.comment.comment_id
        break
      default:
    }
    const res = await CircleApi.createComment({
      guildId: guild_id,
      channelId: channel_id,
      topicId: topic_id,
      postId: post_id,
      quote1,
      quote2,
      content: jsonStringify(richText.ops),
      mentions: richText.mentions,
    })
    if (replyParams.replying && replyParams.replyType == CircleActionType.reply) {
      res.reply_user_info = { ...replyParams.replying.user }
    }
    onComment(res, replyParams)
    setReplyParams({ replyType: CircleActionType.post })
    setFocusedReply(undefined)
  }

  function onCommentClick() {
    if ((comment_total ?? 0) > 0) {
      onScrollToComment()
    } else {
      editorRef.current?.focus()
    }
  }

  const { replying } = replyParams

  const focusReplyParent = 'circleDetailReplyEditor'

  const editor = (
    <FocusReplyContext.Provider value={{ focusedReply, setFocusedReply: () => setFocusedReply(focusReplyParent) }}>
      <ReplyEditor
        ref={editorRef}
        guildId={guild_id}
        channelId={channel_id}
        placeholder={'说点什么...'}
        expandAnimation={true}
        parent={focusReplyParent}
        showCancelButton
        maxLength={500}
        onComplete={onComplete}
        onClearReply={() => {
          setReplyParams({ replyType: CircleActionType.post })
        }}
        onCancel={() => setFocusedReply(undefined)}
      ></ReplyEditor>
    </FocusReplyContext.Provider>
  )

  useEffect(() => {
    if (replying) {
      const replyText = `回复${UserHelper.getAliasName(
        replying.user.user_id,
        replying.comment.guild_id,
        replying.user?.nickname
      )}：${richText2PlainText(transformRichText(replying.comment.content))}`
      editorRef.current?.setReplyTitle(replyText)
      setFocusedReply(focusReplyParent)
    }
  }, [replying])

  const isInGuild = !guildFromList
  // const hasReplyPermission = usePermissions({
  //   permission: PostPermission.ReplyPost,
  //   guildId: guild_id,
  //   channelId: channel_id,
  // }).has(PostPermission.ReplyPost)
  const isMuted = GuildUtils.isMuted(guild)
  const disabled = isMuted || (isInGuild && !guild.guild_circle_comment)
  const getDisabledText = () => {
    if (isMuted) return '禁言中'
    if (!guild.guild_circle_comment) return '内容暂不可评论'
    // if (!hasReplyPermission)
    //   return '没有回复权限'
  }

  return (
    <FadeInOutSwitch index={focused ? 1 : 0} className={clsx(['flex-center flex w-full flex-row pb-4 pl-6 pr-3 pt-2', focused ? 'pr-6' : 'pr-3'])}>
      <div className={'flex-center w-full flex-row gap-3'}>
        {disabled ?
          <div className={'flex-center h-[40px] flex-1 rounded-full bg-[var(--bg-bg-1)] text-sm text-[var(--fg-b40)]'}>{getDisabledText()}</div>
        : <div
            className={
              'flex h-[40px] flex-1 cursor-text items-center overflow-hidden rounded-full bg-[var(--fg-b5)] pl-3 text-sm text-[var(--fg-b40)]'
            }
            onClick={() => {
              setFocusedReply(focusReplyParent)
              editorRef.current?.focus()
            }}
          >
            <span className={'truncate overflow-ellipsis'}>{editorRef.current?.getContent().trim() || '说点什么...'}</span>
          </div>
        }
        {
          <div className={'flex-center'}>
            <ButtonItem
              text="点赞"
              icon={liked ? 'HeartFill' : 'HeartRegular'}
              color={liked ? 'var(--function-red-1)' : 'var(--fg-b100)'}
              onClick={onToggleLike}
              count={like_total ?? 0}
            ></ButtonItem>
            <ButtonItem
              text="收藏"
              icon={is_follow ? 'StarFill' : 'StarRegular'}
              color={is_follow ? 'var(--function-yellow-1)' : 'var(--fg-b100)'}
              onClick={onToggleFollow}
              count={follow_total ?? 0}
            ></ButtonItem>
            <ButtonItem text={'评论'} icon={'ReviewRegular'} onClick={onCommentClick} count={comment_total ?? 0}></ButtonItem>
          </div>
        }
      </div>
      <div className={'flex-1'}>{editor}</div>
    </FadeInOutSwitch>
  )
}

function ButtonItem({
  icon,
  color = 'var(--fg-b100)',
  text,
  count,
  onClick,
}: {
  icon: string
  text: string
  color?: string
  count: number
  onClick?: () => void
}) {
  return (
    <div className={'flex-center h-[40px] w-[52px] cursor-pointer flex-col'} onClick={onClick}>
      <iconpark-icon name={icon} size={22} color={color}></iconpark-icon>
      <div className={'mt-[2px] text-[11px]  text-[var(--fg-b100)]'}>{formatCount(count, text)}</div>
    </div>
  )
}
