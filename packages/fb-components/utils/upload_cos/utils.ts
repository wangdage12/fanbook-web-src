import { default as FbToast, default as fb_toast } from 'fb-components/base_ui/fb_toast'
import { FileType } from './uploadType'

export interface VerifyImageRes {
  width: number
  height: number
  size?: number
  imageName?: string
  localUrl?: string
}

export interface VerifyVideoRes {
  duration: number
  videoName: string
  width: number
  height: number
  localTime: number
  localThumbUrl: string
  thumbFile?: File
}

export default class CosUtils {
  static decodeRSA(encryptedData: string, publicKey: string) {
    // @ts-expect-error 外部引用
    const key = new NodeRSA(publicKey) // 设置你的公钥
    return key.decryptPublic(encryptedData, 'utf-8')
  }

  static verifyVideoFile(
    file: File,
    localUrl: string,
    {
      toast = false,
      size = 500 * 1024,
      durationInMinutes,
    }: {
      toast?: boolean
      size?: number
      durationInMinutes?: number
    } = {}
  ): Promise<VerifyVideoRes> {
    return new Promise((resolve, reject) => {
      if (file.size / 1024 > size) {
        if (toast)
          FbToast.open({
            type: 'warning',
            content: `仅支持${CosUtils.convertBytesToReadableSize(size * 1024)}以内视频上传`,
            key: 'out-limit-tip',
          })
        reject('Exceeded video bytes limit')
        return
      }
      const video = document.createElement('video')
      // https://juejin.cn/post/6865587289167724551
      video.preload = 'auto'
      video.crossOrigin = 'anonymous'
      video.muted = true
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.src = localUrl
      video.currentTime = 0.5
      video.addEventListener('loadedmetadata', () => {
        if (durationInMinutes && video.duration / 60 > durationInMinutes) {
          if (toast)
            FbToast.open({
              type: 'warning',
              content: `仅支持${durationInMinutes}分钟以内视频上传`,
              key: 'out-duration-limit-tip',
            })
          reject('Exceeded video duration limit')
          return
        }
        let { videoWidth, videoHeight } = video
        // 偶现获取视频宽高为零
        if (videoWidth === 0 || videoHeight === 0) {
          video.style.cssText = 'position: fixed; bottom: 1000000px; right: 1000000px;'
          document.body.append(video)
          const clientRect = video.getBoundingClientRect()
          videoWidth = clientRect.width
          videoHeight = clientRect.height
        }
        if (videoWidth === 0 || videoHeight === 0) {
          if (toast) FbToast.open({ type: 'warning', content: '获取视频宽高异常', key: 'get-size-error-tip' })
          video.parentNode && video.parentNode.removeChild(video)
          reject('get video size error')
          return
        }
        video.play()
        setTimeout(() => {
          // 过 100ms 暂停， 解决空白问题
          video.pause()
          const canvas = document.createElement('canvas')
          canvas.width = videoWidth
          canvas.height = videoHeight
          // 在画布上绘制视频的第一帧
          const context = canvas.getContext('2d')
          context?.drawImage(video, 0, 0, canvas.width, canvas.height)
          // 将画布内容转换为图片数据
          const imageDataURL = canvas.toDataURL('image/png')
          // 将画布内容转换为 Blob 对象
          canvas.toBlob(function (blob) {
            const localTime = Date.now()
            // 创建 File 对象 "video_snapshot_xxxx.mp4_23487513_1694586635000.png"
            const thumbFile = blob ? new File([blob], `video_snapshot_${file.name}_${file.size}_${localTime}.png`, { type: 'image/png' }) : undefined
            resolve({
              duration: Math.floor(video.duration),
              videoName: file.name,
              localThumbUrl: imageDataURL,
              thumbFile,
              localTime,
              width: videoWidth,
              height: videoHeight,
            })
          }, 'image/png')
          // 如果被挂载了, 移除
          video.parentNode && video.parentNode.removeChild(video)
        }, 500)
      })
    })
  }

  // 文件是否在上传限制范围内
  static verifyImageFile(
    file: File,
    localUrl: string,
    {
      toast = false,
      pixel = 1e8,
      size = 100 * 1024,
    }: {
      toast?: boolean
      pixel?: number
      size?: number
    } = {}
  ): Promise<VerifyImageRes> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        if (img.width * img.height > pixel) {
          if (toast) FbToast.open({ type: 'warning', content: '图片尺寸过大', key: 'upload-image-tip' })
          reject('Exceeded image size limit')
          return
        }
        if (file.size / 1024 > size) {
          if (toast)
            FbToast.open({
              type: 'warning',
              content: `仅支持${CosUtils.convertBytesToReadableSize(size * 1024)}以内图片上传`,
              key: 'out-limit-tip',
            })
          reject('Exceeded image bytes limit')
          return
        }
        resolve({ width: img.width, size: file.size, imageName: file.name, height: img.height })
      }
      img.onerror = e => {
        if (toast) {
          fb_toast.open({ type: 'error', content: '不支持的图片' })
        }
        reject(`Image read Error ${e.toString()}`)
      }
      img.src = localUrl
    })
  }

  static verifyFile(
    file: File,
    {
      toast = false,
      size = 50 * 1024,
      fileType,
    }: {
      toast?: boolean
      size?: number
      fileType?: FileType[]
    } = {}
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      if (file.size / 1024 > size) {
        if (toast)
          FbToast.open({
            type: 'warning',
            content: `仅支持${CosUtils.convertBytesToReadableSize(size * 1024)}以内文件上传`,
            key: 'out-limit-tip',
          })
        reject('Exceeded file bytes limit')
        return
      }
      if (fileType && fileType.length > 0 && !fileType.includes(CosUtils.getFileExtension(file.name, true) as FileType)) {
        if (toast)
          FbToast.open({
            type: 'warning',
            content: `仅支持${fileType.join(',')}文件上传`,
            key: 'file-type-limit',
          })
        reject('Exceeded file type limit')
        return
      }
      resolve(file)
    })
  }

  static getFileExtension(filename: string, dot = false): string {
    const lastIndex = filename.lastIndexOf('.')
    return lastIndex !== -1 ? filename.substring(lastIndex + (dot ? 0 : 1)) : ''
  }

  static convertBytesToReadableSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    let formattedSize = size.toFixed(2)
    if (Number.isInteger(size)) {
      formattedSize = size.toFixed(0)
    }

    return `${formattedSize} ${units[unitIndex]}`
  }

  static createChunksIterator(str: string, chunkSize: number) {
    return {
      [Symbol.iterator]() {
        let index = 0
        return {
          next() {
            if (index < str.length) {
              const value = str.substring(index, chunkSize + index)
              index += chunkSize
              return { value: value, done: false }
            } else {
              return { done: true }
            }
          },
        }
      },
    }
  }

  static base64ToBlob({ b64data = '', contentType = '', sliceSize = 50 * 1024 * 1024 } = {}) {
    return new Promise<Blob>(resolve => {
      // 使用 atob() 方法将数据解码
      const byteCharacters = atob(b64data)
      const byteArrays = []
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize)
        const byteNumbers = []
        for (let i = 0; i < slice.length; i++) {
          byteNumbers.push(slice.charCodeAt(i))
        }
        // 8 位无符号整数值的类型化数组。内容将初始化为 0。
        // 如果无法分配请求数目的字节，则将引发异常。
        byteArrays.push(new Uint8Array(byteNumbers))
      }
      const result = new Blob(byteArrays, {
        type: contentType,
      })
      resolve(result)
    })
  }
}
