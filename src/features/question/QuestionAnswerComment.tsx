import { Button } from 'antd'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import ExpandAnimation from 'fb-components/components/animation/ExpandAnimation.tsx'
import FocusReplyContext from 'fb-components/question/FocusReplyContext.ts'
import { QuestionNestedAnswerItem } from 'fb-components/question/QuestionAnswerItem.tsx'
import { QuestionAnswerContentType, QuestionAnswerStruct } from 'fb-components/question/types.ts'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import transformRichText from 'fb-components/rich_text/transform_rich_text.ts'
import { RichTextStruct } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor.ts'
import { SimpleUserStruct } from 'fb-components/struct/type.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { uniqWith } from 'lodash-es'
import { Op } from 'quill-delta'
import { Fragment, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import usePermissions from '../../base_services/permission/usePermissions.ts'
import EmptyPage from '../../components/EmptyPage.tsx'
import { RealtimeAvatar } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { UserHelper } from '../../components/realtime_components/realtime_nickname/userSlice.ts'
import { PostPermission } from '../../services/PermissionService.ts'
import ServeSideConfigService from '../../services/ServeSideConfigService.ts'
import { PaginationResp2 } from '../../types.ts'
import StateUtils from '../../utils/StateUtils.ts'
import { copyText } from '../../utils/clipboard.ts'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { AnswerReplyMenuDropdown } from './AnswerReplyMenuDropdown.tsx'
import ReplyEditor from './components/ReplyEditor.tsx'
import QuestionApi from './questionAPI.ts'
import { ArticleStatus, ArticleType } from './questionSlice.ts'
import QuestionUtils from './utils.ts'

interface QuestionAnswerCommentProps {
  data: QuestionAnswerStruct
  hiddenAnswerReply?: boolean
  displayReplyList: boolean
  onComment?: () => void
  onDelete?: (deleteCount: number) => void
}

interface onReplyAttr {
  respAnswerId: string
  replyId?: string
  subReplyId?: string
  richText: RichTextStruct
  quoteAuthor?: SimpleUserStruct
  type: ArticleType.answer | ArticleType.reply | ArticleType.subReply
  scrollIntoView?: boolean
}

interface onReplyDeleteAttr {
  replyId?: string
  subReplyId?: string
  type: ArticleType.reply | ArticleType.subReply
}

export type QuestionAnswerCommentHandler = {
  insertReply: (respAnswerId: string, richText: RichTextStruct, scrollIntoView?: boolean) => void
}

const QuestionAnswerComment = forwardRef<QuestionAnswerCommentHandler, QuestionAnswerCommentProps>(
  ({ data, hiddenAnswerReply = false, displayReplyList, onComment, onDelete }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const replyPermission = usePermissions({ permission: PostPermission.ReplyPost })
    const { answer } = data
    const [replyList, setReplyList] = useState<PaginationResp2<QuestionAnswerStruct>>({ next: 0, list: [] })
    const [subReplyPageParams, setSubReplyPageParams] = useState<Map<string, Omit<PaginationResp2<QuestionAnswerStruct>, 'list'> & ArticleStatus>>(
      new Map()
    )

    useImperativeHandle(ref, () => {
      return {
        insertReply: (respAnswerId, richText, scrollIntoView = false) => {
          onComplete({ respAnswerId, richText, type: ArticleType.answer, scrollIntoView })
        },
      }
    })

    useEffect(() => {
      if (!replyList.session && displayReplyList) {
        fetchReplyList({})
      }
    }, [displayReplyList])

    const fetchReplyList = async ({ replyId }: { replyId?: string }) => {
      const res = await QuestionApi.questionAnswerReplyList(answer.answer_id, replyId, replyList.session, replyList.from)
      setReplyList({
        ...res,
        hasMore: res.hasMore,
        list: [...(replyList.list ?? []), ...res.list],
      })
    }

    const fetchSubReplyList = async ({ answerId, replyId }: { questionId: string; answerId: string; replyId: string }) => {
      const apiState = subReplyPageParams.get(replyId)
      const res = await QuestionApi.questionAnswerReplyList(answerId, replyId, apiState?.session, apiState?.from)

      const reply = replyList.list?.find(e => e.answer.answer_id === replyId)
      if (!reply) return
      if (res.list.length > 0 && !apiState?.session && (reply.reply_list ?? [])?.length != 0) {
        res.list = res.list.slice(reply.reply_list.length, res.list.length)
      }
      // 去重 先添加新评论然后在展开回复 可能出现重复的
      reply.reply_list = [...(reply.reply_list ?? []), ...res.list]
      const originLength = reply.reply_list.length
      reply.reply_list = uniqWith(reply.reply_list, (a, b) => a.answer.answer_id == b.answer.answer_id)
      if (reply?.answer?.reply_count) {
        reply.answer.reply_count = reply.answer.reply_count - (originLength - reply.reply_list.length)
      }
      subReplyPageParams.set(replyId, { ...res, loading: false })
      setSubReplyPageParams(new Map(subReplyPageParams))
      reply.reply_list_has_more = res.hasMore ?? false
    }

    const createAnswer = async ({
      questionId,
      answerId,
      richText,
    }: {
      questionId: string
      answerId: string
      richText: RichTextStruct
    }): Promise<string> => {
      const res = await QuestionApi.answerCreate({
        questionId,
        channelId: data.answer.channel_id,
        answerId,
        content: JSON.stringify(richText.ops),
        mentions: richText.mentions,
        content_type: QuestionAnswerContentType.Text,
      })
      return res.answer_id
    }

    const onComplete = ({ respAnswerId, quoteAuthor, replyId, subReplyId, richText, type, scrollIntoView = false }: onReplyAttr) => {
      const newAnswer: QuestionAnswerStruct = {
        reply_list: [],
        // @ts-expect-error 本地填充的数据会少很多，尽量填上有的
        answer: {
          like_count: 0,
          channel_id: answer.channel_id,
          geo_region: ServeSideConfigService.geo_region,
          content: richText.ops,
          reply_count: 0,
          answer_id: respAnswerId,
          question_id: answer.question_id,
          created_at: Date.now() / 1000,
          user_id: LocalUserInfo.userId,
          guild_id: answer.guild_id,
          quote_l1: subReplyId ?? replyId ?? '0',
          quote_l2: subReplyId ? replyId ?? '0' : '0',
        },
        author: {
          user_id: LocalUserInfo.userId,
          nickname: StateUtils.localUser.nickname,
        },
        reply_user: quoteAuthor,
      }
      if (type === ArticleType.answer) {
        replyList.list.unshift(newAnswer)
        setReplyList({
          ...replyList,
        })
        scrollIntoView &&
          setTimeout(() => {
            containerRef.current?.querySelector('.reply-title')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }, 0)
      } else if (type === ArticleType.reply) {
        const replyIdx = replyList.list.findIndex(e => e.answer.answer_id === replyId)
        if (replyIdx === -1) return
        const reply = replyList.list[replyIdx]
        const updateReply: QuestionAnswerStruct = {
          ...reply,
          answer: {
            ...reply.answer,
            reply_count: reply.answer.reply_count + 1,
          },
          reply_list: [newAnswer, ...replyList.list[replyIdx].reply_list],
        }
        replyList.list.splice(replyIdx, 1, updateReply)
        setReplyList({
          ...replyList,
        })
      } else if (type === ArticleType.subReply) {
        const replyIdx = replyList.list.findIndex(e => e.answer.answer_id === replyId)
        if (replyIdx === -1) return
        const reply = replyList.list[replyIdx]
        const subReplyIdx = reply.reply_list.findIndex(e => e.answer.answer_id === subReplyId)
        if (subReplyIdx === -1) return
        reply.reply_list.splice(subReplyIdx + 1, 0, newAnswer)
        const updateReply: QuestionAnswerStruct = {
          ...reply,
          answer: {
            ...reply.answer,
            reply_count: reply.answer.reply_count + 1,
          },
          reply_list: [...reply.reply_list],
        }
        replyList.list.splice(replyIdx, 1, updateReply)
        setReplyList({
          ...replyList,
        })
      }
      onComment?.()
    }

    const onCopy = (content: Op[]) => {
      const text = richText2PlainText(transformRichText(content))
      copyText(text).then()
    }

    const onReplyDelete = ({ replyId, subReplyId, type }: onReplyDeleteAttr) => {
      let deleteCount = 0
      if (type === ArticleType.reply) {
        const replyIdx = replyList.list.findIndex(e => e.answer.answer_id === replyId)
        if (replyIdx === -1) return
        deleteCount = replyList.list[replyIdx].answer.reply_count + 1
        replyList.list.splice(replyIdx, 1)
        setReplyList({
          ...replyList,
        })
      } else if (type === ArticleType.subReply) {
        const replyIdx = replyList.list.findIndex(e => e.answer.answer_id === replyId)
        if (replyIdx === -1) return
        const reply = replyList.list[replyIdx]
        const subReplyIdx = reply.reply_list.findIndex(e => e.answer.answer_id === subReplyId)
        if (subReplyIdx === -1) return
        deleteCount = 1
        reply.reply_list.splice(subReplyIdx, 1)
        const updateReply: QuestionAnswerStruct = {
          ...reply,
          answer: {
            ...reply.answer,
            reply_count: reply.answer.reply_count - 1,
          },
          reply_list: [...reply.reply_list],
        }
        replyList.list.splice(replyIdx, 1, updateReply)
        setReplyList({
          ...replyList,
        })
      }
      onDelete?.(deleteCount)
    }

    return (
      <>
        <FocusReplyContext.Consumer>
          {({ focusedReply, setFocusedReply }) => {
            return (
              <ExpandAnimation condition={displayReplyList} transitionDuration={400}>
                <div className={'flex flex-col'} ref={containerRef}>
                  {replyPermission.any() && !hiddenAnswerReply && (
                    <div className={'flex w-full gap-2 py-2.5'}>
                      <RealtimeAvatar userId={LocalUserInfo.userId} className={'pt-0.5'} size={32} />
                      <ReplyEditor
                        guildId={answer.guild_id}
                        channelId={answer.channel_id}
                        onComplete={async richText => {
                          const respAnswerId = await createAnswer({
                            questionId: answer.question_id,
                            answerId: answer.answer_id,
                            richText,
                          })
                          onComplete({
                            respAnswerId,
                            richText,
                            type: ArticleType.answer,
                          })
                        }}
                        parent={answer.answer_id}
                        expandAnimation
                        placeholder={'说点什么...'}
                        maxLength={500}
                      />
                    </div>
                  )}

                  {!replyList.list.length ?
                    <div className="h-full w-full py-[36px]">
                      <EmptyPage message="暂无评论" context="说说你的见解吧" />
                    </div>
                  : <>
                      <div className={'reply-title pb-2 pt-4 text-sm text-[var(--fg-b60)]'}>全部评论&nbsp;{formatCount(answer.reply_count)}</div>
                      {replyList.list.map(reply => (
                        <div key={reply.answer.answer_id} className={'flex flex-col'} data-reply-id={reply.answer.answer_id}>
                          <QuestionNestedAnswerItem
                            data={reply}
                            showReply={replyPermission.any()}
                            onReply={() => setFocusedReply(reply.answer.answer_id)}
                            onLike={isLike => {
                              const { question_id, channel_id } = data.answer || {}
                              return QuestionUtils.toggleLike({
                                replyId: reply.answer.answer_id,
                                questionId: question_id,
                                channelId: channel_id,
                                isLike: isLike,
                              })
                            }}
                            moreWrapper={() => (
                              <AnswerReplyMenuDropdown
                                authorId={reply.author?.user_id}
                                guildId={answer.guild_id}
                                channelId={answer.channel_id}
                                questionId={answer.question_id}
                                replyId={reply.answer.answer_id}
                                onCopy={() => onCopy(reply.answer.content)}
                                onDelete={() =>
                                  onReplyDelete({
                                    type: ArticleType.reply,
                                    replyId: reply.answer.answer_id,
                                  })
                                }
                              >
                                <HoverBox size={18}>
                                  <iconpark-icon size={14} color={'var(--fg-b40)'} name="More" />
                                </HoverBox>
                              </AnswerReplyMenuDropdown>
                            )}
                          />
                          {replyPermission.any() && (
                            <ExpandAnimation transitionDuration={300} condition={focusedReply === reply.answer.answer_id}>
                              <div className={'pb-1 pl-10'}>
                                <ReplyEditor
                                  guildId={answer.guild_id}
                                  channelId={answer.channel_id}
                                  autoFocus
                                  parent={reply.answer.answer_id}
                                  maxLength={500}
                                  onComplete={async richText => {
                                    const respAnswerId = await createAnswer({
                                      questionId: answer.question_id,
                                      answerId: reply.answer.answer_id,
                                      richText,
                                    })
                                    onComplete({
                                      respAnswerId,
                                      richText,
                                      replyId: reply.answer.answer_id,
                                      quoteAuthor: reply.author,
                                      type: ArticleType.reply,
                                    })
                                  }}
                                  placeholder={`回复 ${UserHelper.getAliasName(reply.answer.user_id, reply.answer.guild_id, reply.author?.nickname)}`}
                                />
                              </div>
                            </ExpandAnimation>
                          )}
                          {reply.reply_list.map(subReply => (
                            <Fragment key={subReply.answer.answer_id}>
                              <QuestionNestedAnswerItem
                                data={subReply}
                                showReply={replyPermission.any()}
                                secondFloor
                                moreWrapper={() => (
                                  <AnswerReplyMenuDropdown
                                    authorId={subReply.author?.user_id}
                                    guildId={answer.guild_id}
                                    channelId={answer.channel_id}
                                    questionId={answer.question_id}
                                    replyId={subReply.answer.answer_id}
                                    onCopy={() => onCopy(subReply.answer.content)}
                                    onDelete={() =>
                                      onReplyDelete({
                                        type: ArticleType.subReply,
                                        replyId: reply.answer.answer_id,
                                        subReplyId: subReply.answer.answer_id,
                                      })
                                    }
                                  >
                                    <HoverBox size={18}>
                                      <iconpark-icon size={14} color={'var(--fg-b40)'} name="More" />
                                    </HoverBox>
                                  </AnswerReplyMenuDropdown>
                                )}
                                onReply={() => setFocusedReply(subReply.answer.answer_id)}
                                onLike={isLike => {
                                  const { question_id, channel_id } = data.answer || {}
                                  return QuestionUtils.toggleLike({
                                    questionId: question_id,
                                    channelId: channel_id,
                                    replyId: subReply.answer.answer_id,
                                    isLike: isLike,
                                  })
                                }}
                              />
                              {replyPermission.any() && (
                                <ExpandAnimation transitionDuration={300} condition={focusedReply === subReply.answer.answer_id}>
                                  <div className={'pb-1 pl-[72px]'}>
                                    <ReplyEditor
                                      guildId={subReply.answer.guild_id}
                                      channelId={subReply.answer.channel_id}
                                      parent={subReply.answer.answer_id}
                                      autoFocus
                                      maxLength={500}
                                      placeholder={`回复 ${UserHelper.getAliasName(
                                        subReply.answer.user_id,
                                        subReply.answer.guild_id,
                                        subReply.author?.nickname
                                      )}`}
                                      onComplete={async richText => {
                                        const respAnswerId = await createAnswer({
                                          questionId: answer.question_id,
                                          answerId: subReply.answer.answer_id,
                                          richText,
                                        })
                                        onComplete({
                                          respAnswerId,
                                          richText,
                                          replyId: reply.answer.answer_id,
                                          subReplyId: subReply.answer.answer_id,
                                          quoteAuthor: subReply.author,
                                          type: ArticleType.subReply,
                                        })
                                      }}
                                    />
                                  </div>
                                </ExpandAnimation>
                              )}
                            </Fragment>
                          ))}
                          {reply.reply_list && reply.reply_list.length < reply.answer.reply_count && (
                            <div
                              className={
                                'flex cursor-pointer flex-row py-2 pl-[72px] text-[13px] text-sm font-medium leading-[18px] text-[var(--fg-b60)]'
                              }
                              onClick={() => {
                                fetchSubReplyList({
                                  questionId: answer.question_id,
                                  answerId: answer.answer_id,
                                  replyId: reply.answer.answer_id,
                                })
                              }}
                            >
                              展开{formatCount(reply.answer.reply_count - reply.reply_list.length)}条回复
                              <iconpark-icon name="Down" color={'var(--fg-b60)'}></iconpark-icon>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  }
                  {replyList.hasMore && (
                    <div className={'py-2 text-center'}>
                      <Button type={'primary'} className={'bg-[var(--fg-blue-3)] text-[var(--fg-blue-1)]'} onClick={() => fetchReplyList({})}>
                        点击展开更多评论
                      </Button>
                    </div>
                  )}
                </div>
              </ExpandAnimation>
            )
          }}
        </FocusReplyContext.Consumer>
      </>
    )
  }
)

QuestionAnswerComment.displayName = 'QuestionAnswerComment'

export default QuestionAnswerComment
