/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useClickAway, useDebounceFn, useRafTimeout } from 'ahooks'
import { Divider, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { EmojiPopOver } from 'fb-components/components/EmojiPanel.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { Portal } from 'fb-components/components/Portal.tsx'
import { MessageStruct } from 'fb-components/components/messages/types.ts'
import { TextMentionSign } from 'fb-components/rich_text/types.ts'
import RichTextEditorUtils, { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils.tsx'
import RichTextElementRenderer from 'fb-components/rich_text_editor/RichTextElementRenderer.tsx'
import RichTextLeafRenderer from 'fb-components/rich_text_editor/RichTextLeafRenderer.tsx'
import { MentionElement } from 'fb-components/rich_text_editor/custom-editor'
import withEmoji from 'fb-components/rich_text_editor/plugins/withEmoji.tsx'
import withSearch from 'fb-components/rich_text_editor/plugins/withSearch.tsx'
import { PlainTextSlateVisitor } from 'fb-components/rich_text_editor/visitors/PlainTextSlateVisitor'
import { ChannelType } from 'fb-components/struct/ChannelStruct.ts'
import { RoleStruct } from 'fb-components/struct/GuildStruct.ts'
import FilePicker from 'fb-components/utils/FilePicker.ts'
import { AssetType } from 'fb-components/utils/upload_cos/uploadType.ts'
import { delay, isEqual, isString, throttle } from 'lodash-es'
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BaseSelection, Descendant, Editor, Transforms, createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import { RenderElementProps, RenderLeafProps } from 'slate-react/dist/components/editable'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { GlobalEvent, globalEmitter } from '../../base_services/event'
import usePermissions from '../../base_services/permission/usePermissions'
import ChannelIcon from '../../components/ChannelIcon.tsx'
import RealtimeChannelName from '../../components/realtime_components/RealtimeChannel'
import { RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import { UserHelper } from '../../components/realtime_components/realtime_nickname/userSlice'
import Channel from '../../components/rich_text_editor/Channel.tsx'
import Mention from '../../components/rich_text_editor/Mention.tsx'
import { useSearchChannel } from '../../components/rich_text_editor/hooks/useSearchChannel.tsx'
import { useSearchMention } from '../../components/rich_text_editor/hooks/useSearchMention.tsx'
import { ChannelPermission, PermissionService, SpecialPermission } from '../../services/PermissionService'
import ChannelUtils, { LocalSpeakMode } from '../../utils/ChannelUtils.ts'
import DurationUtils from '../../utils/DurationUtils'
import { BotCommand, BotStruct } from '../bot/BotAPI.ts'
import BotCommandHandler from '../bot/BotCommandHandler.ts'
import { useBot } from '../bot/botSlice.ts'
import { DmChannelStruct } from '../dm/dmSlice.ts'
import { draftActions, draftSelectors } from '../draft/draftSlice'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { guildListSelectors } from '../guild_list/guildListSlice'
import { ChannelContext, GuildContext } from '../home/GuildWrapper'
import { possibleMentionsActions } from '../possibleMentionsSlice'
import MessageService from './MessageService'
import { SelectionList } from './components/SelectionList.tsx'
import ShortcutBar from './components/ShortcutBar.tsx'
import { PlainTextMessage } from './items/TextMessage'

interface MessageInputFieldProps {
  reply?: MessageStruct
  onCancelReply: () => void
  readonly?: boolean
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void
  chooseFiles: () => void
}

const NUM_BUTTONS = 4

function roundMillisecondsToMinute(milliseconds: number) {
  const msInM = 60000
  return Math.ceil(milliseconds / msInM) * msInM
}

function calculateMillisecondsRemaining(milliseconds: number) {
  return milliseconds % 6e4
}

const searchResultElementWrapper = (
  <div
    className={
      'absolute bottom-0 left-4 right-4 max-h-[408px] ' + 'border-[var(--fg-b10)]] overflow-y-auto border shadow-[0_4px_8px_0_rgba(26,32,51,0.08)]'
    }
  />
)

/**
 * 唤起机器人指令列表的斜杆按钮
 */
function BotCommandsButton({ botId }: { botId: string }) {
  const bot = useBot(botId)
  const [showCommands, setShowCommands] = useState(false)

  if (!bot?.commands?.length) return

  return (
    <>
      <Tooltip title={'机器人指令'}>
        <HoverBox onClick={() => setShowCommands(true)}>
          <iconpark-icon size={20} color="currentColor" name="DiagonalSquare" />
        </HoverBox>
      </Tooltip>
      {showCommands &&
        createPortal(<BotCommandsList close={() => setShowCommands(false)} bot={bot} />, document.getElementById('container-above-input')!)}
    </>
  )
}

function BotCommandsList({ bot, close }: { bot: BotStruct; close: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useClickAway(close, ref, 'mousedown')

  function onSelect(command: BotCommand) {
    BotCommandHandler.exec(command, { bot })
    close()
  }

  return (
    <div ref={ref} className={'p-2 bg-fgWhite1 border rounded-lg border-fgB10 shadow-[0px_4px_8px_0px_rgba(26,32,51,0.08)] mx-4'}>
      <SelectionList
        data={[
          {
            items: bot.commands,
          },
        ]}
        itemBuilder={cmd => <div className={'cursor-pointer leading-10 px-2 font-medium text-sm'}>/&nbsp;{cmd.command}</div>}
        keyGen={e => e.command_id}
        onSelect={cmd => onSelect(cmd)}
      />
    </div>
  )
}

export default function MessageInputField({ reply, onCancelReply, readonly = false, onPaste, chooseFiles }: MessageInputFieldProps) {
  if (readonly) reply = undefined

  const dispatch = useAppDispatch()
  const guild = useContext(GuildContext)
  const channel = useContext(ChannelContext)
  const slowModeCountdown = useRef<number>(0)
  const slowModeCountdownTimer = useRef<number | null>(null)
  const [canSay, setCanSay] = useState(true)

  // noinspection RequiredAttributes
  const renderElement = useCallback((props: RenderElementProps) => <RichTextElementRenderer {...props} Channel={Channel} Mention={Mention} />, [])
  // noinspection RequiredAttributes
  const renderLeaf = useCallback((props: RenderLeafProps) => <RichTextLeafRenderer {...props} />, [])
  const editor = useMemo(
    () =>
      withSearch(
        {
          '@': {
            elementType: 'mention',
            onSearch: s => mentionSearchOptions.setSearch(s),
          },
          '#': {
            elementType: 'channel',
            onSearch: s => channelSearchOptions.setSearch(s),
          },
        },
        withEmoji(withHistory(withReact(createEditor())))
      ),
    []
  )
  const mentionSearchOptions = useSearchMention(editor as never, channel!.guild_id, {
    channelId: channel!.channel_id,
    enabledMentionAll: true,
    enabledPossibleMention: true,
    enabledMentionRoles: true,
    elementWrapper: searchResultElementWrapper,
  })
  const channelSearchOptions = useSearchChannel(editor as never, channel!.guild_id, {
    elementWrapper: searchResultElementWrapper,
  })
  const previousSelection = useRef<BaseSelection | null>()

  const slowMode = useAppSelector(guildListSelectors.channelSlowMode(guild?.guild_id, channel?.channel_id))
  const { run: debouncedUpdateDraft } = useDebounceFn(
    () => {
      dispatch(draftActions.setDraft({ key: channel?.channel_id ?? 'unknown', content: editor.children }))
    },
    {
      wait: 500,
    }
  )

  const isSilence = !!guild && GuildUtils.isMuted(guild)
  const inactive = isSilence || readonly || !canSay

  const [endTime, setEndTime] = useState(0)
  const [showTipsTime, setShowTipsTime] = useState<number | undefined>(undefined)
  const showSilenceTime = useCallback(() => {
    if (isSilence) {
      const endTime = (guild?.no_say ?? 0) * 1000 - Date.now()
      setEndTime(roundMillisecondsToMinute(endTime))
      setShowTipsTime(calculateMillisecondsRemaining(endTime))
    } else {
      setEndTime(0)
      setShowTipsTime(undefined)
    }
  }, [isSilence])
  useRafTimeout(showSilenceTime, showTipsTime)
  useEffect(() => {
    showSilenceTime()
  }, [isSilence])

  const isDm = channel && 'recipient_id' in channel

  const initialValue: Descendant[] = useAppSelector(draftSelectors.getDraft(channel?.channel_id)) || EMPTY_SLATE

  const [placeholder, setPlaceholder] = useState<ReactNode | null>(null)
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(isEqual(initialValue, EMPTY_SLATE))

  const permissions = usePermissions({
    permission: ChannelPermission.ChannelManager | SpecialPermission.Administrator | ChannelPermission.SendMessage,
    channelId: channel?.channel_id,
  })
  const adminPermissions = permissions.has(ChannelPermission.ChannelManager | SpecialPermission.Administrator)
  const sendPermission = permissions.has(ChannelPermission.SendMessage)

  // 从 DOM 中获取输入框上方的节点，用来展示搜索结果
  const containerAboveInput = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    containerAboveInput.current = document.getElementById('container-above-input') as HTMLDivElement
  }, [])

  /**
   * 监听权限变化时改变慢速模式状态
   */
  useEffect(() => {
    if (!sendPermission) {
      setPlaceholder('该频道为只读模式')
      return
    }
    if (isSilence) {
      setPlaceholder(`禁言中，${DurationUtils.formatSeconds(endTime / 1000)}后解除`)
      return
    }
    if (slowMode) {
      if (adminPermissions) {
        if (channel) {
          const speakMode = ChannelUtils.getSpeakMode(channel)
          setPlaceholder(speakMode === LocalSpeakMode.Slow ? '慢速模式已启用' : '只读模式已启用')
        }
      } else {
        setPlaceholder(slowModeSendablePlaceholder(slowMode).placeholder)
        setCanSay(slowModeSendablePlaceholder(slowMode).canSay)
      }
      return
    }

    if (isDm) {
      if (channel.type === ChannelType.GroupChannel) {
        setPlaceholder(
          <>
            发送到&nbsp;
            <span className={'align-middle leading-none'}>
              <ChannelIcon
                size={'1em'}
                className="inline-block"
                style={{
                  marginRight: 4,
                  height: '1em',
                }}
                type={channel.type}
              />
            </span>
            <span>{channel.name}</span>
          </>
        )
        return
      }
      setPlaceholder(
        <>
          发给&nbsp;
          <RealtimeNickname userId={channel.recipient_id as string} />
        </>
      )
    } else {
      setPlaceholder(
        <>
          发送到&nbsp;
          <RealtimeChannelName prefixChannelIcon iconSpacing={2} />
        </>
      )
    }
  }, [permissions, slowMode, isSilence, endTime])

  useEffect(() => {
    if (reply) {
      ReactEditor.focus(editor)
      // 在连续点击回复时，光标会在开始和结尾切换，原因还不知道
      Transforms.select(editor, Editor.end(editor, []))
    }
  }, [reply])

  useEffect(() => {
    // 这行代码是为了解决一个 Bug：进入频道后首次点击 @ 按钮，会无法插入 @ 非只读情况
    let timer = null
    if (!inactive) {
      timer = setTimeout(() => {
        !inactive && Transforms?.select(editor, Editor?.end(editor, []))
      }, 10)
    }
    // 清除函数，用于在组件卸载时取消定时器
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  useEffect(() => {
    function handleInsertMention({ userId, channelId }: { userId: string; channelId?: string }) {
      if (!inactive && channelId && channel?.channel_id === channelId) {
        insertMention(userId)
        // 每次在频道 @ 用户，都把 TA 加入到可能 @ 的人里面
        dispatch(possibleMentionsActions.append({ guild: channel.guild_id, user: userId }))
      }
    }

    globalEmitter.addListener(GlobalEvent.InsertMention, handleInsertMention)
    return () => {
      globalEmitter.removeListener(GlobalEvent.InsertMention, handleInsertMention)
    }
  }, [channel])

  useEffect(() => {
    function callback(content: Descendant[]) {
      if (inactive) return

      editor.delete({
        at: {
          anchor: editor.start([]),
          focus: editor.end([]),
        },
      })

      editor.removeNodes({ at: [0] })
      editor.insertNodes(content)
      // 聚焦如果不加延迟会报错
      delay(ReactEditor.focus, 50, editor)
    }

    globalEmitter.addListener(GlobalEvent.SetCurrentChatInput, callback)
    return () => {
      globalEmitter.removeListener(GlobalEvent.SetCurrentChatInput, callback)
    }
  }, [channel])

  function slowModeSendablePlaceholder(seconds: number): { placeholder: string; canSay: boolean } {
    const READONLY = -1
    if (seconds === READONLY || !sendPermission)
      return {
        placeholder: '该频道为只读模式',
        canSay: false,
      }
    return {
      placeholder: `每${DurationUtils.formatSeconds(seconds)}可发送1条消息`,
      canSay: true,
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (mentionSearchOptions.onKeyDown(e)) {
      return
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()

      const EFFECT_BY_SLOW_MODE = !adminPermissions && !!slowMode
      if (EFFECT_BY_SLOW_MODE) {
        if (slowModeCountdown.current > 0) {
          FbToast.open({ content: `慢速模式已启用，${dayjs.duration(slowModeCountdown.current, 'second').format('mm:ss')}秒后可发言` })
          return
        } else {
          slowModeCountdown.current = slowMode
          startSlowModeCounter()
        }
      }

      const { text, ...rest } = new PlainTextSlateVisitor(editor.children, editor).result
      throttle(sendText, 1000, {
        trailing: false,
      })(text, rest)
      clear()
    } else if (e.key === 'Escape') {
      onCancelReply()
    }
  }

  function clear() {
    const point = { path: [0, 0], offset: 0 }
    editor.selection = { anchor: point, focus: point }
    editor.history = { redos: [], undos: [] }
    editor.delete({
      at: {
        anchor: editor.start([]),
        focus: editor.end([]),
      },
    })
  }

  function startSlowModeCounter() {
    if (slowModeCountdown && slowMode) {
      slowModeCountdownTimer.current = window.setInterval(() => {
        if (slowModeCountdown.current > 0) {
          slowModeCountdown.current = slowModeCountdown.current - 1
          if (slowModeCountdown.current == 0) {
            slowModeCountdownTimer.current && clearInterval(slowModeCountdownTimer.current)
            slowModeCountdownTimer.current = null
            setPlaceholder(slowModeSendablePlaceholder(slowMode).placeholder)
            setCanSay(slowModeSendablePlaceholder(slowMode).canSay)
          } else {
            setPlaceholder(`${dayjs.duration(slowModeCountdown.current, 'second').format('mm:ss')}后可发言`)
          }
        }
      }, 1000)
    }
    return () => {
      if (slowModeCountdownTimer.current) {
        clearInterval(slowModeCountdownTimer.current)
      }
    }
  }

  function sendText(text: string, options?: { contentType?: number; mentions?: string[]; mention_roles?: string[] }) {
    if (!text) return
    options = {
      contentType: 0,
      ...options,
    }
    const { contentType, ...rest } = options
    channel &&
      MessageService.instance
        .sendText(channel.channel_id, text, contentType, {
          guildId: guild?.guild_id,
          channelType: channel.type,
          reply,
          ...rest,
        })
        .catch(console.info)
    onCancelReply()
    setShowPlaceholder(true)
    // 立即清空草稿
    dispatch(draftActions.setDraft({ key: channel?.channel_id ?? 'unknown', content: '' }))
  }

  function chooseImageOrVideo() {
    FilePicker.pickMedias(AssetType)
      .then(files => {
        channel &&
          MessageService.instance
            .sendImageOrVideo(channel.channel_id, [...files], {
              guildId: guild?.guild_id,
              channelType: channel.type,
            })
            .then()
      })
      .catch(() => {
        /* ignore */
      })
  }

  const botId = useMemo(() => {
    if (channel && channel.type === ChannelType.DirectMessage) {
      const recipient = UserHelper.getUserLocally((channel as DmChannelStruct).recipient_id!)
      if (recipient && recipient.bot) {
        return recipient.user_id
      }
    }
    return undefined
  }, [channel])

  if (!channel) return null

  return (
    <div className={'m-4 mt-2'} onPaste={onPaste}>
      {channel && <ShortcutBar channel={channel} dmBotId={botId} />}

      <div
        className={clsx([
          'box-border flex min-h-[40px] w-auto flex-col gap-3 rounded-lg border border-[var(--fg-b10)] px-3 py-[5px]',
          readonly ? 'bg-[var(--bg-bg-1)]' : 'bg-[var(--bg-bg-3)]',
        ])}
      >
        {/* 回复标题 */}
        {reply && (
          <div className={'flex h-[28px] w-full items-center rounded bg-[var(--fg-b5)] px-2 pl-1'}>
            {/* 取消回复按钮 */}
            <HoverBox className={'p-0'}>
              <iconpark-icon onClick={onCancelReply} color={'var(--fg-b40)'} name="Close" size={16} />
            </HoverBox>
            <Divider type={'vertical'} className={'h-4'} />
            <span className={'flex-grow truncate text-xs text-[var(--fg-b40)]'} key={reply.message_id.toString()}>
              <span>回复</span>
              <RealtimeNickname userId={reply.user_id} />
              :&nbsp;
              <PlainTextMessage colorful={false} message={reply} />
            </span>
          </div>
        )}
        <div
          className={'float-left w-full'}
          style={{
            color: 'var(--fg-b100)',
          }}
        >
          {showPlaceholder && <div className={'absolute translate-y-[4px] select-none leading-[20px] text-[var(--fg-b40)]'}>{placeholder}</div>}
          {/* 文字输入框 */}
          {!inactive && (
            <Slate onChange={handleChange} editor={editor} initialValue={initialValue}>
              <Editable
                autoCorrect={'off'}
                autoComplete={'off'}
                spellCheck={'false'}
                onClick={e => e.stopPropagation()}
                maxLength={5000}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                className={
                  'inline-block max-h-[100px] translate-y-[4px] overflow-y-auto leading-[20px] outline-none outline-0 before:text-[var(--fg-b40)]'
                }
                style={{
                  minWidth: `calc(100% - 8px * ${NUM_BUTTONS + 1} - 28px * ${NUM_BUTTONS})`,
                  maxWidth: '100%',
                }}
              />
            </Slate>
          )}

          {/* 文字输入框右侧的按钮组 */}
          {!inactive && (
            <div className={'float-right flex flex-row gap-2 leading-[0]'}>
              <EmojiPopOver onClick={emoji => RichTextEditorUtils.insertEmoji(editor, emoji)}>
                <Tooltip title={'表情'}>
                  <HoverBox>
                    <iconpark-icon size={20} color="currentColor" name="Emoji" />
                  </HoverBox>
                </Tooltip>
              </EmojiPopOver>
              {!isDm && (
                <Tooltip title={'提及@'}>
                  <HoverBox onClick={insertMentionChar}>
                    <iconpark-icon size={20} color="currentColor" name="At" data-search={'at'} />
                  </HoverBox>
                </Tooltip>
              )}
              <Tooltip title={'图片/视频'}>
                <HoverBox onClick={chooseImageOrVideo}>
                  <iconpark-icon size={20} color="currentColor" name="Picture" />
                </HoverBox>
              </Tooltip>
              <Tooltip title={'文件'}>
                <HoverBox onClick={chooseFiles}>
                  <iconpark-icon size={20} color="currentColor" name="Folder" />
                </HoverBox>
              </Tooltip>
              {botId && <BotCommandsButton botId={botId} />}
            </div>
          )}
        </div>
      </div>
      {containerAboveInput.current && (
        <Portal container={containerAboveInput.current}>
          {channelSearchOptions.element}
          {mentionSearchOptions.element}
        </Portal>
      )}
    </div>
  )

  function insertMentionChar() {
    if (!ReactEditor.isFocused(editor)) {
      ReactEditor.focus(editor)
    }
    editor.insertText('@')
  }

  function insertMention(data: RoleStruct | string) {
    const id = isString(data) ? data : data.role_id
    const sign = isString(data) ? TextMentionSign.User : TextMentionSign.Role

    // 如果是提及用户，且用户没有查看频道的权限，以纯文本形式插入 @
    if (
      sign === TextMentionSign.User &&
      !isDm &&
      channel &&
      !PermissionService.computeChannelPermissions(guild, channel.channel_id, id).has(ChannelPermission.ViewChannel)
    ) {
      UserHelper.getName(id, guild?.guild_id).then(name => {
        RichTextEditorUtils.insertArbitrary(editor, `@${name}`)
      })
      return
    }

    const mention: MentionElement = {
      type: 'mention',
      id,
      sign,
      // todo 添加名称
      name: '',
      roleColor: isString(data) ? undefined : data.color,
      children: [{ text: '' }],
    }
    RichTextEditorUtils.insertArbitrary(editor, mention)
  }

  /**
   * 中文 IME 在输入拼音期间，如果输入框显示了拼音，也需要隐藏 placeholder
   */
  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    const inputEvent = e.nativeEvent as InputEvent
    if (inputEvent.isComposing) {
      if (inputEvent.data === null) {
        setShowPlaceholder(true)
      } else {
        setShowPlaceholder(false)
      }
    }
  }

  function handleChange() {
    debouncedUpdateDraft()
    setShowPlaceholder(isEqual(editor.children, EMPTY_SLATE))

    if (!ReactEditor.isFocused(editor)) return
    const { selection } = editor
    previousSelection.current = selection
  }
}
