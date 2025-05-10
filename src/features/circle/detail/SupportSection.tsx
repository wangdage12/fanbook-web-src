import { Avatar, Divider } from 'antd'
import clsx from 'clsx'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal.tsx'
import { CircleContentStruct } from 'fb-components/circle/types.ts'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { RealtimeAvatar, RealtimeNickname } from '../../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import UserCard from '../../../components/user_card'
import { PaginationResp3 } from '../../../types.ts'
import CircleApi, { SupportDetail } from '../circle_api.ts'

interface SupportSectionProps {
  detail: CircleContentStruct
  onToggleLike: () => void
}

export default function SupportSection({ detail, onToggleLike }: SupportSectionProps) {
  const { post, sub_info } = detail
  const { channel_id, post_id, guild_id } = post
  const { liked } = sub_info!

  const showMore = sub_info!.like_total > 5
  const onShowMore = () => {
    showFbModal({
      title: `点赞 ${sub_info!.like_total}`,
      footer: null,
      content: (
        <>
          <Divider className={'mx-[-24px] my-0'}></Divider>
          <SupportList channelId={channel_id} postId={post_id} />
        </>
      ),
    })
  }

  if (!sub_info) return null
  return (
    <div className={'flex-center flex-col p-6'}>
      <div
        className={'flex-center h-[40px] w-[100px] cursor-pointer gap-2 rounded-full bg-[var(--fg-b5)] text-[var(--fg-b60)]'}
        onClick={onToggleLike}
      >
        <iconpark-icon name={liked ? 'HeartFill' : 'Heart'} color={liked ? 'var(--function-red-1)' : 'var(--fg-b60)'} size={16}></iconpark-icon>
        <span className={'text-sm'}>{liked ? '已点赞' : '点赞'}</span>
      </div>

      {sub_info.like_total > 0 && (
        <div className={'flex-center mt-4 gap-2'}>
          <Avatar.Group size={24} maxCount={5}>
            {sub_info.like_detail.slice(0, 5).map(user => (
              <UserCard key={user.user_id} userId={user.user_id} guildId={guild_id} placement={'bottom'}>
                <RealtimeAvatar size={24} userId={user.user_id} rounded className={'border-[2px] border-[var(--fg-white-1)]'}></RealtimeAvatar>
              </UserCard>
            ))}
          </Avatar.Group>
          <span
            className={clsx(['flex-center text-xs text-[var(--fg-b40)]', showMore && 'cursor-pointer'])}
            onClick={showMore ? onShowMore : undefined}
          >
            {sub_info.like_total}人点赞
            {showMore && <iconpark-icon name="Right" color={'var(--fg-b40)'} size={12}></iconpark-icon>}
          </span>
        </div>
      )}
    </div>
  )
}

function SupportList({ postId }: { channelId: string; postId: string }) {
  const fetchList = () => {
    CircleApi.getReactionList({ postId, listId: supportList?.list_id }).then(res => {
      setSupportList({
        ...res,
        records: [...(supportList?.records ?? []), ...res.records],
      })
    })
  }
  useEffect(() => {
    if (!supportList) {
      fetchList()
    }
  }, [])
  const [supportList, setSupportList] = useState<PaginationResp3<SupportDetail>>()
  if (!supportList)
    return (
      <div className={'flex-center mx-[-12px] h-[460px]'}>
        <CircularLoading />
      </div>
    )
  const hasMore = supportList?.next == '1'

  return (
    <InfiniteScroll
      className={'mx-[-12px] py-2'}
      height={460}
      dataLength={supportList?.records.length}
      next={fetchList}
      hasMore={hasMore}
      loader={
        !hasMore ? null : (
          <div className={'flex-center h-[48px]'}>
            <CircularLoading />
          </div>
        )
      }
    >
      {supportList.records.map(e => {
        return (
          <div key={e.user_id} className={' mb-[2px] h-[48px]'}>
            <UserCard userId={e.user_id} placement={'leftTop'}>
              <HoverBox className={'flex-center h-full w-full gap-3 px-3'} style={{ justifyContent: 'flex-start' }}>
                <RealtimeAvatar size={32} userId={e.user_id}></RealtimeAvatar>
                <RealtimeNickname userId={e.user_id}></RealtimeNickname>
              </HoverBox>
            </UserCard>
          </div>
        )
      })}
    </InfiniteScroll>
  )
}
