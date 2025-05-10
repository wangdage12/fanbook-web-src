import Button from 'antd/es/button'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbToast from 'fb-components/base_ui/fb_toast'
import { useEffect, useState } from 'react'
import ImageCropWrapper from './ImageCropWrapper'
import { ImageInfo } from './type'
import { getCroppedImgArr } from './utils'

export enum ImageCropErrorType {
  Cancel,
  Reselect,
}

export class ImageCropError extends Error {
  type: ImageCropErrorType
  constructor(message: string, type: ImageCropErrorType) {
    super(message)
    this.type = type
  }
}

export function ImageCropContent({
  image,
  aspect,
  onOk,
  onReselect,
  onCancel,
}: {
  image: ImageInfo
  aspect?: number | boolean
  onOk: (image: ImageInfo) => void
  onCancel: () => void
  onReselect?: () => void
}) {
  const [tempImages, setTempImages] = useState<ImageInfo[]>([image])
  const [loading, setLoading] = useState(false)
  const handleOk = () => {
    setLoading(true)
    getCroppedImgArr(tempImages)
      .then(res => {
        onOk(res[0])
      })
      .catch(err => {
        console.error(err)
        FbToast.open({ type: 'error', content: '编辑图片错误', key: 'edit_image_error' })
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => {
    setTempImages([image])
  }, [image])

  return (
    <div className="w-full">
      <div className="h-[500px] w-full">
        <ImageCropWrapper aspectControl={aspect} images={tempImages} onCropChange={setTempImages} />
      </div>
      <div className="flex justify-end py-[16px]">
        <Button onClick={onCancel} type={onReselect ? 'text' : 'default'} className="btn-middle mr-[16px]">
          取消
        </Button>
        {onReselect && (
          <Button onClick={onReselect} className="btn-middle mr-[16px]">
            重新选择
          </Button>
        )}
        <Button type={'primary'} onClick={handleOk} className="btn-middle" loading={loading ? { delay: 200 } : false}>
          确定
        </Button>
      </div>
    </div>
  )
}

const showImageCropModal = ({
  title = '编辑图片',
  aspect = 1,
  image,
  reselectable,
}: {
  image: ImageInfo
  title?: string
  aspect?: number | boolean
  reselectable?: boolean
}) => {
  return new Promise<ImageInfo>((resolve, reject) => {
    const { destroy: close } = showFbModal({
      className: 'rounded-[8px]',
      width: 800,
      title,
      content: (
        <ImageCropContent
          aspect={aspect}
          image={image}
          onOk={image => {
            close()
            resolve(image)
          }}
          onCancel={() => {
            close()
            reject(new ImageCropError('取消裁剪图片', ImageCropErrorType.Cancel))
          }}
          onReselect={
            reselectable ?
              () => {
                close()
                reject(new ImageCropError('重新选择图片', ImageCropErrorType.Reselect))
              }
            : undefined
          }
        />
      ),
      onCancel: () => {
        close()
        reject(new ImageCropError('取消裁剪图片', ImageCropErrorType.Cancel))
      },
      showCancelButton: false,
      showOkButton: false,
    })
  })
}

export default showImageCropModal
