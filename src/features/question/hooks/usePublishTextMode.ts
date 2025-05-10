import { EmbeddedAssetType } from 'fb-components/rich_text/types.ts'
import { FbRichTextSlateVisitor } from 'fb-components/rich_text_editor/visitors/FbRichTextSlateVisitor'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos.ts'
import { CosUploadFileType } from 'fb-components/utils/upload_cos/uploadType.ts'
import { Op } from 'quill-delta'
import { Editor } from 'slate'

/**
 * 此 hook 用于生成问答的普通文本模式的发布数据
 */
export default function usePublishTextMode(editor: Editor) {
  return async (
    images: Array<{ width?: number; height?: number; file: File }>,
    video?: {
      width?: number
      height?: number
      file: File
      thumbnail?: File
      duration: number
    }
  ) => {
    const exporter = new FbRichTextSlateVisitor(editor.children, editor).result

    // 简单文本模式下，图片和视频不在编辑器中展示
    const uploader = UploadCos.getInstance()
    const uploadedImages = await Promise.all(
      images.map(image =>
        uploader
          .uploadFile({
            type: CosUploadFileType.image,
            file: image.file,
          })
          .then(
            source =>
              ({
                insert: {
                  _type: EmbeddedAssetType.Image,
                  source,
                  width: image.width,
                  height: image.height,
                },
              }) as Op
          )
      )
    )
    if (uploadedImages.length) {
      exporter.ops.push(...uploadedImages, { insert: '\n' })
    }

    if (video) {
      const uploadedThumbnail =
        video.thumbnail ?
          await uploader.uploadFile({
            type: CosUploadFileType.image,
            file: video.thumbnail,
          })
        : undefined

      const source = await uploader.uploadFile({
        type: CosUploadFileType.video,
        file: video.file,
      })

      const uploadedVideo = {
        insert: {
          _type: EmbeddedAssetType.Video,
          fileType: EmbeddedAssetType.Video,
          source,
          width: video.width,
          height: video.height,
          duration: video.duration,
          thumbUrl: uploadedThumbnail,
        },
      } as Op

      exporter.ops.push(uploadedVideo, { insert: '\n' })
    }

    return exporter
  }
}
