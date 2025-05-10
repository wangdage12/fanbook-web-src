import { isString } from 'lodash-es'
import { AssetType, ImageType, VideoType } from './upload_cos/uploadType'

export default class FilePicker {
  static pickMedias(
    extensions: string | typeof AssetType | typeof ImageType | typeof VideoType,
    options?: {
      multiple?: boolean
    }
  ): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = isString(extensions) ? extensions : Object.values(extensions).join(',')

      input.multiple = options?.multiple ?? true
      input.onchange = e => {
        const files = (e.target as HTMLInputElement).files
        if (!files) {
          reject('No files selected')
        } else {
          resolve([...files])
        }
      }
      input.oncancel = () => {
        reject('User canceled')
      }
      input.click()
    })
  }
}
