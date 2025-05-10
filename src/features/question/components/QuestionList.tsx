import { QuestionStruct } from 'fb-components/question/types.ts'
import { isEqual } from 'lodash-es'
import { useEffect } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import EmptyPage from '../../../components/EmptyPage'
import ListFooter from '../../../components/ListFooter'
import { FetchConfig, useFetchState } from '../../../hooks/useFetchState'
import { QuestionSearchInfo } from '../questionAPI'
import { QuestionTypeKey, questionActions, questionSelectors } from '../questionSlice'
import QuestionItem from './QuestionItem'
import QuestionSearchItem from './QuestionSearchItem'

function Loading() {
  return new Array(6).fill(0).map((_, i) => <LoadingItem key={i} />)
}

function footer(visible: boolean) {
  return <ListFooter visible={visible}></ListFooter>
}

function LoadingItem() {
  return (
    <div className={'mb-[8px] flex h-[96px] cursor-pointer rounded-[12px] border-transparent bg-[var(--fg-white-1)] p-[12px]'}>
      <div className="w-full flex-1">
        <div className="w-full">
          <div className="float-left my-[3px] flex h-[16px] w-full rounded-[3px] bg-[var(--fg-b5)] text-[16px]"></div>
          <div className="float-left my-[3px] flex h-[16px] w-[66%] rounded-[3px] bg-[var(--fg-b5)] text-[16px]"></div>
        </div>
        <div className="float-left mt-[8px] flex gap-[12px] text-[12px] text-[var(--fg-b40)]">
          <div className="my-[2px] h-[12px] w-[48px] rounded-[4px] bg-[var(--fg-b5)]"></div>
          <div className="my-[2px] h-[12px] w-[48px] rounded-[4px] bg-[var(--fg-b5)]"></div>
          <div className="my-[2px] h-[12px] w-[48px] rounded-[4px] bg-[var(--fg-b5)]"></div>
        </div>
      </div>
      <div className="ml-[10px] h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[6px]  bg-[var(--fg-b5)]"></div>
    </div>
  )
}

export function QuestionCommonList<
  T extends QuestionStruct = QuestionStruct,
  P extends
    | {
        hasMore: boolean
      }
    | undefined = { hasMore: true },
>({
  fetchConfig,
  className,
  questionId,
  emptyMessage,
  type = QuestionTypeKey.All,
}: {
  fetchConfig: FetchConfig<T, P>
  className?: string
  questionId?: string
  emptyMessage?: React.ReactNode
  type: QuestionTypeKey
}) {
  const { list: questionInfos } = useAppSelector(questionSelectors.questionList, isEqual)
  const { fetchData, fetchState, isFetching } = useFetchState<T, P>(fetchConfig)
  const dispatch = useAppDispatch()

  async function getQuestionList(init = false) {
    if ((isFetching || !(fetchState?.hasMore ?? true)) && !init) {
      return
    }
    const info = await fetchData(init)
    dispatch(
      questionActions.setQuestionList({
        info: {
          ...info,
        },
        init,
      })
    )
  }

  useEffect(() => {
    getQuestionList(true)
  }, [fetchConfig])

  return (
    <div className={className}>
      {questionInfos.length ?
        <Virtuoso
          className={'mx-[16px] h-full'}
          data={questionInfos}
          components={{
            ScrollSeekPlaceholder: LoadingItem,
            Footer: () => footer(!isFetching && !(fetchState?.hasMore ?? false)),
          }}
          scrollSeekConfiguration={{
            enter: velocity => Math.abs(velocity) > 1000,
            exit: velocity => Math.abs(velocity) < 50,
          }}
          endReached={() => {
            getQuestionList()
          }}
          itemContent={(_, questionInfo) => (
            <QuestionItem key={questionInfo.question?.question_id} detail={questionInfo} selectedQuestionId={questionId} type={type} />
          )}
        />
      : !isFetching ?
        <div className="flex h-full w-full items-center justify-center">
          {typeof emptyMessage === 'string' ?
            <EmptyPage message={emptyMessage ?? '暂无问题'} />
          : emptyMessage}
        </div>
      : <div className="mx-[16px]">
          <Loading />
        </div>
      }
    </div>
  )
}

export function QuestionSearchList<
  T extends QuestionSearchInfo = QuestionSearchInfo,
  P extends { hasMore: boolean } | undefined = { hasMore: true },
>({
  fetchConfig,
  className,
  questionId,
  answerId,
  keyword,
}: {
  fetchConfig: FetchConfig<T, P>
  className?: string
  questionId?: string
  answerId?: string
  keyword?: string
}) {
  const { list: questionInfos } = useAppSelector(questionSelectors.questionSearchList, isEqual)
  const { fetchData, fetchState, isFetching } = useFetchState<T, P>(fetchConfig)
  const dispatch = useAppDispatch()

  async function getQuestionList(init = false) {
    if ((isFetching || !(fetchState?.hasMore ?? true)) && !init) {
      return
    }
    const info = await fetchData(init)
    dispatch(
      questionActions.setQuestionSearchListList({
        info: {
          ...info,
        },
        init,
      })
    )
  }

  useEffect(() => {
    getQuestionList(true)
  }, [fetchConfig])

  return (
    <div className={className}>
      {questionInfos.length ?
        <Virtuoso
          className={' mx-[16px] h-full'}
          data={questionInfos}
          components={{
            ScrollSeekPlaceholder: LoadingItem,
            Footer: () => footer(!isFetching && !(fetchState?.hasMore ?? false)),
          }}
          scrollSeekConfiguration={{
            enter: velocity => Math.abs(velocity) > 1000,
            exit: velocity => Math.abs(velocity) < 50,
          }}
          endReached={() => {
            getQuestionList()
          }}
          itemContent={(_, questionInfo) => (
            <QuestionSearchItem
              key={`${questionInfo.question.question_id}_${questionInfo.answer?.answer_id}`}
              detail={questionInfo}
              selectedQuestionId={questionId}
              selectedAnswerId={answerId}
              keyword={keyword}
            />
          )}
        />
      : !isFetching ?
        <div className="flex h-full w-full items-center justify-center">
          <EmptyPage message={'暂无相关问题'} />
        </div>
      : <div className="mx-[16px]">
          <Loading />
        </div>
      }
    </div>
  )
}
