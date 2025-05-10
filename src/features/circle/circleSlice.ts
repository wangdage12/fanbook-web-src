/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createAsyncThunk, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { notification } from 'fb-components/base_component/entry.ts'
import { CircleChannelStruct, CircleContentStruct, CircleDisplay, CircleInfo, PostType, TagStruct } from 'fb-components/circle/types'
import { QuillVideo } from 'fb-components/rich_text/split.ts'
import OpsUtils from 'fb-components/utils/OpsUtils.ts'
import sleep from 'fb-components/utils/sleep.ts'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos.ts'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType.ts'
import CosUtils, { VerifyImageRes, VerifyVideoRes } from 'fb-components/utils/upload_cos/utils.ts'
import { Op } from 'quill-delta'
import { RootState, store } from '../../app/store.ts'
import { globalEmitter, GlobalEvent } from '../../base_services/event.ts'
import { ImageInfo } from '../../components/image_crop/type.ts'
import { getCroppedImgArr } from '../../components/image_crop/utils.ts'
import environmentSpecificDraftBox from '../../utils/EnvironmentSpecificDraftBox.ts'
import { VerificationStatus } from '../guild_level/guild-level-slice.ts'
import { guildListActions } from '../guild_list/guildListSlice.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import CircleApi from './circle_api.ts'
import { CircleUtils } from './CircleUtils.tsx'

export interface ArticleStatus {
  loading: boolean
  hasMore?: boolean
}

export enum LoadingType {
  Top = 'top',
  Refresh = 'refresh',
}

export interface CircleState {
  info: Partial<CircleInfo>
  recommendTagList: TagStruct[]
  infoLoading: boolean
  uploadProgress: Record<string, { currentStep: number; totalSteps: number }>
}

const initialState: CircleState = {
  info: {},
  recommendTagList: [],
  infoLoading: false,
  uploadProgress: {},
}

const fetchCircleInfo = createAsyncThunk<
  CircleInfo & { currentGuildId?: string },
  { guildId: string; channelId: string },
  {
    state: RootState
  }
>('circle/info', async ({ guildId, channelId }, thunkAPI) => {
  const state = thunkAPI.getState()
  const result = await CircleApi.circleInfo({ guildId, channelId })
  return { ...result, currentGuildId: state.guild.currentGuildId }
})

const fetchCircleRecommendTagList = createAsyncThunk<
  TagStruct[],
  {
    guildId: string
  }
>('circle/recommendTagList', async ({ guildId }) => await CircleApi.getRecommendTagList(guildId))

export interface PublishArticleArgs {
  // 如果是编辑动态，则需要传入 post_id
  post_id?: string
  guildId: string
  title: string
  cover: File | { source: string; width: number; height: number }
  mentions: Array<{ value: string; label: string }>
  content: Op[]
  visibility: number
  tag_ids: string[]
}

export type PublishPostArgs = Omit<PublishArticleArgs, 'cover'> & {
  cover?: File | { source: string; width: number; height: number }
  // 如果类型是 QuillVideo 说明是网络视频，无需再次上传
  video?: ({ file: File; url: string } & VerifyVideoRes) | QuillVideo
  images?: ImageInfo[]
  // 如果是编辑动态，则需要传入 post_id
  post_id?: string
}

/**
 * 发布圈子动态（图片或视频动态），下面的 `publishArticle` 是发布长文
 */
