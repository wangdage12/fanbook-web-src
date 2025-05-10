import { useDebounceFn } from 'ahooks'
import { Button, Divider } from 'antd'
import clsx from 'clsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import FocusReplyContext from 'fb-components/question/FocusReplyContext.ts'
import { EMPTY_SLATE } from 'fb-components/rich_text_editor/RichTextEditorUtils.tsx'
import RichTextToolbar from 'fb-components/rich_text_editor/RichTextToolbar.tsx'
import { RichTextStruct } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor.ts'
import { PlainTextSlateVisitor } from 'fb-components/rich_text_editor/visitors/PlainTextSlateVisitor.ts'
import FilePicker from 'fb-components/utils/FilePicker.ts'
import { ImageType } from 'fb-components/utils/upload_cos/uploadType.ts'
import CosUtils from 'fb-components/utils/upload_cos/utils.ts'
import React, { useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Descendant, Editor } from 'slate'
import { ReactEditor, Slate } from 'slate-react'
import GuildUtils from '../../guild_list/GuildUtils.tsx'
import usePublishTextMode from '../hooks/usePublishTextMode.ts'
import useQuestionEditor from '../hooks/useQuestionEditor.tsx'
import './reply-editor.css'

interface ReplyEditorProps {
  guildId: string
  channelId: string
  parent: string
  // 用于控制组件自身的动画，3、4 楼的回复编辑器不需要组件内部动画
  expandAnimation?: boolean
  placeholder: string
  autoFocus?: boolean
  showCancelButton?: boolean
  maxLength?: number
  onCancel?: () => void
  onClearReply?: () => void
  onComplete?: (richText: RichTextStruct) => Promise<void>
}

export type ReplyEditorHandler = {
  setReplyTitle: (replyTitle: string) => void
  focus: () => void
  getContent: () => string
}

