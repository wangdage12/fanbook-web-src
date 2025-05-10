import { Tabs } from 'antd'
import clsx from 'clsx'
import CircleArticle from 'fb-components/circle/CircleArticle.tsx'
import CircleBaseCard from 'fb-components/circle/card/CircleBaseCard.tsx'
import { CircleCommentUserStruct, CircleContentStruct } from 'fb-components/circle/types.ts'
import FbAvatar from 'fb-components/components/FbAvatar.tsx'
import { EmbeddedAssetType } from 'fb-components/rich_text/types.ts'
import { SimpleUserStruct } from 'fb-components/struct/type.ts'
import CosUtils from 'fb-components/utils/upload_cos/utils.ts'
import { cloneDeep } from 'lodash-es'
import { useEffect, useState } from 'react'
import { RealtimeAvatar, RealtimeNickname } from '../../components/realtime_components/realtime_nickname/RealtimeUserInfo.tsx'
import { UserHelper } from '../../components/realtime_components/realtime_nickname/userSlice.ts'
import UserCard from '../../components/user_card'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import { CircleUtils } from './CircleUtils.tsx'

export default function CirclePublisherPreview({ data }: { data: CircleContentStruct }) {
  const [previewResolution, setPreviewResolution] = useState<'desktop' | 'mobile'>('desktop')
  const [detail, setDetail] = useState<CircleContentStruct | null>(data)

  useEffect(() => {
    const tmpImages: string[] = []
    const _data = cloneDeep(data)
    if (_data.post.cover instanceof File) {
      const cover = _data.post.cover as unknown as File
      const localUrl = URL.createObjectURL(cover)
      tmpImages.push(localUrl)
      CosUtils.verifyImageFile(cover, localUrl).then(res => {
        _data.post.cover = {
          _type: EmbeddedAssetType.Image,
          width: res.width,
          height: res.height,
          source: localUrl,
        }
        _data.parse_post = CircleUtils.parseToCardContent(_data.post)
        setDetail(_data)
      })
      return
    }
    // 若是非文件即来源于二次编辑的图片
    if (_data.post.cover) {
      _data.post.cover._type = EmbeddedAssetType.Image
    }
    _data.parse_post = CircleUtils.parseToCardContent(_data.post)
    setDetail(_data)

    return () => {
      tmpImages.forEach(url => URL.revokeObjectURL(url))
    }
  }, [data])

  const author = UserHelper.getUserLocally(LocalUserInfo.userId)

  if (!detail) return

  return (
    <div className={'bg-white h-full flex flex-col'}>
      <div className={'h-14'}>
        <Tabs
          centered
          size={'large'}
          defaultActiveKey="desktop"
          items={[
            { label: '桌面端预览', key: 'desktop' },
            {
              label: '移动端预览',
              key: 'mobile',
            },
          ]}
          onChange={key => setPreviewResolution(key as 'desktop' | 'mobile')}
        />
      </div>

      <div className={'flex flex-1 overflow-y-auto overflow-x-hidden bg-bgBg2'}>
        {/* 左侧 */}
        <div className={'border-r px-6 py-4'}>
          <ArticleTag label={'长文卡片'} />
          <CircleBaseCard
            className={'w-[200px] h-fit border-[0.5px]'}
            detail={detail}
            authorAvatar={<FbAvatar fbSize={16} fbRadius={8} src={author?.avatar ?? ''} />}
            authorName={author?.nickname ?? '昵称'}
          />
        </div>
        {/* 右侧 */}
        <div className={'overflow-hidden px-6 py-4 flex-1 flex flex-col'}>
          <ArticleTag label={'长文详情'} />
          <div
            className={clsx(['px-6 pb-4 rounded-lg flex-1 bg-bgBg3 overflow-y-auto', previewResolution === 'mobile' ? 'w-[424px] mx-auto' : 'mx-6'])}
          >
            <CircleArticle
              parentWidth={previewResolution === 'mobile' ? 375 : 800}
              hidePostTime
              detail={detail}
              buildAvatar={(user: CircleCommentUserStruct, size: number) => (
                <UserCard userId={user.user_id}>
                  <RealtimeAvatar userId={user.user_id} size={size} />
                </UserCard>
              )}
              buildName={(user: CircleCommentUserStruct) => (
                <UserCard userId={user.user_id} guildId={GuildUtils.getCurrentGuildId()}>
                  <RealtimeNickname userId={user.user_id} />
                </UserCard>
              )}
              buildMentionUser={(user: SimpleUserStruct) => (
                <UserCard userId={user.user_id} guildId={GuildUtils.getCurrentGuildId()}>
                  <RealtimeNickname prefix={'@'} userId={user.user_id} className={'mx-1 text-[var(--fg-blue-1)]'} />
                </UserCard>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ArticleTag({ label }: { label: string }) {
  return (
    <div className={'mb-4 text-xs flex items-center gap-1 font-medium py-1 px-2 text-fgB40 bg-fgB5 w-fit rounded-full'}>
      <iconpark-icon name={'Article'} size={12} />
      {label}
    </div>
  )
}
