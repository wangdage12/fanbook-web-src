import { BaseEditor, Editor } from 'slate'
import { RenderElementProps } from 'slate-react'
import ChatImage from '../../components/image/ChatImage'
import FbVideo from '../../components/video/FbVideo'
import { VideoWrapper } from '../../components/video/VideoWrapper.tsx'
import { EmbeddedAssetType } from '../../rich_text/types.ts'
import FilePicker from '../../utils/FilePicker'
import { ImageType, VideoType } from '../../utils/upload_cos/uploadType'
import CosUtils from '../../utils/upload_cos/utils'
import RichTextEditorUtils from '../RichTextEditorUtils'
import VoidBlockWrapper from '../VoidBlockWrapper'
import { CustomElement, MediaBlock } from '../custom-editor'

export interface UseMediaEditor extends BaseEditor {
  insertImage: (file: File) => void
  insertVideo: (file: File) => void
  pickImage: () => void
  pickVideo: () => void
}

export default function withMedia<T extends BaseEditor>(editor: T) {
  const e = editor as never as UseMediaEditor
  const { isVoid } = editor
  editor.isVoid = e => (e.type === 'image' || e.type === 'video' ? true : isVoid(e))

  e.insertImage = (file: File) => {
    const localUrl = URL.createObjectURL(file)
    CosUtils.verifyImageFile(file, localUrl, { size: 100 * 1024, toast: true })
      .then(res => {
        const nodes: MediaBlock[] = [
          {
            type: EmbeddedAssetType.Image,
            width: res.width,
            height: res.height,
            localUrl,
            media: file,
            children: [{ text: '' }],
          },
        ]

        afterInsertMedia(editor as never, nodes, res.height)
      })
      .catch(() => {
        URL.revokeObjectURL(localUrl)
      })
  }

  e.insertVideo = (file: File) => {
    const localUrl = URL.createObjectURL(file)
    CosUtils.verifyVideoFile(file, localUrl, { size: 500 * 1024, durationInMinutes: 15, toast: true })
      .then(res => {
        const nodes: MediaBlock[] = [
          {
            type: EmbeddedAssetType.Video,
            width: res.width,
            height: res.height,
            duration: res.duration,
            localUrl,
            media: file,
            localThumbUrl: res.localThumbUrl,
            thumbFile: res.thumbFile,
            children: [{ text: '' }],
          },
        ]

        afterInsertMedia(editor as never, nodes, res.height)
      })
      .catch(() => {
        URL.revokeObjectURL(localUrl)
      })
  }

  e.pickImage = () => {
    FilePicker.pickMedias(ImageType)
      .then(files => {
        files.forEach(file => (editor as never as UseMediaEditor).insertImage(file))
      })
      .catch(() => {
        /* ignore */
      })
  }

  e.pickVideo = () => {
    FilePicker.pickMedias(VideoType)
      .then(files => {
        files.forEach(file => (editor as never as UseMediaEditor).insertVideo(file))
      })
      .catch(() => {
        /* ignore */
      })
  }

  return editor
}

export function ImageBlockRenderer({ attributes, element, children }: RenderElementProps) {
  const { localUrl, url, width, height } = element as MediaBlock
  const _url = localUrl ?? url
  return (
    <VoidBlockWrapper attributes={attributes} element={element} bordered deletable className="my-1">
      <ChatImage src={_url} originSize={{ width, height }} />
      {children}
    </VoidBlockWrapper>
  )
}

export function VideoBlockRenderer({ attributes, element, children }: RenderElementProps) {
  const { localUrl, localThumbUrl, url, thumbUrl, width, height } = element as MediaBlock
  const _url = localUrl ?? url
  const _thumbUrl = localThumbUrl ?? thumbUrl
  return (
    <VoidBlockWrapper attributes={attributes} element={element} bordered deletable className="my-1">
      <VideoWrapper url={_url} originSize={{ width, height }}>
        {size => <FbVideo src={_url} poster={_thumbUrl} width={size.width} height={size.height} />}
      </VideoWrapper>
      {children}
    </VoidBlockWrapper>
  )
}

function afterInsertMedia(editor: Editor, nodes: CustomElement[], height: number) {
  // 如果插入图片或视频时，光标在最后面，那么插入图片或视频后，再插入一个空行，否则无法到达图片或视频下方
  RichTextEditorUtils.insertVoidBlock(editor, nodes)
  RichTextEditorUtils.scrollToInsert(editor, height)
}

export function afterRemoveMedia(nodes: MediaBlock[]) {
  const _nodes = nodes ?? []
  _nodes.forEach(node => {
    if (node.localUrl) {
      URL.revokeObjectURL(node.localUrl)
    }
  })
}
