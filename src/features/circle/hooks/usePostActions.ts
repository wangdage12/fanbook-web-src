import { useDynamicList } from 'ahooks'
import { CircleContentStruct, SubInfo } from 'fb-components/circle/types.ts'

/**
 * 圈子列表操作
 * @param initialList 初始化列表
 */
export default function usePostActions(initialList: CircleContentStruct[]) {
  const { list, replace, remove, push, resetList } = useDynamicList<CircleContentStruct>(initialList)
  return {
    list,
    addPost: (post: CircleContentStruct) => push(post),
    deletePost(postId: string) {
      const index = list.findIndex(item => item.post.post_id === postId)
      index > -1 && remove(index)
    },
    updateSubInfo(postId: string, subInfo: Partial<SubInfo>) {
      const recordIdx = list.findIndex(item => item.post.post_id === postId)
      recordIdx > -1 &&
        replace(recordIdx, {
          ...list[recordIdx],
          sub_info: { ...list[recordIdx].sub_info, ...subInfo } as SubInfo,
        })
    },
    resetList,
  }
}
