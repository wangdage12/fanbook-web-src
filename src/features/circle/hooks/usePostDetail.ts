import { CircleContentStruct } from 'fb-components/circle/types'
import { useEffect, useState } from 'react'
import CircleLinkHandler from '../../../services/link_handler/CircleLinkHandler.ts'
import { CircleUtils } from '../CircleUtils.tsx'
import CircleApi from '../circle_api'

/**
 * 从网络请求圈子详情
 *
 * @param post 圈子id或圈子链接 或结构体 统一处理
 */
export default function usePostDetail(post: string | CircleContentStruct) {
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<CircleContentStruct | undefined>()

  const fetchData = async (postId: string) => {
    setLoading(true)
    const detail = await CircleApi.getPostDetail(postId)
    detail.parse_post = CircleUtils.parseToCardContent(detail.post)
    setDetail(detail)
    setLoading(false)
  }

  useEffect(() => {
    let postId: string | undefined
    if (typeof post !== 'string') {
      setDetail(post)
      postId = post.post.post_id
    } else {
      postId = post.startsWith('http') ? CircleLinkHandler.parseShareLink(post) : post
    }
    if (!postId) {
      setLoading(false)
    } else {
      fetchData(postId).then()
    }
  }, [])
  return { loading, detail }
}
