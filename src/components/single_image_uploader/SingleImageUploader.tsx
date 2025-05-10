import { useUpdate } from 'ahooks'
import { Button, ConfigProvider, Upload, UploadProps } from 'antd'
import clsx from 'clsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import FbImage from 'fb-components/components/image/FbImage'
import { Size } from 'fb-components/components/type.ts'
import { checkIsLocalURL } from 'fb-components/utils/common'
import { ImageType } from 'fb-components/utils/upload_cos/uploadType.ts'
import { CSSProperties, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import showImageCropModal, { ImageCropError, ImageCropErrorType } from '../image_crop/ImageCropModal'
import { getCroppedImg } from '../image_crop/utils'
import './single-image-uploader.css'

export interface CropOptions {
  title?: string
  /** 裁剪比例 */
  aspect?: number | boolean
  editable?: boolean
}

type SingleImageUploaderProps = {
  /** 默认显示的图片地址 */
  defaultUrl?: string
  /** 图片地址 */
  url?: string | File
  /** 展示为按钮 */
  button?: boolean
  /** 选择文件回调 */
  onChange?: (file: File, localUrl: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否裁剪 */
  useCrop?: boolean | CropOptions
  /** 是否返回静态图片，为true情况下，遇到动图图片会裁剪 */
  onlyStatic?: boolean
  /** 是否使用悬浮遮罩 */
  useHoverMask?: boolean
  /** 是否支持点击拉起文件选择 */
  openFileDialogOnClick?: boolean
  // small 尺寸为 72，large 尺寸为 100，也可以传入自定义尺寸
  size?: 'small' | 'large' | Size
  /** 是否仅显示上传图标 */
  onlyIcon?: boolean
  className?: string
  style?: CSSProperties
  limitSize?: number
  needBorder?: boolean
}

export interface SingleImageUploaderHandler {
  pickImage: () => void
}

const SingleImageUploader = forwardRef<SingleImageUploaderHandler, SingleImageUploaderProps>(
  (
    {
      defaultUrl,
      url,
      onChange,
      disabled = false,
      useCrop = false,
      button = false,
      onlyStatic = false,
      useHoverMask = true,
      openFileDialogOnClick = true,
      className = '',
      onlyIcon,
      limitSize = 1024 * 8,
      size = 'small',
    },
    ref
  ) => {
    disabled ||= ConfigProvider.useConfig().componentDisabled ?? false
    const tempUrlRef = useRef<string>()
    const tempFileRef = useRef<File>()
    const update = useUpdate()
    const render = (object: string | File) => {
      // 释放
      tempUrlRef.current && checkIsLocalURL(tempUrlRef.current) && URL.revokeObjectURL(tempUrlRef.current)
      if (object instanceof File) {
        tempUrlRef.current = URL.createObjectURL(object)
      } else {
        tempUrlRef.current = object
      }
      update()
    }
    const uploaderRef = useRef<HTMLDivElement>(null)
    const reselectRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => {
      return {
        pickImage: () => {
          uploaderRef.current?.click()
        },
      }
    })

    const { needCrop, title, aspect, editable } = useMemo(() => {
      if (!useCrop) {
        return { needCrop: false, aspect: 1, editable: false }
      }
      const { title, aspect = 1, editable = false } = typeof useCrop === 'object' ? useCrop : ({} as CropOptions)
      return { needCrop: true, title, aspect, editable }
    }, [useCrop])

    function handleChange(tempFile: File) {
      // @ts-expect-error type: 添加uid参数避免antd Form验证时无法区分file是否已经改变
      tempFile.uid = uuidv4()
      const isLimitOut = tempFile.size / 1024 < limitSize
      if (!isLimitOut) {
        FbToast.open({
          type: 'warning',
          content: `上传图片必须小于${convertFileSize(limitSize)}`,
        })
        return
      }
      tempFileRef.current = tempFile
      if (!url) {
        render(tempFile)
      }
      onChange?.(tempFile, tempUrlRef.current as string)
    }

    const uploadProps: UploadProps = {
      showUploadList: false,
      maxCount: 1,
      accept: Object.values(ImageType).join(','),
      disabled: disabled,
      openFileDialogOnClick,
      beforeUpload: async file => {
        const tempUrl = URL.createObjectURL(file)
        try {
          let tempFile: File = file
          if (needCrop) {
            const imageInfo = await showImageCropModal({
              aspect,
              image: { file, url: tempUrl },
              title,
            })
            const { cropFile } = await getCroppedImg(imageInfo, false, onlyStatic)
            cropFile && (tempFile = cropFile)
          } else {
            const { cropFile } = await getCroppedImg({ file, url: tempUrl }, false, onlyStatic)
            cropFile && (tempFile = cropFile)
          }
          handleChange(tempFile)
          return false
        } catch (err) {
          console.error(err)
          return false
        } finally {
          // 释放内存
          URL.revokeObjectURL(tempUrl)
        }
      },
    }

    useEffect(() => {
      url && render(url)
    }, [url])

    // 释放内存
    useEffect(() => {
      return () => {
        tempUrlRef.current && checkIsLocalURL(tempUrlRef.current) && URL.revokeObjectURL(tempUrlRef.current)
      }
    }, [])

    return (
      <Upload {...uploadProps}>
        <div className="w-[1px] h-[1px] opacity-0 absolute top-0 left-0" ref={reselectRef}></div>
        <div
          className="w-full h-full"
          ref={uploaderRef}
          onClick={async evt => {
            // 如果可以编辑同时存在图片则先编辑
            const url = tempUrlRef.current || defaultUrl
            if (needCrop && editable && url) {
              evt.stopPropagation()
              try {
                const imageInfo = await showImageCropModal({
                  aspect,
                  image: { file: tempFileRef.current, url },
                  title,
                  reselectable: true,
                })
                const { cropFile } = await getCroppedImg(imageInfo, false, onlyStatic)
                if (cropFile) {
                  handleChange(cropFile)
                }
              } catch (err) {
                // 重新选择
                if (err instanceof ImageCropError && err.type === ImageCropErrorType.Reselect) {
                  reselectRef.current?.click()
                }
              }
            }
          }}
        >
          {button ?
            <Button>{tempUrlRef.current ? '重新上传' : '点击上传'}</Button>
          : <div
              className={clsx([
                'relative block single-image-uploader overflow-hidden [&_.ant-upload-select]:h-full [&_.ant-upload-select]:w-full',
                className,
                // needBorder && 'border-[0.5px]  border-[var(--fg-b10)]',
              ])}
              style={{
                // @ts-expect-error 通过这种方式简单获取 size
                width: size?.width ?? (size === 'small' ? 72 : 100),
                // @ts-expect-error 通过这种方式简单获取 size
                height: size?.height ?? (size === 'small' ? 72 : 100),
              }}
            >
              {!(defaultUrl || tempUrlRef.current) && (
                <div className={clsx(['flex-center h-full w-full', size === 'small' ? 'gap-1 text-xs' : 'gap-2 text-sm'])}>
                  <iconpark-icon size={24} color={'var(--fg-b30)'} name="Plus"></iconpark-icon>
                  {!onlyIcon && <span>上传图片</span>}
                </div>
              )}
              {(defaultUrl || tempUrlRef.current) && (
                <>
                  <FbImage src={tempUrlRef.current || defaultUrl} />
                  {useHoverMask && !disabled && (
                    <div
                      className={clsx([
                        'flex-center absolute left-0 top-0 flex h-full w-full gap-1 bg-[rgba(0,0,0,0.5)] opacity-0 transition-all',
                        !disabled && 'hover:opacity-100',
                      ])}
                    >
                      {onlyIcon ?
                        <iconpark-icon name="Edit" color={'var(--fg-white-1)'} size={14}></iconpark-icon>
                      : <>
                          <iconpark-icon name="Edit" color={'var(--fg-white-1)'} size={12}></iconpark-icon>
                          <span className={'text-xs text-[var(--fg-white-1)]'}>更换图片</span>
                        </>
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          }
        </div>
      </Upload>
    )
  }
)

function convertFileSize(kb: number): string {
  if (kb < 1024) {
    return `${kb}KB`
  } else if (kb < 1024 * 1024) {
    const mb = (kb / 1024).toFixed(2)
    return `${mb}MB`
  } else if (kb < 1024 * 1024 * 1024) {
    const gb = (kb / (1024 * 1024)).toFixed(2)
    return `${gb}GB`
  } else {
    const tb = (kb / (1024 * 1024 * 1024)).toFixed(2)
    return `${tb}TB`
  }
}

SingleImageUploader.displayName = 'SingleImageUploader'
export default SingleImageUploader
