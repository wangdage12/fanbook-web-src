import { safeDivision } from 'fb-components/utils/common'
import CosUtils from 'fb-components/utils/upload_cos/utils'
import { isEqual } from 'lodash-es'
import { Area, Size } from 'react-easy-crop'
import { BaseCropInfo, ImageInfo } from './type'

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

// https://github.com/ValentinH/react-easy-crop/blob/e4e7094cec30f567f1f929293f46aff1587803ed/src/helpers.ts#L270
export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

// https://github.com/ValentinH/react-easy-crop/blob/e4e7094cec30f567f1f929293f46aff1587803ed/src/helpers.ts#L277
export function rotateSize(width: number, height: number, rotation: number): Size {
  const rotRad = getRadianAngle(rotation)

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

const mimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  bmp: 'image/bmp',
  webp: 'image/webp',
}

async function getImgContentType(src: string) {
  return fetch(src, { method: 'HEAD' }).then(response => response.headers.get('Content-type'))
}

// https://github.com/ValentinH/react-easy-crop/blob/main/docs/src/components/Demo/cropImage.ts
export async function getBaseCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  suffix: keyof typeof mimeTypes = 'png',
  maxSize?: Size,
  onlyUrl = false
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  const rotRad = getRadianAngle(rotation)

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')

  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) return null

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(canvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  let outCanvas = croppedCanvas

  if (maxSize) {
    // Set the canvas dimensions
    const { width: maxWidth, height: maxHeight } = maxSize
    let width = croppedCanvas.width
    let height = croppedCanvas.height
    // Calculate the width and height, maintaining aspect ratio
    if (width > height) {
      if (width > maxWidth) {
        height *= safeDivision(maxWidth, width)
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width *= safeDivision(maxHeight, height)
        height = maxHeight
      }
    }
    canvas.width = width
    canvas.height = height
    // Draw the image on the canvas
    ctx.drawImage(croppedCanvas, 0, 0, width, height)
    outCanvas = canvas
  }

  const _suffix = Object.values(mimeTypes).includes(suffix) ? suffix : 'png'
  const name = `${Date.now()}.${_suffix}`
  const mineType = mimeTypes[_suffix] ?? 'image/png'
  // As Base64 string
  const url = outCanvas.toDataURL(mineType)
  // As a blob
  return onlyUrl ?
      { file: undefined, url }
    : new Promise<{ file: File | undefined; url: string } | null>(resolve => {
        outCanvas.toBlob(blob => {
          const file = blob ? new File([blob], name, { type: mineType }) : undefined
          resolve({ file, url })
        }, mineType)
      })
}

// 裁剪图片
// force：是否强制裁剪（用于动图获取第一帧）
export async function getCroppedImg(image: ImageInfo, onlyUrl = false, force: boolean = false) {
  const { file, url, cropInfo, cropUrl: handleCropUrl, cropFile: handleCropFile, maxSize } = image
  if (handleCropUrl && (onlyUrl || handleCropFile)) return image
  let suffix = 'png' as keyof typeof mimeTypes
  try {
    suffix = (file ? CosUtils.getFileExtension(file.name) : (await getImgContentType(url))?.split('/')[1]) as keyof typeof mimeTypes
  } catch (err) {
    console.error(err)
    suffix = 'png'
  }

  const { croppedArea, rotation } = cropInfo || {}
  const { file: cropFile = undefined, url: cropUrl = undefined } =
    (force || hasCropImage(cropInfo)) && croppedArea ?
      (await getBaseCroppedImg(
        url,
        croppedArea,
        rotation || 0,
        {
          horizontal: false,
          vertical: false,
        },
        suffix,
        maxSize,
        onlyUrl
      )) ?? {}
    : {}

  return {
    ...image,
    cropFile,
    cropUrl,
  }
}

export async function getCroppedImgArr(images: ImageInfo[], onlyUrl = false) {
  // 创建剪裁图片的 Promise 数组
  const cropPromises = images.map(async image => getCroppedImg(image, onlyUrl))
  // 并行处理剪裁图片的 Promise 数组
  const croppedResults = await Promise.all<Promise<ImageInfo>[]>(cropPromises)
  return croppedResults
}

export function hasCropImage(cropInfo?: BaseCropInfo) {
  if (!cropInfo) return false
  const { croppedArea, originalArea, rotation = 0 } = cropInfo
  if (!croppedArea || !originalArea) return false
  return !isEqual(croppedArea, originalArea) || rotation > 0
}
