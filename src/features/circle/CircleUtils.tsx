/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, notification } from 'antd'
import { CircleCardContentStruct, CircleDisplay, CircleVisibility, MultiParaItemStruct, PostStruct, PostType } from 'fb-components/circle/types'
import { MediaInsertInfo, getFirstMediaFromOps } from 'fb-components/rich_text/transform_rich_text.ts'
import { EmbeddedAssetType } from 'fb-components/rich_text/types.ts'
import { GuildStruct } from 'fb-components/struct/GuildStruct.ts'
import { SwitchType } from 'fb-components/struct/type'
import { safeJSONParse } from 'fb-components/utils/safeJSONParse'
import { difference, isEmpty, isNil, uniqWith } from 'lodash-es'
import Delta, { Op } from 'quill-delta'
import { store } from '../../app/store.ts'
import environmentSpecificDraftBox from '../../utils/EnvironmentSpecificDraftBox.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import openCirclePublisher from './CirclePublisher.tsx'
import { PublishArticleArgs, circleActions } from './circleSlice.ts'
import CircleApi, { ReactionType } from './circle_api.ts'

// {"insert":"#测试话题#","attributes":{"tag":"621181615514583040","_type":"hashtag"}}
export class CircleUtils {
  /**
   * 预处理 post 数据，转换 content_v2 为 content 同时处理 mentions 和 tags
   */
  static transformCircleData(post: PostStruct): PostStruct {
    const handlePost = { ...post }
    const { channel_id, topic_id, content, content_v2, mentions, tags = [], display } = handlePost
    handlePost.content = safeJSONParse(content_v2 || content, [])
    handlePost.mentions = safeJSONParse(mentions, [])
    handlePost.visibility =
      display == CircleDisplay.circleUnVisible ? CircleVisibility.onlyMe
      : display == CircleDisplay.public || display == CircleDisplay.channelVisible ? CircleVisibility.all
      : CircleVisibility.onlyMeButCanNotOperation
    // 旧数据中 topic_id 如果不等于 channel_id，是之前的旧话题频道，需要转换新的话题标签展示
    if (!isNil(channel_id) && !isNil(topic_id) && channel_id !== topic_id && tags.length > 0) {
      handlePost.content.push(
        ...tags.map(tag => {
          const attributes = {
            tag: tag.tag_id,
            _type: 'hashtag',
            //  兼容转换 标识为来自旧话题
            isFromOld: true,
          }
          Object.defineProperty(attributes, 'isFromOld', {
            enumerable: false,
          })
          return {
            insert: `#${tag.tag_name}#`,
            attributes,
          }
        }),
        { insert: '\n' }
      )
    }
    return handlePost
  }

  /**
   * 从富文本中提取话题标签
   */
  static getTagsFromContent(ops: Op[]): string[]
  static getTagsFromContent(ops: Op[], nameInValue: false): string[]
  static getTagsFromContent(
    ops: Op[],
    nameInValue: true
  ): {
    tag_id: string
    tag_name: string
    isFromOld?: boolean
    status: SwitchType
  }[]
  static getTagsFromContent(ops: Op[], nameInValue: boolean = false): any {
    let tags = ops.filter(e => e.attributes?._type === 'hashtag')
    tags = uniqWith(tags, (a, b) => a.attributes?.tag === b.attributes?.tag)
    return tags.map(e => {
      if (!nameInValue) return e.attributes!.tag as string
      const tagName = (e.insert as string) ?? ''
      return {
        tag_id: e.attributes!.tag as string,
        tag_name: tagName.slice(1, tagName.length - 1),
        isFromOld: e.attributes!.isFromOld as boolean,
        status: SwitchType.Yes,
      }
    })
  }

  static getValidTagsFromContent(ops: Op[], oldData: { ops: Op[]; tag_ids: string[] }): string[] {
    const invalidTags = difference(CircleUtils.getTagsFromContent(oldData.ops), oldData.tag_ids ?? [])
    return difference(CircleUtils.getTagsFromContent(ops), invalidTags)
  }

  /**
   * 解析 post 数据，返回 CircleCardContentStruct
   * 用来渲染分享卡片、列表项等非详情页的组件
   */
  static parseToCardContent(post: PostStruct): CircleCardContentStruct {
    switch (post.post_type) {
      case PostType.image:
      case PostType.video:
      case PostType.article:
      case PostType.empty:
      case PostType.none: {
        const parsedContent = {
          cover: post.cover,
          title: post.title,
          has_video: post.has_video === SwitchType.Yes,
          content: this.parsePostContent(post.content),
        }
        // 旧数据中，cover 可能为 null 尝试获取 content 中的 cover
        if (isEmpty(parsedContent.cover)) {
          const content = safeJSONParse(post.content, [] as Op[])
          const firstMedia = getFirstMediaFromOps(content)
          if (firstMedia) {
            parsedContent.cover = firstMedia
          }
        }
        return parsedContent
      }
      case PostType.multi_para: {
        let cover: MediaInsertInfo | undefined

        if (post.cover) {
          cover = post.cover
        } else {
          const content = safeJSONParse(post.content, [] as Op[]) as MultiParaItemStruct[]
          cover = content.find(item => item?.assets && item?.assets?.length > 0)?.assets?.[0]
        }

        return {
          cover,
          title: post.title,
          has_video: post.has_video === SwitchType.Yes,
          content: this.parsePostContent(post.content),
        }
      }
    }
  }

