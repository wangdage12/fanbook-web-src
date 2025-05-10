const dp = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1

/** 根据屏幕像素比进行倍率放大 */
function multiply(value = 1) {
  return (value * dp) | 0
}
export default class CosImageUtils {
  /**
   * 保持宽高比例，生成缩略图，宽高不超过指定值
   * @param src    原图地址，必须是腾讯云 COS 地址，并且开通了数据万象图片处理服务
   * @param width  保证宽度不超过的最大值
   * @param height 保证高度不超过的最大值
   */
  static thumbnailMin(src: string, width: number, height: number = width) {
    if (!src) {
      return ''
    }
    width |= 0
    height |= 0
    try {
      const uri = new URL(src)
      uri.searchParams.set(`imageMogr2/thumbnail/${multiply(width)}x${multiply(height)}>`, '')
      return uri.toString()
    } catch (e) {
      return src
    }
  }

  /**
   * 保持宽高比例，生成缩略图，宽高不小于指定值
   * @param src     原图地址，必须是腾讯云 COS 地址，并且开通了数据万象图片处理服务
   * @param height  保证高度不超过的最小值
   */
  static thumbnailHeight(src: string, height = 100) {
    if (!src) {
      return ''
    }
    height = (height * dp) | 0
    const uri = new URL(src)
    uri.searchParams.set(`imageMogr2/thumbnail/x${multiply(height)}>`, '')
    return uri.toString()
  }

  /**
   * 按指定尺寸裁剪图片
   * @param src     原图地址，必须是腾讯云 COS 地址，并且开通了数据万象图片处理服务
   * @param width  裁剪宽度
   * @param height  裁剪高度
   * @param offsetX  X轴偏移量
   * @param offsetY  Y轴偏移量
   */
  static cut(src: string, width: number, height: number, offsetX: number, offsetY: number) {
    if (!src) {
      return ''
    }
    width |= 0
    height |= 0
    width = multiply(width)
    height = multiply(height)

    const uri = new URL(src)
    uri.searchParams.set(`imageMogr2/cut/${width || ''}x${height}x${offsetX}x${offsetY}`, '')
    return uri.toString()
  }
}
