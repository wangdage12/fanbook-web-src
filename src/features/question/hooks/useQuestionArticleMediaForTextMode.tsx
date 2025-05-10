import { Tooltip } from 'antd'
import { duration as dayjsDuration } from 'dayjs'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import FilePicker from 'fb-components/utils/FilePicker.ts'
import { ImageType, VideoType } from 'fb-components/utils/upload_cos/uploadType.ts'
import CosUtils, { VerifyImageRes } from 'fb-components/utils/upload_cos/utils.ts'
import { zip } from 'lodash-es'
import { useCallback, useState } from 'react'

const MAX_IMAGES = 9

/**
 * 提供问答的提问和回答的编辑器中的图片和视频选择，
 */
export default function useQuestionArticleMediaForTextMode() {
  const [images, setImages] = useState<Array<{ width?: number; height?: number; file: File; url?: string; localUrl?: string }>>([])
  const [video, setVideo] = useState<
    | {
        width: number
        height: number
        thumbnail?: File
        file: File
        url?: string
        thumbUrl?: string
        localUrl?: string
        localThumbUrl?: string
        duration: number
      }
    | undefined
  >(undefined)

  const disabledImage = !!video || images.length === MAX_IMAGES
  const disabledVideo = !!images.length || !!video

  const pickImage = useCallback(() => {
    if (disabledImage) {
      if (video) {
        FbToast.open({ content: '不支持同时上传图片和视频', key: 'question-publish-max-selection' })
      } else {
        FbToast.open({ content: `最多可添加${MAX_IMAGES}张图片`, key: 'question-publish-max-selection' })
      }
      return
    }

    FilePicker.pickMedias(ImageType)
      .then(async files => {
        const _files = files.map(file => ({
          file,
          localUrl: URL.createObjectURL(file),
        }))
        const results = await Promise.allSettled(
          _files.map(({ file, localUrl }) =>
            CosUtils.verifyImageFile(file, localUrl, {
              size: 100e3,
              toast: true,
            })
          )
        )
        const verifyImageRes = results.map(result => (result.status === 'fulfilled' ? result.value : undefined))

        const verified = (zip(_files, verifyImageRes).filter(([, result]) => result) as [{ file: File; localUrl: string }, VerifyImageRes][]).map(
          ([{ file, localUrl }, result]) => ({
            file: file,
            localUrl,
            width: result.width,
            height: result.height,
          })
        )

        const newImages = [...images, ...verified]
        if (newImages.length > MAX_IMAGES) {
          FbToast.open({
            content: `${newImages.length - MAX_IMAGES}张图片未上传,你最多可添加${MAX_IMAGES}张图片`,
          })
        }
        setImages(newImages.slice(0, MAX_IMAGES))
      })
      .catch(() => {
        /* ignore */
      })
  }, [images, disabledImage])

  const deleteMediaAt = useCallback(
    (index: number) => {
      const newImages = [...images]
      const removeImage = newImages.splice(index, 1)
      if (removeImage[0]?.localUrl) {
        URL.revokeObjectURL(removeImage[0]?.localUrl)
      }
      setImages(newImages)
    },
    [images]
  )

  const pickVideo = useCallback(() => {
    if (disabledVideo) {
      if (video) {
        FbToast.open({ content: '最多可添加1个视频', key: 'question-publish-max-selection' })
      } else {
        FbToast.open({ content: '不支持同时上传图片和视频', key: 'question-publish-max-selection' })
      }
      return
    }

    FilePicker.pickMedias(VideoType)
      .then(([file]) => {
        const localUrl = URL.createObjectURL(file)
        CosUtils.verifyVideoFile(file, localUrl, { size: 500e3, durationInMinutes: 15, toast: true })
          .then(res => {
            setVideo({
              file,
              localUrl,
              duration: res.duration,
              width: res.width,
              height: res.height,
              thumbnail: res.thumbFile,
              localThumbUrl: res.localThumbUrl,
            })
          })
          .catch(() => {
            URL.revokeObjectURL(localUrl)
          })
      })
      .catch(() => {
        /* ignore */
      })
  }, [disabledVideo])

  const mediaNode = (
    <>
      <QuestionImages data={images.map(item => item.url ?? item.localUrl)} pickFiles={pickImage} deleteIndex={deleteMediaAt} />
      {video?.localUrl && (
        <QuestionVideo
          url={video.url ?? video.localUrl}
          preview={video.thumbUrl ?? video.localThumbUrl}
          duration={video.duration}
          onRemove={() => {
            const localUrl = video.localUrl
            setVideo(undefined)
            if (localUrl) {
              URL.revokeObjectURL(localUrl)
            }
          }}
        />
      )}
    </>
  )
  return { images, video, pickImage, pickVideo, disabledVideo, disabledImage, mediaNode }
}

function QuestionImages({
  data,
  pickFiles,
  deleteIndex,
}: {
  data: (string | undefined)[]
  pickFiles: () => void
  deleteIndex: (index: number) => void
}) {
  return (
    <div className={'flex select-none flex-wrap gap-2 py-2'}>
      {data.map((file, index) => {
        return (
          <div key={index} className={'relative h-20 w-20 rounded-lg border-[.5px] border-[var(--fg-b10)]'}>
            <img className="h-full w-full rounded-lg object-cover" src={file} alt="" />
            <Controls type={'image'} onDelete={() => deleteIndex(index)} />
          </div>
        )
      })}
      {data.length < MAX_IMAGES && !!data.length && (
        <div
          className={
            'flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[.5px] border-[var(--fg-b10)] text-[var(--fg-b40)]'
          }
          onClick={pickFiles}
        >
          <iconpark-icon className={'p-[3px]'} name="Plus" color="currentColor" size={18} />
          <span>添加图片</span>
        </div>
      )}
    </div>
  )
}

function QuestionVideo({ url, preview, duration, onRemove }: { url: string; preview?: string; duration: number; onRemove: () => void }) {
  return (
    <div className={'relative h-[156px] max-w-[277px]'}>
      <video src={url} poster={preview} className={'h-full w-full rounded-lg bg-black object-contain'} />
      <div
        className={
          'flex-center absolute bottom-1 right-1 z-10 flex h-6 select-none gap-1 rounded-full bg-[var(--fg-widget)] px-2 text-xs font-medium text-[var(--fg-white-1)]'
        }
      >
        <iconpark-icon name="Video" size={14} />
        <span>{dayjsDuration(duration * 1000).format('mm:ss')}</span>
      </div>
      <Controls type={'video'} onDelete={onRemove} />
    </div>
  )
}

function Controls({ type, onDelete }: { type: 'image' | 'video'; onDelete?: () => void }) {
  return (
    <div
      className={
        'absolute bottom-0 left-0 right-0 top-0 z-20 flex items-center justify-center gap-4 rounded-lg text-[var(--fg-white-1)] opacity-0 transition-colors hover:bg-black/50 hover:opacity-100'
      }
    >
      <Tooltip title={type === 'image' ? '删除图片' : '删除视频'}>
        <iconpark-icon name="Delete" size={24} class={'cursor-pointer'} onClick={onDelete} />
      </Tooltip>
    </div>
  )
}
