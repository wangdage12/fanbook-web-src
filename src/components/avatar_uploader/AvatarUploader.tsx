import { Avatar, Upload, UploadFile, UploadProps } from 'antd'
import { RcFile, UploadChangeParam } from 'antd/es/upload'
import { UploadFileStatus } from 'antd/es/upload/interface'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import UploadCos from 'fb-components/utils/upload_cos/UploadCos'
import { AssetType, CosUploadFileType, getFileTypes } from 'fb-components/utils/upload_cos/uploadType'
import CosUtils from 'fb-components/utils/upload_cos/utils'
import { UploadRequestOption } from 'rc-upload/lib/interface'
import { ReactNode, useEffect, useRef, useState } from 'react'
import drawTextAvatar from '../../utils/draw_text_avatar'
import showImageCropModal from '../image_crop/ImageCropModal'
import { getCroppedImg } from '../image_crop/utils'

import './AvatarUploader.less'

enum AvatarUploaderSize {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
}

interface AvatarUploaderProps {
  // 默认显示的url
  url?: string | File
  // 上传或者文字修改callback
  onChange?: (url: string | File | undefined) => void
  // 图片文件 createObjectURL 后的url
  onAvatarChange?: (url: string) => void
  // 尺寸
  size?: AvatarUploaderSize
  // 显示的文字
  text?: string
  children?: ReactNode | ((uploading: boolean) => ReactNode)
}

export default function AvatarUploader({ url, onChange, onAvatarChange, size = AvatarUploaderSize.md, text, children }: AvatarUploaderProps) {
  const [avatar, setAvatar] = useState<string>()
  const [uploadStatus, setUploadStatus] = useState<UploadFileStatus>()
  const [uploading, setUploading] = useState(false)
  const [firstRender, setFirstRender] = useState(true)
  const realFile = useRef<File>()
  const localUrl = useRef<string>()
  // const [percent, setPercent] = useState<number | undefined>()
  const beforeUpload = async (file: RcFile) => {
    const url = URL.createObjectURL(file)
    try {
      const imageInfo = await showImageCropModal({ image: { file, url, maxSize: { width: 500, height: 500 } }, title: '编辑头像' })
      const { cropFile } = await getCroppedImg(imageInfo)
      realFile.current = cropFile ?? file
      const _localUrl = URL.createObjectURL(realFile.current)
      await CosUtils.verifyImageFile(realFile.current, _localUrl, { toast: true, size: 8 * 1024 })
      if (localUrl.current) {
        URL.revokeObjectURL(localUrl.current)
      }
      localUrl.current = _localUrl
      setAvatar(localUrl.current)
      onAvatarChange?.(localUrl.current)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }

    if (avatar || uploading) return
    handleTextChange().then()
  }, [text])

  const handleTextChange = async () => {
    if (text) {
      const file = drawTextAvatar(text)
      onChange?.(file)
    } else {
      onChange?.(undefined)
    }
  }

  const handleUpload = async ({ onError, onSuccess, onProgress }: UploadRequestOption) => {
    try {
      if (!realFile.current) {
        onError?.(new Error('no file'))
        return
      }
      setUploading(true)
      const url = await UploadCos.getInstance().uploadFile(
        {
          type: CosUploadFileType.headImage,
          file: realFile.current,
        },
        percent => {
          onProgress?.({ percent })
        }
      )
      // form.setFieldValue("avatar", url)
      // 等待Progress动画结束
      onSuccess?.(url)
      onChange?.(url)
      // setPercent(0)
    } catch (err) {
      onError?.(err as Error)
    } finally {
      setUploading(false)
    }
  }
  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    // setPercent(info.file.percent)
    setUploadStatus(info.file.status)
  }
  const displayUrl = avatar ?? url
  const showAvatar = !!(displayUrl || text)
  useEffect(() => {
    if (localUrl.current) {
      URL.revokeObjectURL(localUrl.current)
    }
  }, [])
  return (
    <Upload
      name="avatar"
      style={{ padding: 0 }}
      maxCount={1}
      showUploadList={false}
      customRequest={handleUpload}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      accept={getFileTypes([AssetType.GIF, AssetType.MP4])}
    >
      {children ?
        typeof children === 'function' ?
          children(uploading)
        : children
      : <div className={`avatar-uploader ${size} ${showAvatar ? '' : 'empty'}`}>
          <div className={'upload-item border rounded-full'}>
            {showAvatar && (
              <Avatar
                src={typeof displayUrl == 'string' ? displayUrl : null}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: typeof displayUrl == 'string' ? 'transparent' : 'var(--fg-blue-1)',
                }}
              >
                {text?.slice(0, 1)}
              </Avatar>
            )}
            {(uploadStatus === 'uploading' || !showAvatar) && (
              <div className={'mask'}>
                {!showAvatar && (uploadStatus === 'done' || !uploadStatus) && <div>上传头像</div>}
                {uploadStatus === 'uploading' && (
                  <div className={'progress-container'}>
                    {/*<Progress*/}
                    {/*  showInfo={false}*/}
                    {/*  percent={percent}*/}
                    {/*  style={{ color: "white" }}*/}
                    {/*></Progress>*/}
                    <CircularLoading size={24} />
                    <div>头像上传中</div>
                  </div>
                )}
              </div>
            )}
            <div className={'upload-icon'}>
              <iconpark-icon name="Camera" color={'var(--fg-white-1)'} size={12}></iconpark-icon>
            </div>
          </div>
        </div>
      }
    </Upload>
  )
}
