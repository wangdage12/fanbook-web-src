import sleep from './sleep'

export default class ImageUtils {
  /**
   * 获取网络上的图片的宽高
   * @param src
   */
  static resolveNetworkImageSize(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * 发起网络请求获取图片
   * @param url   图片地址
   * @param retry 失败后的重试次数，重试次数耗尽前不会返回数据，重试间隔固定为 1s
   */
  static async fetchImage(url: string, retry?: number) {
    const RETRY_INTERVAL = 1e3
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.src = url
      if (img.complete) {
        resolve(img)
      } else {
        img.onload = () => {
          resolve(img)
        }
        img.onerror = () => {
          if (retry && retry > 0) {
            sleep(RETRY_INTERVAL)
              .then(() => this.fetchImage(url, retry - 1))
              .then(resolve, reject)
          } else {
            reject()
          }
        }
      }
    })
  }
}
