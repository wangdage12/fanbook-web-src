import { CircleContentStruct, CircleSortType, CircleTagDetailStruct, CircleTagType } from 'fb-components/circle/types'
import queryString from 'query-string'
import { useEffect, useState } from 'react'
import CircleTagLinkHandler, { CircleTagLinkParseStruct } from '../../../services/link_handler/CircleTagLinkHandler.ts'
import { CircleUtils } from '../CircleUtils.tsx'
import CircleApi from '../circle_api.ts'
// import qs from 'query-string'

export interface CircleTagDetailContent extends CircleTagDetailStruct {
  // 是否是无数据
  isEmpty?: boolean
  // 解析后的帖子
  post?: CircleContentStruct
}

/**
 * 从网络请求圈子详情
 *
 * @param tag 话题链接
 */
export default function useCircleTagDetail(tag: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)
  const [detail, setDetail] = useState<CircleTagDetailContent | undefined>()

  const fetchData = async ({ tagId, type = CircleTagType.Tag, guildId }: CircleTagLinkParseStruct) => {
    setLoading(true)
    try {
      const detail = await CircleApi.getCircleTagDetail({ tagId, type, guildId })
      if (!detail) {
        setError(true)
        return
      }

      const { records: postDetails } = await CircleApi.tagPostList({ tagId, type, guildId, size: 1, sortType: CircleSortType.Recommend })
      if (!postDetails || postDetails.length === 0) {
        setDetail({ ...detail, isEmpty: true, type, guildId })
        return
      }
      const postDetail = postDetails[0]
      postDetail.parse_post = CircleUtils.parseToCardContent(postDetail.post)
      setDetail({ ...detail, post: postDetail, type, guildId })
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const parseUrl = queryString.parseUrl(tag, { parseFragmentIdentifier: true })
    const { tagId, type, guildId } =
      tag.startsWith('http') ?
        CircleTagLinkHandler.parseShareLink(parseUrl.url, parseUrl.query)
      : { tagId: tag, type: CircleTagType.Tag, guildId: '' }

    if (!tagId) {
      setLoading(false)
    } else {
      fetchData({ tagId, type, guildId }).then()
    }
  }, [])
  return { loading, error, detail }
}
