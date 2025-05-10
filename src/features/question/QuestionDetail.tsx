import { useInViewport } from 'ahooks'
import { Button, Divider } from 'antd'
import FbToast from 'fb-components/base_ui/fb_toast/index.tsx'
import CircularLoading from 'fb-components/components/CircularLoading'
import HoverBox from 'fb-components/components/HoverBox'
import FocusReplyContext from 'fb-components/question/FocusReplyContext.ts'
import QuestionArticle from 'fb-components/question/QuestionArticle'
import QuestionContext from 'fb-components/question/QuestionContext'
import QuestionReactions from 'fb-components/question/QuestionReactions'
import { QuestionAnswerArticleStruct, QuestionAnswerStruct, QuestionArticleStruct, QuestionStruct } from 'fb-components/question/types'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import { ReactionStruct, SwitchType } from 'fb-components/struct/type'
import { formatCount } from 'fb-components/utils/common.ts'
import { uniqBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import FileUnknown from '../../assets/images/file_unknown.svg'
import usePermissions from '../../base_services/permission/usePermissions.ts'
import EmptyPage from '../../components/EmptyPage'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import ShareMenuDropdown from '../../components/share/ShareMenuDropdown.tsx'
import UserCard from '../../components/user_card'
import { PostPermission } from '../../services/PermissionService.ts'
import { PaginationResp } from '../../types'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import AnswerPublisher from './AnswerPublisher.tsx'
import { QuestionAnswer } from './QuestionAnswer.tsx'
import QuestionMenuDropdown, { QuestionActions } from './QuestionMenuDropdown'
import { generateQuestionAfterHandler } from './generateQuestionAfterHandler.ts'
import useJoinGuild from './hooks/useJoinGuild.ts'
import QuestionApi from './questionAPI.ts'
import { ArticleStatus, QuestionAnswerContentStruct, QuestionContentStruct } from './questionSlice'
import QuestionUtils from './utils.ts'

export interface BaseQuestionDetailProps {
  questionId?: string
  originDetail?: QuestionContentStruct
  guildVisible?: boolean
  onGuildClick?: () => void
  onClose?: () => void
}

export type QuestionDetailProps = BaseQuestionDetailProps & QuestionActions

export function QuestionDetail({
  questionId: viewQuestionId,
  originDetail,
  guildVisible = false,
  onClose,
  onView,
  onDeleteQuestion,
  onCollect,
  onDigest,
  onUpdatePermission,
  onTop,
  onAnswer,
}: QuestionDetailProps) {
  const currentGuildId = GuildUtils.getCurrentGuildId()
  const { questionId: routeQuestionId } = useParams()
  const questionId = useMemo(() => {
    // 来自弹窗的问题详情
    return viewQuestionId ?? routeQuestionId
  }, [viewQuestionId, routeQuestionId])

  const [questionDetail, setQuestionDetail] = useState<QuestionContentStruct | undefined>(originDetail)
  const { author, question, guild, tags, deleted, no_permission, loading } = questionDetail ?? {}
  const onGuildClick = useJoinGuild(question?.guild_id)
  const scrollableDivId = useMemo(() => `${uuidv4()}`, [])
  const [answerDetail, setAnswerDetail] = useState<PaginationResp<QuestionAnswerContentStruct> & ArticleStatus>({
    hasMore: false,
    last_id: '',
    list: [],
    next: 0,
    session: '',
    loading: false,
  })
  const { list: answerList = [], loading: answerLoading, hasMore: answerListHasMore = false } = answerDetail ?? {}
  const articleRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [isArticleVisible = true] = useInViewport(articleRef, { threshold: 0.2 })
  const [isAnswerBtnVisible = true] = useInViewport(btnRef, { threshold: 0.4 })
  const replyPermission = usePermissions({ permission: PostPermission.ReplyPost })
  const [focusedReply, setFocusedReply] = useState<string>()
  const afterShareHandler = useMemo(() => {
    if (!questionDetail) {
      return
    }
    const { question_id, guild_id, title, parsed = [] } = questionDetail.question ?? {}
    const { user_id = '', nickname = '' } = author ?? {}
    return question_id ?
        generateQuestionAfterHandler({
          questionId: question_id,
          authorId: user_id,
          authorName: nickname,
          guildId: guild_id,
          content: `${title ?? ''} ${richText2PlainText(parsed)}`,
        })
      : undefined
  }, [questionDetail])

  const handleReactionsClick = useCallback(
    async (name: string) => {
      if (!questionId || !question) return
      const { reactions } = question
      const { me = false, count } = reactions?.find(item => item.name === name) ?? { me: false, count: 0 }
      me ?
        await QuestionApi.reactionCancel({ questionId, channelId: question.channel_id, emoji: name })
      : await QuestionApi.reactionAdd({ questionId, channelId: question.channel_id, emoji: name })

      const updateReactions = [{ name, me: !me, count: count + (me ? -1 : 1) }] as ReactionStruct[]

      setQuestionDetail({
        ...questionDetail,
        question: {
          ...(question as QuestionArticleStruct),
          reactions: uniqBy([...updateReactions, ...(reactions ?? [])], 'name'),
        },
      })
    },
    [questionId, question]
  )

  const [publisher, setPublisher] = useState(false)

  useEffect(() => {
    return () => {
      setFocusedReply(undefined)
    }
  }, [])

  // 上报浏览
  useEffect(() => {
    if (questionId) {
      QuestionApi.questionView(questionId)
        .then(succeed => {
          if (succeed) {
            onView?.()
          }
        })
        .catch(() => {
          /* ignore */
        })
    }
  }, [questionId])

  useEffect(() => {
    if (questionId) {
      if (!loading && !deleted) {
        if (!questionDetail) {
          setQuestionDetail({ loading: true })
        }
        QuestionApi.questionDetail(questionId).then(detail => {
          setQuestionDetail({ ...detail, loading: false })
          fetchAnswerList()
        })
      }
    }
  }, [questionId])

  const fetchAnswerList = async () => {
    setAnswerDetail({
      ...answerDetail,
      loading: true,
    })
    const { last_id } = answerDetail ?? {}
    const res = await QuestionApi.answerList({ questionId, lastId: last_id })
    setAnswerDetail({
      ...res,
      hasMore: res.next == 1,
      loading: false,
      list: [...answerDetail.list, ...res.list],
    })
  }

  const onToggleLike = async (answerItem: QuestionAnswerStruct) => {
    const { answer } = answerItem
    const { is_liked = SwitchType.No, question_id, channel_id, answer_id } = answer
    const isLike = await QuestionUtils.toggleLike({
      questionId: question_id,
      channelId: channel_id,
      replyId: answer_id,
      isLike: is_liked,
    })
    const updateIdx = answerDetail.list.indexOf(answerItem)
    if (updateIdx === -1) return
    const updateAnswer = {
      ...answerItem,
      answer: {
        ...answer,
        is_liked: isLike,
      },
    }
    answerDetail.list.splice(updateIdx, 1, updateAnswer)
    setAnswerDetail({ ...answerDetail })
  }
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircularLoading size={24} />
      </div>
    )
  }

  if (deleted || !question) {
    return (
      <div className="relative h-full w-full">
        {onClose && (
          <HoverBox className=" absolute right-[16px] top-[14px]" onClick={onClose}>
            <iconpark-icon size={20} name="Close" />
          </HoverBox>
        )}
        <EmptyPage
          message={
            onClose || deleted ?
              no_permission ?
                '问题无权限访问'
              : '问题不存在'
            : ''
          }
          context={onClose ? '' : '点击左侧问题浏览内容'}
          image={FileUnknown}
          imageSize={36}
        />
      </div>
    )
  }

  function updateReplyCount(answerId: string, updateCount: number) {
    const answerIdx = answerList.findIndex(e => e.answer?.answer_id === answerId)
    if (answerIdx === -1) return
    const answer = answerList[answerIdx]
    answerList.splice(answerIdx, 1, {
      ...answer,
      answer: {
        ...(answer.answer as QuestionAnswerArticleStruct),
        reply_count: (answer.answer?.reply_count ?? 0) + updateCount,
      },
    })
    setAnswerDetail({
      ...answerDetail,
      list: [...answerList],
    })
  }

  function onComment(answer: QuestionAnswerStruct) {
    setFocusedReply(undefined)
    updateReplyCount(answer.answer.answer_id, 1)
  }

  function onDelete(deleteCount: number, answer: QuestionAnswerStruct) {
    updateReplyCount(answer.answer.answer_id, -deleteCount)
  }

  function onQuestionPropertyChange(property: keyof QuestionArticleStruct, value: string | number) {
    setQuestionDetail({
      ...questionDetail,
      question: {
        ...(question as QuestionArticleStruct),
        [property]: value,
      },
    })
    // }
  }

  function handleAnswer() {
    const targetGuild = guild && GuildUtils.getGuildById(guild.guild_id)
    if (targetGuild && GuildUtils.isMuted(targetGuild)) {
      FbToast.open({ content: '你已被禁言，无法操作', type: 'warning' })
      return
    }
    setPublisher(true)
  }

  return (
    // 标题栏
    <QuestionContext.Provider
      value={{
        author: author,
        questionId: question.question_id,
        openedArticleId: question.question_id,
        buildAvatar: (user, size) => {
          return (
            <UserCard userId={user.user_id}>
              <RealtimeAvatar userId={user.user_id} size={size} className={'cursor-pointer'} />
            </UserCard>
          )
        },
        buildName: user => (
          <UserCard userId={user.user_id}>
            <RealtimeNickname userId={user.user_id} className={'cursor-pointer'} />
          </UserCard>
        ),
        guildVisible,
        onGuildClick,
      }}
    >
      <FocusReplyContext.Provider value={{ focusedReply, setFocusedReply }}>
        <div className="flex h-full flex-col rounded-xl bg-[var(--bg-bg-3)] leading-[1.625] text-[var(--fg-b100)]">
          <div className={'flex h-14 flex-shrink-0 items-center px-[16px] text-[17px] font-medium'}>
            <div className={'flex-1 truncate'}>{isArticleVisible || isAnswerBtnVisible ? '问题详情' : question.title}</div>
            {!(isArticleVisible || isAnswerBtnVisible) && replyPermission.any() ?
              <Button
                ref={btnRef}
                className="mr-[12px]"
                type="primary"
                ghost
                shape="round"
                icon={<iconpark-icon class="anticon" size={14} name="Edit" />}
                onClick={() => setPublisher(true)}
              >
                {answerList.length || question.answer_count ? '写回答' : '抢首答'}
              </Button>
            : null}
            <ShareMenuDropdown guildId={question.guild_id} channelId={question.channel_id} afterHandler={afterShareHandler}>
              <HoverBox className="mr-[12px]">
                <iconpark-icon size={20} name="Share" />
              </HoverBox>
            </ShareMenuDropdown>
            {(questionDetail?.question?.question_id ?? false) && (
              <QuestionMenuDropdown
                article={questionDetail as QuestionStruct}
                onDeleteQuestion={() => {
                  setQuestionDetail({ deleted: true, loading: false })
                  onDeleteQuestion?.()
                }}
                onTop={res => {
                  onQuestionPropertyChange('is_top', res)
                  onTop?.(res)
                }}
                onCollect={res => {
                  onQuestionPropertyChange('is_collected', res)
                  onCollect?.(res)
                }}
                onDigest={res => {
                  onQuestionPropertyChange('is_digest', res)
                  onDigest?.(res)
                }}
                onUpdatePermission={res => {
                  onQuestionPropertyChange('read_permission', res)
                  onUpdatePermission?.(res)
                }}
              >
                <HoverBox>
                  <iconpark-icon size={20} name="More" />
                </HoverBox>
              </QuestionMenuDropdown>
            )}
            {onClose && (
              <HoverBox className="ml-[12px]" onClick={onClose}>
                <iconpark-icon size={20} name="Close" />
              </HoverBox>
            )}
          </div>
          {/*分割线*/}
          <Divider rootClassName={'m-0'} />
          {/*滚动区域*/}
          <div className={'h-full overflow-y-auto'} id={scrollableDivId}>
            <InfiniteScroll
              scrollableTarget={scrollableDivId}
              dataLength={answerList.length}
              next={() => {
                fetchAnswerList()
              }}
              hasMore={answerListHasMore}
              loader={
                !answerList.length ?
                  <></>
                : <div className={'flex-center h-[48px]'}>
                    <CircularLoading />
                  </div>
              }
              endMessage={
                answerList.length > 0 ? <div className={'flex-center mb-[16px] h-[48px] text-xs text-[var(--fg-b30)]'}>- 暂无更多回答 -</div> : null
              }
            >
              {/*正文区*/}
              <div className={'flex flex-1 flex-col overflow-y-scroll px-6 py-2'}>
                {/*文章标题*/}
                <div className={'pb-1 text-[22px] font-medium leading-[36px]'}>{question.title}</div>
                {/*正文*/}
                <QuestionArticle
                  ref={articleRef}
                  data={question}
                  author={author}
                  tags={tags}
                  guild={guild?.guild_id !== currentGuildId ? guild : undefined}
                />
                {/*按钮区*/}
                <div className={'flex gap-2 py-6'}>
                  {replyPermission.any() && (
                    <Button
                      ref={btnRef}
                      className="h-9"
                      type="primary"
                      shape="round"
                      icon={<iconpark-icon class="anticon" size={16} name="Edit" />}
                      onClick={handleAnswer}
                    >
                      {answerList.length || question.answer_count ? '写回答' : '抢首答'}
                    </Button>
                  )}
                  <div className={'flex-1'} />
                  {question.reactions && <QuestionReactions reactions={question.reactions} onClick={handleReactionsClick} />}
                </div>
                {/*分割线*/}
                <Divider className={'m-0'} />
                {/*回答列表*/}
                {answerList.length ?
                  <>
                    <div className={'pb-1 pt-4 text-[14px] font-medium'}>回答&nbsp;{formatCount(question.answer_count)}</div>
                    {answerList.map(item =>
                      item?.answer ?
                        <QuestionAnswer
                          key={item.answer.answer_id}
                          data={item as QuestionAnswerStruct}
                          onToggleLike={() => onToggleLike(item as QuestionAnswerStruct)}
                          onComment={() => onComment(item as QuestionAnswerStruct)}
                          onDeleteAnswer={() => {
                            const idx = answerList.indexOf(item)
                            if (idx === -1) return
                            answerList.splice(idx, 1)
                            setAnswerDetail({
                              ...answerDetail,
                              list: [...answerList],
                            })
                            if (!originDetail) {
                              setQuestionDetail({
                                ...questionDetail,
                                question: {
                                  ...(questionDetail?.question as QuestionArticleStruct),
                                  answer_count: (questionDetail?.question?.answer_count ?? 1) - 1,
                                },
                              })
                            }
                          }}
                          onToggleSuggest={isChoose => {
                            const idx = answerList.indexOf(item)
                            if (idx === -1) return
                            const updateAnswer: QuestionAnswerStruct = {
                              ...(answerList[idx] as QuestionAnswerStruct),
                              answer: {
                                ...(answerList[idx].answer as QuestionAnswerArticleStruct),
                                is_choose: isChoose,
                              },
                            }
                            answerList.splice(idx, 1, updateAnswer)
                            setAnswerDetail({
                              ...answerDetail,
                              list: [...answerList],
                            })
                          }}
                          onDeleteReply={deleteCount => onDelete(deleteCount, item as QuestionAnswerStruct)}
                        />
                      : null
                    )}
                  </>
                : answerLoading ?
                  <div className="flex w-full items-center justify-center py-[48px]">
                    <CircularLoading size={24} />
                  </div>
                : <div className="h-full w-full py-[48px]">
                    <EmptyPage message="还没有收到回答" context="快成为第一个解答的人吧" />
                  </div>
                }
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </FocusReplyContext.Provider>
      {publisher && (
        <AnswerPublisher
          question={question}
          onClose={newAnswer => {
            if (newAnswer) {
              setAnswerDetail({
                ...answerDetail,
                list: [newAnswer, ...answerList],
              })
              setQuestionDetail({
                ...questionDetail,
                question: {
                  ...(questionDetail?.question as QuestionArticleStruct),
                  answer_count: (questionDetail?.question?.answer_count ?? 0) + 1,
                },
              })
              onAnswer?.(newAnswer)
            }
            setPublisher(false)
          }}
        />
      )}
    </QuestionContext.Provider>
  )
}

export default QuestionDetail
