import { Divider } from 'antd'
import CircularLoading from 'fb-components/components/CircularLoading'
import HoverBox from 'fb-components/components/HoverBox'
import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import AnswerContext from 'fb-components/question/AnswerContext'
import FocusReplyContext from 'fb-components/question/FocusReplyContext.ts'
import { AnswerArticle } from 'fb-components/question/QuestionArticle.tsx'
import QuestionContext from 'fb-components/question/QuestionContext.ts'
import { QuestionAnswerContentType, QuestionAnswerStruct } from 'fb-components/question/types.ts'
import { richText2PlainText } from 'fb-components/rich_text/converter/rich_text_to_plain_format.ts'
import { formatCount } from 'fb-components/utils/common.ts'
import { cloneDeep } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import FileUnknown from '../../assets/images/file_unknown.svg'
import usePermissions from '../../base_services/permission/usePermissions.ts'
import EmptyPage from '../../components/EmptyPage'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo'
import ShareMenuDropdown from '../../components/share/ShareMenuDropdown.tsx'
import UserCard from '../../components/user_card/index.tsx'
import { PostPermission } from '../../services/PermissionService.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { AnswerMenuDropdown } from './AnswerMenuDropdown.tsx'
import QuestionAnswerComment, { QuestionAnswerCommentHandler } from './QuestionAnswerComment.tsx'
import { showQuestionDetailModal } from './QuestionModal.tsx'
import ReplyEditor from './components/ReplyEditor.tsx'
import { generateQuestionAfterHandler } from './generateQuestionAfterHandler.ts'
import { useAnswerDetail } from './hooks.ts'
import useJoinGuild from './hooks/useJoinGuild.ts'
import QuestionApi from './questionAPI.ts'

interface QuestionDetailProps {
  questionId?: string
  answerId?: string
  guildVisible?: boolean
  onClose?: () => void
}

