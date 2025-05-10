import clsx from 'clsx'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Op } from 'quill-delta'
import { useMemo } from 'react'
import CosImage from '../../components/image/CosImage'
import VideoThumbnail from '../../components/image/VideoThumbnail'
import { useMediaPreviewer } from '../../components/previewer/MediaPreviewer'
import { splitMediaAndBody } from '../../rich_text/split'
import transformRichText from '../../rich_text/transform_rich_text'
import { EmbeddedAssetType } from '../../rich_text/types'
import { QuestionAnswerContentType } from '../types'

dayjs.extend(duration)

export default function useMediaForTextMode(data: Op[], type: QuestionAnswerContentType = QuestionAnswerContentType.Text) {
  const mediaPreviewer = useMediaPreviewer()
  const { images, video, body } = useMemo(() => {
    if (type === QuestionAnswerContentType.RichText) {
      return { images: undefined, video: undefined, body: transformRichText(data) }
    }
    const res = splitMediaAndBody(data)
    return { ...res, body: transformRichText(res.body) }
  }, [data, type])

  const filterImages = useMemo(() => {
    return images
      ?.filter(item => !!item.insert?.source)
      .map(item => {
        return {
          url: item.insert.source,
          type: EmbeddedAssetType.Image,
          width: item.insert.width,
          height: item.insert.height,
        }
      })
  }, [images])
  return {
    element: (
      <>
        {!!filterImages?.length && (
          <div
            className={'image-gallery flex flex-wrap gap-1 py-[12px]'}
            style={{
              maxWidth: filterImages.length === 4 ? 300 : 400,
            }}
          >
            {filterImages.map((image, index) => (
              // TODO dark mode 的边框颜色
              <CosImage
                key={index}
                onClick={() =>
                  mediaPreviewer?.open({
                    medias: filterImages,
                    initialIndex: index,
                  })
                }
                src={image.url}
                size={filterImages.length > 1 ? 100 : 200}
                className={clsx([
                  'cursor-pointer rounded border-[0.5px] border-[var(--fg-b10)] object-cover',
                  filterImages.length > 1 && '!h-[100px] !w-[100px]',
                ])}
              />
            ))}
          </div>
        )}

        {video && (
          <VideoThumbnail
            className="my-2 inline-flex self-start overflow-hidden rounded-lg border-[1px] border-[var(--fg-b10)]"
            limitSize={{ width: 320, height: 320 }}
            src={video.insert.source}
            thumbSrc={video.insert.thumbUrl}
            width={video.insert.width}
            height={video.insert.height}
            duration={video.insert.duration}
            onClick={() =>
              mediaPreviewer?.open({
                medias: [
                  {
                    type: EmbeddedAssetType.Video,
                    url: video.insert.source,
                    preview: video.insert.thumbUrl,
                    width: video.insert.width,
                    height: video.insert.height,
                  },
                ],
                initialIndex: 0,
              })
            }
          />
        )}
      </>
    ),
    body,
  }
}