const publishPost = createAsyncThunk(
  'circle/publishPost',
  async ({ guildId, title, content, mentions, visibility, video, images, post_id, cover, tag_ids }: PublishPostArgs, { dispatch }) => {
    // 请勿直接修改原数组，避免意外情况
    content = [...content]

    function increaseProgress<T>(value: T): T {
      dispatch(circleActions.increaseProgress(guildId))
      return value
    }

    async function uploadImages(ops: Op[]) {
      if (!images?.length) return
      const croppedImages = await getCroppedImgArr(images)
      const verifiedImages = await Promise.all(
        croppedImages.map(img => {
          if (img.cropFile || img.file) {
            return CosUtils.verifyImageFile(img.cropFile ?? img.file!, img.cropUrl ?? img.url)
          } else {
            return Promise.resolve(img)
          }
        })
      )
      const uploadedImages = await Promise.all(
        verifiedImages.map((e, i) => {
          // 有 width 字段说明是 VerifyImageRes，即本地图片
          if ('width' in e) {
            return UploadCos.getInstance()
              .uploadFile({
                type: CosUploadFileType.image,
                file: croppedImages[i].cropFile ?? croppedImages[i].file!,
              })
              .then(increaseProgress)
          }
          // 如果是网络图片，直接返回
          return undefined
        })
      )
      for (let i = 0; i < images.length; i++) {
        const size = 'width' in verifiedImages[i] ? (verifiedImages[i] as VerifyImageRes) : (croppedImages[i] ?? images[i]).cropInfo!.originalArea!
        ops.push({
          insert: {
            _type: 'image',
            width: size.width,
            height: size.height,
            // 如果上传的文件中没有，说明图片本来就是网络地址
            source: uploadedImages[i] ?? images[i].url,
          },
        })
      }
      cover = {
        source: uploadedImages[0] ?? images[0].url,
        width: (croppedImages[0] ?? images[0]).cropInfo!.originalArea!.width!,
        height: (croppedImages[0] ?? images[0]).cropInfo!.originalArea!.height!,
      }
    }

    async function uploadVideo(ops: Op[]) {
      if (!video) return
      if ('insert' in video) {
        ops.push(video)
        return
      }

      const { url, file, thumbFile, duration, width, height } = video!
      // 认证社区的上限为 2G，非认证社区的上限为 500M
      const sizeLimit = VerificationStatus.officialVerified(GuildUtils.getCurrentGuildId()!) ? 2 * 1024 : 500
      await CosUtils.verifyVideoFile(file, url, { toast: true, size: sizeLimit * 1024 })
      const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        UploadCos.getInstance().uploadFile({ type: CosUploadFileType.video, file }).then(increaseProgress),
        UploadCos.getInstance().uploadFile({ type: CosUploadFileType.image, file: thumbFile! }).then(increaseProgress),
      ])
      ops.push({
        insert: {
          _type: 'video',
          fileType: 'video',
          duration,
          width,
          height,
          thumbUrl: uploadedThumbnail,
          source: uploadedVideo,
          custom_cover: false,
        },
      })
      cover = {
        source: uploadedThumbnail,
        width: video!.width,
        height: video!.height,
      }
    }

    if (images?.length) {
      await uploadImages(content)
      dispatch(circleActions.increaseProgress(guildId))
    } else {
      await uploadVideo(content)
    }

    return CircleApi.post({
      post_id,
      guild_id: guildId,
      channel_id: CircleUtils.getCircleChannelId(),
      post_type: video ? PostType.video : PostType.image,
      title,
      content_v2: OpsUtils.removeRedundantFields(content),
      mentions: mentions.map(e => e.value),
      tag_ids,
      cover: cover as never,
      display: visibility,
    })
  }
)

const publishArticle = createAsyncThunk(
  'circle/publishArticle',
  async ({ guildId, title, cover, content, mentions, visibility, post_id, tag_ids }: PublishArticleArgs, { dispatch }) => {
    // 请勿直接修改原数组，避免意外情况
    content = [...content]

    if (cover instanceof File) {
      const verified = await CosUtils.verifyImageFile(cover, URL.createObjectURL(cover))
      const remoteUrl = await UploadCos.getInstance().uploadFile({ type: CosUploadFileType.image, file: cover })

      dispatch(circleActions.increaseProgress(guildId))

      cover = {
        source: remoteUrl,
        width: verified.width,
        height: verified.height,
      }
    }

    content = await OpsUtils.uploadFilesInOps(content, () => dispatch(circleActions.increaseProgress(guildId)))

    const res = await CircleApi.post({
      post_id,
      guild_id: guildId,
      channel_id: CircleUtils.getCircleChannelId(),
      post_type: PostType.article,
      title,
      content_v2: OpsUtils.removeRedundantFields(content),
      mentions: mentions.map(e => e.value),
      tag_ids,
      cover,
      display: visibility,
    })

    dispatch(circleActions.increaseProgress(guildId))
    return res
  }
)