function AnswerDetail({ questionId: viewQuestionId, answerId: viewAnswerId, guildVisible, onClose }: QuestionDetailProps) {
  const commentRef = useRef<QuestionAnswerCommentHandler>(null)
  const currentGuildId = GuildUtils.getCurrentGuildId()
  const replyPermission = usePermissions({ permission: PostPermission.ReplyPost })
  const { questionId: routeQuestionId, answerId: routeAnswerId } = useParams()
  const [focusedReply, setFocusedReply] = useState<string>()

  const questionId = useMemo(() => {
    // 来自弹窗的问题详情
    return viewQuestionId ?? routeQuestionId
  }, [viewQuestionId, routeQuestionId])

  const answerId = useMemo(() => {
    // 来自弹窗的问题详情
    return viewAnswerId ?? routeAnswerId
  }, [viewAnswerId, routeAnswerId])

  const { loading, detail: remoteDetail } = useAnswerDetail({ questionId, answerId }, false)
  const [answerDetail, setAnswerDetail] = useState<QuestionAnswerStruct | undefined>()
  const { answer, author, guild, question, deleted, no_permission } = answerDetail ?? {}
  const onGuildClick = useJoinGuild(answer?.guild_id)

  const afterShareHandler = useMemo(() => {
    if (!answerDetail) return
    const { question_id, answer_id, guild_id, parsed = [] } = answerDetail.answer ?? {}
    const { user_id = '', nickname = '' } = author ?? {}
    return question_id ?
        generateQuestionAfterHandler({
          questionId: question_id,
          answerId: answer_id,
          authorId: user_id,
          authorName: nickname,
          guildId: guild_id,
          content: `${richText2PlainText(parsed)}`,
        })
      : undefined
  }, [answerDetail])

  const updateReplyCount = (count: number) => {
    if (!answerDetail) return
    const updateDetail = {
      ...(answerDetail as QuestionAnswerStruct),
      answer: {
        ...answerDetail.answer,
        reply_count: answerDetail.answer.reply_count + count,
      },
    }
    setAnswerDetail(updateDetail)
  }

  useEffect(() => {
    if (!loading && remoteDetail) {
      setAnswerDetail(cloneDeep(remoteDetail))
    }
  }, [remoteDetail, loading])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircularLoading size={24} />
      </div>
    )
  }

  if (deleted || !answerDetail || !answer) {
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
                '回答无权限访问'
              : '回答不存在'
            : ''
          }
          image={FileUnknown}
          imageSize={44}
        />
      </div>
    )
  }

  return (
    // 标题栏
    <QuestionContext.Provider
      value={{
        questionId: question?.question_id ?? '',
        openedArticleId: answer?.answer_id ?? '',
        author: {
          user_id: question?.user_id ?? '',
        },
        buildAvatar: (user, size) => (
          <UserCard userId={user.user_id}>
            <RealtimeAvatar userId={user.user_id} size={size} className={'cursor-pointer'} />
          </UserCard>
        ),
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
        <AnswerContext.Provider
          value={{
            moreWrapper: () => null,
            btnsWrapper: () => null,
          }}
        >
          <div className="flex h-full flex-col rounded-xl bg-[var(--bg-bg-3)] leading-[1.625] text-[var(--fg-b100)]">
            <div className={'flex h-14 flex-shrink-0 items-center px-[16px] text-[17px] font-medium'}>
              <div className={'flex-1 truncate'}>回答详情</div>
              <ShareMenuDropdown guildId={answer.guild_id} channelId={answer.channel_id} afterHandler={afterShareHandler}>
                <HoverBox className="mr-[12px]">
                  <iconpark-icon size={20} name="Share" />
                </HoverBox>
              </ShareMenuDropdown>
              <AnswerMenuDropdown
                article={answerDetail as QuestionAnswerStruct}
                onToggleSuggest={isChoose => {
                  setAnswerDetail({
                    ...answerDetail,
                    answer: {
                      ...answerDetail?.answer,
                      is_choose: isChoose,
                    },
                  })
                }}
              >
                <HoverBox>
                  <iconpark-icon size={20} name="More" />
                </HoverBox>
              </AnswerMenuDropdown>
              {onClose && (
                <HoverBox className="ml-[12px]" onClick={onClose}>
                  <iconpark-icon size={20} name="Close" />
                </HoverBox>
              )}
            </div>
            {/*分割线*/}
            <Divider rootClassName={'m-0'} />
            {/*滚动区域*/}
            <div className={'flex-1 overflow-y-auto'}>
              {/*正文区*/}
              <div className={'flex flex-1 flex-col overflow-y-scroll px-6 py-2'}>
                {/*文章标题*/}
                <div className={'break-all pb-1 text-[18px] font-medium leading-[36px]'}>
                  <TenSizeTag color="blue" text="问" bordered className="mr-[8px] align-[.05em]"></TenSizeTag>
                  {question?.title}
                </div>
                <span
                  className={'flex cursor-pointer items-center text-[12px] leading-[18px] text-[var(--fg-b60)]'}
                  onClick={() => {
                    showQuestionDetailModal({
                      questionId: answer?.question_id,
                    })
                  }}
                >
                  {formatCount(question?.view_count)} 浏览 · {formatCount(question?.answer_count)} 回复
                  <iconpark-icon name="Right" class="ml-[4px] text-[var(--fg-b20)]"></iconpark-icon>
                </span>

                {/*分割线*/}
                <Divider className={'mx-0 my-[10px]'} />
                {/*回答列表*/}
                {answerDetail && <AnswerArticle data={answer} author={author} guild={guild?.guild_id !== currentGuildId ? guild : undefined} />}
                {/*子评论*/}
                <QuestionAnswerComment
                  ref={commentRef}
                  hiddenAnswerReply
                  data={answerDetail as QuestionAnswerStruct}
                  displayReplyList={true}
                  onDelete={deleteCount => updateReplyCount(-deleteCount)}
                  onComment={() => {
                    setFocusedReply(undefined)
                    updateReplyCount(1)
                  }}
                />
              </div>
            </div>
            {replyPermission.any() && (
              <div className={'flex w-full gap-2 p-4'}>
                <ReplyEditor
                  parent={answer.answer_id}
                  guildId={answer.guild_id}
                  channelId={answer.channel_id}
                  expandAnimation
                  placeholder={'说点什么...'}
                  maxLength={500}
                  onComplete={async richText => {
                    const res = await QuestionApi.answerCreate({
                      questionId: answer.question_id,
                      channelId: answer.channel_id,
                      answerId: answer.answer_id,
                      content: JSON.stringify(richText.ops),
                      mentions: richText.mentions,
                      content_type: QuestionAnswerContentType.Text,
                    })
                    commentRef.current?.insertReply(res.answer_id, richText, true)
                    setAnswerDetail({
                      ...answerDetail,
                      answer: {
                        ...answerDetail?.answer,
                        reply_count: answerDetail?.answer.reply_count + 1,
                      },
                    })
                  }}
                />
              </div>
            )}
          </div>
        </AnswerContext.Provider>
      </FocusReplyContext.Provider>
    </QuestionContext.Provider>
  )
}

export default AnswerDetail
