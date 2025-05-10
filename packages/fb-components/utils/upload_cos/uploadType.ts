export enum AssetType {
  // image
  GIF = '.gif',
  JPG = '.jpg',
  JPEG = '.jpeg',
  PNG = '.png',
  BMP = '.bmp',
  WEBP = '.webp',
  // video
  MP4 = '.mp4',
}
export enum ImageType {
  GIF = '.gif',
  JPG = '.jpg',
  JPEG = '.jpeg',
  PNG = '.png',
  BMP = '.bmp',
  WEBP = '.webp',
}
export enum VideoType {
  MP4 = '.mp4',
}

export enum FileType {
  CSV = '.csv',
}

const assetTypeArr = Object.values(AssetType) as AssetType[]

export function getFileTypes(excludedTypes: AssetType[] = []): string {
  return assetTypeArr.filter(type => !excludedTypes.includes(type)).join(',')
}

export enum CosUploadFileType {
  unKnow,
  video,
  image,
  audio,
  headImage, //头像
  live,
  pdf,
  txt,
  doc,
  circleIcon, //圈子头像
  zip,
}

export function cosUploadFileTypeToString(type: CosUploadFileType): string {
  return CosUploadFileType[type] ?? 'files'
}

// function contentTypeString(
//   type: CosUploadFileType,
//   ext: string | undefined,
// ): string {
//   switch (type) {
//     case CosUploadFileType.video:
//       return "video/mp4"
//     case CosUploadFileType.audio:
//       return "audio/mp3"
//     case CosUploadFileType.image:
//     case CosUploadFileType.headImage:
//     case CosUploadFileType.circleIcon:
//       if (ext?.includes("gif") ?? false) return "image/gif"
//       if (ext?.includes("png") ?? false) return "image/png"
//       return "image/jpeg"
//     case CosUploadFileType.pdf:
//       return "application/pdf"
//     case CosUploadFileType.txt:
//       return "text/plain"
//     case CosUploadFileType.doc:
//       return "application/msword"
//     default:
//       return "application/octet-stream"
//   }
// }