const ReplyEditor = React.forwardRef<ReplyEditorHandler, ReplyEditorProps>(
  (
    { guildId, channelId, parent, expandAnimation, placeholder, onComplete, autoFocus, onCancel, showCancelButton = false, onClearReply, maxLength },
    ref
  ) => {
    useImperativeHandle(ref, () => {
      return {
        setReplyTitle: replyTitle => {
          setReplyTitle(replyTitle)
          setTimeout(() => {
            editor.select(editor.end([]))
            ReactEditor.focus(editor)
          }, 100)
        },
        focus: () => {
          setTimeout(() => {
            ReactEditor.focus(editor)
          }, 150)
        },
        getContent: () => {
          return Editor.string(editor, [])
        },
      }
    })
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (duringPublishing) return
        send()
      }
    }

    const [editorLen, setEditorLen] = useState(0)
    const [replyTitle, setReplyTitle] = useState<string | undefined>()
    const { editor, editorNode, searchNode } = useQuestionEditor(guildId, channelId, placeholder, 500, handleKeyDown)
    const publishTextMode = usePublishTextMode(editor)
    const [duringPublishing, setDuringPublishing] = useState(false)
    const { focusedReply } = useContext(FocusReplyContext)
    const expanded = focusedReply === parent
    const [isTextEmpty, setIsTextEmpty] = useState(true)
    const focusReplyContext = useContext(FocusReplyContext)
    const localUrl = useRef<string>()

    const { run: onTextChange } = useDebounceFn(
      (value: Descendant[]) => {
        const { text } = value ? new PlainTextSlateVisitor(value, editor).result : { text: '' }
        setIsTextEmpty(!text.trim())
        if (maxLength) {
          setEditorLen(Editor.string(editor, []).length)
        }
      },
      { wait: 50 }
    )

    const [image, setImage] = useState<{ file: File; localUrl: string; width: number; height: number } | undefined>()
    useEffect(() => {
      if (autoFocus) {
        setTimeout(() => {
          editor.select(editor.end([]))
          ReactEditor.focus(editor)
          const dom = ReactEditor.toDOMNode(editor, editor).parentNode as HTMLElement
          dom.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 800)
      }
    }, [autoFocus])

    const send = () => {
      const guild = GuildUtils.getGuildById(guildId)
      if (guild && GuildUtils.isMuted(guild)) {
        FbToast.open({ content: '你已被禁言，无法操作', type: 'warning' })
        return
      }
      if (maxLength && editorLen > maxLength) {
        FbToast.open({ content: `评论字数超出${maxLength}字限制`, key: 'reply-maxLength-limit' })
        return
      }
      setDuringPublishing(true)
      publishTextMode(image ? [image] : [])
        .then(async exporter => {
          return onComplete?.(exporter)
        })
        .then(() => {
          editor.delete({
            at: {
              anchor: editor.start([]),
              focus: editor.end([]),
            },
          })
          setImage(undefined)
          ReactEditor.blur(editor)
          setReplyTitle(undefined)
        })
        .finally(() => setDuringPublishing(false))
    }

    const handlePickImage = useCallback(() => {
      FilePicker.pickMedias(ImageType, { multiple: false })
        .then(async ([file]) => {
          localUrl.current = URL.createObjectURL(file)
          const res = await CosUtils.verifyImageFile(file, localUrl.current, { toast: true, size: 20 * 1024 })
          setImage({
            file,
            localUrl: localUrl.current,
            width: res.width as number,
            height: res.height as number,
          })
        })
        .catch(() => {
          localUrl.current && URL.revokeObjectURL(localUrl.current)
          localUrl.current = undefined
        })
    }, [])

    useEffect(() => {
      if (localUrl.current) {
        URL.revokeObjectURL(localUrl.current)
        localUrl.current = undefined
      }
    }, [])

    return (
      <>
        {searchNode}
        <div
          className={clsx([
            'w-full rounded-lg border border-[var(--fg-b10)] transition-[border-color] focus-within:border-[var(--fg-blue-1)]',
            expanded ? ' h-auto' : 'h-[36px]',
          ])}
        >
          <Slate editor={editor} initialValue={EMPTY_SLATE} onChange={onTextChange}>
            {replyTitle && expanded && (
              <div className={'mx-3 mb-1 mt-2 flex h-[28px] items-center gap-2 rounded-[4px] bg-[var(--fg-b5)] pl-2 text-xs text-[var(--fg-b40)]'}>
                <HoverBox
                  size={16}
                  onClick={() => {
                    setReplyTitle('')
                    setTimeout(() => {
                      ReactEditor.focus(editor)
                    }, 100)
                    onClearReply?.()
                  }}
                >
                  <iconpark-icon name="Close" size={14} color={'var(--fg-b40)'}></iconpark-icon>
                </HoverBox>
                <Divider type={'vertical'} className={'m-0 h-4'}></Divider>
                <div className={'truncate'}>{replyTitle}</div>
              </div>
            )}

            {React.cloneElement(editorNode, {
              className: clsx([
                'question-reply break-all max-h-[160px] w-full min-h-9 text-[15px] leading-[20px] overflow-y-scroll',
                'px-3 my-[7px] focus:outline-none',
                !expanded && '!whitespace-nowrap overflow-hidden text-clip',
                expandAnimation && 'transition-[padding] duration-300',
              ]),
              autoFocus: false,
              onFocus: () => {
                if (!focusReplyContext) return
                focusReplyContext.setFocusedReply(parent)
              },
            })}

            <div
              className={clsx(
                'flex w-full flex-col',
                expandAnimation && 'transition-opacity duration-300',
                expandAnimation && (expanded ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')
              )}
            >
              {image && (
                <div className={'relative h-20 w-20 py-1 pl-3'}>
                  <img src={image.localUrl} className={'h-[72px] w-[72px] rounded-[6px] object-cover'} alt={''} />
                  <div
                    className={
                      'flex-center absolute right-0 top-1 z-10 h-[18px] w-[18px] cursor-pointer rounded-bl-md rounded-tr-md bg-[var(--fg-widget)]'
                    }
                    onClick={() => {
                      setImage(undefined)
                      if (localUrl.current) {
                        URL.revokeObjectURL(localUrl.current)
                        localUrl.current = undefined
                      }
                    }}
                  >
                    <iconpark-icon name={'Close'} size={10} color={'var(--fg-white-1)'} />
                  </div>
                </div>
              )}
              {expanded && (
                <div className={'flex w-full items-center gap-2 px-3'}>
                  <RichTextToolbar
                    mention
                    className={'flex-1 py-[5px] text-[var(--fg-b60)]'}
                    buttonClassName={'w-[26px] h-[26px]'}
                    iconSize={16.5}
                    onPickImage={handlePickImage}
                  />

                  {maxLength && expanded && (
                    <div className={clsx(['text-xs', editorLen > maxLength ? ' text-[var(--function-red-1)]' : ' text-[var(--fg-b40)]'])}>
                      {editorLen}/{maxLength}
                    </div>
                  )}

                  {showCancelButton && (
                    <Button
                      shape={'round'}
                      className={'!h-7'}
                      size="small"
                      onClick={() => {
                        ReactEditor.blur(editor)
                        onCancel?.()
                      }}
                    >
                      取消
                    </Button>
                  )}
                  <Button
                    shape={'round'}
                    className={'!h-7'}
                    size="small"
                    type={'primary'}
                    disabled={isTextEmpty && !image}
                    onClick={send}
                    loading={duringPublishing}
                  >
                    发送
                  </Button>
                </div>
              )}
            </div>
          </Slate>
        </div>
      </>
    )
  }
)
ReplyEditor.displayName = 'ReplyEditor'
export default ReplyEditor