  static parsePostContent(richTextString: string | Op[]): string {
    try {
      const parsedContent = safeJSONParse(richTextString, richTextString as Op[])
      if (typeof parsedContent === 'string' && richTextString === parsedContent) {
        throw new Error('JSON parse failed')
      }
      const delta = new Delta(parsedContent)
      return delta
        .filter(op => typeof op.insert === 'string')
        .map(op => op.insert)
        .join('')
        .trim()
    } catch (err) {
      // JSON parse 可能解析异常
      console.error(err)
      return typeof richTextString === 'string' ? richTextString : ''
    }
  }

  static async addLike(channelId: string, topicId: string, postId: string, type: ReactionType, commentId?: string) {
    return CircleApi.addReaction({
      channelId,
      topicId,
      postId,
      commentId,
      addType: type,
    })
  }

  static async deleteLike(channelId: string, topicId: string, postId: string, likeId: string, type: ReactionType, commentId?: string) {
    await CircleApi.delReaction({
      channelId,
      topicId,
      postId,
      commentId,
      id: likeId,
      delType: type,
    })
  }

  // 转发到频道，简化post（参考app）
  static tinyShareData(post: PostStruct): PostStruct {
    const content = post.content
    if (post.post_type === PostType.multi_para) {
      if (content.length > 1) {
        post.content = content.slice(1, content.length)
        delete (post.content[0] as MultiParaItemStruct).content
      }
    } else {
      let count = 0
      const newContent: Op[] = []
      let hasMedia = false
      for (const op of content) {
        if (typeof op.insert === 'string') {
          if (op.insert.trim().length == 0) {
            newContent.push(op)
          } else {
            if (count < 50) {
              if (count + op.insert.length < 50) {
                count += op.insert.length
              } else {
                op.insert = op.insert.substring(0, 50 - count)
              }
              newContent.push(op)
            }
          }
        } else {
          const isMedia =
            typeof op.insert === 'object' && (op.insert?._type === EmbeddedAssetType.Video || op.insert?._type === EmbeddedAssetType.Image)
          if (isMedia) {
            if (!hasMedia) {
              newContent.push(op)
              hasMedia = true
            }
          } else {
            newContent.push(op)
          }
        }
      }
      // 旧版本兼容
      post.content = [{ 'insert': '当前版本暂不支持此信息类型' }]
      post.content_v2 = newContent
    }
    return { ...post }
  }

  static getCircleChannelId(guildId?: string): string {
    let guild: GuildStruct
    if (guildId) {
      guild = GuildUtils.getGuildById(guildId)!
    } else {
      guild = GuildUtils.getCurrentGuild()!
    }
    return guild.circle.channel_id
  }

  static publishFailedNotice(code: number, publishArgs: PublishArticleArgs, guildId: string) {
    const notificationKey = 'circle-publish-failed'
    // 审核不通过
    if (code === 50004) {
      notification.error({
        key: notificationKey,
        message: '动态发布失败，内容不符合平台规范',
        description: '已保存至草稿，请重新编辑再发布',
        btn: (
          <Button
            type={'primary'}
            onClick={() => {
              openCirclePublisher({ type: getPostTypeFromPublishArgs(publishArgs), reedit: publishArgs, guildId })
              notification.destroy(notificationKey)
            }}
          >
            重新编辑
          </Button>
        ),
      })
    } else {
      notification.error({
        key: notificationKey,
        message: '动态发布失败，已保存草稿',
        description: '请点击重试，或重新编辑再发布',
        btn: (
          <>
            <Button
              type={'primary'}
              className={'mr-2'}
              ghost
              onClick={() => {
                openCirclePublisher({ type: getPostTypeFromPublishArgs(publishArgs), reedit: publishArgs, guildId })
                notification.destroy(notificationKey)
              }}
            >
              重新编辑
            </Button>
            <Button
              type={'primary'}
              onClick={() => {
                const postType = getPostTypeFromPublishArgs(publishArgs)
                const draft = environmentSpecificDraftBox.get<PublishArticleArgs>(`circle-${postType}-${GuildUtils.getCurrentGuildId()}`)
                if (postType === PostType.article) {
                  store.dispatch(circleActions.publishArticle(draft!))
                } else {
                  store.dispatch(circleActions.publishPost(draft!))
                }
                notification.destroy(notificationKey)
              }}
            >
              重新发布
            </Button>
          </>
        ),
      })
    }
  }
}

function getPostTypeFromPublishArgs(publishArgs: PublishArticleArgs) {
  return 'images' in publishArgs || 'video' in publishArgs ? PostType.image : PostType.article
}
