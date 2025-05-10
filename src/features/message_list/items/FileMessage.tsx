import { FileStruct, FileType, MessageStruct } from 'fb-components/components/messages/types.ts'
import CosUtils from 'fb-components/utils/upload_cos/utils.ts'

interface FileMessageProps {
  message: MessageStruct<FileStruct>
}

export function getFileIcon(fileName: string, fileType: FileType) {
  switch (fileType) {
    case FileType.Picture:
      return '/images/file-icons/file_pic.svg'
    case FileType.Video:
      return '/images/file-icons/file_avi.svg'
    case FileType.Audio:
      return '/images/file-icons/file_aac.svg'
    case FileType.Zip:
      return '/images/file-icons/file_rar.svg'
    case FileType.Apk:
      return '/images/file-icons/file_apk.svg'
    case FileType.document:
      return getDocumentationIcon(fileName)
    case FileType.Unknown:
    default:
      return '/images/file-icons/file_unknown.svg'
  }
}

function getDocumentationIcon(fileName: string) {
  const ext = fileName.split('.').pop() ?? ''
  if (['doc', 'dot', 'wps', 'wpt', 'docx', 'dotx', 'docm', 'dotm'].includes(ext)) {
    return '/images/file-icons/file_doc.svg'
  }
  if (['pptx', 'ppt', 'pot', 'potx', 'pps', 'ppsx', 'dps', 'dpt', 'pptm', 'potm', 'ppsm'].includes(ext)) {
    return '/images/file-icons/file_ppt.svg'
  }
  if (ext === 'pdf') {
    return '/images/file-icons/file_pdf.svg'
  }
  if (ext === 'txt') {
    return '/images/file-icons/file_txt.svg'
  }
  if (ext === 'apk') {
    return '/images/file-icons/file_apk.svg'
  }
  return '/images/file-icons/file_unknown.svg'
}

export default function FileMessage({ message }: FileMessageProps) {
  const { file_name, file_url, file_type, file_size } = message.content
  return (
    <div className={'flex space-x-2 bg-fgWhite1 -m-3 p-2.5 items-center'}>
      <img src={getFileIcon(file_name, file_type)} alt="" className={'self-start w-10 h-10  pointer-events-none select-none'} draggable={false} />
      <div>
        <p className={'text-base line-clamp-2'}>{file_name}</p>
        <p className={'text-xs text-fgB60'}>{CosUtils.convertBytesToReadableSize(file_size)}</p>
      </div>
      <iconpark-icon
        size={18}
        class={'icon-bg-btn w-8 h-8'}
        name="Download"
        onClick={() => {
          window.open(file_url)
        }}
      />
    </div>
  )
}
