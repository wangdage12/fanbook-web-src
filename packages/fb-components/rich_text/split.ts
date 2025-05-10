import { partition } from 'lodash-es'
import { Op } from 'quill-delta'
import OpsUtils from '../utils/OpsUtils'
import { EmbeddedAssetType } from './types'

export interface QuillImage {
  insert: { width: number; height: number; source: string }
}

export interface QuillVideo {
  insert: { width: number; height: number; source: string; thumbUrl: string; duration: number }
}

export function splitMediaAndBody(content: Op[]):
  | {
      images: QuillImage[]
      body: Op[]
    }
  | {
      video: QuillVideo
      body: Op[]
    } {
  let [media, body] = partition(
    content,
    // @ts-expect-error _type 是 fb 的自定义字段
    node => node.insert?._type === EmbeddedAssetType.Image || node.insert?._type === EmbeddedAssetType.Video
  ) as [Op[], Op[]]

  // 移除尾部空行
  body = OpsUtils.removeTailBlankLines(body)

  // @ts-expect-error _type 是 fb 的自定义字段
  media = media.filter(node => node.insert?._type === EmbeddedAssetType.Image || node.insert?._type === EmbeddedAssetType.Video)
  // @ts-expect-error _type 是 fb 的自定义字段
  if (media.length === 1 && media[0].insert?._type === EmbeddedAssetType.Video) {
    return {
      body,
      video: media[0] as never,
    }
  }

  return { body, images: media as never }
}
