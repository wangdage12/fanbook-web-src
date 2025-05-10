import { Divider } from 'antd'
import { CircleContentStruct, PostType } from 'fb-components/circle/types.ts'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import FbImage from 'fb-components/components/image/FbImage.tsx'
import CosImageUtils from 'fb-components/utils/CosImageUtils.ts'
import DateTimeUtils from 'fb-components/utils/DateTimeUtils.ts'
import { checkIsLocalURL, formatCount } from 'fb-components/utils/common.ts'
import { useEffect, useMemo, useState } from 'react'
import { NetworkError } from '../../../components/NetworkError.tsx'
import CaiHongStatApi, { CircleStatStruct } from '../../../utils/CaiHongApi.ts'
import { CircleUtils } from '../CircleUtils.tsx'

export interface CircleStatisticsProps {
  detail: CircleContentStruct
}

export function CircleStatistics({ detail }: CircleStatisticsProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [data, setData] = useState<CircleStatStruct | undefined>(undefined)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setHasError(false)
    setLoading(true)
    CaiHongStatApi.fetchCircleStat(detail.post.post_id)
      .then(res => setData(res))
      .catch(() => {
        setHasError(true)
      })
      .finally(() => setLoading(false))
  }
  const isVideo = detail.post.post_type === PostType.video

  const dataItems = useMemo(() => {
    const dataItems = []
    const { like_total, comment_total, follow_total } = detail.sub_info ?? {}
    if (isVideo) {
      dataItems.push({
        title: '播放数据',
        children: [
          {
            label: '点击率',
            value: !data ? '正在计算中' : `${(((data?.view_cnt ?? 0) / (data?.exposure_cnt ?? 0)) * 100).toFixed(1)}%`,
          },
          {
            label: '浏览量',
            value: !data ? '正在计算中' : formatCount(data?.view_cnt ?? 0),
          },
          {
            label: '完播率',
            value: !data ? '正在计算中' : `${data?.play_finish_rate ?? 0}%`,
          },
          {
            label: '5s完播率',
            value: !data ? '正在计算中' : `${data?.valid_visit_duration_rate ?? 0}%`,
          },
          {
            label: '平均浏览时长',
            value: !data ? '正在计算中' : `${data?.avg_view_duration ?? 0}s`,
          },
        ],
      })
    } else {
      dataItems.push({
        title: '浏览数据',
        children: [
          {
            label: '点击率',
            value: !data ? '正在计算中' : `${(((data?.view_cnt ?? 0) / (data?.exposure_cnt ?? 0)) * 100).toFixed(1)}%`,
          },
          {
            label: '浏览量',
            value: !data ? '正在计算中' : formatCount(data?.view_cnt ?? 0),
          },
          {
            label: '人均浏览时长',
            value: !data ? '正在计算中' : `${data?.avg_view_duration ?? 0}s`,
          },
        ],
      })
    }
    dataItems.push({
      title: '互动数据',
      children: [
        {
          label: '点赞量',
          value: formatCount(like_total ?? 0),
        },
        {
          label: '点击率',
          value: !data ? '正在计算中' : `${(((like_total ?? 0) / (data?.view_cnt ?? 0)) * 100).toFixed(1)}%`,
        },
        {
          label: '评论量',
          value: formatCount(like_total ?? 0),
        },
        {
          label: '评论率',
          value: !data ? '正在计算中' : `${(((comment_total ?? 0) / (data?.view_cnt ?? 0)) * 100).toFixed(1)}%`,
        },
        {
          label: '收藏量',
          value: formatCount(follow_total ?? 0),
        },
        {
          label: '收藏率',
          value: !data ? '正在计算中' : `${(((follow_total ?? 0) / (data?.view_cnt ?? 0)) * 100).toFixed(1)}%`,
        },
      ],
    })
    return dataItems
  }, [detail, data])

  const { cover, title, content } = useMemo(() => CircleUtils.parseToCardContent(detail.post), [detail])

  const _title = title || content

  function getThumbnailUrl() {
    if (!cover?.source) return ''
    if (checkIsLocalURL(cover.source)) return cover.source
    return CosImageUtils.thumbnailMin(cover.source, 48 * 2)
  }

  return (
    <div className={'pb-6 flex-center flex-col items-stretch'} style={{ height: isVideo ? 655 : 585 }}>
      {loading && <CircularLoading />}
      {hasError && <NetworkError onClick={fetchData} />}
      {!loading && !hasError && (
        <>
          <div className={'flex-center h-[72px] gap-3 rounded-xl bg-[var(--bg-bg-3)] px-4'}>
            {cover?.source ?
              <div className="relative flex rounded-xl overflow-hidden border-[0.5px] border-[var(--fg-b10)] items-center justify-center">
                {detail.post.post_type === PostType.video ?
                  <em className="absolute left-[50%] top-[50%] ml-[-12px] mt-[-12px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[var(--fg-widget)]">
                    <iconpark-icon size={10} class="text-[var(--fg-white-1)]" name="Pause"></iconpark-icon>
                  </em>
                : null}
                <FbImage
                  blurFadeIn={true}
                  src={getThumbnailUrl()}
                  fallback={
                    <div className="line-clamp-3 flex h-full w-full items-center justify-center bg-[var(--bg-bg-1)] px-[24px] py-[40px] text-[var(--fg-b60)]"></div>
                  }
                  style={{
                    maxWidth: 48,
                    maxHeight: 48,
                    minWidth: 48,
                    minHeight: 48,
                  }}
                />
              </div>
            : <div className="flex rounded-xl border-[0.5px] border-[var(--fg-b10)] items-center justify-center bg-[var(--bg-bg-1)] text-[var(--fg-b60)] p-2 text-xs w-12 h-12">
                <span className="plain-text text-[11px] line-clamp-2 flex-grow break-all [line-break:anywhere] [word-wrap:break-word]">{_title}</span>
              </div>
            }
            <div className={'flex flex-1 flex-col gap-2 overflow-hidden'}>
              <div className={'text-sm font-medium text-[var(--fg-b100)] truncate'}>{_title || '-'}</div>
              <div className={'text-xs text-[var(--fg-b40)]'}>发布于 {DateTimeUtils.format(detail.post.created_at)}</div>
            </div>
          </div>
          {dataItems.map(e => (
            <div key={e.title} className={'mt-4 rounded-xl bg-[var(--bg-bg-3)]'}>
              <div className={'flex h-[44px] items-center px-4 text-sm font-medium'}>{e.title}</div>
              <div className={'flex flex-wrap'}>
                {e.children.map((e, i) => (
                  <>
                    {i % 2 == 1 && <Divider type={'vertical'} className={'h-6 m-0'}></Divider>}
                    <div key={e.label} className={'flex w-[calc(50%-1px)] h-[74px] flex-col gap-1 px-4'}>
                      <div className={'text-[18px] leading-[26px] text-[var(--fg-b100)] font-medium'}>{e.value}</div>
                      <div className={'text-xs text-[var(--fg-b60)]'}>{e.label}</div>
                    </div>
                  </>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
