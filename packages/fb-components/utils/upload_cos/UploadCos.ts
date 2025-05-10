import COS from 'cos-js-sdk-v5'
import { calculateMD5 } from './calculateMD5'
import { CosUploadFileType, cosUploadFileTypeToString } from './uploadType'
import CosUtils from './utils'

export interface CosFile {
  type: CosUploadFileType
  // 文件内容，可以是base64字符串或者File对象
  file: File | string
  // 文件类型 base64时需要传入
  fileType?: string
  // 文件名称 base64时需要传入
  fileName?: string
  md5?: string
}

//cos上传
export interface CosAuth {
  app_id: string
  bucket: string
  token: string
  host: string
  url: string
  secretId: string
  secretKey: string
  audit_app_id: string
  audit_bucket: string
  audit_token: string
  audit_host: string
  audit_url: string
  audit_secretId: string
  audit_type: string
  audit_secretKey: string
  upload_path: string
  upload_path_service: string
  expired_time: number
  start_time: number
}

/**
 * 上传进度回调，
 * @param{number} percent 进度百分比
 */
type OnProgress = (percent: number) => void

/**
 * 使用前需要先执行以下步骤
 * 1. 复制 assets/js/node-rsa.js 到项目中, 在 index.html 中引入
 *
 * 2. 调用 UploadCos.setFetchCosConfig 方法设置获取临时密钥的方法
 *
 *  UploadCos.setFetchCosConfig(() => {
 *
 *    return axios.post<undefined, CosAuth>('/api/file/cosTmpKey')
 *
 *  })
 *
 * 3. 同时需要设置公钥调用 UploadCos.setPublicKey 方法
 */
export default class UploadCos {
  private static instance: UploadCos
  private static publicKey: string
  static setPublicKey(publicKey: string) {
    UploadCos.publicKey = publicKey
  }
  private static fetchCosConfig: () => Promise<CosAuth>
  static setFetchCosConfig(fetchCosConfig: () => Promise<CosAuth>) {
    UploadCos.fetchCosConfig = fetchCosConfig
  }
  cos?: COS
  auditCos?: COS
  cosAuth?: CosAuth

  public static getInstance(): UploadCos {
    if (!UploadCos.instance) {
      UploadCos.instance = new UploadCos()
    }
    return UploadCos.instance
  }

  async fetchCosConfigIfNeed() {
    //临时密钥为空，或临时密钥到期前1.5小时重新获取
    if (this.cosAuth != null && this.cosAuth.expired_time != null && this.cosAuth.expired_time - Date.now() / 1000 > 90 * 60) return
    this.cosAuth = await UploadCos.fetchCosConfig()
    this.cosAuth.secretKey = CosUtils.decodeRSA(this.cosAuth.secretKey, UploadCos.publicKey)
    this.cosAuth.audit_secretKey = CosUtils.decodeRSA(this.cosAuth.audit_secretKey, UploadCos.publicKey)
    const { secretId, secretKey, token, audit_secretId, audit_secretKey, audit_token } = this.cosAuth
    this.cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
      SecurityToken: token,
    })
    this.auditCos = new COS({
      SecretId: audit_secretId,
      SecretKey: audit_secretKey,
      SecurityToken: audit_token,
    })
  }
  getUploadPath(type: CosUploadFileType) {
    return type === CosUploadFileType.headImage ? this.cosAuth?.upload_path_service : this.cosAuth?.upload_path
  }

  getFileUrl(type: CosUploadFileType) {
    return type === CosUploadFileType.video ? this.cosAuth?.audit_url : this.cosAuth?.url
  }

  getCos(type: CosUploadFileType) {
    return type === CosUploadFileType.video ? this.auditCos : this.cos
  }

  getCosParam(type: CosUploadFileType) {
    return { Bucket: type === CosUploadFileType.video ? this.cosAuth?.audit_bucket : this.cosAuth?.bucket, Region: 'ap-guangzhou' }
  }

  //上传文件
  async uploadFile(file: CosFile, onProgress?: OnProgress): Promise<string> {
    await this.fetchCosConfigIfNeed()
    const targetFile =
      typeof file.file === 'string' ? await CosUtils.base64ToBlob({ b64data: file.file, contentType: file.fileType }) : (file.file as File)
    const md5 = file.md5 ?? (await this.calculateMD5(targetFile))
    const key = `${this.getUploadPath(file.type)}${file.fileType ?? cosUploadFileTypeToString(file.type)}/${md5}.${CosUtils.getFileExtension(
      typeof file.file === 'string' ? file.fileName ?? '' : (file.file as File).name
    )}`
    const completeUrl = `${this.getFileUrl(file.type)}/${key}`
    const cos = this.getCos(file.type)
    if (!cos) throw new Error('cos is empty')
    const { Bucket, Region } = this.getCosParam(file.type)
    if (typeof Bucket === 'undefined') {
      throw new Error('cos bucket is empty')
    }
    if (await this.checkFileHashIsExist(cos, { Bucket, Region, Key: key })) return completeUrl
    return new Promise((resolve, reject) => {
      this.getCos(file.type)?.putObject(
        {
          Bucket,
          Region,
          Key: key /* 必须 */,
          Body: targetFile,
          onProgress: e => {
            onProgress?.(e.percent * 100)
          },
        },
        err => {
          if (!err) {
            resolve(completeUrl)
          } else {
            reject(err)
          }
        }
      )
    })
  }

  // 获取文件url
  async getObjectUrl(file: CosFile): Promise<string | undefined> {
    const targetFile =
      typeof file.file === 'string' ? await CosUtils.base64ToBlob({ b64data: file.file, contentType: file.fileType }) : (file.file as File)
    const md5 = file.md5 ?? (await this.calculateMD5(targetFile))
    const key = `${this.getUploadPath(file.type)}${file.fileType ?? cosUploadFileTypeToString(file.type)}/${md5}.${
      typeof file.file === 'string' ? file.fileName ?? '' : (file.file as File).name
    }`
    return new Promise(resolve => {
      const { Bucket, Region } = this.getCosParam(file.type)
      if (typeof Bucket === 'undefined') {
        console.log(new Error('cos bucket is empty'))
        return resolve(undefined)
      }
      this.getCos(file.type)?.getObjectUrl(
        {
          Bucket,
          Region,
          Key: key /* 必须 */,
          Sign: false,
        },
        (err, data) => {
          if (err) {
            console.log(err)
            resolve(undefined)
          }
          resolve(data.Url)
        }
      )
    })
  }

  async calculateMD5(target: Blob): Promise<string> {
    return await calculateMD5(target)
  }
  // 判断文件是否已经上传过
  async checkFileHashIsExist(cos: COS, { Bucket, Region, Key }: { Bucket: string; Region: string; Key: string }): Promise<boolean> {
    try {
      const result = await cos.headObject({
        Bucket,
        Region,
        Key,
      })
      return result.statusCode === 200
    } catch (err) {
      return false
    }
  }
}