const circleSlice = createSlice({
  name: 'circle',
  initialState,
  reducers: {
    // 退出圈子时调用，如果不及时清除，会导致切换社区圈子时，首次渲染的会是旧的圈子数据
    clear: state => {
      state.info = {}
    },
    updateCircleChannel: (state, { payload }: PayloadAction<Partial<CircleChannelStruct> & Pick<CircleChannelStruct, 'channel_id' | 'guild_id'>>) => {
      if (!state.info.channel) {
        return state
      }
      const { guild_id, channel_id } = payload
      if (state.info.channel.channel_id !== channel_id && state.info.channel.guild_id !== guild_id) {
        return
      }
      Object.assign(state.info.channel, payload)
      return state
    },
    // addPostToList: (state, { payload }: PayloadAction<CircleContentStruct>) => {
    //   // 若不是全部或当前频道的帖子，则不添加
    //   if (!state.postList.topicId || state.postList.topicId !== payload.post.topic_id) {
    //     return
    //   }
    //   // 若是非全部帖子或按照发布时间排序，则按照排序方式添加
    //   if (state.postList.topicId || state.sortType === CircleSortType.Latest) {
    //     state.postList.records = [payload, ...state.postList.records]
    //   } else {
    //     const topCount = state.info.top?.records?.length ?? 0
    //     state.postList.records = [
    //       ...(topCount > 0 ? state.postList.records.slice(0, topCount) : []), // 置顶帖子
    //       payload,
    //       ...state.postList.records.slice(topCount),
    //     ]
    //   }
    // },
    changePostPined(state, { payload }: PayloadAction<{ pinned: boolean; detail: CircleContentStruct }>) {
      const { pinned, detail } = payload
      const { top = { records: [], type: [] } } = state.info ?? {}
      const records = top.records ?? []
      if (pinned) {
        records.unshift({
          post: detail,
          post_id: detail.post.post_id,
          channel_id: detail.post.channel_id,
          guild_id: detail.post.guild_id,
          created_at: detail.post.created_at,
          topic_id: detail.post.topic_id,
          title: detail.post.title,
          list_id: detail.post.list_id,
          type_id: detail.post.type_id,
          type_name: detail.post.type_name,
        })
      } else {
        const index = records.findIndex(item => item.post.post.post_id === detail.post.post_id)
        if (index > -1) {
          records.splice(index, 1)
        }
      }

      state.info.top = {
        ...top,
        records,
      }
    },
    increaseProgress: (state, { payload }: PayloadAction<string>) => {
      state.uploadProgress[payload].currentStep++
    },
    deleteProgress: (state, { payload }: PayloadAction<string>) => {
      delete state.uploadProgress[payload]
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCircleInfo.pending, state => {
        state.infoLoading = true
      })
      .addCase(fetchCircleInfo.fulfilled, (state, { payload }) => {
        state.infoLoading = false
        // 加载的圈子频道信息不是当前社区的圈子频道的信息，则不更新
        if (payload.currentGuildId === payload.channel.guild_id) {
          state.info = payload
        }
      })
      .addCase(fetchCircleInfo.rejected, state => {
        state.infoLoading = false
      })
      .addCase(guildListActions.updateChannelPermission, (state, { payload }) => {
        if (!state.info.channel) {
          return
        }
        const { id, guild_id, channel_id, allows, deny, action_type } = payload
        if (state.info.channel.channel_id !== channel_id && state.info.channel.guild_id !== guild_id) {
          return
        }
        const overwrites = state.info.channel.overwrite
        if (!overwrites) return
        overwrites[id] =
          !overwrites[id] ?
            { id, guild_id, channel_id, allows, deny, action_type }
          : {
              ...overwrites[id],
              allows,
              deny,
            }
      })
      .addCase(publishArticle.pending, (state, action) => {
        // 将长文上传流程分为：
        // 1. 上传封面
        // 2. 上传内容中的图片和视频，取决于内容中有多少图片和视频，每个图片单独算一步，
        //    每个视频单独算两步（包含封面和视频）
        // 3. 发布帖子
        const numSteps =
          2 +
            action.meta.arg.content.reduce(
              (acc, cur: Op) =>
                acc +
                // @ts-expect-error ignore
                (cur.insert?._type === 'image' ? 1
                  // @ts-expect-error ignore
                : cur.insert?._type === 'video' ? 2
                : 0),
              0
            ) || 0
        state.uploadProgress[action.meta.arg.guildId] = {
          currentStep: 0,
          totalSteps: numSteps,
        }
      })
      .addCase(publishPost.pending, (state, action) => {
        // 将普通动态上传流程分为：
        // 1. 上传图片或视频
        //     1. 上传内容中的图片和视频，取决于内容中有多少图片和视频，每个图片单独算一步，
        //     2. 视频单独算两步（包含封面和视频）
        // 2. 发布帖子
        const arg = action.meta.arg
        const numSteps = (arg.images?.length ?? 0) + (arg.video ? 2 : 0) + 1

        state.uploadProgress[action.meta.arg.guildId] = {
          currentStep: 0,
          totalSteps: numSteps,
        }
      })
      .addCase(fetchCircleRecommendTagList.fulfilled, (state, { payload }) => {
        state.recommendTagList = payload
      })
      .addMatcher(isAnyOf(publishPost.rejected, publishArticle.rejected), (state, action) => {
        const { guildId } = action.meta.arg
        const postType = action.type === publishArticle.rejected.type ? PostType.article : PostType.image
        console.error('Failed to publish due to ', action.error)
        environmentSpecificDraftBox.save(`circle-${postType}-${guildId}`, action.meta.arg)
        CircleUtils.publishFailedNotice(
          parseInt(action.error.message?.split(' ')[0] ?? '0'),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          environmentSpecificDraftBox.get<PublishArticleArgs>(`circle-${postType}-${guildId}`)!,
          guildId
        )
        delete state.uploadProgress[action.meta.arg.guildId]
      })
      .addMatcher(isAnyOf(publishPost.fulfilled, publishArticle.fulfilled), (state, action) => {
        const { guild_id, display } = action.payload
        const postType = action.type === publishArticle.fulfilled.type ? PostType.article : PostType.image
        notification.success({
          message: '发布成功 🎉',
          description: display === CircleDisplay.public ? '邀请好友来围观吧～' : '动态仅自己可见，可在「我的圈子」中查看',
        })
        globalEmitter.emit(GlobalEvent.CircleCreatedPost)
        environmentSpecificDraftBox.delete(`circle-${postType}-${guild_id}`)
        // 晚一点删除可以让用户看到 100% 进度
        sleep(100).then(() => {
          store.dispatch(circleActions.deleteProgress(guild_id))
        })
      })
  },
})

export default circleSlice.reducer

export const circleActions = {
  fetchCircleInfo,
  fetchCircleRecommendTagList,
  publishArticle,
  publishPost,
  ...circleSlice.actions,
}

export const circleSelectors = {
  infoLoading: (state: RootState) => state.circle.infoLoading,
  channel: (state: RootState) => state.circle.info?.channel,
  info: (state: RootState) => state.circle.info,
  progress: (guildId: string) => (state: RootState) => state.circle.uploadProgress[guildId],
  recommendTagList: (state: RootState) => state.circle.recommendTagList,
  // postList: (state: RootState) => state.circle.postList,
  // postSearchList: (state: RootState) => state.circle.postSearchList,
  // sortType: (state: RootState) => state.circle.sortType,
}
