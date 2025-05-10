import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Op } from 'quill-delta'
import { useMemo } from 'react'
import { splitMediaAndBody } from '../../rich_text/split'
import transformRichText from '../../rich_text/transform_rich_text'
import { EmbeddedAssetType } from '../../rich_text/types'
import { MultiParaItemStruct, PostType } from '../types'

dayjs.extend(duration)

export default function useCircleContent(data: Op[], type: PostType = PostType.image) {
  const { images, video, body } = useMemo(() => {
    switch (type) {
      case PostType.multi_para:
        return { images: undefined, video: undefined, body: data as MultiParaItemStruct[] }
      case PostType.video:
      case PostType.image: {
        const { body, ...media } = splitMediaAndBody(data)
        return {
          images: 'images' in media ? media.images : undefined,
          video: 'video' in media ? media.video : undefined,
          body: transformRichText(body),
        }
      }
      case PostType.article:
      case PostType.empty:
      case PostType.none: {
        return {
          images: undefined,
          video: undefined,
          body: transformRichText(data),
        }
      }
    }
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
    images: filterImages,
    video:
      video ?
        {
          url: video.insert.source,
          type: EmbeddedAssetType.Video,
          width: video.insert.width,
          height: video.insert.height,
          preview: video.insert.thumbUrl,
          duration: video.insert.duration,
        }
      : undefined,
    body,
  }
}
